//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappedToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Bridge is Ownable {
    error NoServiceFee();
    error InsufficientBalance();

    mapping(address => uint256) public transactions;
    mapping(address => address) public wrappedToNative;
    bytes2 private wrapPrefix = "w";

    uint256 public transactionsCounter;
    uint256 public constant fee = 30000000000000000;

    event TokenLocked(address token, uint256 amount, address sender);
    event TokenUnlocked(address token, uint256 amount, address receiver);
    event TokenMinted(address token, uint256 amount, address receiver);
    event TokenBurned(address token, uint256 amount, address receiver);

    function lock(address _nativeToken, uint256 _amount) external payable {
        if (msg.value != fee) {
            revert NoServiceFee();
        }

        payable(Ownable.owner()).transfer(msg.value);
        ERC20(_nativeToken).transferFrom(msg.sender, address(this), _amount);
        emit TokenLocked(_nativeToken, _amount, msg.sender);
    }

    function mint(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint8 _decimals,
        uint256 _amount,
        address _receiver,
        address _nativeToken
    ) external {
        WrappedToken wrappedToken;
        string memory wrappedName = string.concat("w", _tokenName);

        if (wrappedToNative[_nativeToken] != address(0x0)) {
            wrappedToken = WrappedToken(wrappedToNative[_nativeToken]);
        } else {
            string memory wrappedSymbol = string.concat("w", _tokenSymbol);
            wrappedToken = new WrappedToken(wrappedName, wrappedSymbol, _decimals);
            address tokenAddress = address(wrappedToken);
            wrappedToNative[_nativeToken] = tokenAddress;
        }

        wrappedToken.mint(_receiver, _amount);
        emit TokenMinted(address(wrappedToken), _amount, _receiver);
    }

    function unlock(address _nativeToken, uint256 _amount, address _receiver) external {
        ERC20(_nativeToken).transfer(_receiver, _amount);
        emit TokenUnlocked(_nativeToken, _amount, _receiver);
    }

    function burn(address _wrappedTokenAddress, uint256 _amount) external payable {
        if (msg.value != fee) {
            revert NoServiceFee();
        }

        if (WrappedToken(_wrappedTokenAddress).balanceOf(msg.sender) < _amount) {
            revert InsufficientBalance();
        }

        payable(Ownable.owner()).transfer(msg.value);
        WrappedToken(_wrappedTokenAddress).burn(msg.sender, _amount);

        emit TokenBurned(_wrappedTokenAddress, _amount, msg.sender);
    }
}
