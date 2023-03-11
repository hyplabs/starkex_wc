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
const config = require('../config.json');
//const spottx = require('spottx.json');
const path = require('path');
const spottx = require(path.join(__dirname, 'spottx.json'));
const spottx_signed = require(path.join(__dirname, 'spottx_signed.json'));


jest.setTimeout(60000);
doGenerateAccount = async (app,admin) => {
    // Here we demo:
    // (1) ETH private key Generation. This can be used for L1 functions such deposting into StarkEx.
    let results = {}
    results.ethProvider =  config.ethProvider ;
    results.starkProvider =  config.starkProvider;
    results.ethResponse = await app.run("generate_account","eth",{});
    results.ethAccount  = await app.run("select_account","eth",{publicKey: results.ethResponse.publicKey}); 
    results.ethPrivateAccount  = await app.run("expose_account","eth",{publicKey: results.ethResponse.publicKey}); 
    results.starkResponse = await app.request("generate_stark_account_from_private_key","starkex",{'privateKey':results.ethPrivateAccount.privateKey});
    results.starkAccount = await app.request("select_account","starkex",{starkKey:results.starkResponse.starkKey});
    return results;
  }

  doTestTransaction= async(req,app,admin,expect,doSign,txAdd)=>{
    if (doSign==true)
    {
        req['nonce'] = Math.floor(Math.random() * 900000) + 100000;
        let sig = await app.request( "sign_message", "starkex", req);
        console.log("Test Sig")
        console.log(sig)
        expect(sig).toHaveProperty('r', expect.stringMatching(/^0x[a-f0-9]+$/));
        expect(sig).toHaveProperty('s', expect.stringMatching(/^0x[a-f0-9]+$/));
        req['signature'] = sig;
    }
    req['tx_add'] = txAdd;
    res = await app.request( "sendTransaction", "starkexgate",req);
    console.log("Test Res")
    console.log(res)
    expect(res).toHaveProperty('code', 'TRANSACTION_PENDING');
  
  }

  test('Test System', async () => {
    jest.setTimeout(30000);
    const dom = new JSDOM();
    global.document = dom.window.document;
    const projectId = config.projectID;
      
    const namespaces = {
        eip155: { methods: ['generate_request_hash',
                            'personal_sign',
                            "get_public_key", 
                            "sign_message",
                            "get_key_material",
                            'generate_account',
                            'signTransaction',
                            'set_gateway',
                            'getFirstUnusedTxId',
                            'set_gateway',
                            'sendTransaction',
                            'generate_stark_account_from_private_key',
                            'generate_account_from_private_key',
                            'select_account',
                             ], 
                  chains: ['eip155:1'], 
                  events: ['accountsChanged'] }
      }; 
    
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
    console.log("StarkExGateway INIT");
    let admin = new Wallet({"walletWCConfig":walletWCConfig,
                            'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // NOT A SECURE KEY
                            'starkPrivateKey':undefined,
                             });
    console.log("StarkExGateway FINISH");
    let app = new WCApp({'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // NOT A SECURE KEY
                        'starkPrivateKey':undefined,
                         }); 
      
    // Step 1 - App Propse + Get deep link [  ]
    let linkAndApprove = await app.doConnect(namespaces,projectId);
    let appConnectPromise = app.listen();    
    await admin.listen(); // Wallet looks for pairing at relay
  
    currentAccount = await admin.serviceManager.run("eth", "admin", "generate_account", {});
    await app.serviceManager.run("eth",  "admin",  "select_account", {"privateKey":currentAccount.privateKey});    
    await appConnectPromise; // APP is starting to listen
    //await admin['cli'].pair(linkAndApprove.deep_link); // Wallet looks for pairing at relay
    await admin.admin_command("auth "+linkAndApprove.deep_link); // Wallet looks for pairing at relay
    await linkAndApprove.approval; // approval comes back
    
    let accountResults = await doGenerateAccount(app,admin);
    console.log (accountResults);  
    expect(accountResults['ethProvider']).toMatch(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
    expect(accountResults['starkProvider']).toMatch(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);
    expect(accountResults['ethResponse']['publicKey']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['ethAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['ethPrivateAccount']['mnemonic']).toMatch(/^\b(\w+)\b(\s+\b\w+\b)*$/);
    expect(accountResults['ethPrivateAccount']['address']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['ethPrivateAccount']['publicKey']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['ethPrivateAccount']['privateKey']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['starkResponse']['account']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['starkResponse']['starkKey']).toMatch(/^[A-Za-z0-9]{5,1000}$/);
    expect(accountResults['starkAccount']).toMatch(/^[A-Za-z0-9]{5,1000}$/);


    let starkKey = accountResults['starkResponse']['starkKey'];
      
    res =await app.request( "set_gateway", "starkexgate", {"providerUrl":"https://gw.playground-v2.starkex.co"});
    expect(res).toEqual(true);
    
      
    // Some test requests
    /*
    await doTestTransaction({"type":"TransferRequest",
      systemId: '1',
      amount: '1001',
      nonce: 1519522183,
      senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
      senderVaultId: 1,
      token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
      receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
      receiverVaultId: 1,
      expirationTimestamp: 438953},app,admin,expect);*/
      
    let tx_add = 0;  
    
    for (let i = 0; i < spottx.length; i++) {
      spottx[i]['systemId'] = 1;
      await doTestTransaction(spottx[i], app, admin, expect, false, tx_add);
      tx_add = tx_add +1;
    }
      
    //for (let i = 0; i < spottx_signed.length; i++) {
    //  spottx_signed[i]['systemId'] = 1;
    //  await doTestTransaction(spottx_signed[i], app, admin, expect, true, tx_add);
    //  tx_add = tx_add +2;
    //}
      
      
    
      
    // DEPOSIT --------------------------------------------------------------------
    // WITH FEES --------------------------------------------------------------------
    /*
    await doTestTransaction({
        systemId: '1',
        type: "TransferRequest",
        amount: '1000',
        nonce: 1519522183,
        senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
        senderVaultId: 1,
        token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
        receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
        receiverVaultId: 1,
        expirationTimestamp: 438953,
        feeInfoUser: {
            token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
            feeLimit: "0",
            sourceVaultId: 3            
        },
        "feeToken",   
        "feeVaultId",
        "feeLimit"
        feeInfoExchange: {
            destinationStarkKey: '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
            destinationVaultId: 4,
            feeTaken: 0
        }},app,admin,expect);
        
,    
    {
        "systemId": "1",
        "type": "TransferRequestWithFees",
        "amount": "1000",
        "nonce": 1519522183,
        "senderPublicKey": "0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4",
        "senderVaultId": 1,
        "token": "0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4",
        "receiverPublicKey": "0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020",
        "receiverVaultId": 1,
        "expirationTimestamp": 438953,
        "feeInfoUser": {
            "token": "0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4",
            "feeLimit": "0",
            "sourceVaultId": 3
        },
        "feeInfoExchange": {
            "destinationStarkKey": "0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80",
            "destinationVaultId": 4,
            "feeTaken": 1
        }
    }        
        
        */
      
      
      
      
      
    // PERPETUAL --------------------------------------------------------------------
    // WITH FEES --------------------------------------------------------------------
    //console.log(spottx);
      
    
  });