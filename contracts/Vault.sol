// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable {
    bytes32 private password;

    constructor(bytes32 _password) {
        password = _password;
    }
    
    modifier checkPassword(bytes32 _password) {
        require(password == _password, "Wrong password");
        _;
    }

    receive() external payable {}

    function deposit() external payable onlyOwner {}

    function withdraw(bytes32 _password) external checkPassword(_password) {
        payable(msg.sender).transfer(address(this).balance);
    }
}
