class UnitTestCLIDriver{
    constructor(sm,responder)
    {
      this.serviceManager = sm;
      if (responder==undefined)
      {
        console.log("ASSIGNING DEFAULT HANDLER");
        this.serviceManager.registerAdminHandler(this.testAdminResponder.bind(this));          
      }
      else
      {      
        console.log("CUSTOM HANDLER");
        this.serviceManager.registerAdminHandler(responder.bind(this));          
      }
    }

    testAdminResponder(event){
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
      event.func_resolve(resp);
    }

  }
  module.exports = UnitTestCLIDriver;
  module.exports.UnitTestCLIDriver = UnitTestCLIDriver;