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
 * 
 */
class Wallet
{ 
  constructor(settings){
   this.interfaces = {}
   this.walletWCConfig = settings.walletWCConfig;
      
    const ServiceManager = require('./services/ServiceManager.js');
    this.serviceManager = new ServiceManager();
      
    const StarkWallet = require('./services/StarkWallet.js');
    this.serviceManager.registerService(new StarkWallet(this.serviceManager));
 
    const WCDriver = require('./drivers/WCDriver.js');
    this.interfaces['wc'] = new WCDriver(this.serviceManager);
    
    const CLIDriver = require('./drivers/CLIDriver.js');
    this.interfaces['cli'] = new CLIDriver(this.serviceManager,settings.approvalMethod,this.interfaces['wc']);
    
  }
  
  async admin_command(command_text){
      this.interfaces['cli'].handleReadline(command_text);
  }
  async listen(){
    await this.interfaces['wc'].listen(this.walletWCConfig);       
    await this.interfaces['cli'].listen();       
  }
}
module.exports = Wallet;