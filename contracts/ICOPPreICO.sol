pragma solidity 0.4.15;

import './ICOPPreSale.sol';
import 'zeppelin-solidity/contracts/ReentrancyGuard.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'mixbytes-solidity/contracts/crowdsale/ExternalAccountWalletConnector.sol';
import 'mixbytes-solidity/contracts/crowdsale/SimpleCrowdsaleBase.sol';
import 'mixbytes-solidity/contracts/crowdsale/InvestmentAnalytics.sol';


/// @title ICOPlate pre-sale contract
contract ICOPPreICO is ICOPPreSale {

    /// @notice maximum investments to be accepted during preSale
    function getMaximumFunds() internal constant returns (uint) {
        return 10000 ether;
    }

    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        return 1507766400;
    }

    /// @notice end time of the pre-ICO
    function getEndTime() internal constant returns (uint) {
        return 1507766400;
    }

    /// @notice pre-ICO bonus
    function getPreICOBonus() internal constant returns (uint) {
        return 0;
    }

    /// @notice minimal amount of investment
    function getMinInvestment() public constant returns (uint) {
        return 10 finney;
    }
}