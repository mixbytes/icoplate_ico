pragma solidity 0.4.15;

import '../ICOPICO.sol';
import "../test_helpers/StatefulMixinTestHelper.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


/// @title ICOPICOTestHelper ico contract for test purposes. DON'T use it in production!
contract ICOPICOTestHelper is ICOPICO, StatefulMixinTestHelper {
    using SafeMath for uint256;

    function ICOPICOTestHelper(address[] _owners, address _token)
    ICOPICO(_owners, _token)
    {
    }

    function getFundsAddress() public constant returns (address) {
        return m_fundsAddress;
    }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyowner {
        m_time = time;
    }

    function _getStartTime() external constant returns (uint) {
        return getStartTime();
    }

    function _getEndTime() external constant returns (uint) {
        return getEndTime();
    }

    function wcOnCrowdsaleSuccessPublic() external {
        wcOnCrowdsaleSuccess();
    }

    /// @dev called in case crowdsale failed
    function wcOnCrowdsaleFailurePublic() external {
        wcOnCrowdsaleFailure();
    }

    uint m_time;
}

