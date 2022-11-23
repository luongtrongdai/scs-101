// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISavingAccount {
    function deposit() external payable;

    function withdraw() external;
}

contract Investor is Ownable {
    ISavingAccount public immutable savingsAccount;

    constructor(address savingsAccountAddress) {
        savingsAccount = ISavingAccount(savingsAccountAddress);
    }

    function depositIntoSavingsAccount() external payable onlyOwner {
        savingsAccount.deposit{ value: msg.value }();
    }

    function withdrawFromSavingsAccount() external onlyOwner {
        savingsAccount.withdraw();
    }

    receive() external payable {
        payable(owner()).transfer(address(this).balance);
    }
}