const { JSDOM } = require('jsdom');
const { window } = new JSDOM('', {
  url: "http://localhost",
  resources: "usable",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
 
// Remove or disable Node.js-specific features
// This partly simulates a browser environment, so we can 
// ensure the application can run in a browser as is, if needed
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.XMLHttpRequest = window.XMLHttpRequest;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;

Object.defineProperties(global.navigator, {
  userAgent: { value: "jsdom" },
  platform: { value: "jsdom" },
});

delete global.window.document.createRange;
delete global.window.document.getSelection;
delete global.window.localStorage; 
const Wallet = require( '../wallet/wallet.js')
const WCApp = require( '../web3modal/src/components/WCApp.js')

jest.setTimeout(30000);


doGenerateAccount = async (app,admin) => {
    // Here we demo:
    // (1) ETH private key Generation. This can be used for L1 functions such deposting into StarkEx.
    results = {}
    results.ethResponse = await app.request("generate_account","eth",{});
    
    // (2) Eth user selection
    results.ethAccount  = await app.request("select_account","eth",{publicKey: results.ethResponse.publicKey}); 

    // (3) StarkEx key Generation.
    results.starkResponse = await app.request("generate_stark_account_from_public_key","starkex",{'publicKey':results.ethResponse.publicKey});
    
    // (4) Stark user selection.
    results.starkAccount = await app.request("select_account","starkex",{starkKey:results.starkResponse.starkKey});

    return results;
  }

  doTestTransactions = async (app,admin) => {
    let val;
    results = {}
    results['get_key_material'] = await app.request("get_key_material","starkex", {});

    results['generate_request_hash'] = await app.request("generate_request_hash", 
    "starkex",  
      {"type":"TransferRequest",
      amount: '1000',
      nonce: 1519522183,
      senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
      senderVaultId: 1,
      token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
      receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
      receiverVaultId: 1,
      expirationTimestamp: 438953});
    
        
    results['sign_message'] = await app.request("sign_message","starkex",         
      {"type":"TransferRequest",
      amount: '1000',
      nonce: 1519522183,
      senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
      senderVaultId: 1,
      token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
      receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
      receiverVaultId: 1,
      expirationTimestamp: 438953});
    
    //expect(Object.keys(val).includes("r")).toEqual(true);
    //expect(Object.keys(val).includes("s")).toEqual(true);
    //expect(val['r']).toMatch(/^0x[A-Za-z0-9]{5,1000}$/);
    //expect(val['s']).toMatch(/^0x[A-Za-z0-9]{5,1000}$/);
  
    results['getFirstUnusedTxId']  = await app.request("getFirstUnusedTxId","starkex", {});
    //console.log("getFirstUnusedTxId");
    //console.log(val);
    //expect(val.toString()).toMatch(/^[0-9]{3,1000}$/);

    results['sendTransaction'] = await app.request( "sendTransaction", "starkex", 
    {
      "type": "DepositRequest",
      "tokenId": '0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
      "amount": '1000',
      "vaultId": 1,
      "starkKey": '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
    });
    return results;
  }


/*
  handleGetAccountData = async () => {
    let sessions = await this.app.request("list_sessions","system",{});        
    alert(JSON.stringify(accountResponse)+JSON.stringify(sessions));
  }

  handleFundingEth = async () => {
    // Move L1 currency into Starkware with a Deposit
    let args = {};
    let metadata = {};  
    let value = "0.001"; // 0.001 Ether
    let gasPrice = "2000000000"; // 2 Gwei
    let gasLimit = "21000";
    let chainId = 5;
    args = {
        to: "31349e0c9d36f3d11b980df145a1abc871399b8a",
        value: value,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        type:1,
        chainId: chainId,
    };
    metadata = {};
  
    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedTransaction = await this.app.request("signTransaction","eth",args);
    
    // (1.b) Send money to StarkEx deposit
    let sendTransaction = await this.app.request("sendTransaction","eth",args);
    fundingTransaction  = sendTransaction;
    alert(JSON.stringify(sendTransaction ));

    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedTransaction2 = await this.app.request("signTransaction","stark",args);
    
    // (1.b) Send money to StarkEx deposit
    let sendTransaction2 = await this.app.request("sendTransaction","stark",args);
    fundingTransaction  = sendTransaction;
    alert(JSON.stringify(sendTransaction ));
  }

  handleStarkExample = async () => {

    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedTransaction = await this.app.request("signTransaction","stark",args);
    
    // (1.b) Send money to StarkEx deposit
    let sendTransaction = await this.app.request("sendTransaction","stark",args);
  }

  disconnect = async () => {

    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedTransaction = await this.app.request("signTransaction","stark",args);
    
    // (1.b) Send money to StarkEx deposit
    let sendTransaction = await this.app.request("sendTransaction","stark",args);
  }
  
  failAtUsingWallet = async () => {

    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedTransaction = await this.app.request("signTransaction","stark",args);
    
    // (1.b) Send money to StarkEx deposit
    let sendTransaction = await this.app.request("sendTransaction","stark",args);
  }*/


  test('Test ServiceManager registration with ethers.js long version', async () => {
    jest.setTimeout(30000);
    const dom = new JSDOM();
    global.document = dom.window.document;
    const projectId = 'b700887b888adad39517894fc9ab22e1';
    const namespaces = {
        eip155: { methods: ['generate_request_hash',
                            'personal_sign',
                            "get_public_key", 
                            "sign_message",
                            "get_key_material",
                            'generate_account',
                            'signTransaction',
                            'getFirstUnusedTxId',
                            'sendTransaction',
                            'generate_stark_account_from_public_key',
                            'generate_account_from_private_key',
                            'select_account',
                             ], 
                  chains: ['eip155:1'], 
                  events: ['accountsChanged'] }
      }; 
    
    let admin = new Wallet({'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // NOT A SECURE KEY
                            'ethProviderUrl':undefined,
                            'starkPrivateKey':undefined,
                            'srarkProviderUrl':undefined,
                             }); // JUSTIN'S INSTANCE
    let app = new WCApp(); 
      
    // Step 1 - App Propse + Get deep link [  ]
    let linkAndApprove = await app.doConnect(namespaces,projectId);
    let appConnectPromise = app.listen();    
  
    // Step 2 - APP Connect [  ]
    let walletWCConfig = {
      projectId: projectId,
      relayUrl: "wss://relay.walletconnect.com",
      metadata: {
        name: "Wallet name",
        description: "A short description for your wallet",
        url: "#",
        icons: ["https://walletconnect.com/walletconnect-logo.png"],
      },
    }    
    await admin.wc_listen(walletWCConfig); // CLI starts to listen  
    await appConnectPromise; // APP is starting to listen
    await admin.wc_pair(linkAndApprove.deep_link); // Wallet looks for pairing at relay
    await linkAndApprove.approval; // approval comes back
    await admin.serviceManager.run("eth",  "admin", "set_admin_account", {"providerUrl":"https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"});
    await admin.serviceManager.run("starkex", "admin", "set_admin_account", {"providerUrl":"https://gw.playground-v2.starkex.co"});
    
    let accountResults = await doGenerateAccount(app,admin);

    console.log(JSON.stringify(accountResults));
    expect(accountResults['ethAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['starkAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);

    let testResults = await doTestTransactions(app,admin);
    console.log("deposit results")
    console.log(testResults)
    // ***Gui Upgrades (9-11)
    // 0 - buttons exist for some flow
    // 1 - Can see transactions in a list
    // 2 - Whole experience runs on master

  });