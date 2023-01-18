class UnitTestCLIDriver{
    constructor(sm)
    {
      this.serviceManager = sm;
      this.serviceManager.registerAdminHandler(this.testAdminResponder.bind(this));          
    }
  
    testAdminResponder(event){
      /**{
        id: '167380080693177',
        service: 'eth_wallet_gateway',
        role: 'admin',
        command: 'generate_eth_account',
        args: {},
        func_reject: [Function (anonymous)],
        func_resolve: [Function (anonymous)],
        promise_response: Promise { <pending> }
      } */
      // console.log("Test CLI Auto Approving:-------------------------------");
      // console.log(event);
      if (event.command == "system_approve_paired_accounts")
      {
        event.func_resolve(["0xbe1E971E8e5E50F7698C74656520F0E788a0518D",
                            "0x3c582121909DE92Dc89A36898633C1aE4790382b"]);
        return;
      }


      let resp = this.serviceManager.run(
              event.service, 
              event.role, 
              event.command,
              event.args);
      //console.log("RESOLVING ADMIN REQUEST<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
      //console.log(resp);
      event.func_resolve(resp);
    }
  
  }
  module.exports = UnitTestCLIDriver;
  module.exports.UnitTestCLIDriver = UnitTestCLIDriver;