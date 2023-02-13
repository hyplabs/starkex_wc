# StarkEx Crypto Wallet SDK
This repository is a basic crypto wallet repository intended for developers to build upon. It includes a ServiceManager class that acts as a wrapper for any wallet-service that implements the IService interface. It also includes an example Services class which connect to StarkEx. 

## Motivation
This repository provides developers with two core example IService examples: the CLI and the WalletConnect user. The CLI allows developers to send commands to the ServiceManager kernel and authorize sections from the command line (admin role), while the WalletConnect user allows dApps to connect to the ServiceManager (user role). 

## Technology
- **IService Interface**: The IService interface is the backbone of the ServiceManager class and is essential for any wallet-service that is to be used with the ServiceManager. It includes definitions for all of the methods and properties that the ServiceManager requires in order to perform its operations.
- **ServiceManager**: The ServiceManager class acts as a wrapper over any wallet-service that implements the IService interface.
- **StarkExWallet**: The core NodeJs code that can authorize users and sign transactions.
- **StarkExGateway**: Core NodeJs code that can connect to a StarkEx gateway.
See getting_started.md for more documentation and overview on the SDK.

## Installation
To install the repository, clone the Github repository to your local machine:

```
git clone https://github.com/THE_FINAL_REPO_LOCATION
```

## Getting Started
- run "npm install". 
- testing "npm run test", These tests use the IService classes to test the wallets

## Example Usage dApp + CLI
- Head over to the dApp example. It uses WalletConnect, so you will need to run "npm start" to boot up the dApp.
- In this repo, run "node index.js", this will (right now) start up the CLI admin interface
- Click Connect on the dApp. When prompted, copy the deep link
- In the cli type "auth YOUR_PASTED_AUTH_CODE" and press enter
- You should see that your session is started
- On the dApp, you should see that the message is gone 
- you can now use the dApp, and when required, type "approve" into the wallet
