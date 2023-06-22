const { expect } = require("chai");
const { Signer } = require("ethers");
const { ethers } = require("hardhat");
const { describe } = require("mocha");
const BN = require("ethers").BigNumber;

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

describe("MKong Token Testing", async () => {
  beforeEach(async () => {
    [owner, user] = await ethers.getSigners();
    accounts = await ethers.getSigners();
    provider = await ethers.provider;

    console.log("accounts", accounts[1].address);
    console.log("owner", owner.address);

    CalHash = await ethers.getContractFactory("CalHash");
    Weth9 = await ethers.getContractFactory("WETH9");
    Pair = await ethers.getContractFactory("UniswapV2Pair");
    Factory = await ethers.getContractFactory("UniswapV2Factory");
    Router = await ethers.getContractFactory("UniswapV2Router02");
    memekong = await ethers.getContractFactory("MEMEKONG");
    calhash = await CalHash.deploy();
    await calhash.getInitHash();
    console.log("init hash ", await calhash.getInitHash());

    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    pair = await Pair.deploy();
    await pair.deployed();

    weth9 = await Weth9.deploy();
    await weth9.deployed();

    router = await Router.deploy(factory.address, weth9.address);
    await router.deployed();

    Memekong = await memekong.deploy();
    await Memekong.deployed();

    await Memekong.init(
      BN.from("1000000").mul(BN.from("10").pow("9")),
      owner.address,
      router.address
    );

    await Memekong.setAdminCommission(0);
    await Memekong.approve(
      router.address,
      BN.from("1000000").mul(BN.from("10").pow("9"))
    );

    console.log("before li");
    await router
      .connect(owner)
      .addLiquidityETH(
        Memekong.address,
        BN.from("100000").mul(BN.from("10").pow("9")),
        1,
        1,
        owner.address,
        1969971655,
        { value: BN.from("10").mul(BN.from("10").pow("18")) }
      );
    console.log("Liquidity added successfully ");

    // // console.log("pairAddress", pairAddress);

    // const getAmountsOut = await router.getAmountsOut(
    //   BN.from("100").mul(BN.from("10").pow("18")),
    //   [Memekong.address, weth9.address]
    // );
    // console.log("getAmountsOut", getAmountsOut);
  });

  ///Staking///////////////////
  it("should allow staking tokens", async function () {
    await Memekong.connect(owner).mint(
      BN.from("10").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    console.log(initialBalance, "first");
    let amount = BN.from("1").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);

    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log(finalBalance, "second");

    expect(finalBalance).to.equal(initialBalance - amount);
    expect(await Memekong.balanceOf(Memekong.address)).to.equal(amount);
    expect(await Memekong.totalStaked()).to.be.equal(amount);
  });

  it("should update totalStaked when staking tokens", async function () {
    await Memekong.connect(owner).mint(
      BN.from("10").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    let amount1 = BN.from("1").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount1);
    const totalStakedBefore = await Memekong.totalStaked();

    let amount2 = BN.from("1").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount2);

    const totalStakedAfter = await Memekong.totalStaked();

    expect(totalStakedAfter).to.equal(totalStakedBefore.add(amount2));
  });
  it("should update totalStaked when staking tokens", async function () {
    await Memekong.connect(owner).mint(
      BN.from("10").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    let amount1 = BN.from("1").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount1);
    const totalStakedBefore = await Memekong.totalStaked();

    let amount2 = BN.from("1").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount2);

    const totalStakedAfter = await Memekong.totalStaked();

    expect(totalStakedAfter).to.equal(totalStakedBefore.add(amount2));
  });

  it("should not allow staking more than maximumStakingAmount", async function () {
    await Memekong.connect(owner).mint(
      BN.from("500000000").mul(BN.from("10").pow("9")),
      user.address
    );
    let amount = BN.from("200000000").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);

    let amountExceedingMax = BN.from("1").mul(BN.from("10").pow("9"));
    await expect(
      Memekong.connect(user).StakeTokens(amountExceedingMax)
    ).to.be.revertedWith("Maximum staking limit reached");
  });
  it("should not allow if staking amount is zero ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("50000000").mul(BN.from("10").pow("9")),
      user.address
    );
    let amount = BN.from("0").mul(BN.from("10").pow("9"));

    await expect(Memekong.connect(user).StakeTokens(amount)).to.be.revertedWith(
      "zero input"
    );
  });
  it("should not allow if staking amount is more than the user balance ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("50000000").mul(BN.from("10").pow("9")),
      user.address
    );
    let amount = BN.from("200000000").mul(BN.from("10").pow("9"));

    await expect(Memekong.connect(user).StakeTokens(amount)).to.be.revertedWith(
      "Error: insufficient balance"
    );
  });
  it("should emit TokenStake event when staking tokens", async function () {
    let amount = BN.from("1").mul(BN.from("10").pow("9"));

    await expect(Memekong.StakeTokens(amount))
      .to.emit(Memekong, "TokenStake")
      .withArgs(owner.address, amount);
  });
  //unStake///
  it("unStaking function with no emergency", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("50").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, false);

    const nineDays = 9 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");

    await Memekong.connect(user).ClaimUnStakeAmount();

    const finalBalanceAfterUnStake = await Memekong.connect(
      user
    ).mkongBalance();
    expect(finalBalanceAfterUnStake).to.be.equal(
      BN.from("950").mul(BN.from("10").pow("9"))
    );
  });
  it("unStaking function with no emergency should not allow if no staked balance is left", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("100").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, false);

    const nineDays = 9 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");

    await expect(
      Memekong.connect(user).ClaimUnStakeAmount()
    ).to.be.revertedWith("you have no staked balance");
  });
  it("unStaking function with no emergency should not allow if trying to unStake before cooling perion 9 days ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("10").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, false);

    await expect(
      Memekong.connect(user).ClaimUnStakeAmount()
    ).to.be.revertedWith("invalid time: must be greater than 9 days");
  });
  it("unStaking function with no emergency should not allow if theres no pending amount ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("100").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("10").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, false);

    const nineDays = 9 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await Memekong.connect(user).ClaimUnStakeAmount();
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await expect(
      Memekong.connect(user).ClaimUnStakeAmount()
    ).to.be.revertedWith("no available amount");
  });
  it("unStaking function with no emergency should not allow if balance of contract is less than the user staked amount ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("10").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, false);

    const nineDays = 9 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");

    await Memekong.connect(user).ClaimUnStakeAmount();
  });
  it("unStaking function with emergency", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("50").mul(BN.from("10").pow("9"));
    await Memekong.connect(user).UnstakeTokens(amount1, true);

    const finalBalanceAfterUnStake = await Memekong.connect(
      user
    ).mkongBalance();
    console.log("3 balance", finalBalanceAfterUnStake);
    expect(finalBalanceAfterUnStake).to.be.equal(
      finalBalance - 4500000000 + 45500000000
    );
  });
  it("should not allow if amount is zero", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("0").mul(BN.from("10").pow("9"));
    await expect(
      Memekong.connect(user).UnstakeTokens(amount1, false)
    ).to.be.revertedWith("invalid deposit amount");
  });
  it("should not allow if amount is greater than staked balance ", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();
    console.log("1 balance", initialBalance);
    let amount = BN.from("100").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();
    console.log("2 balance", finalBalance);

    const amount1 = BN.from("1000").mul(BN.from("10").pow("9"));
    await expect(
      Memekong.connect(user).UnstakeTokens(amount1, false)
    ).to.be.revertedWith("unstake amount is bigger than you staked");
  });
  ///router///
  it("Getting Name & Symbol", async () => {
    console.log("Memekong", Memekong.address);
    await Memekong.mint(
      BN.from("500").mul(BN.from("10").pow("9")),
      accounts[2].address
    );
    await Memekong.connect(accounts[2]).approve(
      router.address,
      BN.from("500").mul(BN.from("10").pow("9"))
    );
    console.log("beforeSWAP", await provider.getBalance(accounts[2].address));
    // await router.connect(accounts[2]).swapExactTokensForETH(
    //   BN.from("100").mul(BN.from("10").pow("9")),
    //   1,
    //   [Memekong.address,weth9.address],
    //   accounts[2].address,
    //   1969971655
    // );
    await router
      .connect(accounts[2])
      .swapExactTokensForETHSupportingFeeOnTransferTokens(
        BN.from("100").mul(BN.from("10").pow("9")),
        1,
        [Memekong.address, weth9.address],
        accounts[2].address,
        1969971655
      );
    // await router.connect(accounts[1]).swapExactETHForTokensSupportingFeeOnTransferTokens(
    //     1,
    //     [weth9.address,Memekong.address],
    //     accounts[1].address,
    //     1969971655,
    //     { value: BN.from("1").mul(BN.from("10").pow("18"))}

    //   );

    await Memekong.connect(accounts[2]).transfer(
      accounts[3].address,
      BN.from("100").mul(BN.from("10").pow("9"))
    );
    console.log(
      "balance of account[2]",
      await Memekong.balanceOf(accounts[3].address),
      await provider.getBalance(accounts[2].address)
    );
  });
  //burn//
  it("should burn MKONG tokens and update balances", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    console.log(initialBalance, "first");
    let amount = BN.from("10000").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();

    const nineDays = 100 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await Memekong.connect(user).ClaimStakeInterest();
    const afterStake = await Memekong.connect(user).mkongBalance();
    console.log(afterStake, "finalBalance2");
    const burnAmount = 1000;

    await Memekong.connect(user).BurnMkong(burnAmount);
    const finalBalance1 = await Memekong.connect(user).mkongBalance();
    console.log(finalBalance1, "finalBalance1");
    const expectedDifference = afterStake.sub(finalBalance1);

    expect(expectedDifference).to.equal(1000);

    const userBalance = await Memekong.connect(user).mkongBalance();
    expect(userBalance).to.equal(afterStake.sub(1000));
    const unipool = await Memekong.uniPool();
    const uniPoolBalance = await Memekong.balanceOf(unipool);
    console.log(uniPoolBalance, "uniPoolBalance");

    const totalSupply = await Memekong.totalSupply();
    console.log(totalSupply, "totalSupply");
    const contractBalance = await Memekong.balanceOf(Memekong.address);
    // expect(uniPoolBalance).to.equal(200);
    // expect(totalSupply).to.equal(700);
  });

  it("should revert if the amount is zero", async function () {
    await expect(Memekong.BurnMkong(0)).to.be.revertedWith(
      "value must be greater than 0"
    );
  });

  it("should revert if the balance is too low", async function () {
    await Memekong.connect(owner).mint(
      BN.from("10000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    console.log(initialBalance, "first");
    let amount = BN.from("10000").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();

    const nineDays = 100 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await Memekong.connect(user).ClaimStakeInterest();
    const afterStake = await Memekong.connect(user).mkongBalance();
    console.log(afterStake, "finalBalance2");
    const burnAmount = 1000000000000;

    await expect(
      Memekong.connect(user).BurnMkong(burnAmount)
    ).to.be.revertedWith("balance too low");
  });
  it("checking the unipool balances", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    console.log(initialBalance, "first");
    let amount = BN.from("10000").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();

    const nineDays = 100 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await Memekong.connect(user).ClaimStakeInterest();
    const afterStake = await Memekong.connect(user).mkongBalance();
    console.log(afterStake, "finalBalance2");
    const burnAmount = 1000;
    const unipool = await Memekong.uniPool();
    const uniPoolBalancebefore = await Memekong.balanceOf(unipool);
    await Memekong.connect(user).BurnMkong(burnAmount);

    const uniPoolBalanceafter = await Memekong.balanceOf(unipool);

    expect(uniPoolBalanceafter).to.be.equal(
      uniPoolBalancebefore.sub(burnAmount)
    );
  });
  it("checking the unipool balances if the sender amount is greater", async function () {
    await Memekong.connect(owner).mint(
      BN.from("1000000").mul(BN.from("10").pow("9")),
      user.address
    );
    const initialBalance = await Memekong.connect(user).mkongBalance();

    console.log(initialBalance, "first");
    let amount = BN.from("10000").mul(BN.from("10").pow("9"));

    await Memekong.connect(user).StakeTokens(amount);
    const finalBalance = await Memekong.connect(user).mkongBalance();

    const nineDays = 100 * 24 * 60 * 60;
    await ethers.provider.send("evm_increaseTime", [nineDays]);
    await ethers.provider.send("evm_mine");
    await Memekong.connect(user).ClaimStakeInterest();
    const afterStake = await Memekong.connect(user).mkongBalance();
    console.log(afterStake, "finalBalance2");
    const burnAmount = 1100000000000;
    const unipool = await Memekong.uniPool();
    const uniPoolBalancebefore = await Memekong.balanceOf(unipool);
    await Memekong.connect(user).BurnMkong(burnAmount);

    const uniPoolBalanceafter = await Memekong.balanceOf(unipool);
    console.log(uniPoolBalanceafter, "uniPoolBalanceafter");
    const poolBurnAdjust = await Memekong.poolBurnAdjust();
    const cal = uniPoolBalancebefore.div(poolBurnAdjust);
    expect(uniPoolBalanceafter).to.be.equal(uniPoolBalancebefore.sub(cal));
  });

  it("should set the unstake time offset", async function () {
    const initialTimeoff = await Memekong.UNSTAKE_TIMEOFF();

    const newTimeoff = 3600; // 1 hour
    await Memekong.setUnstakeTimeoff(newTimeoff);

    const updatedTimeoff = await Memekong.UNSTAKE_TIMEOFF();
    expect(updatedTimeoff).to.equal(newTimeoff);
    expect(updatedTimeoff).to.not.equal(initialTimeoff);
  });

  it("should revert if called by a non-owner address", async function () {
    const newTimeoff = 3600; // 1 hour
    await expect(
      Memekong.connect(user).setUnstakeTimeoff(newTimeoff)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  //setUnipool
  it("should set the uniPool address correctly", async function () {
    const newUnipoolAddress = "0x1234567890123456789012345678901234567890";

    await Memekong.connect(owner).setUnipool(newUnipoolAddress);
    const updatedUnipoolAddress = await Memekong.uniPool();
    expect(updatedUnipoolAddress).to.equal(newUnipoolAddress);
  });

  it("should revert when called by a non-owner account", async function () {
    const newUnipoolAddress = "0x1234567890123456789012345678901234567890";
    await expect(
      Memekong.connect(user).setUnipool(newUnipoolAddress)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert when the contract is locked", async function () {
    const newUnipoolAddress = "0x1234567890123456789012345678901234567890";
    await Memekong.connect(owner).revokeAdmin();
    await expect(
      Memekong.connect(owner).setUnipool(newUnipoolAddress)
    ).to.be.revertedWith("cannot change native pool");
  });
  //setBurnAdjust

  it("should set the burnAdjust value correctly", async function () {
    const newBurnAdjust = 500;

    await Memekong.connect(owner).setBurnAdjust(newBurnAdjust);

    const updatedBurnAdjust = await Memekong.burnAdjust();

    expect(updatedBurnAdjust).to.equal(newBurnAdjust);
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newBurnAdjust = 500;
    await expect(
      Memekong.connect(nonOwner).setBurnAdjust(newBurnAdjust)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert when the contract is locked", async function () {
    const newBurnAdjust = 500;
    await Memekong.connect(owner).revokeAdmin();
    await expect(
      Memekong.connect(owner).setBurnAdjust(newBurnAdjust)
    ).to.be.revertedWith("cannot change burn rate");
  });
  //uniPoolBurnAdjust

  it("should set the poolBurnAdjust value correctly", async function () {
    const newPoolBurnAdjust = 500;
    await Memekong.connect(owner).uniPoolBurnAdjust(newPoolBurnAdjust);
    const updatedPoolBurnAdjust = await Memekong.poolBurnAdjust();
    expect(updatedPoolBurnAdjust).to.equal(newPoolBurnAdjust);
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newPoolBurnAdjust = 500;

    await expect(
      Memekong.connect(nonOwner).uniPoolBurnAdjust(newPoolBurnAdjust)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert when the contract is locked", async function () {
    const newPoolBurnAdjust = 500;

    await Memekong.connect(owner).revokeAdmin();
    await expect(
      Memekong.connect(owner).uniPoolBurnAdjust(newPoolBurnAdjust)
    ).to.be.revertedWith("cannot change pool burn rate");
  });
  //setAdmin
  it("should set the admin address correctly", async function () {
    const newAdmin = ethers.utils.getAddress(
      "0x1234567890123456789012345678901234567890"
    );
    await Memekong.connect(owner).setAdmin(newAdmin);

    const updatedAdmin = await Memekong.admin();
    expect(updatedAdmin).to.equal(newAdmin);
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newAdmin = ethers.utils.getAddress(
      "0x1234567890123456789012345678901234567890"
    );

    await expect(
      Memekong.connect(nonOwner).setAdmin(newAdmin)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  //setStakingDays

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newDays = 30;
    await expect(
      Memekong.connect(nonOwner).setStakingDays(newDays)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  //apyUnique

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newUnique = 10;
    await expect(
      Memekong.connect(nonOwner).apyUnique(newUnique)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  //setAdminCommission
  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newCommission = 5;
    await expect(
      Memekong.connect(nonOwner).setAdminCommission(newCommission)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  //setBurnPercentage

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const newPercentage = 2;
    await expect(
      Memekong.connect(nonOwner).setBurnPercentage(newPercentage)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  //rescueETH

  //   it("should transfer the specified amount of ETH to the owner", async function () {
  //     const weiAmount = ethers.utils.parseEther("1");
  //       // await router.connect(accounts[1]).swapExactETHForTokensSupportingFeeOnTransferTokens(
  //       //   1,
  //       //   [weth9.address,Memekong.address],
  //       //   owner.address,
  //       //   1969971655,
  //       //   { value: BN.from("1").mul(BN.from("10").pow("18"))}

  //       // );
  //       const initialBalanceContract = await ethers.provider.getBalance(Memekong.address);
  //     const initialBalance = await ethers.provider.getBalance(owner.address);
  // console.log(initialBalanceContract,"initialBalanceContract")
  //     await Memekong.connect(owner).rescueETH(weiAmount);

  //     const updatedBalance = await ethers.provider.getBalance(owner.address);

  //     expect(updatedBalance.sub(initialBalance)).to.equal(weiAmount);
  //   });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    const weiAmount = ethers.utils.parseEther("1");
    await expect(
      Memekong.connect(nonOwner).rescueETH(weiAmount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should revert if the contract balance is insufficient", async function () {
    const weiAmount = ethers.utils.parseEther("1");
    await expect(
      Memekong.connect(owner).rescueETH(weiAmount)
    ).to.be.revertedWith("Insufficient ETH Balance");
  });
  //rescueAnyERC20Tokens
  it("should transfer the specified amount of ERC20 tokens to the recipient", async function () {
    const initialBalance = await Memekong.balanceOf(user.address);
    await Memekong.connect(owner).mint(1000,Memekong.address)
    await Memekong.connect(owner).rescueAnyERC20Tokens(
      Memekong.address,
      user.address,
      10
    );

    const updatedBalance = await Memekong.balanceOf(user.address);

    expect(updatedBalance.sub(initialBalance)).to.equal(10);
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);

    await expect(
      Memekong.connect(nonOwner).rescueAnyERC20Tokens(
        Memekong.address,
        user.address,
        100
      )
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  ///forceTransfer

  it("should transfer the specified amount of tokens from 'from' to 'to'", async function () {
    const initialBalance = await Memekong.balanceOf(user.address);

    await Memekong.connect(owner).forceTransfer(
      owner.address,
      user.address,
      10
    );

    const updatedBalance = await Memekong.balanceOf(user.address);
    expect(updatedBalance.sub(initialBalance)).to.equal(10);
  });

  it("should revert when trying to transfer tokens to the zero address", async function () {
    await expect(
      Memekong.connect(owner).forceTransfer(
        owner.address,
        ethers.constants.AddressZero,
        10
      )
    ).to.be.revertedWith("Cannot send to 0 address");
  });

  it("should revert when trying to transfer zero tokens", async function () {
    await expect(
      Memekong.connect(owner).forceTransfer(owner.address, user.address, 0)
    ).to.be.revertedWith("Amount should be greater than 0");
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);

    await expect(
      Memekong.connect(nonOwner).forceTransfer(owner.address, user.address, 10)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  /////

  it("should set the Uniswap router address to the specified value", async function () {
    await Memekong.connect(owner).setUniswapRouterAddress(user.address);

    const updatedRouter = await Memekong.uniswapV2Router();

    expect(updatedRouter).to.equal(user.address);
  });

  it("should revert when trying to set the Uniswap router address to the zero address", async function () {
    await expect(
      Memekong.connect(owner).setUniswapRouterAddress(
        ethers.constants.AddressZero
      )
    ).to.be.revertedWith("Invalid Address");
  });

  it("should revert when called by a non-owner account", async function () {
    const nonOwner = ethers.provider.getSigner(1);
    await expect(
      Memekong.connect(nonOwner).setUniswapRouterAddress(user.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("should return the correct decimal value", async function () {
    const decimals = await Memekong.decimals();

    expect(decimals).to.equal(9);
  });

  it("should return the correct token name", async function () {
    const name = await Memekong.name();

    expect(name).to.equal("MEME KONG");
  });

  it("should return the correct token symbol", async function () {
    const symbol = await Memekong.symbol();

    expect(symbol).to.equal("MKONG");
  });
});
