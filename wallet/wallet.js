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
    // Disabled - const StarkExGateway = require('./services/StarkExGateway.js');
    // Disabled - this.serviceManager.registerService(new StarkExGateway(this.serviceManager,settings.starkProviderUrl));
   this.interfaces = {}
   this.walletWCConfig = settings.walletWCConfig;
      
    this.serviceManager = new ServiceManager();
    const ServiceManager = require('./services/ServiceManager.js');
      
    const StarkExWallet = require('./services/StarkExWallet.js');
    this.serviceManager.registerService(new StarkExWallet(this.serviceManager));
 
    const CLIDriver = require('./drivers/CLIDriver.js');
    this.interfaces['cli'] = new CLIDriver(this.serviceManager,settings.approvalMethod);
    
    const WCDriver = require('./drivers/WCDriver.js');
    this.interfaces['wc'] = new WCDriver(this.serviceManager);
  }
    
  async run(){
    await this.interfaces['wc'].listen(walletWCConfig);       
    await this.interfaces['cli'].listen();       
  }
}
module.exports = Wallet;