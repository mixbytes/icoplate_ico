pragma solidity 0.4.18;

import './PLTToken.sol';
import './mixins/StatefulMixin.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'mixbytes-solidity/contracts/crowdsale/ExternalAccountWalletConnector.sol';
import 'mixbytes-solidity/contracts/crowdsale/SimpleCrowdsaleBase.sol';
import 'mixbytes-solidity/contracts/crowdsale/InvestmentAnalytics.sol';


/// @title ICOPlate pre-sale contract
contract ICOPPreSale is SimpleCrowdsaleBase, Ownable, StatefulMixin, ExternalAccountWalletConnector, InvestmentAnalytics {
    using SafeMath for uint256;

    function ICOPPreSale(address token, address funds)
        SimpleCrowdsaleBase(token)
        ExternalAccountWalletConnector(funds)
    {
    }

    // PUBLIC interface: maintenance

    function createMorePaymentChannels(uint limit) external onlyOwner returns (uint) {
        return createMorePaymentChannelsInternal(limit);
    }

    /// @notice pauses sale
    function pause() external requiresState(State.RUNNING) onlyOwner
    {
        changeState(State.PAUSED);
    }

    function fail() external requiresState(State.PAUSED) onlyOwner
    {
        wcOnCrowdsaleFailure();
    }

    /// @notice resume paused sale
    function unpause() external requiresState(State.PAUSED) onlyOwner
    {
        changeState(State.RUNNING);
    }

    /// @notice Tests ownership of the current caller.
    /// @return true if it's an owner
    // It's advisable to call it by new owner to make sure that the same erroneous address is not copy-pasted to
    // addOwner/changeOwner and to isOwner.
    function amIOwner() external constant onlyOwner returns (bool) {
        return true;
    }

    function getToken() public constant returns (PLTToken) {
        return PLTToken(address(m_token));
    }

    // INTERNAL

    /// @notice sale participation

    function buyInternal(address investor, uint payment, uint extraBonuses)
    internal
    exceptsState(State.PAUSED)
    {
        if (getCurrentState() == State.INIT && getCurrentTime() >= getStartTime())
            changeState(State.RUNNING);

        if (!mustApplyTimeCheck(investor, payment)) {
            require(State.RUNNING == m_state || State.INIT == m_state);
        }
        else
        {
            require(State.RUNNING == m_state);
        }

        super.buyInternal(investor, payment, extraBonuses);
    }

    function iaOnInvested(address investor, uint payment, bool /*usingPaymentChannel*/) internal
    {
        buyInternal(investor, payment, 0);
    }

    function calculateTokens(address /*investor*/, uint payment, uint /*extraBonuses*/) internal constant returns (uint) {
        uint numTokens = c_PLTperETH.mul(c_PLTBonus.add(100)).mul(payment).div(100);

        return numTokens;
    }

    /// @notice minimum amount of funding to consider preSale as successful
    function getMinimumFunds() internal constant returns (uint) {
        return 0;
    }

    /// @notice maximum investments to be accepted during preSale. No hard cap
    function getMaximumFunds() internal constant returns (uint) {
        return 0;
    }

    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        // Sun, 5 Nov 2017 0:00:00 GMT
        return 1509840000;
    }

    /// @notice end time of the pre-ICO
    function getEndTime() internal constant returns (uint) {
        // FIXME: need details
        return getStartTime() + (12 days);
    }

    /// @notice minimal amount of investment
    function getMinInvestment() public constant returns (uint) {
        return 10 finney;
    }

    function mustApplyTimeCheck(address investor, uint /*payment*/) constant internal returns (bool) {
        return investor != owner;
    }

    function wcOnCrowdsaleSuccess() internal {
        getToken().detachController();
        changeState(State.SUCCEEDED);
    }

    /// @dev called in case crowdsale failed
    function wcOnCrowdsaleFailure() internal {
        getToken().detachController();
        changeState(State.FAILED);
    }

    // FIELDS

    /// @notice starting exchange rate of PLT
    // FIXME: need details
    uint public constant c_PLTperETH = 100000;

    /// @notice additional tokens bonus percent
    // FIXME: need details
    uint public constant c_PLTBonus = 40;
}
