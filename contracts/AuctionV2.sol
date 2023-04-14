// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract AuctionV2 is Ownable, ReentrancyGuard {
    using Address for address payable;

    address payable public currentLeader;
    uint256 public highestBid;

    mapping(address => uint256) public refunds;

    function bid() external payable nonReentrant {
        require(msg.value > highestBid, "Bid not high enough");

        if (currentLeader != address(0)) {
            refunds[currentLeader] += highestBid;
        }

        currentLeader = payable(msg.sender);
        highestBid = msg.value;
    }

    function withdrawRefund() external nonReentrant {
        uint refund = refunds[msg.sender];


        console.log("Refund: ", refund);
        console.log("addr: ", msg.sender);
        refunds[msg.sender] = 0;

        payable(msg.sender).sendValue(refund);
    }

}