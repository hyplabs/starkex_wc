# Wallet Engineer Guide 
This is your guide to developing and launching your own StarkEx wallet. If you are a wallet developer, interested in signing transactions for StarkEx, this is the right document for you. There are a few main sections. First, we will cover Wallet Architecture, just to get our bearings. Second, we will discuss each major wallet component. Third, we will discuss best practices and places to expand the codebase for your organization. Lastly, we will provide a checklist, a series of steps to follow when making your own wallet.


## 0 Testing
There are two forms of testing. Internal, and External.

*Internal*: from the /wallet/ directory, you can run "npm run test" and this will test the wallet. You can also open up /wallet/tests, to inspect basic line by line usage of the wallet. This test case is similar to what you may do if you are adminstering the wallet locally, on a server, or directly on a wallet-user's computer.
*External*: from the / (root) directory, you can run "npm run test" and this will test the end to end system via WalletConnect. You can also open up /tests folder, to inspect External use, line by line. This test case is similar to what an end-user may experience.

If you are doign Test Driven Development, it is possible to extend these use cases with additional features, then to consult the arcitecture diagram to look for development or extension oppourtunities. 


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

### services/EthWallet *disabled by default*
  The EthWallet is a software implementation for a service that manages Ethereum wallets. In this example we support a basic NodeJS implementation of wallet services. A developer may be interested in using this class as a base for integrating with other EVM chains like Polygon. It provides several functions for generating, managing, and signing Ethereum transactions. This service allows users to create new Ethereum accounts, view the public keys of all their managed accounts, select a specific account to work with, access details about an account such as the public and private keys, and derive the public key and address of an account from its private key. The service is named "eth" and it also implements methods required by the Service Manager, including returning the service name and running commands.

### services/EthGateway *disabled by default*
   The EthGateway class acts as a gateway to interact with the Ethereum blockchain network. This class implements an Ethereum gateway service, which is responsible for sending transactions to the Ethereum network. It contains methods for setting the Ethereum provider URL, sending transactions, and managing roles of users. The method roles determine which type of users can access specific methods.The provider URL is an important aspect of the class as it is used to communicate with the Ethereum network to send transactions. The sendTransaction method is used to send a signed transaction to the Ethereum network, and the transaction details, such as the hash, can be retrieved after it is sent.


## 2 - Extension Checklist
If you would like to extend or create your own StarkEx wallet, this check list will lead you through the process.

**0 - Beginner:Running tests**
- run "npm run test" from the project root to test the system is  operating properly. 

**1- Beginner:Adding your own StarkEx Wallet Methods**
It may be the case that you want a new method to derive a StarkEx wallet, or you want to enforce a certain kind of account. In this case open wallet/services/StarkExWallet.js, and add the functionality you would like. 

**2- Beginner:Adding your own Service**
you may have a service, such as a database, app settings, or library, you want to provide to your wallet. To add in a service you will need to:
1. Create your new service file wallet/services/NEW_SERVICE.js. To understand structure, you may inspect wallet/services/IService.js
2. In /wallet/wallet.js, you will want to register a new service by calling registerService.
3. You will want to edit /tests/full.js, and add in a test case to run your new service methods.

**3- Beginner:Adding your own Driver Interface**
1. Create your new driver in /drivers/NEW_DRIVER.js. To understand structure, you may inspect wallet/services/CLIDriver.js
2. A Driver can be a reactjs communication tunnel, and API service, or even a transaction processor that reads transactions from a database
2. In /wallet/wallet.js, you will want to register a new driver by calling doMethodBinding.
3. You will want to edit /tests/full.js, and add in a test case to run your new driver methods.

**4- Beginner:Distributing and Running just the wallet, without the dApp**
1. Know: The /wallet/* directory is actually a complete NPM package, and can be removed. It even has its own unit test wired into "wallet/npm run test"
2. You can move the /wallet/* directory to new directory of your choice
3. You can initalize this as a new repository, and customize as you please

**5- Medium:Adding Storage**
1. The default wallet example service (wallet/services/StarkExWallet.js) has no storage, however it does maintain state awareness as long as a session is running.
2. You can extend this service, or add a secondary service that connects to a database, the local file system, or localStorage
3. You will want to edit /tests/full.js, and add in a test case to run your new service methods.

**6- !Advanced: Fully Supporting Wallet Connect**
1. The current WalletConnect support is minimal in nature. We do not demonstrate the usage of events, session management, session events, or 2 way communication
2. Please do visit docs.walletconnect.com to decide if more aspects of the protocol interest you.
3. If you team opts to use more wallet connect features, you must edit the /drivers/WCDriver.js with any new methods and systems
4. If you add in session management, or other features that require service-to-service communication, see (7)

**7- !Advanced: Service-to-Service communication**
1. It is very likely that you may want services to communicate with each other. As an example, we have crafted an example for educational purposes only in StarkExWallet.js.
```
// from StarkExWallet.js.
    async generate_stark_account_from_public_key(args,metadata){
        ...
        let ethAccount = await this.serviceManager.run("eth", "admin",  "expose_account", 
        {
          "publicKey": args.publicKey,
        });       
        ...
        let starkAcc = this.generate_stark_account_from_private_key({"privateKey":ethAccount.privateKey},{})
        ...
        return {"starkKey":starkAcc.starkKey}      
    }
```
2. It is possible to request, from one service, the operations of another registered service. This pattern is reccomended when you believe a secondary service should remain independent. An example may be an encrypted database, which may be upgraded. You may register this service in the serviceManager as "storage", and support a series of get and set methods.
3. In wallet.js, you can choose to register the kind oof storage class you like, and the underlying implementation will be used by any requester.

**8- !Advanced: Catching Custom Events **
1. If you are building a driver, or service, you may be interested in generating or handling events. When events arrive from WalletConnect, they are encoded as RPC requests like so:
```
/// Service Requestor (WCDriver)
class WCDriver{
  ...  
  async queryForResponse(service,method,params,metadata){
   // We request that the serviceManager promises to respond to a service request. We return this promise 
    let resp = await this.serviceManager.request(service, "admin", method,params);
    return resp
  }
  ...
```

2. You will need to have a previously registered service to handle a response
```
/// Service Responder (CLIDriver-edited for readability)
...
// Tell the service manager you would like to respond to events.
this.serviceManager.registerAdminHandler(responder); 
// where, an example responder could be
this.responder = async (args,metadata) => {
      // (a) you can test the request, and decide if you want to exeute it. This can involve requesting the user respond to a request
      if(something_bad_is_true)
      {
          event.func_reject({"error":"something_bad_is_true"});
          return;
      }
      // (b) you may handle special requests (not reccomended)
      if (event.command="some_hard_coded_exception")
      {
          event.func_resolve("some_hard_coded_result"); // return the result
          return;
      }
      
      // (c.1) you may run invoke the request right away
      let resp = this.serviceManager.run(
              event.service, 
              event.role, 
              event.command,
              event.args);
      event.func_resolve(resp); // return the result
      
      // (c.1) you may run invoke the request right away
      let approval = await someInterface.promptApproval(event)
      if (approval)
      {
          let resp = this.serviceManager.run(
                  event.service, 
                  event.role, 
                  event.command,
                  event.args);
          event.func_resolve(resp); // return the result      
      }
      else
      {
          event.func_resolve("Approval Rejected"); // return the result           
      }
}
... 
```