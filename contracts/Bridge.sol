//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";

contract Bridge is Ownable {
  error YouMustPayTheServiceFee();
  error InputMoreThanBalance();

  mapping(address => address) public nativeToTargetTokenMapping;
  mapping(string => address) tokens;
  mapping(address => mapping(address => uint)) amountLocked;
  bytes2 private wrapPrefix = "b";

  uint public constant fee = 30000000000000000;

  event Lock(address token, uint256 amount, address sender);
  event Unlock(address token, uint256 amount, address receiver);
  event Mint(address token, uint256 amount, address receiver);
  event Burn(address token, uint256 amount, address receiver);

  function lock(address _mainToken, uint _amount) external payable {
    if (msg.value != fee) {
      revert YouMustPayTheServiceFee();
    } else {
      payable(Ownable.owner()).transfer(msg.value);
      amountLocked[_mainToken][msg.sender] += _amount;
      Token(_mainToken).transferFrom(msg.sender, address(this), _amount);
      Token(_mainToken).approve(address(this), _amount);
      emit Lock(_mainToken, _amount, msg.sender);
    }
  }

  function mint(
    string memory _tokenName,
    string memory _tokenSymbol,
    uint8 _decimals,
    uint256 _amount,
    address _receiver,
    address _nativeToken
  ) external onlyOwner {
    Token token;
    string memory _wrappedName = string(
      abi.encodePacked(wrapPrefix, _tokenName)
    );
    if (tokens[_wrappedName] == address(0x0)) {
      string memory _wrappedSymbol = string(
        abi.encodePacked(wrapPrefix, _tokenSymbol)
      );
      token = new Token(_wrappedName, _wrappedSymbol, _decimals);
      address _tokenAddress = address(token);
      tokens[_wrappedName] = _tokenAddress;
      nativeToTargetTokenMapping[_tokenAddress] = _nativeToken;
    } else {
      token = Token(tokens[_wrappedName]);
    }
    token.mint(_receiver, _amount);
    emit Mint(address(token), _amount, _receiver);
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
      revert YouMustPayTheServiceFee();
    } else if (Token(_nativeToken).balanceOf(msg.sender) < _amount) {
      revert InputMoreThanBalance();
    } else {
      payable(Ownable.owner()).transfer(msg.value);
      Token(_nativeToken).burn(msg.sender, _amount);
      emit Burn(_nativeToken, _amount, msg.sender);
    }
  }
}
