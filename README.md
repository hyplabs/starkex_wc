# Introduction
Welcome to the Crypto Wallet and dApp Solution for StarkEx. This repository contains two projects that work together to provide a comprehensive solution for creating secure and reliable cryptocurrency wallets and decentralized applications (dApps) specifically for the StarkEx ecosystem. The projects are the web3modal and wallet.


## Install
1. **important** Please set up a config.json in all application directories you intend to run. There is a config_example.json present. This is a secure file with details that ONLY YOU should know for security reasons.
2. run npm install in the root, root/wallet/, and root/web3modal/

## Testing
- In the monorepo root, run "npm run test", and this will start up a dApp module, and a wallet module, and test WalletConnect fully with a toy ethers.js implementation


### web3modal
The web3modal directory contains a dApp (decentralized application) and a SignClient that allows for secure communication between the dApp and the wallet component of the project. The SignClient is a client-side implementation of the WalletConnect protocol that enables the wallet application to communicate with the dApp. This allows users to access their wallet's functionality and data, such as sending and receiving cryptocurrency, directly from the dApp without compromising security. 
- To deploy locally run "npm run start" in the web3modal directory


### wallet 
The wallet directory contains a crypto wallet solution that includes a ServiceManager class that acts as a wrapper for StarkEx's wallet-service. It also includes an example StarkEx class which functions as a gateway to the StarkEx services. Additionally, two example users are included; a CLI (Command Line Interface) user and a WalletConnect user. The ServiceManager allows for a centralized management of the StarkEx wallet-service, making it easy for developers to switch between different services without having to make significant changes to their code.
- To deploy locally run "node index" in the wallet directory

### mini-wallets (Services)
Within the wallet application, there are DRIVERS and SERVICES. Each Service functions as a "mini-wallet" managing the affairs of a specific service. The project is built with extentsion in mind and it should be easy to update and swap new L2 conventions as needed. CommonJs has been used to maximize compatibility with both back-end and desktop deployments, so it may be important to keep this in mind when extending.
- EthWalletGateway - This is an Ethereum Wallet toy example that can sign a request.
- StarkExWallet - This is a StarkEx service that can manage Spot and Perpetual requests
- StarkExGateway- This is a StarkEx service that can manage Spot and Perpetual requests



## Key Concepts
- WalletConnect: WalletConnect is a protocol that allows for secure, peer-to-peer connections between decentralized applications (dApps) and a user's cryptocurrency wallet. The SignClient provided in the web3modal directory is one way to implement the WalletConnect protocol in a dApp.
- Wallets: A cryptocurrency wallet is a digital wallet that allows users to store, send and receive digital assets such as cryptocurrencies. The wallet directory provides developers with a comprehensive starting point for building their own cryptocurrency wallets. Examples include MetaMask, or Ledger. Similar to MetaMask, the current version allows for both wallet operations and chain querying services.
- dApps: A decentralized application (dApp) is a software application that runs on a decentralized network (such as the blockchain) and is open-source. The web3modal directory provides developers with a comprehensive starting point for building their own dApps that can interact with a wallet through the WalletConnect protocol.

For any additional questions or information, please refer to the README.md file in the web3modal and wallet directories.

## Next Steps / What you should add / for discussion
Open the /wallet/ or /web3modal/ directories to learn more.