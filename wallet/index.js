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
                    ethPrvateKey: ethPrivateKey, // This is the ETH private key we will use internall to represent the sessioon
                    ethProviderUrl: ethProviderUrl}); // This is the RPC target for the Eth Node we wish to speak with
  await admin.wc_listen();   
  currentAccount = await admin.serviceManager.run("eth_wallet_gateway", "admin", "generate_eth_account", {});
  await admin.serviceManager.run("eth_wallet_gateway", 
                                  "admin", 
                                  "set_admin_account", {"privateKey":currentAccount.privateKey,
                                                        "providerUrl":undefined});
  
  console.log(JSON.stringify(currentAccount));
  console.log("begin by writing 'auth PASTE_YOUR_DEEP_LINK'");   
  console.log("After session_approval, you may see requests for review. With these requests you can respond with 'approve' and 'reject'.");   
  rl.prompt();
}

let admin = undefined;
let currentAccount = {};
let approvals = [];

main();