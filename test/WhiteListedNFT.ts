import { ethers } from "hardhat";
import { expect } from "chai";
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("WhiteListedNFT", function () {
  async function deployWhiteListedNFTFixture() {
    const [admin, owner, otherAccount, anotherAccount] = await ethers.getSigners();

    const WhiteListedNFT = await ethers.getContractFactory("WhiteListedNFT");
    const whiteListedNFT = await WhiteListedNFT.deploy(admin.address, 10);

    return { whiteListedNFT, admin, owner, otherAccount, anotherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { whiteListedNFT, admin } = await loadFixture(deployWhiteListedNFTFixture);

      expect(await whiteListedNFT.getAdmin()).to.equal(admin.address);
    });
  });

  describe("WhiteList Management", function () {
    it("Should allow admin to add to whitelist", async function () {
      const { whiteListedNFT, admin, owner } = await loadFixture(deployWhiteListedNFTFixture);
      await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
      expect(await whiteListedNFT.isOnWhiteList(owner.address)).to.equal(true);
    });

    it("Should prevent non-admins from adding to whitelist", async function () {
      const { whiteListedNFT, otherAccount, owner } = await loadFixture(deployWhiteListedNFTFixture);
      await expect(whiteListedNFT.connect(otherAccount).addToWhiteList(owner.address)).to.be.revertedWith("Only admin can execute this");
    });

    it("Should allow admin to remove from whitelist", async function () {
      const { whiteListedNFT, admin, owner } = await loadFixture(deployWhiteListedNFTFixture);
      await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
      await whiteListedNFT.connect(admin).removeFromWhiteList(owner.address);
      expect(await whiteListedNFT.isOnWhiteList(owner.address)).to.equal(false);
    });
  });

  describe("Minting", function () {
    it("Should allow whitelist user to mint", async function () {
      const { whiteListedNFT, admin, owner } = await loadFixture(deployWhiteListedNFTFixture);
      await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
      await expect(whiteListedNFT.connect(owner).mint()).not.to.be.reverted;
      expect(await whiteListedNFT.hasMinted(owner.address)).to.equal(true);
    });

    it("Should prevent non-whitelist user from minting", async function () {
      const { whiteListedNFT, otherAccount } = await loadFixture(deployWhiteListedNFTFixture);
      await expect(whiteListedNFT.connect(otherAccount).mint()).to.be.revertedWith("You are not on the whitelist");
    });

    it("Should prevent user from minting more than once", async function () {
      const { whiteListedNFT, admin, owner } = await loadFixture(deployWhiteListedNFTFixture);
      await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
      await whiteListedNFT.connect(owner).mint();
      await expect(whiteListedNFT.connect(owner).mint()).to.be.revertedWith("You have already minted");
    });

    it("Should prevent minting more than MAX_NFT_COUNT", async function () {
      const { whiteListedNFT, admin, owner } = await loadFixture(deployWhiteListedNFTFixture);

      const signers = await ethers.getSigners();

      let mintedCount = 0;
      for (const signer of signers) {
          if (signer.address !== owner.address && signer.address !== admin.address) {
              await whiteListedNFT.connect(admin).addToWhiteList(signer.address);
              await whiteListedNFT.connect(signer).mint();
              mintedCount++;
              if (mintedCount >= 10) {
                  break; // stop once we've minted 99 times
              }
          }
      }

      await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
      await expect(whiteListedNFT.connect(owner).mint()).to.be.revertedWith("Maximum NFTs minted");
    });
  });

  describe("Admin Management", function () {
    it("Should allow current admin to set a new admin", async function () {
      const { whiteListedNFT, admin, otherAccount } = await loadFixture(deployWhiteListedNFTFixture);
      await whiteListedNFT.connect(admin).setAdmin(otherAccount.address);
      expect(await whiteListedNFT.getAdmin()).to.equal(otherAccount.address);
    });

    it("Should prevent non-admins from setting a new admin", async function () {
      const { whiteListedNFT, otherAccount, anotherAccount } = await loadFixture(deployWhiteListedNFTFixture);
      await expect(whiteListedNFT.connect(otherAccount).setAdmin(anotherAccount.address)).to.be.revertedWith("Only admin can execute this");
    });
});

  describe("Token Management", function () {
      it("Should return correct currentTokenId after multiple mints", async function () {
        const { whiteListedNFT, admin, owner, otherAccount } = await loadFixture(deployWhiteListedNFTFixture);
        await whiteListedNFT.connect(admin).addToWhiteList(owner.address);
        await whiteListedNFT.connect(owner).mint();

        await whiteListedNFT.connect(admin).addToWhiteList(otherAccount.address);
        await whiteListedNFT.connect(otherAccount).mint();

        expect(await whiteListedNFT.currentTokenId()).to.equal(2);
      });
  });

});
