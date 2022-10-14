import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Access Control", function () {
  let deployer, attacker;
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAgreedWithPrice100() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const AgreedPrice = await ethers.getContractFactory("AgreedPrice", deployer);
    const agreedPrice = await AgreedPrice.deploy(100);
    
    return {agreedPrice, deployer, attacker, user};
  }

  describe("AgreedPrice", function () {
    it("Should set price at deployment", async () => {
      const { agreedPrice } = await loadFixture(deployAgreedWithPrice100);

      expect(await agreedPrice.price()).to.equal(100);
    });

    it("Should set the deployer account as the owner at deployment",async () => {
      const { agreedPrice, deployer } = await loadFixture(deployAgreedWithPrice100);

      expect(await agreedPrice.owner()).to.equal(deployer.address);
    });

    it("Should be possible for the owner to change price", async () => {
      const { agreedPrice } = await loadFixture(deployAgreedWithPrice100);

      await agreedPrice.updatePrice(1000);

      expect(await agreedPrice.price()).to.equal(1000);
    });

    it("Should NOT be possible for other than the owner to change price",async () => {
      const { agreedPrice, attacker } = await loadFixture(deployAgreedWithPrice100);

      await expect(agreedPrice.connect(attacker).updatePrice(1000)).to.be.revertedWith("only owner can call this");
    });

    it ("Should be possible for the owner to transfer ownership",async () => {
      const { agreedPrice, user } = await loadFixture(deployAgreedWithPrice100);

      await agreedPrice.changeOwner(user.address);

      expect(await agreedPrice.owner()).to.equal(user.address);
    });

    it ("Should be possible for a new owner to call updatePrice",async () => {
      const { agreedPrice, user } = await loadFixture(deployAgreedWithPrice100);

      await agreedPrice.changeOwner(user.address);
      await agreedPrice.connect(user).updatePrice(1000);

      expect(await agreedPrice.price()).to.equal(1000);
    });

    it ("Should NOT be possible for other than the owner to transfer ownership",async () => {
      const { agreedPrice, attacker } = await loadFixture(deployAgreedWithPrice100);

      await expect(agreedPrice.connect(attacker).changeOwner(attacker.address)).to.be.revertedWith("only owner can call this");
    });
  });
});
