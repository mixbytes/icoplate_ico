pragma solidity 0.4.15;


import 'mixbytes-solidity/contracts/token/CirculatingToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './mixins/MultiControlledMixin.sol';
import 'mixbytes-solidity/contracts/token/MintableToken.sol';


/// @title ICOPlate coin contract
contract PLTToken is MintableToken, CirculatingToken, MultiControlledMixin {
    using SafeMath for uint256;

    event Mint(address indexed to, uint256 amount, address sale);
    event Burn(address indexed to, uint256 amount, address sale);

    /// @dev Allows token transfers
    function startCirculation() external onlyControllers {
        assert(enableCirculation());    // must be called once
    }

    /// @dev mints new tokens
    function mint(address _to, uint256 _amount) external onlyControllers {
        totalSupply = totalSupply.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        salesBalances[msg.sender][_to] = salesBalances[msg.sender][_to].add(_amount);
        Transfer(this, _to, _amount);
        Mint(_to, _amount, msg.sender);
    }

    /// @dev burns tokens from address
    function burn(address _from, uint256 _amount) external onlyControllers {
        uint256 balance = balanceOf(_from);
        require(_amount <= balance);
        totalSupply = totalSupply.sub(_amount);
        balances[_from] = balances[_from].sub(_amount);
        salesBalances[msg.sender][_from] = salesBalances[msg.sender][_from].sub(_amount);
        Burn(_from, _amount, msg.sender);
        Transfer(_from, this, _amount);
    }

    /// @dev balance of tokens for investor during certain crowdsale
    function balanceOfDuringSale(address _owner) external constant returns (uint256)  {
        return salesBalances[msg.sender][_owner];
    }

    // FIELDS
    string public constant name = 'ICOPlate Token';
    string public constant symbol = 'PLT';
    uint8 public constant decimals = 18;

    mapping(address => mapping(address => uint256)) salesBalances;
}
