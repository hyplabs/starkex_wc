import { SignClient } from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'

function MainComponent() {
  const projectId = 'b700887b888adad39517894fc9ab22e1'
  const namespaces = {
    eip155: { methods: ['personal_sign'], 
              chains: ['eip155:1'], 
              events: ['accountsChanged'] }
  }
  const web3Modal = new Web3Modal({ projectId, standaloneChains: namespaces.eip155.chains })
  let sessionApproval = undefined;
  let signClient = undefined;

  async function testSignPersonalMessage(){
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
    console.log(result);
  }

  let doConnect = async () =>{
    try {
      if (signClient) {
        const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
        if (uri) {
          web3Modal.openModal({ uri })
          let res = await approval()
          console.log("Connected")
          console.log(res)
          web3Modal.closeModal()
          sessionApproval = res;
          handleWalletEvents(signClient);
        }
      }
      else
      {
        signClient = await SignClient.init({ projectId })
        alert("Init Done");
      }
    } catch (err) {
      console.error(err)
    }

  }

function handleWalletEvents(signClient){

  signClient.on("session_event", ({ event }) => {
    console.log("session_event");
    console.log("-----------------");
    console.log(event);
    
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  });
  signClient.on("session_request", (event) => {
    console.log ("SESSION REQUEST");
    console.log(event);
    this.signClient.respond({
                          "topic": event.topic,
                          "response":{"id":event.id,
                                    "jsonrpc":"2.0",
                                    "result":{'test_message':'hey from wallet'}}});

  });
    
  signClient.on("session_update", ({ topic, params }) => {
      const { namespaces } = params;
      const _session = signClient.session.get(topic);
      // Overwrite the `namespaces` of the existing session with the incoming one.
      const updatedSession = { ..._session, namespaces };
      // Integrate the updated session state into your dapp state.
      //onSessionUpdate(updatedSession);
      console.log("session_update");
      console.log("-----------------");
      console.log(updatedSession);
    });
  
  signClient.on("session_delete", () => {
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
    console.log("session_delete !");
    console.log("-----------------");
});
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