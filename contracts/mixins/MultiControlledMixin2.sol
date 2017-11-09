pragma solidity 0.4.15;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/// @title Stateful mixin add state to contact and handlers for it
contract MultiControlledMixin is Ownable {

    event ControllerAdded(address controller);
    event ControllerRetired(address controller);
    event ControllerDisabledForever();

    modifier onlyControllers() {
        require(isController(msg.sender));
        _;
    }

    modifier onlyControllersOrOwners() {
        require(isController(msg.sender) || owner == msg.sender);
        _;
    }

    /// @dev Add address to controllers
    function addController(address _controller) external onlyOwner {
        require(!m_isSetControllerDisabled);
        require(m_numControllers < 256);

        if (!isController(_controller)){
            m_numControllers++;
            m_controllers[m_numControllers] = _controller;
            m_controllerIndex[_controller] = checkControllerIndex(m_numControllers);

            ControllerAdded(_controller);
        }
    }

    /// @dev Detach sender controller address from controllers
    function detachController() external onlyControllers {
        require(!m_isSetControllerDisabled);
        detachControllerInternal(msg.sender);
    }

    /// @dev Detach address from controllers by Owner
    function detachControllerByOwner(address _controller) external onlyOwner {
        require(!m_isSetControllerDisabled);
        detachControllerInternal(_controller);
    }

    /// @dev Detach all controllers and disable adding
    function detachControllersForever() external onlyControllersOrOwners {
        require(!m_isSetControllerDisabled);
        //m_controllers = new address[](0);
        m_isSetControllerDisabled = true;
        ControllerDisabledForever();
    }

    function getMaxControllers() public constant returns (uint){
        return 256;
    }

    // INTERNAL METHODS

    /// @dev Check if address in controllers
    function isController(address _controller) internal constant returns (bool) {
        return m_controllerIndex[_controller] > 0;
    }


    function assertControllersAreConsistent() private constant {
        assert(m_numControllers > 0);
        assert(m_numControllers <= 256);
        assert(m_controllers[0] == 0);
    }

    function checkControllerIndex(uint controllerIndex) private constant returns (uint) {
        assert(0 != controllerIndex && controllerIndex <= 256);
        return controllerIndex;
    }

    /// @dev Detach address from controllers internal function
    function detachControllerInternal(address _controller) internal {
        require(isController(_controller));

        uint controllerIndex = checkControllerIndex(m_controllerIndex[_controller]);
        m_controllers[controllerIndex] = 0;
        m_controllerIndex[_controller] = 0;
        m_numControllers--;
        //make sure m_numOwners is equal to the number of owners and always points to the last owner
        //reorganizeOwners();

        ControllerRetired(_controller);
    }

    // FIELDS
    // 0 is not used
    address[256] internal m_controllers;
    uint public m_numControllers;

    // index on the list of controllers to allow reverse lookup: owner address => index in m_owners
    mapping(address => uint) internal m_controllerIndex;

    bool public m_isSetControllerDisabled = false;
}