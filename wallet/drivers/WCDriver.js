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
    let resp = await this.serviceManager.request(service, "admin", method,params);
    return resp
  }

  constructor(sm){
        this.signClient = undefined;
        this.system_topics = {};
        this.serviceManager = sm;
  }
    
  // First you have to initialize, and set up lisenting for WC Events. None will come through, but get ready!
  async listen(config){
    this.signClient = await SignClient.init(config);
      
      this.signClient.on("session_request", async (event) => {
        let method = event.params.request['method'];
        let params = event.params.request['params'];
        let service= event.params.request['service'];
      
        let metadata = {};

        let resp = await this.queryForResponse(service,method,params,metadata);
        this.signClient.respond({
                              "topic": event.topic,
                              "response":{"id":event.id,
                                        "jsonrpc":"2.0",
                                        "result":resp}});
      });
      

      this.signClient.on("session_proposal", async (event) => {
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
        
        
        let accounts = await this.queryForResponse("starkex","get_public_key",{},{});
        if (accounts.length==0)
        {
          accounts = ['0x0000000000000000000000000000000000000000'];
          //let rejectionReason = "No accounts found in wallet";
          //await this.signClient.reject(event.id, rejectionReason);
          //return;            
        }
          
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
        
        /* This is a VERY useful template to have for debugging reasons. Delete close to production.
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

    async pair(auth_code)
    {
      let step1 = await this.signClient.core.pairing.pair({ uri: auth_code })
      let step2 =await this.signClient.core.pairing.activate({ topic: step1.topic })      
      const pairings = this.signClient.core.pairing.getPairings()
    }
}

module.exports = WCDriver;