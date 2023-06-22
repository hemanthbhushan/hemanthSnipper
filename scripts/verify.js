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
    address: "0x50a75714fb2F23d444F95A46a2ac6c2311c73D61",

    //Pass arguments as string and comma seprated values
    constructorArguments: [],
    //Path of your main contract.
    contract: "contracts/MockRouter/BuyContract.sol:BuyContract",
  });

  await Hre.run("verify:verify", {
    //Deployed contract OwnedUpgradeabilityProxy address
    address: "0x2e5746bdbF206Ef4F97911E2BD7fb01Bd2e72E38",
    //Path of your main contract.
    contract:
      "contracts/upgradability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  });

  // await Hre.run("verify:verify", {
  //   //address of the Root tunnel
  //   address: "0xe9ddF749F9b276CC84d32f573cA41befD2D0Ec08",

  //   //Pass arguments as string and comma seprated values
  //   constructorArguments: [],
  //   //Path of your main contract.
  //   contract:
  //     "contracts/MockRouter/DummyToken.sol:DummyToken",
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
