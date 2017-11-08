pragma solidity 0.4.15;


import '../mixins/MultiControlledMixin.sol';


/// @title MultiControlledMixinHelper for test purposes. DON'T use it in production!
contract MultiControlledMixinHelper is MultiControlledMixin {
    function MultiControlledMixinHelper()
    {
    }

    function isControllerPublic(address _controller) public constant returns (bool)
    {
        return isController(_controller);
    }
}