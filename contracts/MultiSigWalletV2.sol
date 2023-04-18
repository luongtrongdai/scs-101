// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "hardhat/console.sol";

contract MultiSigWalletV2 {
    using Address for address payable;


    address[2] public admins;
    mapping(bytes32 => bool) executed;

    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    constructor(address[2] memory _admins) {
        admins = _admins;
    }

    function transfer(address to, uint256 amount, Signature[2] memory signatures, uint256 nonce) external {
        bytes32 firstSig = keccak256(abi.encodePacked(nonce, signatures[0].v, signatures[0].r, signatures[0].s));
        bytes32 secondSig = keccak256(abi.encodePacked(nonce, signatures[1].v, signatures[1].r, signatures[1].s));

        require(!executed[firstSig] && !executed[secondSig], "Signature expired");

        executed[firstSig] = true;
        executed[secondSig] = true;
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