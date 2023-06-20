const { expect } = require("chai");
const { Signer } = require("ethers");
const { ethers } = require("hardhat");
const { describe } = require("mocha");
const BN = require("ethers").BigNumber;

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

describe("sniper  Testing", async () => {
  beforeEach(async () => {
    console.log("first")
    [owner, user] = await ethers.getSigners();
    accounts = await ethers.getSigners();

    console.log("accounts", accounts[1].address);
    console.log("owner", owner.address);

    CalHash = await ethers.getContractFactory("CalHash");
    Weth9 = await ethers.getContractFactory("WETH9");
    Pair = await ethers.getContractFactory("UniswapV2Pair");
    Factory = await ethers.getContractFactory("UniswapV2Factory");
    Router = await ethers.getContractFactory("UniswapV2Router02");
    BuyContarct = await ethers.getContractFactory("BuyContarct");
    DummyTOken = await ethers.getContractFactory("DummyToken");
    calhash = await CalHash.deploy();
    await calhash.getInitHash();
    console.log("init hash ", await calhash.getInitHash());

    factory = await Factory.deploy(owner.address);
    await factory.deployed();

    pair = await Pair.deploy();
    await pair.deployed();

    weth9 = await Weth9.deploy();
    await weth9.deployed();

    await weth9.deposit( { value: BN.from("1000000").mul(BN.from("10").pow("18")) })

    router = await Router.deploy(factory.address, weth9.address);
    await router.deployed();

    dummyTOken = await DummyTOken.deploy();
    await dummyTOken.deployed();

    await dummyTOken.approve(
      router.address,
      BN.from("1000000").mul(BN.from("10").pow("18"))
    );

    await weth9.approve(
      router.address,
      BN.from("1000000").mul(BN.from("10").pow("18"))
    );

    await BuyContarct.setPlatformAddress(owner.address);
    await BuyContarct.setMaintainerAddress(owner.address);

    console.log("before li");
    await router
      .connect(owner)
      .addLiquidity(
        weth9.address,
        dummyTOken.address,
        BN.from("1000000").mul(BN.from("10").pow("18")),
        BN.from("1000000").mul(BN.from("10").pow("18")),
        BN.from("1").mul(BN.from("10").pow("18")),
        BN.from("1").mul(BN.from("10").pow("18")),
        owner.address,
        1677848557
      );
    console.log("Liquidity added successfully ");

    // // // console.log("pairAddress", pairAddress);

    // const getAmountsOut = await router.getAmountsOut(
    //   BN.from("100").mul(BN.from("10").pow("18")),
    //   [dummyTOken.address, weth9.address]
    // );
    // console.log("getAmountsOut", getAmountsOut);
  });
});
