// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const Hre = require("hardhat");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function expandTo18Decimals(n) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(18));
}

async function main() {
  // let impl = await hre.ethers.getContractFactory("MEMEKONG");
  // let proxy = await hre.ethers.getContractFactory("MEMEKongProxy");

  Weth9 = await ethers.getContractFactory("WETH9");
  Pair = await ethers.getContractFactory("UniswapV2Pair");
  Factory = await ethers.getContractFactory("UniswapV2Factory");
  Router = await ethers.getContractFactory("UniswapV2Router02");
  BuyContract = await ethers.getContractFactory("BuyContract");
  DummyToken = await ethers.getContractFactory("DummyToken");
  CallHash = await ethers.getContractFactory("CalHash");
  // const Impl = await impl.deploy();
  // console.log("Implementation: ",Impl.address);

  // const Proxy = await proxy.deploy();
  // console.log("Proxy: ",Proxy.address);

  // await Proxy.upgradeTo(Impl.address);

  // factory = await Factory.deploy("0x14ef97a0a27EeDDFd9A1499FD7ef99b52F8C7452");
  // await factory.deployed();
  // console.log("Factory: ", factory.address);

  // pair = await Pair.deploy();
  // await pair.deployed();
  // console.log("Pair: ", pair.address);

  // weth9 = await Weth9.deploy();
  // await weth9.deployed();
  // console.log("WETH: ", weth9.address);

  // router = await Router.deploy(factory.address, weth9.address);
  // await router.deployed();
  // console.log("Router: ", router.address);

  buyContract = await BuyContract.deploy("0xE485707D382A3d91c71d9814F50Adb1f89d8975a", "0x909c1CA4e7463a4399B49701101f67cEd905c460");
  await sleep(6000);
  console.log("BuyContract: ", buyContract.address);



  // dummyToken = await DummyToken.deploy();
  // console.log("DummyTOken: ", dummyToken.address);
  // await sleep(6000);

  // calHash = await CallHash.deploy();
  // console.log("callHash", await calHash.getInitHash());
  // await sleep(6000);

  //verify
 

  sleep(6000);

  // await dummyToken.approve(router.address, expandTo18Decimals(100000));
  // await sleep(6000);
  // await weth9.approve(router.address, expandTo18Decimals(1));
  // await sleep(6000);
  // await router
  //   .connect()
  //   .addLiquidity(
  //     weth9.address,
  //     dummyToken.address,
  //     expandTo18Decimals(1),
  //     expandTo18Decimals(100000),
  //     expandTo18Decimals(1),
  //     expandTo18Decimals(1),
  //     "0x14ef97a0a27EeDDFd9A1499FD7ef99b52F8C7452",
  //     1686307329
  //   );
  // await sleep(6000);
  console.log("COmpleted ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
