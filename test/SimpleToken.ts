import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Overflow Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultWithInitSupply() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const SimpleToken = await ethers.getContractFactory("SimpleToken", deployer);
    const simpleToken = await SimpleToken.deploy(1000);
    
    return {simpleToken, deployer, user, attacker};
  }

  describe("Simple Token", function () {
    it("Should allow a user to transfer amounts smaller than or equal to its balance", async () => {
        const { simpleToken, deployer, user } = await loadFixture(deployVaultWithInitSupply);

        await simpleToken.transfer(user.address, 1);

        expect(await simpleToken.balanceOf(user.address)).to.eq(1);
        expect(await simpleToken.balanceOf(deployer.address)).to.eq((await simpleToken.totalSupply()) - 1);
    });

    it("Should revert if the user tries to transfer an amount greater than its balance", async () => {
        const { simpleToken, attacker, user } = await loadFixture(deployVaultWithInitSupply);

        await simpleToken.transfer(attacker.address, 1);

        await expect(simpleToken.connect(attacker).transfer(user.address, 11)).to.be.revertedWith("Not enough token");
    });

    it.skip("Should overflow if an attacker transfer an amount greater than its balance", async () => {
        const { simpleToken, attacker, user } = await loadFixture(deployVaultWithInitSupply);

        await simpleToken.transfer(attacker.address, 10);
        await simpleToken.connect(attacker).transfer(user.address, 11);
        expect(await simpleToken.balanceOf(attacker.address)).to.be.eq(ethers.constants.MaxUint256);
    });
  });
});
