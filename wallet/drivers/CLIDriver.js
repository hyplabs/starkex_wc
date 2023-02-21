const readline = require('readline');

class CLIDriver{
    constructor(sm,approvalMethod,wcDriver)
    {
        this.system_topics = {};
        this.wcDriver = wcDriver;
        this.serviceManager = sm;
        if (approvalMethod=="cli")
        {
            console.log("ADMIN HANDLER ACTIVATED");
            this.serviceManager.registerAdminHandler(this.adminResponder.bind(this));          
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            this.rl.on('line', this.handleReadline);
            this.currentAccount = {};
            this.approvals = [];
            this.g_autoApprove = false;
        }
        else
        {      
            console.log("DEFAULT HANDLER ACTIVATED");
            this.serviceManager.registerAdminHandler(this.testAdminResponder.bind(this));          
        }
        
        
    }
    
    testAdminResponder(event){
      if (event.command == "system_approve_paired_accounts")
      {
        event.func_resolve(["0xbe1E971E8e5E50F7698C74656520F0E788a0518D","0x3c582121909DE92Dc89A36898633C1aE4790382b"]);
        return;
      }
      let resp = this.serviceManager.run(
              event.service, 
              event.role, 
              event.command,
              event.args);
      event.func_resolve(resp);
    }
    
    async handleReadline(input){
        const words = input.split(' ');
        const command = words[0];
        const args = words.slice(1); 
        if (command === 'echo') {
            console.log(`Echoing: ${args.join(' ')}`);

        } else if (command === 'auto_approve') {
            this.g_autoApprove = true;
            console.log("\nSystem will now approve all requests");

        } else if (command === 'list') {
            console.log(this.system_topics);

        } else if (command === 'approve') {
            console.log("approving.. ");
            this.adminApproveAll();
        } else if (command === 'reject') {
            console.log("rejecting.. ");
            this.adminRejectAll();
        } else if (command === 'auth') {
            console.log("Pairing.. "+args[0]);
            this.wcDriver.pair(args[0]);
        } else {
            console.log(`Unknown command: ${command}`);
        }
    
    }
    
    async listen (){
        if (this.rl) 
            this.rl.prompt();
    }

    async adminApproveAll(){
      console.log(JSON.stringify(approvals));
      this.approvals.forEach((event)=>{
        this.adminResponder(event);
      });
      this.approvals = [];
    }

    async adminRejectAll(){
      this.approvals.forEach((event)=>{
        event.func_reject({'error':"rejected by wallet user"});
      });
      this.approvals = [];
    }
    
    async adminResponder(event){
      if (event.command == "system_approve_paired_accounts")
      {
        event.func_resolve(["0x"+currentAccount['address']]);
        return;
      }

      if (event.command == "system_get_account_data")
      {
        retVal = {}
        retVal['address'] = currentAccount['address'];
        retVal['publicKey'] = currentAccount['publicKey'];
        event.func_resolve(retVal);
        return;
      }

      let resp = this.serviceManager.run( event.service, event.role, event.command,event.args);
      event.func_resolve(resp);
    }
}
module.exports = CLIDriver;
module.exports.CLIDriver = CLIDriver;