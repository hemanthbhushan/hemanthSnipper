// const { expect } = require("chai");
// const { Signer } = require("ethers");
// const { ethers, web3 } = require("hardhat");
// // const { describe } = require("mocha");
// const BN = require("ethers").BigNumber;

// function sleep(time) {
//   return new Promise((resolve) => setTimeout(resolve, time));
// }
// function expandTo18Decimals(n) {
//   return BN.from(n).mul(BN.from(10).pow(18));
// }
// describe("sniper  Testing", async () => {
//   let owner, user, factory, router, pair, dummyTOken, weth9, buyContract;
//   beforeEach(async () => {
//     [owner, user] = await ethers.getSigners();

//     const CalHash = await ethers.getContractFactory("CalHash");
//     const Weth9 = await ethers.getContractFactory("WETH9");
//     const Pair = await ethers.getContractFactory("UniswapV2Pair");
//     const Factory = await ethers.getContractFactory("UniswapV2Factory");
//     const Router = await ethers.getContractFactory("UniswapV2Router02");
//     const BuyContract = await ethers.getContractFactory("BuyContract");
//     const OwnedUpgradeabilityProxy = await ethers.getContractFactory(
//       "OwnedUpgradeabilityProxy"
//     );
    
//     const DummyTOken = await ethers.getContractFactory("DummyToken");
//     const calhash = await CalHash.deploy();
//     console.log("init hash ", await calhash.getInitHash());
    
//     factory = await Factory.deploy(owner.address);
    
//     pair = await Pair.deploy();
//     // await pair.deployed();
    
//     weth9 = await Weth9.deploy();
//     // await weth9.deployed();
    
//     await weth9.deposit({
//       value: 1000000,
//       // value: (Number(1000000) * 10 ** 18).toString(),
//     });
//     buyContract = await BuyContract.deploy();
//     console.log("BuyContract----------",buyContract.address)
    
//     router = await Router.deploy(factory.address, weth9.address);
//     await router.deployed();
    
//     dummyTOken = await DummyTOken.deploy();
//     await dummyTOken.deployed();
    
//     await dummyTOken.approve(
//       router.address,
//       BigNumber.from("1000000").mul(BigNumber.from("10").pow("18"))
//       );
      
//       await weth9.approve(
//         router.address,
//         BN.from("1000000").mul(BN.from("10").pow("18"))
//         );
        
//         let proxy = await OwnedUpgradeabilityProxy.deploy();
//         await sleep(6000);
//         console.log("proxy address", proxy.address);
        
//         console.log("uprade before");
//         await proxy.upgradeTo(buyContract.address);
//         await sleep(6000);
        
//         let proxy1 = BuyContract.attach(proxy.address);
//         console.log("proxy1", proxy1.address);
        
//         await proxy.initialize(
//           router.address,
//           weth9.address,
//           owner.address,
//           owner.address
//           );
          
//           console.log("before li");
//           await router
//           .connect(owner)
//           .addLiquidity(
//             weth9.address,
//             dummyTOken.address,
//         BN.from("1000000").mul(BN.from("10").pow("18")),
//         BN.from("1000000").mul(BN.from("10").pow("18")),
//         BN.from("1").mul(BN.from("10").pow("18")),
//         BN.from("1").mul(BN.from("10").pow("18")),
//         owner.address,
//         1677848557
//         );
//         console.log("Liquidity added successfully ");
        
//         // // // console.log("pairAddress", pairAddress);
        
//         const getAmountsOut = await router.getAmountsOut(
//           BN.from("100").mul(BN.from("10").pow("18")),
//           [dummyTOken.address, weth9.address]
//           );
//           console.log("getAmountsOut", getAmountsOut);
//   });

//   it("Check", async () => {
//     console.log("Hello");
//   });
// });
