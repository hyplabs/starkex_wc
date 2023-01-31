
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

///
////////////////////////////////////////////
///
const readline = require('readline');
const  Wallet  = require('./wallet.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', async (input) => {
  const words = input.split(' ');
  const command = words[0];
  const args = words.slice(1); 

  if (command === 'echo') {
    console.log(`Echoing: ${args.join(' ')}`);

  
  } else if (command === 'list') {
    console.log(system_topics);

  } else if (command === 'approve') {
    console.log("approving.. ");
    adminApproveAll();
  } else if (command === 'reject') {
    console.log("rejecting.. ");
    adminRejectAll();
  } else if (command === 'auth') {
    console.log("Pairing.. "+args[0]);
    await admin.wc_pair(args[0]); // Wallet looks for pairing at relay
      
  } else {
    console.log(`Unknown command: ${command}`);
  }
});

async function adminApproveAll(){
  console.log(JSON.stringify(approvals));
  approvals.forEach((event)=>{
    adminRespond(event);
  });
  approvals = [];
}

async function adminRejectAll(){
  approvals.forEach((event)=>{
    event.func_reject({'error':"rejected by wallet user"});
  });
  approvals = [];
}

async function adminRequest(event){
  console.log("New Request from dApp. Type 'approve' to approve it! Type 'reject' to reject it.");
  console.log("-------------------");
  console.log(JSON.stringify(event));
  console.log("-------------------");
  approvals.push(event);
}

async function adminRespond(event){
  if (event.command == "system_approve_paired_accounts")
  {
    event.func_resolve(["0x"+currentAccount['address']]);
    return;
  }
    
  if (event.command == "system_get_account_data")
  {
    retVal = {}
    retVal['address'] = currentAccount['address'];
    retVal['publicKey'] = currentAccount['publicKey'];
    event.func_resolve(retVal);
    return;
  }

  let resp = admin.serviceManager.run( event.service, event.role, event.command,event.args);
  event.func_resolve(resp);
}


let main = async () =>{
  let ethPrivateKey = undefined;
  let ethProviderUrl = undefined;
  admin = new Wallet({approvalMethod: adminRequest, // This is the handler that is involked when a new event is triggered by a dApp
                        'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // TESTING. NOT A SECURE KEY
                            'ethProviderUrl':undefined,
                            'starkPrivateKey':undefined,
                            'srarkProviderUrl':undefined}); // This is the RPC target for the Eth Node we wish to speak with
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
  await admin.wc_listen(walletWCConfig);   
  currentAccount = await admin.serviceManager.run("eth", "admin", "generate_account", {});
  await admin.serviceManager.run("eth", 
                                  "admin", 
                                  "set_admin_account", {"privateKey":currentAccount.privateKey,
                                                        "providerUrl":undefined});
  await admin.serviceManager.run("eth",  "admin", "set_admin_account", {"providerUrl":"https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"});
  await admin.serviceManager.run("starkex", "admin", "set_admin_account", {"providerUrl":"https://gw.playground-v2.starkex.co"});

  console.log ("Connected:");  
  console.log (await admin.serviceManager.run("starkex", "admin", "getFirstUnusedTxId", {}))


  //console.log(JSON.stringify(currentAccount));
  console.log("begin by writing 'auth PASTE_YOUR_DEEP_LINK'");   
  console.log("After session_approval, you may see requests for review. With these requests you can respond with 'approve' and 'reject'.");   
  rl.prompt();
}

let admin = undefined;
let currentAccount = {};
let approvals = [];

main();