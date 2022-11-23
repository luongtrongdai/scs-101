// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";

contract SavingsAccountV2 {
    using Address for address payable;
    mapping(address => uint256) public balanceOf;
    constructor() {
        
    }

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw() external {
        require(balanceOf[msg.sender] > 0, "Nothing to withdraw");

        uint256 amountDeposited = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        payable(msg.sender).sendValue(amountDeposited);
    }
}