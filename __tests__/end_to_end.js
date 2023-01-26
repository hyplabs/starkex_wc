/**
 * END TO END TEST - Jest
 * dApp --- Relay --- Wallet test
 * 
 * This unit test runs an end-to-end dApp + Wallet. It covers
 * - Authorization through Wallet Connect
 * - Accessing a protected wallet service
 * - Responding to any Authorizatioons
 * 
 * TODO / CONSIDER: 
 * - Left these constants in, so the repository works upon npm install without configuration
 * - *idea* It may be a good idea to add a CLI configuration script to the repo, along with a method of handling constants across browser / live deployments 
 */

const Wallet = require( '../wallet/wallet.js')
const WCApp = require( '../web3modal/src/components/WCApp.js')

jest.setTimeout(10000);
test('Simulate a dApp connecting to a CLI wallet', async () => {
  jest.setTimeout(10000);
  const projectId = 'b700887b888adad39517894fc9ab22e1'; // Wallet Connect project_id
  const namespaces = {
      eip155: { methods: ['personal_sign',
                          'generate_eth_account'], 
                chains: ['eip155:1'], 
                events: ['accountsChanged'] }
    };

  // Create a new Wallet object. This will handle all Wallet-side code
  let wallet = new Wallet({'ethPrivateKey':"0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f", // NOT A SECURE KEY
                          'ethProviderUrl':undefined, // If you have it, pass a URL to an infura instance. If none is required, the code will do its best without a gateway
                          'approvalMethod': undefined // a callback function of the format <<(event) =>{event.func_resolve(resp);}>> that resolves/rejects wallet promises.
                                                      // There is a default implementation in /drivers/CLIDrivers.js for general testing support, which authorizes all requests
                          });

  //////////////////////////////////////////////////////
  ///// 1 - Establish dApp-relay-Wallet Tunnel   ///////
  ///// 
  // Create a new dApp object, to access a WalletConnect wallet.
  // - Note. WCApp can be upgraded to be a Provider if desired.
  //
  // To: dApp Developer
  // WCApp is also used in react.js to talk to wallet connect.
  // If you are a dApp developer, you will be mostly interested in
  // how WCApp works. 
  // It may, in fact, ../web3modal/src/components/WCApp.js may be the only file you need!
  let app = new WCApp(); 
    
  // From the dApp, request the Relay for a connection
  let linkAndApprove = await app.doConnect(namespaces,projectId);
  
  // From the dApp, listen for Wallet Events
  let appConnectPromise = app.listen();    
  
  // From the Wallet, listen for dApp Events
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
  await wallet.wc_listen(walletWCConfig); // CLI starts to listen
  
  // From the dApp, accept connection. The Tunnel is established
  await appConnectPromise; // APP is starting to listen
  
  ////////////////////////////////////////////
  ///// 2 - Propose a session ////////////////
  ///// 
  // approve the deep link in the wallet (In real live, the user will type "auth wc:#######")
  await wallet.wc_pair(linkAndApprove.deep_link);
  // await the appoval promise on the dApp side
  await linkAndApprove.approval; 
  
  ////////////////////////////////////////////
  ///// 2 - Run a Request ////////////////////
  // After this, things are easy.
  // request an account. The default wallet application will auto_approve requests (for unit test reasons)
  let newAccnt = await app.request("generate_eth_account","eth_wallet_gateway",{});

  // Make sure the dApp gets a valid user back from the wallet
  expect(Object.keys(newAccnt).includes("mnemonic")).toEqual(true);

});