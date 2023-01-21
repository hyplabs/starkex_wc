## Crypto Wallet and dApp Solution
This repository contains two projects that work together to provide a comprehensive solution for creating secure and reliable cryptocurrency wallets and decentralized applications (dApps). The projects are the web3modal and wallet.

**web3modal**
The web3modal directory contains a dApp (decentralized application) and a SignClient that allows for secure communication between the dApp and the wallet component of the project. The SignClient is a client-side implementation of the WalletConnect protocol that enables the wallet application to communicate with the dApp. This allows users to access their wallet's functionality and data, such as sending and receiving cryptocurrency, directly from the dApp without compromising security.

**wallet**
The wallet directory contains a crypto wallet solution that includes a ServiceManager class that acts as a wrapper for any wallet-service that implements the IService interface. It also includes an example ETHWalletGateway ans StarkEx class which functions as an Ethereum wallet and Infura gateway. Additionally, two example users are included; a CLI (Command Line Interface) user and a WalletConnect user. The ServiceManager allows for a centralized management of multiple wallet-services, making it easy for developers to switch between different services without having to make significant changes to their code.

**mini-wallets**
Within the wallet, there are some sub services. Today, there is an IService example, and ETH service, and a StarkEx service. Each function as "mini-wallets" each managing the affairs of one chain. It is direct to add in new services, and remove them, without knowledge of dApp+wallet application. A major motivation of this project is making sure that services can be easily updated and altered over time, as the nature of L2 protocols changes. It should be easy to update and swap new L2 conventions as needed. The project is built with extentsion in mind. 


# Motivation
It's essential for developers to have the tools necessary to create secure and reliable interactions between dApps and wallets. WalletConnect is a popular library for implementing web3modals, but there are almost no "end-to-end" examples. This repository demonstrates a bare bones dApp and Wallet combination that use the new SignClient interface from WalletConnect 2.0. This repository provides developers with a basic starting point for building their own projects that can interact with a wallet through the WalletConnect protocol. In fact, as opposed to the most common WalletConnect examples, this code base discusses one dApp, one kind of Wallet, and one interaction pattern, on one protocol version.


## Key Concepts
- WalletConnect: WalletConnect is a protocol that allows for secure, peer-to-peer connections between decentralized applications (dApps) and a user's cryptocurrency wallet. The SignClient provided in the web3modal directory is one way to implement the WalletConnect protocol in a dApp.
- Wallets: A cryptocurrency wallet is a digital wallet that allows users to store, send and receive digital assets such as cryptocurrencies. The wallet directory provides developers with a comprehensive starting point for building their own cryptocurrency wallets. Examples include MetaMask, or Ledger. These technologies include user interface controls.
- Wallet-Service: A sub-wallet or a service that acts as a mini wallet within a complete wallet. Examples are ethers.js, StarkEx.js, IService, EthWalletGateway, and any composoble sub service.
- dApps: A decentralized application (dApp) is a software application that runs on a decentralized network (such as the blockchain) and is open-source. The web3modal directory provides developers with a comprehensive starting point for building their own dApps that can interact with a wallet through the WalletConnect protocol.

For any additional questions or information, please refer to the README.md file in the web3modal and wallet directories.

## Next Steps / What you should add
This repository is template, and as such developers should be able to access the code quickly as a base layer, without lots of complexity. Our goal is to get you started quickly. However, there are many concessions we have made to keep the code focused, which we summerize below.
- We use signClient.requests for almost all messages. It is possible to emit WalletConnect events, and send session info, which would increase the handlers and complexity on both sides of the application. 
- It is possible to create something called a Provider, that can simplify the code base for some users. This topic is not covered, as we imagine some of our users would perfer lower level access.
- We did not discuss, or handle, emitting events from the wallet to the user. We also defined a "react only wallet" that does not take its own commands. This was to keep the code simple. A real wallet can also generate events, such as accountChanged, and even session termination
- We did not keep multiple sessions in memory, or handle terminating sessions
- We did not give an example of querying or altering the WalletConnect session dynamically
All of these subjects, and more, can be considered when you develop your real wallet! With the above in mind, it would not be approopriate to use this example as a full application. It is, however, and excellent starting point. 







