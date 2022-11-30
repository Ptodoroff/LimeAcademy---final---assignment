//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappedToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
  error NoServiceFee();
  error InsufficientBalance();

  mapping(address => address) public wrappedToNative;
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
    ERC20(_nativeToken).transferFrom(msg.sender, address(this), _amount);
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
    WrappedToken wrappedToken;
    string memory wrappedName = string.concat("w", _tokenName);
    if (wrappedToNative[_nativeToken] == address(0x0)) {
      string memory wrappedSymbol = string.concat("w", _tokenSymbol);
      wrappedToken = new WrappedToken(wrappedName, wrappedSymbol, _decimals);
      address tokenAddress = address(wrappedToken);
      wrappedToNative[tokenAddress] = _nativeToken;
    } else {
      wrappedToken = WrappedToken(wrappedToNative[_nativeToken]);
    }
    wrappedToken.mint(_receiver, _amount);
    emit Mint(address(wrappedToken), _amount, _receiver);
  }

  function unlock(
    address _nativeToken,
    uint256 _amount,
    address _receiver
  ) external onlyOwner {
    WrappedToken(_nativeToken).transferFrom(address(this), _receiver, _amount);
    emit Unlock(_nativeToken, _amount, _receiver);
  }

  function burn(
    address _wrappedTokenAddress,
    uint256 _amount
  ) external payable {
    if (msg.value != fee) {
      revert NoServiceFee();
    } else if (
      WrappedToken(_wrappedTokenAddress).balanceOf(msg.sender) < _amount
    ) {
      revert InsufficientBalance();
    } else {
      payable(Ownable.owner()).transfer(msg.value);
      WrappedToken(_wrappedTokenAddress).burn(msg.sender, _amount);
      emit Burn(_wrappedTokenAddress, _amount, msg.sender);
    }
  }
}
