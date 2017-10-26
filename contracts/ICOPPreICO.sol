pragma solidity 0.4.15;

import './ICOPPreSale.sol';


/// @title ICOPlate pre-sale contract
contract ICOPPreICO is ICOPPreSale {
    /// @notice start time of the pre-ICO
    function getStartTime() internal constant returns (uint) {
        // Sun, 15 Nov 2017 0:00:00 GMT
        return 1510704000;
    }

    /// @notice end time of the pre-ICO
    function getEndTime() internal constant returns (uint) {
        // FIXME: need details
        return getStartTime() + (10 days);
    }

    /// @notice minimal amount of investment
    function getMinInvestment() public constant returns (uint) {
        return 20 finney;
    }

    /// @notice starting exchange rate of ICOP
    // FIXME: need details
    uint public constant c_ICOPperETH = 50000;

    /// @notice additional tokens bonus percent
    // FIXME: need details
    uint public constant c_ICOPBonus = 20;
}