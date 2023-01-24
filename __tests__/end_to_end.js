const Wallet = require( '../wallet/wallet.js')
const WCApp = require( '../web3modal/src/components/WCApp.js')

jest.setTimeout(30000);
test('Simulate a dApp connecting to a CLI wallet', async () => {
  const projectId = 'b700887b888adad39517894fc9ab22e1';
  const namespaces = {
      eip155: { methods: ['personal_sign','generate_eth_account'], 
                chains: ['eip155:1'], 
                events: ['accountsChanged'] }
    };

  let admin = new Wallet();
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
  console.log(newAccnt);
  //// Step 4- Wallet Send message [   ]
  //await admin.wc_SendTestMessage();
  
  expect(1).toEqual(1);
});