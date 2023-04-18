// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract KotET is Ownable {
    using Address for address payable;

    address public king;
    uint256 public claimPrice;

    constructor() {
        king = msg.sender;
    }

    receive() external payable {
        require(msg.value > claimPrice, "Not enough Ether");
        address overThrownKing = king;

        king = msg.sender;
        claimPrice = msg.value;

        uint256 fee = (claimPrice / 100) * 2;
        uint256 compensation = claimPrice - fee;

        payable(owner()).sendValue(fee);
        payable(overThrownKing).sendValue(compensation);
    }
}
