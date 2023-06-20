// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "uniswap-v2-contract/contracts/uniswap-v2-periphery/interfaces/IUniswapV2Router02.sol";
import "uniswap-v2-contract/contracts/uniswap-v2-core/interfaces/IUniswapV2Factory.sol";
import "uniswap-v2-contract/contracts/uniswap-v2-core/interfaces/IUniswapV2Pair.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BuyContract is OwnableUpgradeable {
    // Address of the Uniswap v2 router
    address public UNISWAP_V2_ROUTER;

    // Address of WETH token
    // address private constant WETH ;
    address public WETH;

    //Address of the fund receiver
    address private platformAddress;

    address private maintanierAddress;

    constructor() {
        _disableInitializers();
    }

    modifier ZeroAddress(address _account) {
        require(_account != address(0), "BC:Invalid address");
        _;
    }
    modifier ZeroAmount(uint256 _amount) {
        require(_amount != 0, "BC:Invalid Amount");
        _;
    }

    event TokensSwapped(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed to
    );

    function initialize(
        address _router,
        address _Weth,
        address _maintanierAddress,
        address _platformAddress
    ) public initializer {
        require(_router != address(0), "BC:Invalid router address");
        require(_Weth != address(0), "BC:Invalid WETH address");
        require(
            _maintanierAddress != address(0),
            "BC:Invalid maintainer address"
        );
        require(_platformAddress != address(0), "BC:Invalid platform address");
        UNISWAP_V2_ROUTER = _router;
        WETH = _Weth;
        maintanierAddress = _maintanierAddress;
        platformAddress = _platformAddress;
    }

    /**
     * Perform a token swap from one token to another
     * @param _tokenIn The address of the token to trade out of
     * @param _tokenOut The address of the token to receive in the trade
     * @param _amountIn The amount of tokens to send in
     * @param _amountOutMin The minimum amount of tokens expected to receive
     * @param _to The address to send the output tokens to
     */
    function swapWithFee(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _to
    )
        external
        ZeroAddress(_to)
        ZeroAmount(_amountIn)
        ZeroAmount(_amountOutMin)
    {
        // Construct the token swap path
        address[] memory path;

        if (_tokenIn == WETH || _tokenOut == WETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = WETH;
            path[2] = _tokenOut;
        }

        // Call the Uniswap router to perform the token swap
        if (_tokenOut == WETH) {
            IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
            IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, _amountIn);

            uint256 _amountOfWeth = IUniswapV2Router02(UNISWAP_V2_ROUTER)
                .swapExactTokensForTokens(
                    _amountIn,
                    _amountOutMin,
                    path,
                    address(this),
                    block.timestamp+100
                )[1];

            // uint256 _amountOfWeth = amounts;
            // uint256 _deductionAmount = (_amountOfWeth * 99) / 10000; // 0.99% deduction
            // uint256 _maintanierFee = _deductionAmount / 2;
            // uint256 _platformFee = _deductionAmount - _maintanierFee;
            // uint256 amountToSend = _amountOfWeth - _deductionAmount;

            IERC20(WETH).transfer(
                maintanierAddress,
                ((_amountOfWeth * 99) / 10000) / 2
            );
            IERC20(WETH).transfer(
                platformAddress,
                (((_amountOfWeth * 99) / 10000) -
                    ((_amountOfWeth * 99) / 10000)) / 2
            );
            IERC20(WETH).transfer(
                _to,
                _amountOfWeth - (_amountOfWeth * 99) / 10000
            );

            emit TokensSwapped(
                _tokenIn,
                _tokenOut,
                _amountIn,
                (_amountOfWeth - (_amountOfWeth * 99)) / 10000,
                _to
            );
        } else {
            // Calculate the percentage to deduct
            uint256 deductionAmount = (_amountIn * 99) / 10000; // 0.99% deduction
            uint256 maintanierFee = deductionAmount / 2;
            uint256 platformFee = deductionAmount - maintanierFee;
            uint256 amountToSwap = _amountIn - deductionAmount;

            IERC20(_tokenIn).transferFrom(
                msg.sender,
                maintanierAddress,
                maintanierFee
            );
            IERC20(_tokenIn).transferFrom(
                msg.sender,
                platformAddress,
                platformFee
            );
            IERC20(_tokenIn).transferFrom(
                msg.sender,
                address(this),
                amountToSwap
            );
            IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, amountToSwap);

            IUniswapV2Router02(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
                amountToSwap,
                _amountOutMin,
                path,
                _to,
                block.timestamp
            );

            emit TokensSwapped(
                _tokenIn,
                _tokenOut,
                _amountIn,
                amountToSwap,
                _to
            );
        }
    }

    /**
     * Get the minimum amount of token Out for a given token In and amount In
     * @param _tokenIn The address of the token to trade out of
     * @param _tokenOut The address of the token to receive in the trade
     * @param _amountIn The amount of tokens to send in
     * @return The minimum amount of tokens expected to receive
     */
    function getAmountOutMin(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    ) external view returns (uint256) {
        // Construct the token swap path
        address[] memory path;
        if (_tokenIn == WETH || _tokenOut == WETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = WETH;
            path[2] = _tokenOut;
        }

        // Get the minimum amount of token Out
        uint256[] memory amountOutMins = IUniswapV2Router02(UNISWAP_V2_ROUTER)
            .getAmountsOut(_amountIn, path);
        return amountOutMins[path.length - 1];
    }

    function setPlatformAddress(
        address _account
    ) external onlyOwner ZeroAddress(_account) {
        platformAddress = _account;
    }

    function setMaintainerAddress(
        address _account
    ) external onlyOwner ZeroAddress(_account) {
        maintanierAddress = _account;
    }
}
