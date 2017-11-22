pragma solidity 0.4.15;

import '../ICOPPreSale.sol';
import "../test_helpers/StatefulMixinTestHelper.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


/// @title ICOPPreSaleTestHelper pre-sale contract for test purposes. DON'T use it in production!
contract ICOPPreSaleTestHelper is ICOPPreSale, StatefulMixinTestHelper {
    using SafeMath for uint256;

    function ICOPPreSaleTestHelper(address token, address funds)
    ICOPPreSale(token, funds)
    {
    }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
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

