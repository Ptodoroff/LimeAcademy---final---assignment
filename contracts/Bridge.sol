
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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


constructor (){

}
function lock (uint8 targetChain, address mainToken, uint amount)  external payable{
    if (msg.value != fee ) {
        revert YouMustPayTheServiceFee ();
    }
    else {
       payable(Ownable.owner()).transfer(msg.value) ;
      amountLocked[mainToken] += amount;
     IERC20(mainToken).transferFrom(msg.sender, address(this), amount);
     emit Lock(targetChain,mainToken,amount);
    }
}

function mint (address token, uint256 amount, address receiver) external onlyOwner {

emit Mint( token,  amount, receiver);
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