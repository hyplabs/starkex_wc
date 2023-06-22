const ethers = require( 'ethers');
const {IService} = require('./ServiceManager.js');
const BIP39 = require('bip39');
const ethUtil = require('ethereumjs-util');
const { BigNumber } = require( 'ethers');

/**
 * EthGateway: IService
 * An example implementation of a wallet + gateway combination. Partial implementation meant to be instuctive in nature.
 */
class EthGateway /* implements IService */ {
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,privateKey,providerUrl) {
        this.settings = {}
        this.settings.accounts = {}
        this.settings.selectedAccount = undefined
        this.serviceManager = serviceManager;
        if (providerUrl)
            this.set_gateway({'providerUrl':providerUrl},{})
    }
    
    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        return "ethgate"
    } 


    /**
     * Return a dictionary that defines all methods, and roles that can access that method
     * @return {Object}
     */    
    methodRoles(){
        return {
            "admin": {  
                        "sendTransaction":this.sendTransaction.bind(this),
                        "set_gateway":this.set_gateway.bind(this),
                     },
            "user" : {}
        };
    }  
    
    /**
     * Given a private key, derive other account details
     * @param {String} args.privateKey The private key
     * @param {String} args.providerUrl The URL of the Eth RPC proovider
     * @param {Object} metadata associated with your command (command, service, role). This makes it possible to constrain user types that can use this command.
     * @return {Object}
     */        
    async set_gateway(args,metadata) {
        if (args.providerUrl)
            this.settings.providerUrl = args.providerUrl;
        return true
    }

    /**
     * Given a private key, derive other account details
     * @param {String} args.privateKey The private key
     * @param {String} args.providerUrl The URL of the Eth RPC proovider
     * @param {Object} metadata associated with your command (command, service, role). This makes it possible to constrain user types that can use this command.
     * @return {Object}
     */        
    async sendTransaction(args,metadata) {
        let signedTransaction = args["hex"];
        if (this.settings.providerUrl == undefined)
        {
            return {"error":"There is no provider attached to the ETH wallet. Please use set_admin_account({'providerUrl':URL}) to set one up."}
        }
        try {
            let provider = new ethers.providers.JsonRpcProvider(this.settings.providerUrl);
            let transaction = await provider.sendTransaction(signedTransaction);
            let transactionId = transaction.hash;
            return { transaction};
        } catch (error) {
            return {"error": error.message};
        }
    }
} 

module.exports = EthGateway;