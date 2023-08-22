import { ethers } from "hardhat";

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Deploying with account:", admin.address);
  const MAX_NFT_COUNT = 20;
  const WhiteListedNFTFactory = await ethers.getContractFactory("WhiteListedNFT");
  const whiteListedNFT = await WhiteListedNFTFactory.deploy(admin.address, MAX_NFT_COUNT);
  await whiteListedNFT.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
