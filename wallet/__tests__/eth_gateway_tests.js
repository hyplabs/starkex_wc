

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

test('Test ServiceManager registration with ethers.js long version', async () => {
  const dom = new JSDOM();
  global.document = dom.window.document;
  
  // Init
  const ServiceManager = require('../services/ServiceManager.js');
  const EthWalletGateway = require('../services/EthWalletGateway.js');
  sm = new ServiceManager();
  sm.registerService(new EthWalletGateway());  

  // Tests
  let resp = await sm.run("eth_wallet_gateway", "admin", "generate_eth_account",{});
  console.log(resp);
  expect(Object.keys(resp).includes("mnemonic")).toEqual(true);


  let gateway = new EthWalletGateway();

  let args = {};
  let metadata = {};
  let newAccount = await sm.run("eth_wallet_gateway", "admin", "generate_eth_account",{});
  console.log(resp);
  expect(Object.keys(resp).includes("mnemonic")).toEqual(true);
  
  //
  let admin_privateKey = "0x7e225d3db6cf09dbd2f153b47a8e08b44a4c4f2a4a7a6a4a6a7a6a4a6a7a6a4";
  let value = "1000000000000000"; // 0.001 Ether
  let gasPrice = "2000000000"; // 2 Gwei
  let gasLimit = "21000";
  let nonce = "0";
  let chainId = "1";
  let data = "0x";
  
  let args = {
      privateKey: admin_privateKey,
      to: newAccount.address,
      value: value,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      nonce: nonce,
      chainId: chainId,
      data: data
  };
  let metadata = {};
  let signedTransaction = await sm.run("eth_wallet_gateway", "admin", "signTransaction",args);

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

});


