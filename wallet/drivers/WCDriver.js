/** WCDriver - Wallet Connect Driver
 * Use this Driver to support connecting to the Service Manager with Wallet Connect, like this:
 * dApp -- WalletConnect Relay --- WCDriver --- ServiceManager -- Services
 * 
 * The WCDriver encapsulates all WalletConnect support, on the wallet side. It intercepts all WC requests, and transforms them into 
 * requests for the ServiceManager. In the context of a larger application, other classes may also be using the ServiceManager.
 * In this case, another interface (like a CLI), may be able take privilaged actions that the WCDriver can not.
 * 
 */
const { SignClient } = require( "@walletconnect/sign-client");
const { Core } = require( "@walletconnect/core");
const { inspect } = require( 'util') ;
const ServiceManager = require('../services/ServiceManager.js');


class WCDriver{
    
  async queryForResponse(service,method,params,metadata){
    //let resp = await this.serviceManager.request("eth_wallet_gateway", "admin", "generate_eth_account",{});
    //console.log("queryForResponse---------------------------------");
    //console.log(service);
    //console.log(method);
    //console.log(params);

    let resp = await this.serviceManager.request(service, "admin", method,params);
    //console.log ("SESSION REQUEST (A.2)");
    //console.log(resp);
    return resp
  }

  constructor(sm){
        this.signClient = undefined;
        this.system_topics = {};
        this.serviceManager = sm;
  }
    
  // First you have to initialize, and set up lisenting for WC Events. None will come through, but get ready!
  async listen(){
    this.signClient = await SignClient.init({
        projectId: "b700887b888adad39517894fc9ab22e1",
        relayUrl: "wss://relay.walletconnect.com",
        metadata: {
          name: "Wallet name",
          description: "A short description for your wallet",
          url: "#",
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
        },
      });
      
      this.signClient.on("session_request", async (event) => {
        let method = event.params.request['method'];
        let params = event.params.request['params'];
        let service= event.params.request['service'];
      
        let metadata = {};

        //console.log ("waiting...");
        let resp = await this.queryForResponse(service,method,params,metadata);
        //console.log ("done...");
        this.signClient.respond({
                              "topic": event.topic,
                              "response":{"id":event.id,
                                        "jsonrpc":"2.0",
                                        "result":resp}});
      });
      

      this.signClient.on("session_proposal", async (event) => {
        /**
         * 
        {
              "id": 1674053961082583,
              "params": {
                "id": 1674053961082583,
                "pairingTopic": "2540da25a70a3ace59c50f335d5e3ea53feecdbaacedbcda7a92531cd7280dad",
                "expiry": 1674054262,
                "requiredNamespaces": {
                  "eip155": {
                    "methods": [
                      "personal_sign"
                    ],
                    "chains": [
                      "eip155:1"
                    ],
                    "events": [
                      "accountsChanged"
                    ]
                  }
                },
                "relays": [
                  {
                    "protocol": "irn"
                  }
                ],
                "proposer": {
                  "publicKey": "60d012e715e531c5bd15eee63074ead6a8dd1c0bf59e7bd0daeb8a30b4dccd12",
                  "metadata": {
                    "name": "",
                    "description": "",
                    "url": "",
                    "icons": [
                      ""
                    ]
                  }
                }
              }
            }
         */
        //console.log("session_proposal EVENT>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        //console.log(JSON.stringify(event, null, 2));

        let genericParing = {} 

        if (event.params == undefined || event.params.requiredNamespaces == undefined)
        {
          console.log("TODO, Handle rejection properly");
          return;
        }
  
        Object.keys(event.params.requiredNamespaces).forEach((nsid)=>{
          genericParing[nsid] = {};
          ['chains','events','methods'].forEach((spec)=>{
              genericParing[nsid][spec] = event.params.requiredNamespaces[nsid][spec];
          });
        });
        let accounts = await this.queryForResponse("eth_wallet_gateway","system_approve_paired_accounts",genericParing,{});
        
        /// TODO -- This should validate only accounts on relevant chains. As a demo this is fine.
        Object.keys(genericParing).forEach((nsid)=>{
          event.params.requiredNamespaces[nsid].chains.forEach((chainid)=>{
            genericParing[nsid]['accounts'] = [];
            accounts.forEach((account)=>{
              genericParing[nsid]['accounts'].push (chainid+":"+account); 
            });
          });
        });


        let apprv = {"id":event.id,"namespaces":genericParing}
        let vals   =  await this.signClient.approve(apprv);
        this.system_topics[vals.topic] =  event;
            
              
        
        /*
        let apprv = {
          "id":event.id,
          "namespaces":{
            "eip155":{
              "methods":["eth_sendTransaction",
                        "eth_signTransaction",
                        "generate_eth_account",
                        "personal_sign",
                        "eth_signTypedData"],
              "accounts":["eip155:1:0xbe1E971E8e5E50F7698C74656520F0E788a0518D",
                          "eip155:42161:0x3c582121909DE92Dc89A36898633C1aE4790382b",
                          "eip155:43114:0x3c582121909DE92Dc89A36898633C1aE4790382b"],
              "events":["chainChanged",
                "accountsChanged"]
                    }
            }
        } */       
      });          
  }


    async SendTestMessage(){
      console.log("Sending Message to dApp");
      let keys = Object.keys(this.system_topics);
        console.log("Ping !");
        const result = await this.signClient.request({
          topic: keys[0],
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
        console.log("Got response from dApp");
        console.log(result);
  

    }

    //Second, to allow events from a device, you need to pair 
    async pair(auth_code)
    {
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