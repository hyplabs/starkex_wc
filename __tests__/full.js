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
    let results = {}
    results.ethProvider =  "https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514";
    results.starkProvider =  "https://gw.playground-v2.starkex.co";

    await app.request("set_admin_account","eth",   {"providerUrl":results.ethProvider});
    await app.request("set_admin_account", "starkex", {"providerUrl":results.starkProvider});

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


  doL1Deposit = async (app,admin) => {
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
    let signedEthTransaction = await app.request("signTransaction","eth",args);
    console.log("signedEthTransaction");
    console.log(signedEthTransaction);    
    args = {"hex":signedEthTransaction};
    let sentEthTransaction = await app.request("sendTransaction","eth",args);
    return {signedEthTransaction, sentEthTransaction};

  }

  doL2Deposit = async (app,admin) => {
    results = {}
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

    results['getFirstUnusedTxId']  = await app.run("getFirstUnusedTxId","starkexgate", {});

    results['sendTransaction'] = await app.run( "sendTransaction", "starkexgate", 
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
Connect Wallet:
---------------------------
[ ] - End-user uses a StarkEx App and presses “Connect Wallet”
[ ] - Pop-up window with optional wallets and WalletConnect
[ ] - Presses “WalletConnect”
[ ] - Pop-up window with QR code
[ ] - End user scans code with a WalletConnect compatible wallet, or enters the deep_link (in the case of a Command Line Interface)

Get public key:
---------------------------
[ ] - App sends to wallet Get_public_key
[ ] - Wallet derives Stark pair keys from mnemonic (BIP32, EIP-2645)
[ ] - Wallet send the app the public Stark key

Deposit (Spot):
---------------------------
[ ] - End user presses “deposit” on app
[ ] - App sends an on-chain deposit request to an Ethereum wallet (which includes Stark_public_key, asset_type, vault_id,quantized_amount). The deposit operation supports deposits of ETH, ERC-20, ERC-721, and ERC-1155.
[ ] - App sends off-chain deposit to StarkEx service


Transfer (Spot):
---------------------------
[ ] - End user request to transfer funds (presses ‘transfer’ in app)
[ ] - App sends Stark wallet sign_message request for transaction type transfer (if it’s StarkEx v1) or type transaction_with_fees (for Starkex version 4.5)
[ ] - Wallet parse message payload and present to end-user to sign
[ ] - User signs message with Stark key corresponding to this specific app
[ ] - App sends a transfer request transaction to the StarkEx gateway, using the add_transaction API with the TransferRequest transaction type.
*/


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
                            "set_admin_account",
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
    let app = new WCApp({'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // NOT A SECURE KEY
    'ethProviderUrl':undefined,
    'starkPrivateKey':undefined,
    'srarkProviderUrl':undefined,
     }); 
      
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
    currentAccount = await admin.serviceManager.run("eth", "admin", "generate_account", {});
    await app.serviceManager.run("eth", 
                                    "admin", 
                                    "set_admin_account", {"privateKey":currentAccount.privateKey,
                                                          "providerUrl":undefined});    
    await appConnectPromise; // APP is starting to listen
    await admin.wc_pair(linkAndApprove.deep_link); // Wallet looks for pairing at relay
    await linkAndApprove.approval; // approval comes back
    await app.serviceManager.run("ethgateway",  "admin", "set_gateway", {"providerUrl":"https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"});
    await app.serviceManager.run("starkexgate", "admin", "set_gateway", {"providerUrl":"https://gw.playground-v2.starkex.co"});
    
    console.log ("Connected:");  
    console.log (await app.serviceManager.run("starkexgate", "user", "getFirstUnusedTxId", {}))


    
    let accountResults = await doGenerateAccount(app,admin);

    console.log(JSON.stringify(accountResults));
    expect(accountResults['ethAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['starkAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    
    //let testResults = await doTestTransactions(app,admin);
    //console.log("test results")
    //console.log(testResults)

    //let l1depositResults = await doL1Deposit(app,admin);
    //console.log("L1 deposit results");
    //console.log(l1depositResults);
    let l2depositResults = await doL2Deposit(app,admin);
    console.log("L2 deposit results");
    console.log(l2depositResults);

  });