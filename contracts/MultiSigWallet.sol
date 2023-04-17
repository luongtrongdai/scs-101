// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";

contract MultiSigWallet {
    using Address for address payable;

    address[2] public admins;

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    constructor(address[2] memory _admins) {
        admins = _admins;
    }

    function transfer(address to, uint256 amount, Signature[2] memory signatures) external {
        console.logString("Start transfer");
        // Authenticate check
        require(_verifySignature(to, amount, signatures[0]) == admins[0], "Access restricted");
        require(_verifySignature(to, amount, signatures[1]) == admins[1], "Access restricted");
        payable(to).sendValue(amount);
    }

    function _verifySignature(address to, uint256 amount, Signature memory signature) internal pure returns (address signer) {
        // message byte lenght = 52
        string memory header = "\x19Ethereum Signed Message:\n52";
        bytes32 messagehash = keccak256(abi.encodePacked(header, to, amount));
        return ecrecover(messagehash, signature.v, signature.r, signature.s);
    }

    receive() external payable {}
}