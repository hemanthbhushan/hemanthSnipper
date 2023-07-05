const Hre = require("hardhat");

async function main() {
  // await Hre.run("verify:verify", {
  //     //address of the Root tunnel
  //     address: "0x8Ffa1d246579C5eb1924B1a7F882702DD10e90a4",
  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: ["0x14ef97a0a27EeDDFd9A1499FD7ef99b52F8C7452"],
  //     //Path of your main contract.
  //     contract:
  //       "contracts/MockRouter/UniswapV2Factory.sol:UniswapV2Factory",
  //   });
  //   await Hre.run("verify:verify", {
  //     //address of the Root tunnel
  //     address: "0x0cB425c9Cc7d687780163dC30d01647261F17309",

  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: [],
  //     //Path of your main contract.
  //     contract:
  //       "contracts/MockRouter/UniswapV2Pair.sol:UniswapV2Pair",
  //   });
  //   await Hre.run("verify:verify", {
  //     //address of the Root tunnel
  //     address: "0x909c1CA4e7463a4399B49701101f67cEd905c460",

  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: [],
  //     //Path of your main contract.
  //     contract:
  //       "contracts/MockRouter/test/WETH9.sol:WETH9",
  //   });
  //   await Hre.run("verify:verify", {
  //     //address of the Root tunnel
  //     address: "0xE485707D382A3d91c71d9814F50Adb1f89d8975a",

  //     //Pass arguments as string and comma seprated values
  //     constructorArguments: ["0x8Ffa1d246579C5eb1924B1a7F882702DD10e90a4","0x909c1CA4e7463a4399B49701101f67cEd905c460"],
  //     //Path of your main contract.
  //     contract:
  //       "contracts/MockRouter/UniswapV2Router02.sol:UniswapV2Router02",
  //   });
  await Hre.run("verify:verify", {
    //address of the Root tunnel
    address: "0xe1764E9c11241b54bD87cC0a858A105950C548eF",

    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract: "contracts/MockRouter/BuyContract.sol:BuyContract",
  });

  await Hre.run("verify:verify", {
    //Deployed contract OwnedUpgradeabilityProxy address
    address: "0x217674a8552a5795f1065496857d39906bd3117B",
    //Path of your main contract.
    contract:
      "contracts/upgradability/TradixProxy.sol:TradixProxy",
  });

  await Hre.run("verify:verify", {
    //address of the Root tunnel
    address: "0x363a704530C8Ecd4194223484d2e281ca2693F26",

    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract:
      "contracts/MockRouter/DummyToken.sol:DummyToken",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
