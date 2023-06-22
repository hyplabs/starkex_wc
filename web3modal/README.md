## WalletConnect dApp + SignClient

This repository is a part of the WalletConnect project and contains a dApp (decentralized application) and a SignClient that allows for secure communication between the dApp and the wallet component of the project. This is a training application that teaches users how to use the Ethereum (ETH) and Stark networks to send commands. The application is built using the React library and utilizes the Web3Modal library for interacting with the stark blockchain. The app includes example commands for sending ETH transfers and Stark deposit requests, with the ability for users to enter their own custom commands.

The the SignClient is responsible for establishing a secure connection between the wallet and the dApp, and for handling the authorization of transactions and sensitive operations between the two. This ensures that the dApp can securely interact with the wallet without the need for sensitive information to be shared directly.

## Example Usage dApp 
- dapp:run "npm run start" to boot up the dApp.
- wallet: start the wallet "wallet/node index.js" *
- dapp: use "Connect" to connect to your wallet
- wallet: type "auth wc:THE_DEEP_LINK"
- dapp: use "Generate ETH account" - This will create a new ETH account, in an unsecure manner, in the dApp memory using ethers.js
- wallet: "approve" until all requests are approved
- dapp: use "Get Public Key" - this will get the Stark public key from the wallet (make sure to 'approve' the requests in the wallet.)
- wallet: "approve" until all requests are approved
- dapp: use "stark.sign_message"  - A toy sign_message call
- wallet: "approve" until all requests are approved


**The code is organized as follows:**
The example dApp is all in one file (App.js) for pedelogical reasons. Take what you need from this example, and you should not need to understand or explore many files to get started. To make your own dApp, you will want to mve the components/WCApp.js into your JS, or even use the relevant portions in your application.

- App.js - All user commands and GUI functionality in one file. You should not need to explore many files to learn StarkEx and ETH.
- WCApp.js - All dApp side use of WalletConnect. If you only care about WalletConnect, you can head here
- Wallet - If you are a wallet developer:  head over to /wallet/ side and review index.js. In this file we will only consider the user experience.

