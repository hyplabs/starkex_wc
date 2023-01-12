# StarkEx Crypto Wallet Repository
This repository is a basic crypto wallet repository intended for developers to build upon. It includes a ServiceManager class that acts as a wrapper for any wallet-service that implements the IService interface. It also includes an example ETHWalletGateway class which functions as an ethereum wallet and Infura gateway. Additionally, two example users are included; a CLI (Command Line Interface) and a WalletConnect user.

## Motivation
As cryptocurrency continues to become more and more mainstream, it’s essential for developers to have the tools necessary to create secure and reliable cryptocurrency wallets. This repository provides developers with a comprehensive starting point for building their own cryptocurrency wallets, gateways, and othe tools. The ServiceManager within is designed to make it easier to connect to any wallet-service that implements the IService interface. Specifically, we demonstrate how the SM kernel can both connect to a WalletConnect relay and Command Line interface simultaniously.  

Furthermore, this repository provides developers with two example IService examples: the CLI and the WalletConnect user. The CLI allows developers to send commands to the ServiceManager kernel and authorize sections from the command line (admin role), while the WalletConnect user allows dApps to connect to the ServiceManager (user role). 

## Technology
**IService Interface**: The IService interface is the backbone of the ServiceManager class and is essential for any wallet-service that is to be used with the ServiceManager. It includes definitions for all of the methods and properties that the ServiceManager requires in order to perform its operations. This interface allows for a standardized approach to connecting and interacting with any wallet-service, making it easy for developers to switch between different services without having to make significant changes to their code. It also ensures that all wallet-services used with the ServiceManager have the necessary functionality to perform the required operations.

**ServiceManager**: The ServiceManager class acts as a wrapper over any wallet-service that implements the IService interface. At run time, the ServiceManager can be bound to any wallet-service that implements the IService interface. The ServiceManager supports both an admin and user role, and can process requests and emit events, making it a powerful tool for managing and interacting with wallet-services. It allows for a centralized management of multiple wallet-services, making it easy for developers to switch between different services without having to make significant changes to their code.

**ETHWalletGateway**: The ETHWalletGateway class is a specific implementation of the IService interface, which functions as an Ethereum wallet and Infura gateway. It serves as a good development example, demonstrating how to implement the IService interface and use it with the ServiceManager. It allows developers to easily interact with the Ethereum network and perform operations such as sending and receiving Ether and other ERC-20 tokens.

**CLI (Command Line Interface)**: The CLI (Command Line Interface) is a class that can send commands to the ServiceManager kernel and receive events. It also allows for the authorization of sections from the command line, providing developers with a convenient way to interact with the ServiceManager and perform operations such as sending and receiving cryptocurrency.

**WalletConnect User**: The WalletConnect User is a user that allows a WalletConnect relay to communicate with the ServiceManager, providing a bridge between dApps and the ServiceManager. This allows dApps to connect to the ServiceManager and perform operations such as sending and receiving cryptocurrency, making it easy for developers to integrate their dApps with the ServiceManager.

## Installation

To install the repository, clone the Github repository to your local machine:

```
git clone https://github.com/Hypelabs/crypto-wallet-repository.git
```

## Getting Started

- run "npm install". 
- testing "npm run tests", These tests use the IService classes to test the wallets

## Example Usage dApp (IN ACTIVE DEVELOPMENT)
- (IN ACTIVE DEVELOPMENT)
- Head over to the dApp example. It uses WalletConnect, so you will need to run "npm start" to boot up the dApp.
- In this repo, run "node index.js", this will (right now) start up the CLI admin interface
- Click Connect on the dApp. When prompted, copy the deep link
- In the cli type "auth YOUR_PASTED_AUTH_CODE" and press enter
- You should see that your session is started
- On the dApp, you should see that the message is gone 

## Usage CLI (IN DEVELOPMENT)
- Stay Tuned