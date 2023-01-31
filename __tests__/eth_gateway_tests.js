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
                          'generate_eth_account',
                          'signTransaction',
                          'sendTransaction',
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
  
  let newAccnt = await app.request("generate_eth_account","eth",{});
  expect(Object.keys(newAccnt).includes("mnemonic")).toEqual(true);


  let args = {};
  let metadata = {};  
  let value = "0.001"; // 0.001 Ether
  let gasPrice = "2000000000"; // 2 Gwei
  let gasLimit = "21000";
  let chainId = 5;
  console.log("newAccnt.address");
  console.log(newAccnt.address);
  args = {
      to: newAccnt.address,
      value: value,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      type:1,
      chainId: chainId,
  };
  metadata = {};

  let signedTransaction = await app.request("signTransaction","eth",args);
  console.log(signedTransaction);
  expect(signedTransaction).toMatch(/^0x[A-Za-z0-9]{10,1000}$/);

  await admin.serviceManager.run("eth", 
                                  "admin", 
                                  "set_admin_account", {"privateKey":"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f",
                                                        "providerUrl":"https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"});


  console.log("Setting pro---------------------------------")
  let connectionResult = await admin.serviceManager.run("starkex", 
                                 "admin", 
                                 "set_admin_account", {"privateKey":"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f",
                                                       "providerUrl":"https://gw.playground-v2.starkex.co"});
  console.log(connectionResult);
         
  signedTransaction = await app.request("signTransaction","eth",args);
  console.log(signedTransaction);
  expect(signedTransaction).toMatch(/^0x[A-Za-z0-9]{10,1000}$/);
  let val = "";
  val = await admin.serviceManager.run("starkex",  "admin",  "get_public_key", {});
  console.log(val);
  expect(Object.keys(val).includes("res")).toEqual(true);
  
  val = await admin.serviceManager.run("starkex",  "admin",  "get_key_material", {});
  console.log(val);
  expect(Object.keys(val).includes("result")).toEqual(true);
/**
        const request: TransactionRequest = {
            type: GatewayRequestType.DEPOSIT_REQUEST,
            tokenId: '0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
            amount: '1000',
            vaultId: 1,
            starkKey: '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
        }
        const response = await wallet.sendTransaction(await addTxIdToRequest(request));
        expect(response.code).toBe('TRANSACTION_PENDING');
 * 
 * 
 */
  val = await admin.serviceManager.run("starkex",  
    "admin",  
    "generate_request_hash", 
    {"type":"TransferRequest",
    amount: '1000',
    nonce: 1519522183,
    senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
    senderVaultId: 1,
    token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
    receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
    receiverVaultId: 1,
    expirationTimestamp: 438953});
  console.log(val);
  expect(val).toMatch(/^[A-Za-z0-9]{5,1000}$/);

  val = await admin.serviceManager.run("starkex",  
    "admin",  
    "sign_message", 
    {"type":"TRANSFER_REQUEST",
    amount: '1000',
    nonce: 1519522183,
    senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
    senderVaultId: 1,
    token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
    receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
    receiverVaultId: 1,
    expirationTimestamp: 438953});
  
  expect(Object.keys(val).includes("r")).toEqual(true);
  expect(Object.keys(val).includes("s")).toEqual(true);
  expect(val['r']).toMatch(/^0x[A-Za-z0-9]{5,1000}$/);
  expect(val['s']).toMatch(/^0x[A-Za-z0-9]{5,1000}$/);

  val = await admin.serviceManager.run("starkex", "user",  "getFirstUnusedTxId", {});
  console.log("getFirstUnusedTxId");
  console.log(val);

  expect(val.toString()).toMatch(/^[0-9]{3,1000}$/);
  val = await admin.serviceManager.run("starkex", "admin",  "sendTransaction", 
  {
    "type": "DepositRequest",
    "tokenId": '0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
    "amount": '1000',
    "vaultId": 1,
    "starkKey": '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
  });
  console.log("Value");

  console.log(val);


/* TODO, 
  Reccomend adding ethers.js methods if we would like. 
  They are prototyped already, just need a little extra love.
  
  console.log("Signed transaction:", signedTransaction);
  
  let args = {signedTransaction: signedTransaction}; 
  let metadata = {};
  let transactionId = await sm.run("eth", "admin", "sendSignedTransaction",args);
  console.log("Transaction ID:", transactionId);
  
  let args = {transactionId: transactionId};
  let metadata = {};
  let transactionReceipt = await sm.run("eth", "admin", "getTransactionStatus",args);
  while (!transactionReceipt.confirmed) {
    transactionReceipt = await sm.run("eth", "admin", "getTransactionStatus",args);
      console.log("Transaction not confirmed yet, checking again in 5 seconds...");
      await sleep(5000);
  }
  console.log("Transaction confirmed. Receipt:", transactionReceipt);
  */
});

