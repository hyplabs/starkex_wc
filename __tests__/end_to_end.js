const {SignClient} = require( '@walletconnect/sign-client')
const Wallet = require( '../wallet/drivers/WCDriver.js')
      /*
      const myPromise = new Promise((resolve, reject) => {
          this.signClient.on("session_event", ({ event }) => {
            console.log("dApp session_event");
            console.log("-----------------");
            console.log(event);
            resolve("Hello, World!");
          });  
      });
      const prom = await myPromise;
      */

class WCRemoteWallet{
    constructor()
    {
        this.signClient = undefined; 
        this.sessionApproval = undefined;
    }

    async doConnect(){
        const projectId = 'b700887b888adad39517894fc9ab22e1'
        const namespaces = {
            eip155: { methods: ['personal_sign'], 
                      chains: ['eip155:1'], 
                      events: ['accountsChanged'] }
          }
        if (this.signClient == undefined)
            this.signClient = await SignClient.init({ projectId })
        const { uri, approval } = await this.signClient.connect({ requiredNamespaces: namespaces });
        console.log("Connecting");
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

    async dAppSendTestMessage(){

      const result = await this.signClient.request({
        topic: this.sessionApproval.topic,
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
      console.log("Dapp sent message");
    }


    processCommand (arg)
    {
        console.log(arg);
        return true
    }
}



jest.setTimeout(30000);
test('pretend to be a dApp user also operating a CLI wallet', async () => {
    let cli = new Wallet();
    jest.setTimeout(30000);

    let app = new WCRemoteWallet()
    /// TODO, Finish from Here
    let cmdResult = cli.wc_sayHello();
    
    // Step 1 - Listen
    let cmdSetup = await cli.wc_listen();
    let linkAndApprove = await app.doConnect();
    console.log("The link" + linkAndApprove['deep_link']);
    await app.listen();    
    // Step 2 - Paring
    let approvalPromise = linkAndApprove['approval']();
    await cli.wc_pair(linkAndApprove['deep_link']);    
    app.setSessionApproval(await approvalPromise);
    
    // Step 3- dApp Send message
    await app.dAppSendTestMessage();
    
    // Step 4- clie Send message
    await cli.wc_SendTestMessage();
    
    //expect(cmdResult).toEqual(true);
    
    let appResult = app.processCommand("test");
    expect(appResult).toEqual(true);

    
    // 3) dApp sends a message for signing
    // 4) Wallet rejects
    
    // 3) Wallet kills session
    // 4) dApp recieves termination message


});
/*
test('spawn a child thread', () => {
  // spawn the child thread
  const child = spawn('node', ['child.js']);

  // send data to the child thread
  child.stdin.write('hello from parent');

  // listen for data from the child thread
  child.stdout.on('data', (data) => {
    console.log(`child said: ${data}`);
  });

  // listen for the child thread to exit
  child.on('exit', (code) => {
    console.log(`child exited with code ${code}`);
  });

  // make sure to kill the child process when the test is done
  //afterAll(() => {
    child.kill();
  //});
});*/

