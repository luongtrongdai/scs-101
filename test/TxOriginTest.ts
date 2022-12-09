import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Tx.origin", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySmallWalletWithTxOrigin() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const SmallWallet = await ethers.getContractFactory("SmallWallet", deployer);
    const smallWallet = await SmallWallet.deploy();

    await deployer.sendTransaction({ to: smallWallet.address, value: 10000 });

    const SmallWalletAttacker = await ethers.getContractFactory("SmallWalletAttacker", deployer);
    const smallWalletAttacker = await SmallWalletAttacker.deploy(smallWallet.address);
    
    return {smallWallet, smallWalletAttacker, deployer, attacker, user};
  }

  describe("Small Wallet", function () {
    it("Should accept deposits", async () => {
      const { smallWallet, user } = await loadFixture(deploySmallWalletWithTxOrigin);

      expect(await ethers.provider.getBalance(smallWallet.address)).to.eq(10000);
    });

    it("Should allow the owner to execute withdrawAll",async () => {
      const { smallWallet, user } = await loadFixture(deploySmallWalletWithTxOrigin);

      const initialUserBalance = await ethers.provider.getBalance(user.address);
      
      await smallWallet.withdrawAll(user.address);

      expect(await ethers.provider.getBalance(smallWallet.address)).to.eq(0);
      expect(await ethers.provider.getBalance(user.address)).to.eq(initialUserBalance.add(10000));
    });

    it("Should revert if withdrawAll is called from any other account than the owner",async () => {
      const { smallWallet, attacker } = await loadFixture(deploySmallWalletWithTxOrigin);
    
      await expect(smallWallet.connect(attacker).withdrawAll(attacker.address)).to.be.revertedWith("Caller not authorized");
    });
  });
});
