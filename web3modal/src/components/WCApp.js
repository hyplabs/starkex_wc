const { SignClient } = require( "@walletconnect/sign-client");
const EthGateway = require('../services/EthGateway.js');
const EthWallet = require('../services/EthWallet.js');
const ServiceManager = require('../services/ServiceManager.js');


class WCApp{
    constructor(settings)
    {
        this.signClient = undefined; 
        this.sessionApproval = undefined;
        settings = {};
        this.serviceManager = new ServiceManager();
        let success = false;
        success = this.serviceManager.registerService(new EthGateway(this.serviceManager,settings.ethProviderUrl));
        if (success == false)
            throw new Error('!Could not add EthGateway'); 
        success =this.serviceManager.registerService(new EthWallet(this.serviceManager,settings.ethPrivateKey));    
        if (success == false)
            throw new Error('!Could not add EthWallet'); 
    }

    async doConnect(namespaces,projectId){
        if (this.signClient == undefined)
            this.signClient = await SignClient.init({ projectId })
        const { uri, approval } = await this.signClient.connect({ requiredNamespaces: namespaces });

        let approvalPromise = approval();
        approvalPromise.then((sessionVal)=>{
          this.sessionApproval = sessionVal; 
        });
        return {'deep_link':uri,'approval':approvalPromise }
    }

    async listen(){
      this.signClient.on("session_request", (event) => {
        this.signClient.respond({
                              "topic": event.topic,
                              "response":{"id":event.id,
                                        "jsonrpc":"2.0",
                                        "result":{'test_message':'hey from APP'}}});
    
      });
    }
    
    /**
     * request(method,service,params)
     * Via the WalletConnect RPC  tunnel, request a function call from a wallet.
     * @param {Object} method the name of the method to be invoked 
     * @param {Object} service the service in the wallet that contains the method
     * @param {Object} params any relevant parameters
     * @return {Object}
     */ 
    async request(method,service,params){
      if(this.sessionApproval == undefined)
          return {"error":"no Session established"}
      let packet ={
        topic: this.sessionApproval.topic,
        chainId: "eip155:1",
        request: {
          id: 1,
          jsonrpc: "2.0",
          method: method,
          service: service,
          params: params,
        },
      }; 
      console.log("signClient.request");
      console.log(this.signClient.request);
      const result = await this.signClient.request(packet);

      return result;
    }

    /**
     * run(method,service,params)
     * Locally, in the current set of dApp services, run some kind of method.
     * @param {Object} method the name of the method to be invoked 
     * @param {Object} service the service in the wallet that contains the method
     * @param {Object} params any relevant parameters
     * @return {Object}
     */ 
    async run(method,service,params){        
        return this.serviceManager.run(service,"admin",method,params)
    }    

} 
module.exports = WCApp;