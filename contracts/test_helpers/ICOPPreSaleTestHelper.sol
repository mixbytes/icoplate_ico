pragma solidity 0.4.15;

import '../ICOPPreSale.sol';


/// @title ICOPPreSaleTestHelper pre-sale contract for test purposes. DON'T use it in production!
contract ICOPPreSaleTestHelper is ICOPPreSale {
    using SafeMath for uint256;

    function ICOPPreSaleTestHelper(address token, address funds)
    ICOPPreSale(token, funds)
    {
    }

    function createMorePaymentChannels(uint limit) external onlyOwner returns (uint) {
        return createMorePaymentChannelsInternal(limit);
    }

    function getCurrentTime() internal constant returns (uint) {
        return m_time;
    }

    function setTime(uint time) external onlyOwner {
        m_time = time;
    }

    uint m_time;
}

