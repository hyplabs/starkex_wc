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
    
  async queryForResponse(method,params,metadata){
    let resp = await this.serviceManager.request("eth_wallet_gateway", "admin", "generate_eth_account",{});
    console.log ("SESSION REQUEST (A.2)");
    console.log(resp);
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
        //optional parameters
        relayUrl: "wss://relay.walletconnect.com",
        metadata: {
          name: "Wallet name",
          description: "A short description for your wallet",
          url: "#",
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
        },
      });
      
      this.signClient.on("session_request", async (event) => {
        console.log ("SESSION REQUEST (X)");
        console.log(event);
        let method = event['method'];
        let params = event['params'];
        let metadata = {};

        console.log ("waiting...");
        let resp = await this.queryForResponse(method,params,metadata);
        console.log ("done...");
        this.signClient.respond({
                              "topic": event.topic,
                              "response":{"id":event.id,
                                        "jsonrpc":"2.0",
                                        "result":resp}});
      });
      


      this.signClient.on("session_proposal", async (event) => {
        console.log("Session Event");
        console.log(inspect(event, { depth: null, colors: true }));
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
        let vals   =  await this.signClient.approve(apprv);
        console.log("Session Event Ack");
        console.log(vals.acknowledged);
        console.log("Session Event Topic");
        console.log(vals.topic);
        this.system_topics[vals.topic] =  event;

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

class CLIDriver{
  constructor(sm)
  {
    this.serviceManager = sm;
    this.serviceManager.registerAdminHandler(this.testAdminResponder.bind(this));          
  }

  testAdminResponder(event){
    // TODO, will need to resolve requests here with the "answer"
    /**
    {
      id: '167380080693177',
      service: 'eth_wallet_gateway',
      role: 'admin',
      command: 'generate_eth_account',
      args: {},
      func_reject: [Function (anonymous)],
      func_resolve: [Function (anonymous)],
      promise_response: Promise { <pending> }
    }
     * 
     */
    console.log("GOT ADMIN REQUEST<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(event);
    console.log(event.service);
    console.log(event.role);
    console.log(event.command);
    console.log(event.args);
    console.log("GOT ADMIN REQUEST 2<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(this.serviceManager);
    console.log(this.serviceManager.run);
    console.log("GOT ADMIN REQUEST 3<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

    let resp = this.serviceManager.run(
            event.service, 
            event.role, 
            event.command,
            event.args);
    console.log("RESOLVING ADMIN REQUEST<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    console.log(resp);
    event.func_resolve(resp);
  }

}

/**
 * Wallet (class)
 * A general example wallet that can be used to approve WalletConnect commands on your local CLI
 * The Wallet implements the Facade pattern, and is internally decoposed as follows:
 * - Wallet (<Composition> of Drivers)
 * --- Driver: CLI - work with admin user
 * --- Driver: WC - work with wallet connect (dApp) user
 *
 * - Service Manager (<Facade> to Services) - Route requests from Drivers to Services
 * --- Service: IService - Generic and empty service
 * --- Service: EthWalletGateway - Create an ETH user
 * 
 */
// TODO push to more general location

class Wallet{
  constructor(){
    this.interfaces = {}
    const EthWalletGateway = require('../services/EthWalletGateway.js');
    this.serviceManager = new ServiceManager();
    this.serviceManager.registerService(new EthWalletGateway());
    this.interfaces['cli'] = new CLIDriver(this.serviceManager);
    this.interfaces['wc'] = new WCDriver(this.serviceManager);
    this.system_topics = {};

    this.doMethodBinding("cli",this.interfaces['cli']);
    this.doMethodBinding("wc",this.interfaces['wc']);
  }

  /**
   *  doMethodBinding
   *  Unrap the component instance and place methods into the parent class dynamically
   */
  doMethodBinding(prefix,sourceInstance){
    let prototype = Object.getPrototypeOf(sourceInstance);
    let methods = Object.getOwnPropertyNames(prototype);
    methods.forEach(method => {
        if(typeof prototype[method] === "function" && method != "constructor" ){
           //console.log(prefix+"_"+method + " bound");
            Object.defineProperty(Wallet.prototype, prefix+"_"+method, {
                get: function() {
                    return prototype[method].bind(sourceInstance);
                }
            });
        }
    });

  }
  
}



module.exports = Wallet;