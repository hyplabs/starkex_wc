# Wallet Getting Started

This is a CLI wallet. Ideally, you are a developer who is looking to create or extend a wallet for the StarkEx platform. This wallet application encloses two services, a StarkExWallet service, which can sign requsts and create keys, and a StarkExGateway service which can talk to an external gateway. These services reside in the /wallet/services/ directory. Using the CLI you can authorize requests originating from a WalletConnect user. A future version may remove the StarkExGateway.

# Example Usage (wallet only)
- To start the wallet, run "node index.js".
- When you want to bind to a wallet, type > "auth wc:THE_LONG_CODE" which you can get from clicking copy on the wallet connect popup
- type "approve" as you see transactions to approve pop up
- If you want to focus on dApp development, it can be useful to type in "auto_approve". This will tell the wallet to auto_approve all messages it gets.

# Commands:
- echo: This will echo the text you type. This just shows how to get data from the command line and make sure the wallet is running. 
- auto_approve: From now on, approve all requests
- list: List the current WalletConnect sessions
- approve: Approve all of the recent transactions (usually the only transaction displayed. It is possible if you connect two wallets, to handle multiple requests, in theory.)
- reject: Rejects all the requests in the current approval queue
- auth [wc:wallet_connect_deep_link]: Connect to WalletConnect, and create a session. That session will be visible in a list

# Extension (Developers)
This wallet is built to be extended. Below are the important files, and how they are built

### index.js
Index implements the simplest possible Command Line Interface that can handles user input. At around 150 lines of code, it should ideally be easy to see how one can intercept commands from WalletConnect for approval, and how one may craft their own wallet kernel. 

### wallet.js
The Wallet class wraps many subservices into one class, using the composition pattern. It has no real functionality alone, and is modular in nature. It is plugin friendly, meaning it is very simple to add and remove new services. To extend the wallet, you need to write a new NodeJs /wallet/service, and write a new service:
```
this.serviceManager.registerService(new StarkExWallet(this.serviceManager,args));
```
The services which are registered may talk to each other, but do not need to programmatically refrence each other. This means it can be very direct to add and remove services over time.

### drivers/CLIDriver.js
This class is responsible for acting like a Command Line Interface, to talk with a human. It does not know about WalletConnect per-se, and responds to commands from the ServiceManager. If you are making a GUI application, you may be interested in making a new version of this class.

### drivers/WCDriver.js
This class is responsible to binding to WalletConnect. WalletConnect is very fully featured, and in this example we mainly focus on using the WalletConnect authorization and request functionality. Sessions are not fully managed or supported in this WCDriver, and if you do want to create a production grade wallet, you will be interested in extending the application to support more event types. Specifically, you shoud add in listeners, to listen to blockchian events, and wallet events, and those should be sent to the connected wallets with the emit() event. Also, you should update and send any session changes to the connected wallets. This example assumes eip115:1, and does not use the session wallet information in the rest of the application. A developer should  also clean up any hanging sessions, and add in reconnect functionality. A full wallet connect wallet example is out of scope for this code base and is sufficiently complex, however, this intorductory code base can indeed get you started.

### services/StarkExWallet
The class provides a set of methods for managing cryptographic keys and signing messages for use with the StarkEx platform. Some of the methods allow for listing and selecting accounts, generating new accounts from public or private keys, and retrieving key material. The code requires the StarkExAPI, starkware-crypto-utils, and crypto libraries to function.


- set_admin_account: sets the URL of the StarkEx API and a private key for the admin account.
- serviceName: returns the name of the service, which is "starkex".
- methodRoles: returns a dictionary that defines the roles that are allowed to access the methods of the class.
- list_accounts: lists all the accounts stored in the wallet.
- select_account: selects an account from the list of accounts stored in the wallet.
- generate_stark_account_from_public_key: generates a new StarkEx account using a public key.
- generate_stark_account_from_private_key: generates a new StarkEx account using a private key.
- get_key_material: returns the key material associated with a specific StarkEx account.- 
- generate_request_hash: generates a hash from a request message.
- sign_message: signs a message using the selected StarkEx account.
- get_public_key: returns the public key of the selected StarkEx account.

### services/StarkExGateway 
This code is an implementation of a gateway access point for StarkEx.The class implements methods such as getTransaction, getFirstUnusedTxId, sendTransaction, and set_gateway which are used to interact with a provider URL. The class is initialized with a service manager instance and a URI. The sendTransaction method uses the getFirstUnusedTxId method to obtain the next unused transaction ID, then before sending a transaction to a node. 
*depircation notice* this NodeJs wallet will, in later versions, may be disabled

### services/EthWallet *disabled by default*
The EthWallet is a software implementation for a service that manages Ethereum wallets. In this example we support a basic NodeJS implementation of wallet services. A developer may be interested in using this class as a base for integrating with other EVM chains like Polygon. It provides several functions for generating, managing, and signing Ethereum transactions. This service allows users to create new Ethereum accounts, view the public keys of all their managed accounts, select a specific account to work with, access details about an account such as the public and private keys, and derive the public key and address of an account from its private key. The service is named "eth" and it also implements methods required by the Service Manager, including returning the service name and running commands.

### services/EthGateway *disabled by default*
The EthGateway class acts as a gateway to interact with the Ethereum blockchain network. This class implements an Ethereum gateway service, which is responsible for sending transactions to the Ethereum network. It contains methods for setting the Ethereum provider URL, sending transactions, and managing roles of users. The method roles determine which type of users can access specific methods.The provider URL is an important aspect of the class as it is used to communicate with the Ethereum network to send transactions. The sendTransaction method is used to send a signed transaction to the Ethereum network, and the transaction details, such as the hash, can be retrieved after it is sent.


### services/ServiceManager

The ServiceManager class is a class that allows for the modular linking of multiple services into consumers such as CLI Interfaces, WalletConnect, and dApps. The Service Manager provides a set of services, for example ethers.js and StarkEx.js, and supports different Interfaces, for example CLI and WalletConnect. The major objects within Service Manager are services, roles, events, and commands.

Services are defined as objects that implement the IService interface and can subscribe to events, emit events, and have a list of commands, which are functions that take a JSON object as an argument. There are two roles within the Service Manager, User and Admin. Each command in an IService is required to be configured for a User or Admin role. Typically, a local wallet CLI is granted Admin access, whereas a dApp is granted User access. In general, Users cannot see private keys or inspect other secret data.

The Service Manager has functions for registering a service, registering an admin handler, emitting an admin event, making a request, and running a command. The request function makes a request to a user to run a command that the requester cannot run. The run function runs a command and returns a result.