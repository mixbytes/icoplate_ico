pragma solidity 0.4.15;

import './PLTToken.sol';
import './mixins/StatefulMixin.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'mixbytes-solidity/contracts/crowdsale/FundsRegistryWalletConnector.sol';
import 'mixbytes-solidity/contracts/crowdsale/SimpleCrowdsaleBase.sol';
import 'mixbytes-solidity/contracts/crowdsale/InvestmentAnalytics.sol';
import 'mixbytes-solidity/contracts/ownership/multiowned.sol';

/// @title ICOPlate ICO contract
contract ICOPICO is SimpleCrowdsaleBase, multiowned, StatefulMixin, FundsRegistryWalletConnector, InvestmentAnalytics {
    using SafeMath for uint256;

    function ICOPICO(address[] _owners, address _token, address _funds)
    multiowned(_owners, 2)
    SimpleCrowdsaleBase(_token)
    FundsRegistryWalletConnector(_owners, 2)
    {
        require(3 == _owners.length);
        // TODO: use FixedTimeBonuses from solidity library
    }

    // PUBLIC interface: maintenance

    function pause() external requiresState(State.RUNNING) onlyowner
    {
        changeState(State.PAUSED);
    }

    /// @notice resume paused sale
    function unpause() external requiresState(State.PAUSED) onlymanyowners(sha3(msg.data))
    {
        changeState(State.RUNNING);
    }

    function createMorePaymentChannels(uint limit) external onlyowner returns (uint) {
        return createMorePaymentChannelsInternal(limit);
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

        if (mustApplyTimeCheck(investor, payment))
            require(State.RUNNING == m_state);

        super.buyInternal(investor, payment, extraBonuses);
    }

    function withdrawPayments() public payable requiresState(State.FAILED) {
        m_fundsAddress.withdrawPayments(msg.sender);
        getToken().burn(msg.sender, getToken().balanceOf(msg.sender));
    }


    /// @notice Tests ownership of the current caller.
    /// @return true if it's an owner
    // It's advisable to call it by new owner to make sure that the same erroneous address is not copy-pasted to
    // addOwner/changeOwner and to isOwner.
    function amIOwner() external constant onlyowner returns (bool) {
        return true;
    }

    // INTERNAL

    function calculateTokens(address /*investor*/, uint payment, uint /*extraBonuses*/) internal constant returns (uint) {
        // FIMXE: here flexible logic with decreasing every day
        uint rate = c_PLTperETH.mul(c_PLTBonus.add(100)).div(100);

        return payment.mul(rate);
    }

    /// @notice minimum amount of funding to consider ICO as successful
    function getMinimumFunds() internal constant returns (uint) {
        // FIXME: need details
        return 1000 finney;
    }

    /// @notice maximum investments to be accepted during ICO
    function getMaximumFunds() internal constant returns (uint) {
        // FIXME: need details
        return 4000 finney;
    }

    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        // FIXME: need details
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
        return isOwner(investor);
    }

    function wcOnCrowdsaleSuccess() internal {
        m_fundsAddress.changeState(FundsRegistry.State.SUCCEEDED);
        getToken().startCirculation();
        getToken().detachControllersForever();
        changeState(State.SUCCEEDED);
    }

    /// @dev called in case crowdsale failed
    function wcOnCrowdsaleFailure() internal {
        // FIXME: here burn logic
        m_fundsAddress.changeState(FundsRegistry.State.REFUNDING);
        changeState(State.FAILED);
        //m_token.detachController();
    }

    /// @notice starting exchange rate of PLT
    // FIXME: need details
    uint public constant c_PLTperETH = 100000;

    /// @notice additional tokens bonus percent
    // FIXME: need details
    uint public constant c_PLTBonus = 40;
}
