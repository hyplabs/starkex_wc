
## 1 Architecture : Definitions

### drivers/*
A driver operates the wallet on behalf of a connected user. An example is WCDriver that operates on behalf of a connected WalletConnect user, or CLIDriver, who operates on behalf of a Command Line admin.

### services/IService
Services are defined as objects that implement the IService interface and can subscribe to events, emit events, and have a list of commands, which are functions that take a JSON object as an argument. There are two roles within the Service Manager, User and Admin. Each command in an IService is required to be configured for a User or Admin role. Typically, a local wallet CLI is granted Admin access, whereas a dApp is granted User access. In general, Users cannot see private keys or inspect other secret data.


### services/ServiceManager
The Service Manager brokers messages to, and from, the services, performs function reslution, and allows Services to use each other without hard coupling. It maintains an internal dictionary of Services. It also manages two roles, an admin, and a user. Admin functions require authorization to execute, whereas User functions can be freely executed without approval. The Service Manager has functions for registering a service, registering an admin handler, emitting an admin event, making a request, and running a command. The request function makes a request to a user to run a command that the requester cannot run. The run function runs a command and returns a result.



### drivers/CLIDriver.js
   This class is responsible for acting like a Command Line Interface, to talk with a human. It does not know about WalletConnect per-se, and responds to commands from the ServiceManager. If you are making a GUI application, you may be interested in making a new version of this class.  This example shows how an admin driver can interept all requests, and how approval can be handeled. This class is a good starting point for other kinds of administrative user interfaces, like ReactJS interfaces, or even a wallet admin API tunnel for administering server side wallets. 

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
