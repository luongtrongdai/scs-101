import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ReentrancyTest", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployInvestorWithSavingsAccount() {
    const [deployer, user] = await ethers.getSigners();

    const SavingsAccountV2 = await ethers.getContractFactory("SavingsAccountV2", deployer);
    const savingsAccount = await SavingsAccountV2.deploy();

    const InvestorV2 = await ethers.getContractFactory("InvestorV2", deployer);
    const investor = await InvestorV2.deploy(savingsAccount.address);
    
    return {savingsAccount, investor, deployer, user};
  }

  describe("From an EOA", function () {
    it("Should be possible to deposit", async () => {
      const { savingsAccount, user } = await loadFixture(deployInvestorWithSavingsAccount);

      expect(await savingsAccount.balanceOf(user.address)).to.eq(0);

      await savingsAccount.connect(user).deposit({ value: 100 });
      expect(await savingsAccount.balanceOf(user.address)).to.eq(100);
    });

    it("Should be possible to withdraw", async () => {
      const { savingsAccount, investor, deployer, user } = await loadFixture(deployInvestorWithSavingsAccount);

      expect(await savingsAccount.balanceOf(user.address)).to.eq(0);

      await savingsAccount.connect(user).deposit({ value: 100 });
      expect(await savingsAccount.balanceOf(user.address)).to.eq(100);

      await savingsAccount.connect(user).withdraw();
      expect(await savingsAccount.balanceOf(user.address)).to.eq(0);
    });
  });

  describe("From a Contract", function () {
    it("Should be possible to deposit", async () => {
      const { savingsAccount, investor } = await loadFixture(deployInvestorWithSavingsAccount);

      expect(await savingsAccount.balanceOf(investor.address)).to.eq(0);

      await investor.depositIntoSavingsAccount({ value: 100 });
      expect(await savingsAccount.balanceOf(investor.address)).to.eq(100);
    });

    it("Should be possible to withdraw", async () => {
      const { savingsAccount, investor, deployer, user } = await loadFixture(deployInvestorWithSavingsAccount);

      expect(await savingsAccount.balanceOf(investor.address)).to.eq(0);

      await investor.depositIntoSavingsAccount({ value: 100 });
      expect(await savingsAccount.balanceOf(investor.address)).to.eq(100);

      await investor.withdrawFromSavingsAccount();
      expect(await savingsAccount.balanceOf(investor.address)).to.eq(0);
    });
  });

  describe("Attack", function () {
    it.skip("Should reentrancy attack",async () => {
      const { savingsAccount, investor, user } = await loadFixture(deployInvestorWithSavingsAccount);

      await savingsAccount.connect(user).deposit({ value: 100 });

      await investor.attack({ value: 100 });

      expect(await ethers.provider.getBalance(savingsAccount.address)).to.eq(0);
    });
  });
});
