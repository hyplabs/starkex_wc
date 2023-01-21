import { SignClient } from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'
const WCApp = require(  './WCApp.js');

/*

  let app = new WCApp();   
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
  
*/
function MainComponent() {
  const projectId = 'b700887b888adad39517894fc9ab22e1'
  const namespaces = {
    eip155: { methods: ['personal_sign','generate_eth_account'], 
              chains: ['eip155:1'], 
              events: ['accountsChanged'] }
  }
  const web3Modal = new Web3Modal({ projectId, standaloneChains: namespaces.eip155.chains })
  //let sessionApproval = undefined;
  //let signClient = undefined;
  let app = new WCApp();   

  async function testSignPersonalMessage(){
    /*
    const result = await signClient.request({
      topic: sessionApproval.topic,
      chainId: "eip155:1",
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "personal_sign",
        params: [
          "0x1d85568eEAbad713fBB5293B45ea066e552A90De",
          "0x7468697320697320612074657374206d65737361676520746f206265207369676e6564",
        ],
      },
    });
    console.log("SIGN RESP")
    console.log(result);*/
    alert(2);
  }
 
  let doConnect = async () =>{
    try {
      
      //const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
      const { deep_link, approval } = await app.doConnect(namespaces,projectId);
      //let appConnectPromise = app.listen();   
      let uri = deep_link;

      if (uri) {
        web3Modal.openModal({ uri })
        let res = await approval; // WHAT
        console.log("Connected 2");
        console.log(res)
        web3Modal.closeModal()
        let sessionApproval = res;
        //handleWalletEvents(signClient);
        
      }

    } catch (err) {
      console.error(err)
    }

  }




  return (
    <>
      <button onClick={doConnect} >Connect
      </button>
      <button onClick={testSignPersonalMessage} >testSignPersonalMessage
      </button>
    </>

  ); 
}

export default MainComponent;