/** WCDriver - Wallet Connect Driver
 * Use this Driver to support connecting to the Service Manager with Wallet Connect, like this:
 * dApp -- WalletConnect Relay --- WCDriver --- ServiceManager -- Services
 * 
 * The WCDriver encapsulates all WalletConnect support. It intercepts all WC requests, and transforms them into 
 * requests for the ServiceManager. In the context of a larger application, other classes may also be using the ServiceManager.
 * In this case, another interface (like a CLI), may be able take privilaged actions that the WCDriver can not.
 * 
 */
const { SignClient } = require( "@walletconnect/sign-client");
const { Core } = require( "@walletconnect/core");
const { inspect } = require( 'util') ;
class WCDriver{
    constructor(){
        this.signClient = undefined;
    }
    // First you have to initialize, and set up lisenting for WC Events. None will come through, but get ready!
    async listen(){
      this.signClient = await SignClient.init({
          projectId: "b700887b888adad39517894fc9ab22e1",
          //optional parameters
          relayUrl: "wss://relay.walletconnect.com",
          metadata: {
            name: "Wallet name",
            description: "A short description for your wallet",
            url: "#",
            icons: ["https://walletconnect.com/walletconnect-logo.png"],
          },
        });
        
        this.signClient.on("session_proposal", async (event) => {
          console.log("Session Event");
          console.log(inspect(event, { depth: null, colors: true }));
          //if (approveNamespaces(event.params.requiredNamespaces) == false)
          //  addAccountsToNamespaces
          /// TODO -- Request the user to approve the session
          console.log("Session Approving 1....");
          let apprv = {
            "id":event.id,
            "namespaces":{
              "eip155":{
                "methods":["eth_sendTransaction",
                          "eth_signTransaction",
                          "personal_sign",
                          "eth_signTypedData"],
                "accounts":["eip155:1:0xbe1E971E8e5E50F7698C74656520F0E788a0518D",
                            "eip155:42161:0x3c582121909DE92Dc89A36898633C1aE4790382b",
                            "eip155:43114:0x3c582121909DE92Dc89A36898633C1aE4790382b"],
                "events":["chainChanged",
                  "accountsChanged"]
                      }
              }
          }
          console.log("Session Approving....");
          
          /*
          const { topic, acknowledged } = await signClient.approve(apprv)
            console.log("Session Event Ack");
            console.log(acknowledged);
            console.log("Session Event Topic");
            console.log(topic);
        */
            let prms   =  this.signClient.approve(apprv).then(({topic, acknowledged})=>{

              console.log("Session Event Ack");
              console.log(acknowledged);
              console.log("Session Event Topic");
              console.log(topic);
  
          });
          console.log("Finished....");
          await prms;
      });          
  }

    //Second, to allow events from a device, you need to pair 
    async pair(auth_code)
    {
      //let link = 'wc:758c5c02550bfe24d3fc4df42955a0678e7d5f981cd18e3424ff646a0f0635d0@2?relay-protocol=irn&symKey=ce7d0e81126bcf96b04a14ffe9e7b517cb29626af8d68a9514af92b748f3597a'
      let step1 = await this.signClient.core.pairing.pair({ uri: auth_code })
      console.log("Step 1")
      console.log(step1);
      
      let step2 =await this.signClient.core.pairing.activate({ topic: step1.topic })
      console.log("Step 2")
      console.log(step2);
      
      const pairings = this.signClient.core.pairing.getPairings()
      console.log("List")
      console.log(pairings);
  

    }



    sayHello() {
        console.log("hello");
        return true;
    }
}

module.exports = WCDriver;