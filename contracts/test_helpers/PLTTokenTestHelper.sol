pragma solidity 0.4.18;

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

    /// For Crowdsale.js
    function m_controller() public constant returns (address) {
        return m_controllers[0];
    }

}

