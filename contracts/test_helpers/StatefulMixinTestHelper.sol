pragma solidity 0.4.18;

import '../mixins/StatefulMixin.sol';

/// @title Stateful mixin add state to contact and handlers for it
contract StatefulMixinTestHelper is StatefulMixin {

    function StatefulMixinTestHelper(){

    }

    function changeStatePublic(State _newState) external {
        changeState(_newState);
    }

    function setState(State _newState) external {
        m_state = _newState;
    }

}