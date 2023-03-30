// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract SavingsAccountV2 is ReentrancyGuard {
    using Address for address payable;
    mapping(address => uint256) public balanceOf;
    constructor() {
        
    }

    function deposit() external payable nonReentrant {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external nonReentrant {
        require(balanceOf[msg.sender] > 0, "Nothing to withdraw");

        uint256 amountDeposited = balanceOf[msg.sender];
        console.log("");
        console.log("Victim balance: ", address(this).balance);
        console.log("Attacker balance: ", balanceOf[msg.sender]);
        console.log("");
        balanceOf[msg.sender] = 0;   
        payable(msg.sender).sendValue(amountDeposited);
     
    }
}