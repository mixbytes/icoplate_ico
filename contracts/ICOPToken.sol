pragma solidity 0.4.15;

import 'mixbytes-solidity/contracts/token/CirculatingToken.sol';
import 'mixbytes-solidity/contracts/token/MintableMultiownedToken.sol';


/// @title ICOPlate coin contract
contract ICOPToken is CirculatingToken, MintableMultiownedToken {

    // PUBLIC interface

    function ICOPToken(address[] _owners)
        MintableMultiownedToken(_owners, 2, /* minter: */ address(0))
    {
        require(3 == _owners.length);
    }

    /// @dev Allows token transfers
    function startCirculation() external onlyController {
        assert(enableCirculation());    // must be called once
    }

    /// @notice Starts new token emission
    /// @param _tokensCreatedInSTQ Amount of ICOP to create, like 30 000 or so
    function emission(uint256 _tokensCreatedInICOP) external onlymanyowners(sha3(msg.data)) {
        emissionInternal(_tokensCreatedInICOP.mul(uint256(10) ** uint256(decimals)));
    }


    // FIELDS

    string public constant name = 'ICOPlate Token';
    string public constant symbol = 'ICOP';
    uint8 public constant decimals = 18;
}
