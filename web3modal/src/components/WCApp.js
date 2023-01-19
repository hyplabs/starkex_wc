const { SignClient } = require( "@walletconnect/sign-client");
class WCApp{
    constructor()
    {
        this.signClient = undefined; 
        this.sessionApproval = undefined;
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
        console.log ("APP SESSION REQUEST");
        console.log(event);
        this.signClient.respond({
                              "topic": event.topic,
                              "response":{"id":event.id,
                                        "jsonrpc":"2.0",
                                        "result":{'test_message':'hey from APP'}}});
    
      });
    }

    async request(method,service,params){
      const result = await this.signClient.request({
        topic: this.sessionApproval.topic,
        chainId: "eip155:1",
        request: {
          id: 1,
          jsonrpc: "2.0",
          method: method,
          service: service,
          params: params,
        },
      });

      //console.log("SIGN RESP")
      ///console.log(result);      
      //console.log("Dapp sent message");
      return result;
    }



}

module.exports = WCApp;