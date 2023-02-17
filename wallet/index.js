const { JSDOM } = require('jsdom');
const { window } = new JSDOM('', {
  url: "http://localhost",
  resources: "usable",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
 
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
const  Wallet  = require('./wallet.js');

let main = async () =>{
  let ethPrivateKey = undefined;
  let ethProviderUrl = undefined;
  let walletWCConfig = {
    projectId: "b700887b888adad39517894fc9ab22e1",
    relayUrl: "wss://relay.walletconnect.com",
    metadata: {
      name: "Wallet name",
      description: "A short description for your wallet",
      url: "#",
      icons: ["https://walletconnect.com/walletconnect-logo.png"],
    },
  }    
    
  admin = new Wallet({
                        "walletWCConfig":walletWCConfig,
                        "approvalMethod": "cli", // This is the handler that is involked when a new event is triggered by a dApp
                            'starkPrivateKey':undefined,
                            }); // This is the RPC target for the Eth Node we wish to speak with
   admin.run();
}

main();


// 1. Need way to set current account
// 2. Should be able to set account with mnemonic
// 3. Constants should be consolidated in env vars