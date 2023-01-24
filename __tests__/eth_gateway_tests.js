

const { JSDOM } = require('jsdom');
const { window } = new JSDOM('', {
  url: "http://localhost",
  resources: "usable",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
 
// Remove or disable Node.js-specific features
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
  const dom = new JSDOM();
  global.document = dom.window.document;
  const projectId = 'b700887b888adad39517894fc9ab22e1';
  const namespaces = {
      eip155: { methods: ['personal_sign','generate_eth_account','signTransaction'], 
                chains: ['eip155:1'], 
                events: ['accountsChanged'] }
    };
  
  let admin = new Wallet({'ethPrivateKey':"0xa881e3de2f71ddfcd7d5c189c4755b6033328d48e9895d47ea4de00603d6732c",
                          'ethProviderUrl':"https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"});
  let app = new WCApp(); 
  jest.setTimeout(30000);
    
  // Step 1 - App Propse + Get deep link [  ]
  let linkAndApprove = await app.doConnect(namespaces,projectId);
  //console.log("The link" + linkAndApprove['deep_link']);
  let appConnectPromise = app.listen();    

  // Step 2 - APP Connect [  ]
  await admin.wc_listen(); // CLI starts to listen
  await appConnectPromise; // APP is starting to listen
  await admin.wc_pair(linkAndApprove.deep_link); // Wallet looks for pairing at relay
  await linkAndApprove.approval; // approval comes back
  
  let newAccnt = await app.request("generate_eth_account","eth_wallet_gateway",{});
 
  expect(Object.keys(newAccnt).includes("mnemonic")).toEqual(true);


  let args = {};
  let metadata = {};  
  let value = "0.001"; // 0.001 Ether
  let gasPrice = "2000000000"; // 2 Gwei
  let gasLimit = "21000";
  let chainId = 5;
  
  args = {
      to: newAccnt.address,
      value: value,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      nonce: nonce,
      type:1,
      chainId: chainId,
  };
  metadata = {};

  console.log("preparedTransaction");
  console.log(args);
  let signedTransaction = await app.request("signTransaction","eth_wallet_gateway",args);
  console.log("signedTransaction");
  console.log(signedTransaction);

/*
  console.log("Signed transaction:", signedTransaction);
  
  let args = {signedTransaction: signedTransaction};
  let metadata = {};
  let transactionId = await sm.run("eth_wallet_gateway", "admin", "sendSignedTransaction",args);
  console.log("Transaction ID:", transactionId);
  
  let args = {transactionId: transactionId};
  let metadata = {};
  let transactionReceipt = await sm.run("eth_wallet_gateway", "admin", "getTransactionStatus",args);
  while (!transactionReceipt.confirmed) {
    transactionReceipt = await sm.run("eth_wallet_gateway", "admin", "getTransactionStatus",args);
      console.log("Transaction not confirmed yet, checking again in 5 seconds...");
      await sleep(5000);
  }
  console.log("Transaction confirmed. Receipt:", transactionReceipt);
  */
});


