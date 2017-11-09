pragma solidity 0.4.15;

import '../PLTToken.sol';


/// @title PLTTokenTestHelper pre-sale contract for test purposes. DON'T use it in production!
contract PLTTokenTestHelper is PLTToken {
    function getMaxControllers() public constant returns (uint){
        return 5;
    }

    /// @notice Gets controllers
    /// @return memory array of controllers
    function getControllers() public constant returns (address[]) {
        return m_controllers;
    }
}

