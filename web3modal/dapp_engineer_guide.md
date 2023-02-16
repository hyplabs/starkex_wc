# dApp Developer Guide 
This is your guide to developing and launching your own dApp. If you are a dApp developer, interested in signing transactions for StarkEx, this is the right document for you. There are a few main sections. First, we will cover Wallet Architecture, just to get our bearings. Second, we will discuss each major wallet component. Third, we will discuss best practices and places to expand the codebase for your organization. Lastly, we will provide a checklist, a series of steps to follow when making your own wallet.


## 0 Testing

from the / (root) directory, you can run "npm run test" and this will test the end to end system via WalletConnect. You can also open up /tests folder and explore the tests line by line. This test case is similar to what an end-user may experience. If you are doign Test Driven Development, it is possible to extend these use cases with additional features, then to consult the arcitecture diagram to look for development or extension oppourtunities. 


## 1 - Extension Checklist
If you would like to extend or create your own StarkEx wallet, this check list will lead you through the process.

**0 - Beginner:Running tests**
- run "npm run test" from the project root to test the system is  operating properly. 
- run "npm start" from the /web3modal/ directory to run the dApp alone
- you can run any ETH (local) command WITHOUT running the back-end service

**1- Beginner: Adding your own ETH Wallet Methods**
1. It may be the case that you want a new method to derive a ETH wallet, or you want to enforce a certain kind of account. In this case open wallet/services/EthWallet.js, and add the functionality you would like. 

**2- Beginner: Adding your own Service**
1. you may have a service, such as a database, app settings, or library, you want to provide to your dApp, locally, in browser. To add in a service you will need to:
1. Create your new service file web3modal/src/services/NEW_SERVICE.js. To understand structure, you may inspect web3modal/src/services/IService.js
2. In /web3modal/src/WCApp.js, you will want to register a new service by calling registerService.

```
const EthWallet = require('../services/MY_NEW_SERVICE.js');
class WCApp{
    constructor(settings)
    {
        
        ...
        success =this.serviceManager.registerService(new MY_NEW_SERVICE(this.serviceManager,MY_ARGS));    
        if (success == false)
            throw new Error('!Could not add MY_NEW_SERVICE');
        ...
    }

```
3. You will want to edit /tests/full.js, and add in a test case to run your new local service methods.

**3- Beginner: Distributing and Running just the dApp**
1. Know: The /web3modal/* directory is actually a complete NPM package, and can be removed. 
2. Issue: You must be sure that your custom wallet is broadly supported. Thus, you should likely consult the /wallet/\*.md files to get started with wallet development in general.
3. You can initalize this as a new repository, and customize as you please
      
**3- Beginner: Distributing and Running the dApp+wallet**
1. If you are crafting your own wallet while following the /wallet/\*.md guides, you may upgrade this dApp to invoke new commands
2. in App.js, you should add in new test function calls:
```

g_exampleCommands['stark.sign_message'] = {
        service:"starkex",
        type:"request",
        command:"sign_message",
        args: {"type":"TransferRequest",
              amount: '1000',
              nonce: 1519522183,
              senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
              senderVaultId: 1,
              token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
              receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
              receiverVaultId: 1,
              expirationTimestamp: 438953}  
} 

```
3. These commands will appear in a drop down list of commands in the running react app. If you run the commands, the results will appear to the user.
4. If you are a wallet developer, you can distribute this whole modified repository as an example of how to make a dApp for your new wallet.
... 
```