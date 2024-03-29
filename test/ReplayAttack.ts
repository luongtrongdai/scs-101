import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Replay Attack", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMultiSigWalletWithAdminsAccount() {
    const [deployer, admin1, admin2, user, attacker] = await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet", deployer);
    const multiSigWallet = await MultiSigWallet.deploy([admin1.address, admin2.address]);

    await admin1.sendTransaction({ to: multiSigWallet.address, value: ethers.utils.parseEther("10")});    
    return {multiSigWallet, admin1, admin2, user, attacker};
  }

  async function deployMultiSigWalletV2WithAdminsAccount() {
    const [deployer, admin1, admin2, user, attacker] = await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWalletV2", deployer);
    const multiSigWallet = await MultiSigWallet.deploy([admin1.address, admin2.address]);

    await admin1.sendTransaction({ to: multiSigWallet.address, value: ethers.utils.parseEther("10")});    
    return {multiSigWallet, admin1, admin2, user, attacker};
  }

  it("Should allow transfer funds after receiving both signatures", async () => {
    const {multiSigWallet, admin1, admin2, user } = await loadFixture(deployMultiSigWalletWithAdminsAccount);

    const beforeBalance = await ethers.provider.getBalance(user.address);

    const amount = ethers.utils.parseEther("1");
    const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
    const messageBuffer = ethers.utils.concat([message]);

    //sign
    let adminOneSig = await admin1.signMessage(messageBuffer);
    let adminTwoSig = await admin2.signMessage(messageBuffer);

    let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
    let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);

    await multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig]);

    const afterBalance =  await ethers.provider.getBalance(user.address);

    expect(afterBalance).to.be.eq(beforeBalance.add(amount));
  });

  it("Should revert if receive other signature", async () => {
    const {multiSigWallet, admin1, user, attacker } = await loadFixture(deployMultiSigWalletWithAdminsAccount);

    const amount = ethers.utils.parseEther("1");
    const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
    const messageBuffer = ethers.utils.concat([message]);

    //sign
    let adminOneSig = await admin1.signMessage(messageBuffer);
    let adminTwoSig = await attacker.signMessage(messageBuffer);

    let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
    let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);

    await expect(multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig])).to.be.revertedWith("Access restricted");
  });

  describe("Attack", function () {
    it("vulnerable: allow transfer multiple times with same signatures", async () => {
      const {multiSigWallet, admin1, admin2, user } = await loadFixture(deployMultiSigWalletWithAdminsAccount);
  
      const beforeBalance = await ethers.provider.getBalance(user.address);
  
      const amount = ethers.utils.parseEther("1");
      const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
      const messageBuffer = ethers.utils.concat([message]);
  
      //sign
      let adminOneSig = await admin1.signMessage(messageBuffer);
      let adminTwoSig = await admin2.signMessage(messageBuffer);
  
      let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
      let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);
  
      await multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig]);
      await multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig]);
      await multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig]);
  
      const afterBalance =  await ethers.provider.getBalance(user.address);
  
      expect(afterBalance).to.be.eq(beforeBalance.add(amount.mul(3)));
    });

    it("Should prevent transfer multiple times with same signatures", async () => {
      const {multiSigWallet, admin1, admin2, user } = await loadFixture(deployMultiSigWalletV2WithAdminsAccount);
  
      const nonce = 1;
  
      const amount = ethers.utils.parseEther("1");
      const message = ethers.utils.solidityPack(["address", "uint256"], [user.address, amount]);
      const messageBuffer = ethers.utils.concat([message]);
  
      //sign
      let adminOneSig = await admin1.signMessage(messageBuffer);
      let adminTwoSig = await admin2.signMessage(messageBuffer);
  
      let adminOneSplitSig = ethers.utils.splitSignature(adminOneSig);
      let adminTwoSplitSig = ethers.utils.splitSignature(adminTwoSig);
  
      await multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce);
  
      await expect(multiSigWallet.transfer(user.address, amount, [adminOneSplitSig, adminTwoSplitSig], nonce)).to.be.revertedWith("Signature expired");
    });
  });
});
