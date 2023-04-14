import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("LogicV1", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLogicV1WithInitSupply() {
    const [deployer] = await ethers.getSigners();

    const LogicV1 = await ethers.getContractFactory("LogicV1", deployer);
    const logicV1 = await LogicV1.deploy();

    
    return {logicV1, deployer};
  }

  describe("Test increase", function () {
    it("Should increase X value", async () => {
      const { logicV1 } = await loadFixture(deployLogicV1WithInitSupply);
      
      await logicV1.increaseX();
      await logicV1.increaseX();

      expect(await logicV1.x()).to.be.eq(2);
    });
  });
});




describe("Proxy", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployProxyWithLogicV1AndInitSupply() {
    const [deployer, attacker, user] = await ethers.getSigners();

    const LogicV1 = await ethers.getContractFactory("LogicV1", deployer);
    const logicV1 = await LogicV1.deploy();

    const LogicV2 = await ethers.getContractFactory("LogicV2", deployer);
    const logicV2 = await LogicV2.deploy();

    const Proxy = await ethers.getContractFactory("Proxy", deployer);
    const proxy = await Proxy.deploy(logicV1.address);

    const proxyPattern = await ethers.getContractAt("LogicV1", proxy.address);
    const proxyPatternV2 = await ethers.getContractAt("LogicV2", proxy.address);
    
    return {logicV1, proxy, logicV2, attacker, proxyPattern, proxyPatternV2, user};
  }

  describe("Test Proxy V1", function () {
    it("Should set logic is V1", async () => {
      const { logicV1, proxy } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      
      expect(await proxy.logicContract()).to.be.eq(logicV1.address);
    });

    it("Should revert if someone try to upgrade without role", async () => {
      const { logicV2, proxy, attacker } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      
      
      await expect(proxy.connect(attacker).upgrade(logicV2.address)).to.be.revertedWith("Access restricted");
    });

    it("Should allow owner upgrade", async () => {
      const { logicV2, proxy } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      await proxy.upgrade(logicV2.address);
      
      expect(await proxy.logicContract()).to.be.eq(logicV2.address);
    });

    it("Should allow to call increaseX", async () => {
      const { proxy, proxyPattern, user } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      await proxyPattern.connect(user).increaseX();
      
      expect(await proxy.x()).to.be.eq(1);
    });

    it("Should allow to call increaseX of Logic V2 after upgrade", async () => {
      const { proxy, logicV2, proxyPatternV2, user } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      await proxy.upgrade(logicV2.address);
      await proxyPatternV2.connect(user).increaseX();
      
      expect(await proxy.x()).to.be.eq(2);
    });

    it("Should set y",async () => {
      const { proxy, logicV2, proxyPatternV2, user } = await loadFixture(deployProxyWithLogicV1AndInitSupply);
      await proxy.upgrade(logicV2.address);
      console.log("Owner: ", await proxy.owner());
      await proxyPatternV2.connect(user).setY(10);
      //expect(await proxy.y()).to.be.eq(2);
    });
  });
});
