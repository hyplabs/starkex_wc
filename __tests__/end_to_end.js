const {SignClient} = require( '@walletconnect/sign-client')
const WCDriver = require( '../wallet/drivers/WCDriver.js')

class WCAppConnection{
    constructor()
    {
        this.signClient = undefined; 
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

    processCommand (arg)
    {
        console.log(arg);
        return true
    }
}



jest.setTimeout(30000);
test('pretend to be a dApp user also operating a CLI wallet', async () => {
    let cli = new WCDriver()
    jest.setTimeout(30000);



    let app = new WCAppConnection()
    /// TODO, Finish from Here
    let cmdResult = cli.sayHello();
    let cmdSetup = await cli.listen();
    let linkAndApprove = await app.doConnect();
    console.log("The link" + linkAndApprove['deep_link']);
    let approvalPromise = linkAndApprove['approval']();
    await cli.pair(linkAndApprove['deep_link']);    
    await approvalPromise;
    console.log("waiting.......")
    console.log("Connected!!!!")
    

    expect(cmdResult).toEqual(true);
    
    let appResult = app.processCommand("test");
    expect(appResult).toEqual(true);
    // A
    // 1) dApp inits connection
    // 2) Wallet accepts

    // 3) dApp sends a message for signing
    // 4) Wallet accepts
    
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

