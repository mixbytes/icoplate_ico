pragma solidity 0.4.15;

import '../PLTToken.sol';


/// @title PLTTokenTestHelper pre-sale contract for test purposes. DON'T use it in production!
contract PLTTokenTestHelper is PLTToken {
    function get_m_controllers() constant returns(address[]) {
        return m_controllers;
    }

    function getMaxControllers() public constant returns (uint){
        return 5;
    }
}

