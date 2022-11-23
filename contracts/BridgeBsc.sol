

// when bridging from the target chain to the main one, the user clicks a' bridge/transfer' button, which calls the burn function on the contract in the target chain and then calls the unlock function on the native chain contract
// lock/mint and burn/unlock  - the fn() call pairs

//SPDX license identifier: MIT

pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";
contract Bridge is Ownable {
error YouMustPayTheServiceFee();

mapping (address=>address) nativeToTargetTokenMapping;
mapping (string=>address) tokens;
mapping (address=>uint) amountLocked;
bytes2 private wrapPrefix = "b";

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
      amountLocked[_mainToken] += _amount;  
     Token(_mainToken).transferFrom(msg.sender, address(this), _amount); // transfers assets to the bridge contract
     emit Lock(_targetChain,_mainToken,_amount);
    }
}

function mint (string memory  _tokenName, string memory _tokenSymbol, uint8 _decimals, uint256 _amount, address _receiver, address _nativeToken) external onlyOwner { // should be called on the target chain contract
Token token;           // an instance of the Token contract (ERC20). Using this instead of IERC20, as the latter does not contain the mint();
string memory _wrappedName=string(abi.encodePacked(wrapPrefix,_tokenName));  // creating a name for the token at the target chain 
if(tokens[_wrappedName]==address(0x0)) {       // check if the token exists. if not, it is created
    string memory _wrappedSymbol = string(abi.encodePacked(wrapPrefix, _tokenSymbol));  // creating the symbol
    token = new Token(_wrappedName,_wrappedSymbol, _decimals);   //creating the token instance
    address _tokenAddress = address(token);
    tokens[_wrappedName] = _tokenAddress;   // mapping the name of the newly created token to its address
    nativeToTargetTokenMapping[_nativeToken] =_tokenAddress; // mapping the native token to its sibling, deployed at the target  chain
}
else {
    token = Token(tokens[_wrappedName]);  // if the token already exists, its address is 'selected'
}
token.mint(_receiver,_amount);
emit Mint(address(token),  _amount, _receiver);
}


function unlock(address _nativeToken, uint256 _amount, address _receiver) external payable onlyOwner {   //only the operator can unlock tokens. ui should include wein input in order to include the service fee. the input could be prefilled.
    if (msg.value != fee ) {
        revert YouMustPayTheServiceFee ();
    }
    else{
         payable(Ownable.owner()).transfer(msg.value) ;
         Token(_nativeToken).transferFrom(address(this),_receiver, _amount);
          emit Unlock( _nativeToken,  _amount,  _receiver);
    }
}

function burn (address _token, uint256 _amount) external {    //ask Kris if this should be accessed only by the wallet in the node app a.k.a the operator 
        Token(_token).burn(msg.sender, _amount);
        emit Burn(_token, _amount, msg.sender);
}

}