const readline = require('readline');

class CLIDriver{
    constructor(sm,approvalMethod,wcDriver)
    {
        
        if (wcDriver == undefined)
          throw new Error(`(a) Did not pass a wallet connect driver which is required for auth`);
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
            this.rl.on('line', this.handleReadline.bind(this));
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
            if (this.wcDriver == undefined)
              throw new Error(`(b) Did not pass a wallet connect driver which is required for auth`);
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
      console.log(JSON.stringify(this.approvals));
      this.approvals.forEach((event)=>{
          let resp = this.serviceManager.run(event.service, 
                                             event.role, 
                                             event.command,
                                             event.args);
          event.func_resolve(resp);
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
      console.log("new event for approval, type approve");
      console.log("-----------");
      console.log(JSON.stringify(event,null,2));
      console.log("-----------");
      this.approvals.push(event);
        
    }
}
module.exports = CLIDriver;
module.exports.CLIDriver = CLIDriver;