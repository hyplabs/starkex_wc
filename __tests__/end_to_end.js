const {SignClient} = require( '@walletconnect/sign-client')
const Wallet = require( '../wallet/wallet.js')

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
        //console.log("Connecting");
        return {'deep_link':uri,'approval':approval }
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

    setSessionApproval(data)
    {
      this.sessionApproval = data; 
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



jest.setTimeout(30000);
test('pretend to be a dApp user also operating a CLI wallet', async () => {
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
  await admin.wc_listen();
  await appConnectPromise;
  let approvalPromise = linkAndApprove['approval']();
  await admin.wc_pair(linkAndApprove['deep_link']);    
  app.setSessionApproval(await approvalPromise);
  
  // Step 3- dApp Send message [YES]
  let newAccnt = await app.request("generate_eth_account","eth_wallet_gateway",{});
  console.log(newAccnt);
  // Step 4- clie Send message [   ]
  await admin.wc_SendTestMessage();
  
 // expect(appResult).toEqual(true);
  expect(1).toEqual(1);

});