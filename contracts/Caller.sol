// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Caller {
    uint256 public x;
    address public callee;

    function setCallee(address _callee) external {
        callee = _callee;
    }

    function callSetX(uint256 _x) external {
        (bool success, ) = callee.call(abi.encodeWithSignature("setX(uint256)", _x));
        require(success, "Error");
    }

    function delegatecallSetX(uint256 _x) external {
        (bool success, ) = callee.delegatecall(abi.encodeWithSignature("setX(uint256)", _x));

        require(success, "Error");
    }
}