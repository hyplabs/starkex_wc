## Crypto Wallet and dApp Solution
This repository contains two projects that work together to provide a comprehensive solution for creating secure and reliable cryptocurrency wallets and decentralized applications (dApps). The projects are the web3modal and wallet directories.

# Motivation
As cryptocurrency and decentralized applications become more mainstream, it's essential for developers to have the tools necessary to create secure and reliable interactions between dApps and wallets. This repository provides developers with a comprehensive starting point for building their own projects that can interact with a wallet through the WalletConnect protocol.

## Project Summary
**web3modal**
The web3modal directory contains a dApp (decentralized application) and a SignClient that allows for secure communication between the dApp and the wallet component of the project. The SignClient is a client-side implementation of the WalletConnect protocol that enables the wallet application to communicate with the dApp. This allows users to access their wallet's functionality and data, such as sending and receiving cryptocurrency, directly from the dApp without compromising security.

**wallet**
The wallet directory contains a crypto wallet solution that includes a ServiceManager class that acts as a wrapper for any wallet-service that implements the IService interface. It also includes an example ETHWalletGateway class which functions as an Ethereum wallet and Infura gateway. Additionally, two example users are included; a CLI (Command Line Interface) and a WalletConnect user. The ServiceManager allows for a centralized management of multiple wallet-services, making it easy for developers to switch between different services without having to make significant changes to their code.

## Key Concepts
- WalletConnect: WalletConnect is a protocol that allows for secure, peer-to-peer connections between decentralized applications (dApps) and a user's cryptocurrency wallet. The SignClient provided in the web3modal directory is one way to implement the WalletConnect protocol in a dApp.
- Wallets: A cryptocurrency wallet is a digital wallet that allows users to store, send and receive digital assets such as cryptocurrencies. The wallet directory provides developers with a comprehensive starting point for building their own cryptocurrency wallets.
- dApps: A decentralized application (dApp) is a software application that runs on a decentralized network (such as the blockchain) and is open-source. The web3modal directory provides developers with a comprehensive starting point for building their own dApps that can interact with a wallet through the WalletConnect protocol.

For any additional questions or information, please refer to the README.md file in the web3modal and wallet directories.



