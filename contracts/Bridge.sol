//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappedToken.sol";

contract Bridge is Ownable {
  error NoServiceFee();
  error InsufficientBalance();

  mapping(address => address) public nativeToWrapped;
  mapping(string => address) wrappedTokens;
  mapping(address => mapping(address => uint)) amountLocked;
  bytes2 private wrapPrefix = "w";

  uint public constant fee = 30000000000000000;

  event Lock(address token, uint256 amount, address sender);
  event Unlock(address token, uint256 amount, address receiver);
  event Mint(address token, uint256 amount, address receiver);
  event Burn(address token, uint256 amount, address receiver);

  function lock(address _nativeToken, uint _amount) external payable {
    if (msg.value != fee) {
      revert NoServiceFee();
    }
    payable(Ownable.owner()).transfer(msg.value);
    amountLocked[_nativeToken][msg.sender] += _amount;
    Token(_nativeToken).transferFrom(msg.sender, address(this), _amount);
    Token(_nativeToken).approve(address(this), _amount);
    emit Lock(_nativeToken, _amount, msg.sender);
  }

  function mint(
    string memory _tokenName,
    string memory _tokenSymbol,
    uint8 _decimals,
    uint256 _amount,
    address _receiver,
    address _nativeToken
  ) external onlyOwner {
    Token wrappedToken;
    string memory wrappedName = string.concat("w", _tokenName);
    if (wrappedTokens[wrappedName] == address(0x0)) {
      string memory wrappedSymbol = string.concat("w", _tokenSymbol);
      wrappedToken = new Token(wrappedName, wrappedSymbol, _decimals);
      address tokenAddress = address(wrappedToken);
      wrappedTokens[wrappedName] = tokenAddress;
      nativeToWrapped[tokenAddress] = _nativeToken;
    } else {
      wrappedToken = Token(wrappedTokens[wrappedName]);
    }
    wrappedToken.mint(_receiver, _amount);
    emit Mint(address(wrappedToken), _amount, _receiver);
  }

  function unlock(
    address _nativeToken,
    uint256 _amount,
    address _receiver
  ) external onlyOwner {
    amountLocked[_nativeToken][_receiver] -= _amount;
    Token(_nativeToken).transferFrom(address(this), _receiver, _amount);
    emit Unlock(_nativeToken, _amount, _receiver);
  }

  function burn(address _nativeToken, uint256 _amount) external payable {
    if (msg.value != fee) {
      revert NoServiceFee();
    } else if (Token(_nativeToken).balanceOf(msg.sender) < _amount) {
      revert InsufficientBalance();
    } else {
      payable(Ownable.owner()).transfer(msg.value);
      Token(_nativeToken).burn(msg.sender, _amount);
      emit Burn(_nativeToken, _amount, msg.sender);
    }
  }
}