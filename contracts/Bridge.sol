
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Token.sol";
contract Bridge is Ownable {
error YouMustPayTheServiceFee();

mapping (address=>address) mainToTargetTokenMapping;
mapping (address=>uint) amountLocked;
bytes2 private wrapPrefix = "b";
address payable owner;

uint public constant fee = 30000000000000000;
//events
    event Lock(uint8 targetChain, address token, uint256 amount);
    event Unlock(address token, uint256 amount, address receiver);
    event Mint(address token, uint256 amount, address receiver);
    event Burn(address token, uint256 amount, address receiver);



//lock () - ui should include an input for wei. The bridge will accept only eth fees and not bridged token fees
function lock (uint8 _targetChain, address _mainToken, uint _amount)  external payable{
    if (msg.value != fee ) {
        revert YouMustPayTheServiceFee ();
    }
    else {
       payable(Ownable.owner()).transfer(msg.value) ;  //transfers fee to owner
      amountLocked[_mainToken] += amount;  
     IERC20(_mainToken).transferFrom(msg.sender, address(this), _amount); // transfers assets to the bridge contract
     emit Lock(_targetChain,_mainToken,_amount);
    }
}

function mint (address _token, uint256 _amount, address _receiver) external onlyOwner {
      IERC20(_token)._mint(_receiver, _amount *(10 ** uint256(IERC20(_token).decimals())));
emit Mint(_token,  _amount, _receiver);
}


function unlock(address token, uint256 amount, address receiver) external onlyOwner {

    emit Unlock( token,  amount,  receiver);
}

function burn (address token, uint256 amount, address receiver) external {

    emit Burn( token,  amount,  receiver);
}


function transferOwnership (address payable newOwner) external onlyOwner {

}

}