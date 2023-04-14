import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";

describe("LotteryV1", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLotteryWithInitSupply() {
    const [deployer, user, attacker] = await ethers.getSigners();

    const Lottery = await ethers.getContractFactory("Lottery", deployer);
    const lottery = await Lottery.deploy();

    const LotteryAttacker = await ethers.getContractFactory("LotteryAttacker", attacker);
    const lotteryAttacker = await LotteryAttacker.deploy(lottery.address);

    return {lottery, lotteryAttacker, deployer, user, attacker};
  }

  describe("Test Lottery game", function () {
    describe.skip("With bets open", function() {
      it("Should allow a user to place a bet", async () => {
        const { lottery, user } = await loadFixture(deployLotteryWithInitSupply);

        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});

        expect(await lottery.bets(user.address)).to.be.eq(10);
      });

      it("Should revert if user place more than 1 bet", async () => {
        const { lottery, user } = await loadFixture(deployLotteryWithInitSupply);

        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});
        await expect(lottery.connect(user).placeBet(20, {value: ethers.utils.parseEther("10")})).to.be.revertedWith("Only 1 bet per player");
      });

      it("Should revert if bet is != 10 ether", async () => {
        const { lottery, user } = await loadFixture(deployLotteryWithInitSupply);

        await expect(lottery.connect(user).placeBet(20, {value: ethers.utils.parseEther("20")})).to.be.revertedWith("Bet cost:  10 ether");
      });

      it("Should revert if bet number is not > 0", async () => {
        const { lottery, user } = await loadFixture(deployLotteryWithInitSupply);

        await expect(lottery.connect(user).placeBet(0, {value: ethers.utils.parseEther("10")})).to.be.revertedWith("Must be a number from 1 to 255");
      });
    });

    describe.skip("With bets closed", function() {
      it("Should revert if a user place a bet", async () => {
        const { lottery, user } = await loadFixture(deployLotteryWithInitSupply);

        await lottery.endLottery();

        await expect(lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")}))
          .to.be.revertedWith("Bets are closed");
      });

      it("Should allow only the winner to call withdrawPrize", async () => {
        const { lottery, user, attacker } = await loadFixture(deployLotteryWithInitSupply);
        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});
        await lottery.connect(attacker).placeBet(15, {value: ethers.utils.parseEther("10")});
        
        var winningNumber = 0;

        while (winningNumber != 10) {
          await lottery.endLottery();
          winningNumber = await lottery.winningNumber();
        }

        await expect(lottery.connect(attacker).withdrawPrize()).to.be.revertedWith("You're the winner");
      });

      it("Should allow the winner to call withdrawPrize", async () => {
        const { lottery, user, attacker } = await loadFixture(deployLotteryWithInitSupply);
        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});
        
        var winningNumber = 0;

        while (winningNumber != 10) {
          await lottery.endLottery();
          winningNumber = await lottery.winningNumber();
        }
        const beforeBalance = await ethers.provider.getBalance(user.address);
        await lottery.connect(user).withdrawPrize();
        const afterBalance = await ethers.provider.getBalance(user.address);

        expect(afterBalance).to.be.gt(beforeBalance);
      });

      it("Should revert if the winner to call withdrawPrize more than once", async () => {
        const { lottery, user, attacker } = await loadFixture(deployLotteryWithInitSupply);
        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});
        
        var winningNumber = 0;

        while (winningNumber != 10) {
          await lottery.endLottery();
          winningNumber = await lottery.winningNumber();
        }
        await lottery.connect(user).withdrawPrize();

        await expect(lottery.connect(user).withdrawPrize()).to.be.revertedWith("Prize already taken");
      });
    });

    describe("Attack", function() {
      it.skip("Should miner guess winningNumber",async () => {
        const { lottery, user, attacker } = await loadFixture(deployLotteryWithInitSupply);

        await lottery.connect(user).placeBet(10, {value: ethers.utils.parseEther("10")});
        await lottery.connect(attacker).placeBet(15, {value: ethers.utils.parseEther("10")});
        await lottery.placeBet(20, {value: ethers.utils.parseEther("10")});

        await network.provider.send("evm_setNextBlockTimestamp", [1681446601]);
        var winningNumber = 0;
        while (winningNumber != 15) {
          await lottery.endLottery();
          winningNumber = await lottery.winningNumber();
        }
        const beforeBalance = await ethers.provider.getBalance(attacker.address);
        await lottery.connect(attacker).withdrawPrize();
        const afterBalance = await ethers.provider.getBalance(attacker.address);

        expect(afterBalance).to.be.gt(beforeBalance);
      });

      it("Should Replicate random logic within the same block", async () => {
        const { lottery, lotteryAttacker, attacker } = await loadFixture(deployLotteryWithInitSupply);

        await lotteryAttacker.attack({ value: ethers.utils.parseEther("10")});
        await lottery.endLottery();

        await network.provider.send("evm_mine");

        console.log("Winning number: ", await lottery.winningNumber());
        console.log("Attacker bid: ", await lottery.bets(lotteryAttacker.address));

        console.log("Contract balance: ", await ethers.provider.getBalance(lottery.address));
        await lotteryAttacker.withdraw();
        console.log("Contract balance: ", await ethers.provider.getBalance(lottery.address));
      });
    });
  });
});