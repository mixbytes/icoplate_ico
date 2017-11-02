pragma solidity 0.4.15;

import 'mixbytes-solidity/contracts/token/CirculatingToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './mixins/MultiControlledMixin.sol';


/// @title ICOPlate coin contract
contract PLTToken is CirculatingToken, MultiControlledMixin {
    using SafeMath for uint256;

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed to, uint256 amount);


    /// @dev Allows token transfers
    function startCirculation() external onlyControllers {
        assert(enableCirculation());    // must be called once
    }

    /// @dev mints new tokens
    function mint(address _to, uint256 _amount) external onlyControllers {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Transfer(this, _to, _amount);
        Mint(_to, _amount);
    }

    /// @dev burns tokens from address
    function burn(address _from, uint256 _amount) external onlyControllers {
        uint256 balance = this.balanceOf(_from);
        require(_amount < balance || _amount == balance);
        totalSupply = totalSupply.sub(_amount);
        balances[_from] = balances[_from].sub(_amount);
        Burn(_from, _amount);
        Transfer(_from, this, _amount);
    }

    // FIELDS
    string public constant name = 'ICOPlate Token';
    string public constant symbol = 'PLT';
    uint8 public constant decimals = 18;

}
