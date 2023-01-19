
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
// TODO push to more general location

class Wallet{
  constructor(){
    this.interfaces = {}
    const ServiceManager = require('./services/ServiceManager.js');
    const EthWalletGateway = require('./services/EthWalletGateway.js');
    this.serviceManager = new ServiceManager();
    this.serviceManager.registerService(new EthWalletGateway());
    this.system_topics = {};

    const CLIDriver = require('./drivers/CLIDriver.js');
    this.interfaces['cli'] = new CLIDriver(this.serviceManager);
    this.doMethodBinding("cli",this.interfaces['cli']);
    
    const WCDriver = require('./drivers/WCDriver.js');
    this.interfaces['wc'] = new WCDriver(this.serviceManager);
    this.doMethodBinding("wc",this.interfaces['wc']);
  }

  /**
   *  doMethodBinding
   *  Unrap the component instance and place driver methods into the parent class dynamically
   */
  doMethodBinding(prefix,sourceInstance){
    let prototype = Object.getPrototypeOf(sourceInstance);
    let methods = Object.getOwnPropertyNames(prototype);
    methods.forEach(method => {
        if(typeof prototype[method] === "function" && method != "constructor" ){
           //console.log(prefix+"_"+method + " bound");
            Object.defineProperty(Wallet.prototype, prefix+"_"+method, {
                get: function() {
                    return prototype[method].bind(sourceInstance);
                }
            });
        }
    });
  }
}

module.exports = Wallet;