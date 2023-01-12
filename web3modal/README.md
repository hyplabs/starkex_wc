## WalletConnect dApp + SignClient

This repository is a part of the WalletConnect project and contains a dApp (decentralized application) and a SignClient that allows for secure communication between the dApp and the wallet component of the project. The usage of SignClient is a client-side usage of the WalletConnect protocol that enables the wallet application to authorize actions on behalf the of the dApp.

The the SignClient is responsible for establishing a secure connection between the wallet and the dApp, and for handling the authorization of transactions and sensitive operations between the two. This ensures that the dApp can securely interact with the wallet without the need for sensitive information to be shared directly.

**Configurations:**
- It is possible to use this dApp through WalletConnect to perform some standard operations

## Motivation
As decentralized applications become more mainstream, it's important for developers to have the tools necessary to create secure and reliable interactions between dApps and wallets. This repository provides developers with a comprehensive starting point for building their own dApps that can interact with a wallet through the WalletConnect protocol.

## Example Usage dApp (IN ACTIVE DEVELOPMENT)
- (IN ACTIVE DEVELOPMENT)
- We uss WalletConnect, so you will need to run "npm start" to boot up the dApp.
- Head over to the wallet directory, In this repo, run "node index.js", this will (right now) start up the CLI admin interface
- Click Connect on the dApp. When prompted, copy the deep link
- In the cli type "auth YOUR_PASTED_AUTH_CODE" and press enter
- You should see that your session is started
- On the dApp, you should see that the message is gone 

## How to use this repository
1. Clone the web3modal directory.
2. Run npm install to install the necessary dependencies.

## Additional Resources
- WalletConnect React web3modal documentation
- WalletConnect protocol documentation: https://walletconnect.org/

The WalletConnect protocol is a standard for connecting decentralized applications (dApps) to a user's cryptocurrency wallet using a secure, peer-to-peer connection. This allows users to access their wallet's functionality and data, such as sending and receiving cryptocurrency, directly from the dApp without compromising security. The SignClient provided in this repository is one way to implement the WalletConnect protocol in a dApp.

