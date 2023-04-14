// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract LotteryV2 is VRFConsumerBase, Ownable {
    using Address for address payable;

    uint8 public winningNumber;
    mapping(address => uint8) public bets;
    bool public betsClosed;
    bool public prizeTaken;

    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    constructor() VRFConsumerBase(0x326C977E6efc84E512bB9C30f76E30c160eD06FB, 0x326C977E6efc84E512bB9C30f76E30c160eD06FB) {
        keyHash = "13123213123";
        fee = 0.1 * 10**18;
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enoudh LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }

    function placeBet(uint8 _number) external payable {
        require(bets[msg.sender] == 0, "Only 1 bet per player");
        require(msg.value == 10 ether, "Bet cost:  10 ether");
        require(betsClosed == false, "Bets are closed");
        require(_number > 0 && _number <= 255, "Must be a number from 1 to 255");

        bets[msg.sender] = _number;
    }

    function endLottery() external onlyOwner {
        betsClosed = true;

        winningNumber = uint8(randomResult % 254 + 1);
    }

    function withdrawPrize() external {
        require(betsClosed == true, "Bets are still open");
        require(prizeTaken == false, "Prize already taken");
        require(bets[msg.sender] == winningNumber, "You're the winner");

        prizeTaken = true;
        console.log("Balance: ", address(this).balance);
        payable(msg.sender).sendValue(address(this).balance);
    }


    function pseudoRandNumGen() private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encode(block.timestamp))) % 254) + 1;
    }
}