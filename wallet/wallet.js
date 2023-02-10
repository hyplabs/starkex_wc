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
 * --- Service: EthWalletGateway - Create an ETH user
 * 
 */
class Wallet
{ 
  constructor(settings){
    this.interfaces = {}
    const ServiceManager = require('./services/ServiceManager.js');
    const StarkExWallet = require('./services/StarkExWallet.js');
    const StarkExGateway = require('./services/StarkExGateway.js');

    this.serviceManager = new ServiceManager();
    this.serviceManager.registerService(new StarkExGateway(this.serviceManager,settings.starkProviderUrl));
    this.serviceManager.registerService(new StarkExWallet(this.serviceManager,settings.starkPrivateKey));

    this.system_topics = {};

    const CLIDriver = require('./drivers/CLIDriver.js');
    this.interfaces['cli'] = new CLIDriver(this.serviceManager,settings.approvalMethod);
    this.doMethodBinding("cli",this.interfaces['cli']);
    
    const WCDriver = require('./drivers/WCDriver.js');
    this.interfaces['wc'] = new WCDriver(this.serviceManager);
    this.doMethodBinding("wc",this.interfaces['wc']);
  }

}
module.exports = Wallet;