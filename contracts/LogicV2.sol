// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LogicV2 {
    uint256 public x;
    uint256 public y;

    function increaseX() external {
        x = x + 2;
    }

    function setY(uint256 _y) external {
        y = _y;
    }

}
