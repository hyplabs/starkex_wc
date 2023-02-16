
# Architecture

This project is a dApp example, which shows how to communicate with a StarkEx wallet application. It is very slimmed down, and can me expanded or altered in many ways. At its core, the App.js file demonstrates how to, in one file, create a functional dApp user interface. It sends requests to two services, an local (in-memory) ETH service, and a remote (other machine) StarkEx service. In this example, both services expose a Wallet. 

### src/App.js
The User interface for the dApp GUI. It allows a user to generate a new account, sign transactions, and send them to some toy gateways. Every service and gateway is minimal in implementation such that it is simple to extend / adapt this dApp.

### src/services/IService
Services are defined as objects that implement the IService interface and can subscribe to events, emit events, and have a list of commands, which are functions that take a JSON object as an argument. There are two roles within the Service Manager, User and Admin. Each command in an IService is required to be configured for a User or Admin role. Typically, a local wallet CLI is granted Admin access, whereas a dApp is granted User access. In general, Users cannot see private keys or inspect other secret data.

### services/ServiceManager
The Service Manager brokers messages to, and from, the services, performs function reslution, and allows Services to use each other without hard coupling. It maintains an internal dictionary of Services. It also manages two roles, an admin, and a user. Admin functions require authorization to execute, whereas User functions can be freely executed without approval. The Service Manager has functions for registering a service, registering an admin handler, emitting an admin event, making a request, and running a command. The request function makes a request to a user to run a command that the requester cannot run. The run function runs a command and returns a result.

### src/components/WCApp.js
   The WCApp sends messages to a remote service, and formats the response for the dApp. This class is responsible to binding to WalletConnect. WalletConnect is very fully featured, and in this example we mainly focus on using the WalletConnect authorization and request functionality. 




### src/services/EthWallet
  The EthWallet is a software implementation for a service that manages Ethereum wallets. In this example we support a basic JavaScript implementation of wallet services. A developer may be interested in using this class as a base for integrating with other EVM chains like Polygon. It provides several functions for generating, managing, and signing Ethereum transactions.
  
### src/services/EthGateway
   The EthGateway class acts as a gateway to interact with the Ethereum blockchain network. This class implements an Ethereum gateway service, which is responsible for sending transactions to the Ethereum network. It contains methods for setting the Ethereum provider URL, sending transactions, and managing roles of users. The method roles determine which type of users can access specific methods.The provider URL is an important aspect of the class as it is used to communicate with the Ethereum network to send transactions. The sendTransaction method is used to send a signed transaction to the Ethereum network, and the transaction details, such as the hash, can be retrieved after it is sent.