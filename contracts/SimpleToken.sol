// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken {
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    address public owner;

    constructor(uint256 _initSupply) public {
        totalSupply = _initSupply;
        balanceOf[msg.sender] = _initSupply;
        owner = msg.sender;
    }
    
    function transfer(address _to, uint256 _amount) public {
        require(balanceOf[msg.sender] >= _amount, "Not enough token");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
    }

    function mint(uint256 amount) external {
        totalSupply += amount;
        balanceOf[owner] += amount;
    }
}
