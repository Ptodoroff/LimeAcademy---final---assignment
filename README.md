> LimeAcademy Cohort IV final task - a ETH - BNB token bridge

---

### Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Installation](#installation)
- [How To Use](#how-to-use)

---

## Description

This repository consists of the contracts, their unit tests and and deploymnet scripts for the final task of LimeAcademy, cohort IV - a bridge. The dapp allows for moving assets between Goerli and BSC Testnet by utilising 2 instances of a bridge smart contract (`Bridge.sol`) deployed on the native and the target chain. The contracts check if the input token has a wrapped equivalent on the target chain and ,if not, it creates one by making use of the WrappedToken.sol` contract.

There is also an script, lsitening for events emitted from both contracts. The script has a wallet , attached to it , which calls specific functions if certain events are emitted.

The contract logic utilizes the "Lock/Mint" and "Burn/Unlock" methodology. This means that the transfer happens by the user locking funds in the native chain bridge contract. The `lock ()` function emits an event, captured by the script, which then calls `mint()` on the bridge smart contract, created on the target chain.

The approach is the same when the user wants to move funds back from the target to the native chain, however, the `burn()` function is called first at the target chain bridge contract and then the `unlock()` function on the native chain smart contract.

---

#### Technologies

- HardHat
- Javascript
- Openzeppelin libraries - contracts and iterfaces.
- Chai
- ethers.js

[Back To The Top](#read-me)

---

#### Installation

First, make sure you have Goerli test ether. You can get some at: [goerlifaucet.com](https://goerlifaucet.com/)

1. Clone the repository
2. Run `npm install`
3. Interacting with the dapp:
   a/ run the following command `npx hardhat run scripts/bridgeAPI.js`
   b/ clone https://github.com/Ptodoroff/LimeAcademy--final--assignment--fe in another local folder, run `npm install` and then `npm start`. Then navigate within the dapp via the frontend.

NOTE: It is mandatory that the `bridgeAPI.js` is run in the background, otherwise, the contracts will not be able to communicate with each other.

## Author Info

- LinkedIn - [Petar Todorov](https://www.linkedin.com/in/petargtodorov/)
- Blog - [0xTodorov](https://0xtodorov.hashnode.dev/)

[Back To The Top](#read-me-template)
