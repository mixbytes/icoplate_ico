pragma solidity 0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/// @title Stateful mixin add state to contact and handlers for it
contract MultiControlledMixin is Ownable {

    event ControllerAdd(address controller);
    event ControllerRetired(address controller);
    event ControllerDisabledForever();

    modifier onlyControllers() {
        require(checkController(msg.sender));
        _;
    }

    function addController(address _controller) external onlyOwner {
        require(!m_isSetControllerDisabled);
        require(m_controllers.length < c_MaxControllers + 1);
        if (!checkController(_controller)){
            m_controllers.push(_controller);
            ControllerAdd(_controller);
        }
    }

    function detachController(address _controller) external onlyOwner {
        require(!m_isSetControllerDisabled);
        for (uint i = 0; i < m_controllers.length; ++i) {
            if (m_controllers[i] == _controller) {
                delete m_controllers[i];
                ControllerRetired(_controller);
                break;
            }
        }
    }

    function detachControllersForever() external onlyOwner {
        require(!m_isSetControllerDisabled);
        m_controllers = new address[](0);
        m_isSetControllerDisabled = true;
        ControllerDisabledForever();
    }

    function checkController(address _controller) internal returns (bool) {
        for (uint i = 0; i < m_controllers.length; ++i) {
            if (m_controllers[i] == _controller) {
                return true;
            }
        }
        return false;
    }

    // FIELDS
    address[] internal m_controllers;
    uint public constant c_MaxControllers = 5;
    bool public m_isSetControllerDisabled = false;
}