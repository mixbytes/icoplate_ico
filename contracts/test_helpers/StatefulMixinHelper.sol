pragma solidity 0.4.15;

import '../mixins/StatefulMixin.sol';

/// @title Stateful mixin add state to contact and handlers for it
contract StatefulMixinHelper is StatefulMixin {

    function StatefulMixinHelper(){

    }

    /// @notice consider paused ICO as failed
    function failPublic() external {
        changeState(State.FAILED);
    }

    function changeStatePublic(State _newState) external {
        changeState(_newState);
    }

    function setState(State _newState) external {
        m_state = _newState;
    }

}