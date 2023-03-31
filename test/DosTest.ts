import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Dos", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAuctionWithInitSupply() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const Auction = await ethers.getContractFactory("Auction", deployer);
    const auction = await Auction.deploy();

    await auction.bid({ value: 100 });
    
    return {auction, deployer, user, attacker};
  }

  async function deployAuctionV2WithInitSupply() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const AuctionV2 = await ethers.getContractFactory("AuctionV2", deployer);
    const auctionv2 = await AuctionV2.deploy();

    await auctionv2.bid({ value: 100 });
    
    return {auctionv2, deployer, user, attacker};
  }

  describe("Auction", function () {
    describe("If bid is lower than highestBid", function() {
      it("Should NOT accept bids lowder than current bid", async () => {
        const { auction, user } = await loadFixture(deployAuctionWithInitSupply);

        await expect(auction.connect(user).bid({ value: 50 })).to.be.revertedWith("Bid not high enough");
      });
    });

    describe("If bid is higher than highestBid", function() {
      it("Should accept bids higher than current bid", async () => {
        const { auction, user } = await loadFixture(deployAuctionWithInitSupply);

        await auction.connect(user).bid({ value: 150 });
        expect(await auction.highestBid()).to.eq(150);
      });

      it("Should make msg.sender to be currentLeader", async () => {
        const { auction, user } = await loadFixture(deployAuctionWithInitSupply);

        await auction.connect(user).bid({ value: 150 });
        expect(await auction.currentLeader()).to.eq(user.address);
      });

      it("Should add current leader and highestBid to prevous refund", async () => {
        const { auction, user, deployer } = await loadFixture(deployAuctionWithInitSupply);

        await auction.connect(user).bid({ value: 150 });
        const [addr, amount] = await auction.refunds(0);
        expect(addr).to.eq(deployer.address);
        expect(amount).to.eq(100);
      });
    });

    describe("When calling refundAll", function() {
      it("Should refund for bidders didn't win", async () => {
        const { auction, user, deployer } = await loadFixture(deployAuctionWithInitSupply);

        await auction.connect(user).bid({ value: 150 });
        const userBalance = await ethers.provider.getBalance(user.address);
        await auction.bid({ value: 200 });
        await auction.refundAll();

        expect(await ethers.provider.getBalance(user.address)).to.eq(userBalance.add(150));
      });

      it.skip("Should revert if the amount of computation hits the block gas limit",async () => {
        const { auction, user, deployer } = await loadFixture(deployAuctionWithInitSupply);

        var value = 150;
        for (var i = 0; i < 1500; i++) {
          await auction.connect(user).bid({ value: value + i });
        }
        expect(await auction.refundAll()).to.revertedWith("Transaction ran out of gas");

      });
    });
  });

  describe("AuctionV2", function () {
    describe("If bid is lower than highestBid", function() {
      it("Should NOT accept bids lowder than current bid", async () => {
        const { auctionv2, user } = await loadFixture(deployAuctionV2WithInitSupply);

        await expect(auctionv2.connect(user).bid({ value: 50 })).to.be.revertedWith("Bid not high enough");
      });
    });

    describe("If bid is higher than highestBid", function() {
      it("Should accept bids higher than current bid", async () => {
        const { auctionv2, user } = await loadFixture(deployAuctionV2WithInitSupply);

        await auctionv2.connect(user).bid({ value: 150 });
        expect(await auctionv2.highestBid()).to.eq(150);
      });

      it("Should make msg.sender to be currentLeader", async () => {
        const { auctionv2, user } = await loadFixture(deployAuctionV2WithInitSupply);

        await auctionv2.connect(user).bid({ value: 150 });
        expect(await auctionv2.currentLeader()).to.eq(user.address);
      });

      // it.skip("Should add current leader and highestBid to prevous refund", async () => {
      //   const { auctionv2, user, deployer } = await loadFixture(deployAuctionV2WithInitSupply);

      //   await auctionv2.connect(user).bid({ value: 150 });
      //   const [addr, amount] = await auctionv2.refunds(0);
      //   expect(addr).to.eq(deployer.address);
      //   expect(amount).to.eq(100);
      // });
    });

    // describe.skip("When calling refundAll", function() {
    //   it("Should refund for bidders didn't win", async () => {
    //     const { auctionv2, user, deployer } = await loadFixture(deployAuctionV2WithInitSupply);

    //     await auctionv2.connect(user).bid({ value: 150 });
    //     const userBalance = await ethers.provider.getBalance(user.address);
    //     await auctionv2.bid({ value: 200 });
    //     await auction.refundAll();

    //     expect(await ethers.provider.getBalance(user.address)).to.eq(userBalance.add(150));
    //   });

    //   it ("Should revert if the amount of computation hits the block gas limit",async () => {
    //     const { auction, user, deployer } = await loadFixture(deployAuctionWithInitSupply);

    //     var value = 150;
    //     for (var i = 0; i < 1500; i++) {
    //       await auction.connect(user).bid({ value: value + i });
    //     }
    //     expect(await auction.refundAll()).to.revertedWith("Transaction ran out of gas");

    //   });
    // });
  });
});
