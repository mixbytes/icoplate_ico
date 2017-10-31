pragma solidity 0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/// @title Stateful mixin add state to contact and handlers for it
contract MultiControlledMixin is Ownable {

    event ControllerAdd(address controller);
    event ControllerRetired(address controller);
    event ControllerDisabledForever();

    modifier onlyControllers() {
        require(isController(msg.sender));
        _;
    }

    /// @dev Add address to controllers
    function addController(address _controller) external onlyOwner {
        require(!m_isSetControllerDisabled);
        require(m_controllers.length < c_MaxControllers);
        if (!isController(_controller)){
            m_controllers.push(_controller);
            ControllerAdd(_controller);
        }
    }

    /// @dev Detach address from controllers
    function detachController() external onlyControllers {
        require(!m_isSetControllerDisabled);
        for (uint i = 0; i < m_controllers.length; ++i) {
            if (m_controllers[i] == msg.sender) {
                delete m_controllers[i];
                ControllerRetired(msg.sender);
                break;
            }
        }
    }

    /// @dev Detach all controllers and disable adding
    function detachControllersForever() external onlyOwner {
        require(!m_isSetControllerDisabled);
        m_controllers = new address[](0);
        m_isSetControllerDisabled = true;
        ControllerDisabledForever();
    }

    /// @dev Check if address in controllers
    function isController(address _controller) internal returns (bool) {
        for (uint i = 0; i < m_controllers.length; ++i) {
            if (m_controllers[i] == _controller) {
                return true;
            }
        }
        return false;
    }

    /// @notice Gets controllers
    /// @return memory array of controllers
    function getControllers() public constant returns (address[]) {
        address[] memory result = new address[](m_controllers.length);
        for (uint i = 0; i < m_controllers.length; ++i)
        result[i] = m_controllers[i];

        return result;
    }

    // FIELDS
    address[] internal m_controllers;
    uint public constant c_MaxControllers = 5;
    bool public m_isSetControllerDisabled = false;
}