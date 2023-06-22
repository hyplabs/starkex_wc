# Introduction
Welcome to the Crypto Wallet and dApp Solution for StarkEx. This repository contains two projects that work together to provide a comprehensive solution for creating secure and reliable cryptocurrency wallets and decentralized applications (dApps) specifically for the StarkEx ecosystem. The projects are the web3modal and wallet.

## Docs! 
1. For an overview of the wallet, check out [Wallet](./wallet/README.md)
3. For Wallet Engineering, check out the [Wallet Engineering Guide](./wallet/wallet_engineer_guide.md)
5. To understand architecture, check out [Wallet Architecture](./wallet/architecture.md)
4. For an overview of the dApp, check out [dApp Overview](./web3modal/README.md)
5. For dApp Engineering, check out the [dApp Engineering Guide](./web3modal/dapp_engineer_guide.md)
6. To customize the whitelisted transactions see [transactions.md](./wallet/transactions.md)
7. For high level usage and functions consult [spec.md](./wallet/spec.md)
8. For a template reactjs dApp application, please consult [App.js](./web3modal/src/App.js)
9. For a template nodejs application, please consult [transactions.js](./__tests__/transactions.js)

# Key Concepts 
`Understanding Proxies` 
1. This system allows a reactjs app to use a nodeJS wallet, through a wallet connect relay.
2. By default,`Wallets are proxies to starkware-crypto-utils`. 
     1. This means that the wallet inherently supports all functions that that [starkware-crypto-utils](https://github.com/starkware-libs/starkware-crypto-utils) does. 
     2. The opposite is true; any messages not supported by starkware-crypto-utils are not supported by this proxy interface. 
     3. To see examples of how to configure messages for signatures, see [spec.md](./wallet/spec.md) and  [transactions.md](./wallet/transactions.md). 
4. By Default, `Gateways are proxies to the perpetual and spot API`. 
     1. The registry.json constrains the messages and arguments that are supplied, but no processing or other filtering is done. 
     2. The best way to visualize this operation is as a pipe. StarkEx WC passes messages, but does not understand them. 
     3. Thus, all transactions supported by a StarkEx or StarkWare POST gateway are inherently supported, as long as they are entered in the registry.json. Please see [transactions.md](./wallet/transactions.md) for instructions on how to configure the registry


## Install
1. **important** Please set up a config.json the root directory. There is a config_example.json present. `!!!This is a secure file with details that ONLY YOU should know for security reasons.!!! Do not add it to source control!`
2. run `npm install` in the root, root/wallet/, and root/web3modal/
3. run `npm run setup` in the root



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


## TODOs
Some known TODOs will be added here soon!
