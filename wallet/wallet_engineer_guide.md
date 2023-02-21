# Wallet Developer Guide 
This is your guide to developing and launching your own StarkEx wallet. If you are a wallet developer, interested in signing transactions for StarkEx, this is the right document for you. There are a few main sections. First, we will cover Wallet Architecture, just to get our bearings. Second, we will discuss each major wallet component. Third, we will discuss best practices and places to expand the codebase for your organization. Lastly, we will provide a checklist, a series of steps to follow when making your own wallet.


## 0 Testing
There are two forms of testing. Internal, and External.

1. *Internal*: from the /wallet/ directory, you can run "npm run test" and this will test the wallet. You can also open up /wallet/tests, to inspect basic line by line usage of the wallet. This test case is similar to what you may do if you are adminstering the wallet locally, on a server, or directly on a wallet-user's computer.
2. *External*: from the / (root) directory, you can run "npm run test" and this will test the end to end system via WalletConnect. You can also open up /tests folder, to inspect External use, line by line. This test case is similar to what an end-user may experience.

If you are doign Test Driven Development, it is possible to extend these use cases with additional features, then to consult the arcitecture diagram to look for development or extension oppourtunities. 


## 1 - Extension Checklist
If you would like to extend or create your own StarkEx wallet, this check list will lead you through the process.

**0 - Beginner:Running tests**
- run "npm run test" from the project root to test the system is  operating properly. 

**1- Beginner:Adding your own StarkEx Wallet Methods**
1. It may be the case that you want a new method to derive a StarkEx wallet, or you want to enforce a certain kind of account. In this case open wallet/services/StarkExWallet.js, and add the functionality you would like. 

**2- Beginner:Adding your own Service**
1. you may have a service, such as a database, app settings, or library, you want to provide to your wallet. To add in a service you will need to:
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

**8- !Advanced: Catching Custom Events**
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
```
3. c.1, c.2, c.3 all describe different approval schemes.

    1. (c.1) invoke
```      
      ////////////
      // (c.1) you may run invoke the request right away
      let resp = this.serviceManager.run(
              event.service, 
              event.role, 
              event.command,
              event.args);
      event.func_resolve(resp); // return the result
```

    2. (c.2) await approval

```      
      ////////////
      // (c.2) you may otherwise pass along the event for approval, and then process the request
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
          event.func_reject("Approval Rejected"); // return the result           
      }
      
```

    3. (c.2) delegate

```
      
      ////////////
      // (c.3) you can also simply pass on the approval process, and delegate the above details.
      await someInterface.handleApproval(event);
}
      

... 
```