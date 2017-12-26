pragma solidity 0.4.18;

import './PLTToken.sol';
import './mixins/StatefulMixin.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'mixbytes-solidity/contracts/crowdsale/FundsRegistryWalletConnector.sol';
import 'mixbytes-solidity/contracts/crowdsale/SimpleCrowdsaleBase.sol';
import 'mixbytes-solidity/contracts/crowdsale/InvestmentAnalytics.sol';
import 'mixbytes-solidity/contracts/ownership/multiowned.sol';

/// @title ICOPlate ICO contract
contract ICOPICO is SimpleCrowdsaleBase, multiowned, FundsRegistryWalletConnector, InvestmentAnalytics, StatefulMixin {
    using SafeMath for uint256;

    event Withdraw(address payee, uint amount);


    function ICOPICO(address[] _owners, address _token)
    SimpleCrowdsaleBase(_token)
    multiowned(_owners, 2)
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
    function unpause() external requiresState(State.PAUSED) onlymanyowners(keccak256(msg.data))
    {
        changeState(State.RUNNING);
    }

    function createMorePaymentChannels(uint limit) external onlyowner returns (uint) {
        return createMorePaymentChannelsInternal(limit);
    }

    function iaOnInvested(address investor, uint payment, bool /*usingPaymentChannel*/) internal
    {
        buyInternal(investor, payment, 0);
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

        // Allows to send ether from funds after reaching the soft cap
        if (getWeiCollected() >= getMinimumFunds() && m_fundsAddress.m_state() != FundsRegistry.State.SUCCEEDED) {
            m_fundsAddress.changeState(FundsRegistry.State.SUCCEEDED);
        }
    }

    function withdrawPayments() public {
        if (getCurrentTime() >= getEndTime())
            finish();

        require(State.FAILED == m_state);

        uint balanceToWithdraw = m_fundsAddress.m_weiBalances(msg.sender);

        m_fundsAddress.withdrawPayments(msg.sender);

        uint amount = getToken().balanceOfDuringSale(msg.sender);

        getToken().burn(msg.sender, amount);

        Withdraw(msg.sender, balanceToWithdraw);
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
        // FIXME: here flexible logic with decreasing every day
        uint numTokens = c_PLTperETH.mul(c_PLTBonus.add(100)).mul(payment).div(100);

        return numTokens;
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
        return !isOwner(investor);
    }

    function wcOnCrowdsaleSuccess() internal {
        if (m_fundsAddress.m_state() != FundsRegistry.State.SUCCEEDED) {
            m_fundsAddress.changeState(FundsRegistry.State.SUCCEEDED);
        }

        getToken().startCirculation();
        getToken().detachControllersForever();
        changeState(State.SUCCEEDED);
    }

    /// @dev called in case crowdsale failed
    function wcOnCrowdsaleFailure() internal {
        m_fundsAddress.changeState(FundsRegistry.State.REFUNDING);
        changeState(State.FAILED);
    }

    /// @notice starting exchange rate of PLT
    // FIXME: need details
    uint public constant c_PLTperETH = 100000;

    /// @notice additional tokens bonus percent
    // FIXME: need details
    uint public constant c_PLTBonus = 40;
}
