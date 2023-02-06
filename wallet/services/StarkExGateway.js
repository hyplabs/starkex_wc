const {IService} = require('./ServiceManager.js');
const StarkExAPI = require('@starkware-industries/starkex-js');
const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const crypto = require('crypto');

/**
 * StarkExWalletGateway: IService
 * An implementation of a wallet + gateway combination. Partial implementation meant to be instuctive in nature.
 */
class StarkExGateway /* implements IService */ {
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,uri) {
        this.settings = {}
        this.serviceManager = serviceManager;
        this.starkExUri = undefined;
        if (uri)
            this.starkExUri = uri;

        this.sendTransactionFuncs= {
            "DepositRequest": 'deposit',
            "WithdrawalRequest": 'withdrawal',
            "SettlementRequest": 'settlement',
            "TransferRequest": 'transfer',
            "ConditionalTransferRequest": 'conditionalTransfer',
            "MultiTransactionRequest": 'multiTransaction',
        };       
    }


    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        return "starkexgate"
    } 

    /**
     * Run a dynamic command, and return some result after. This method looks at the registered bound functions,
     * and routes the function calls to those modules. This is better than copying and pasting several methods
     * one by one into this interface. This method unpacks the arguments, and places them into an orderd arrangement.
     * @param {Object} args named dict of arguments intended for your command
     * @param {Object} metadata associated with your command (command, service, role)
     * @return {Object}
     */   
    /**
     * Return a dictionary that defines all methods, and roles that can access that method
     * @return {Object}
     */    
    methodRoles(){
        let roles = {
            "admin": { },
            "user" : {
                "generate_request_hash":this.generate_request_hash.bind(this),
                "getTransaction":this.getTransaction.bind(this),
                "sendTransaction":this.sendTransaction.bind(this),
                "getFirstUnusedTxId":this.getFirstUnusedTxId.bind(this),
                "getTransaction":this.getTransaction.bind(this),
            }
        }; 
        return roles;
    }

    async set_gateway(args,metadata) {
        if (args.providerUrl)
            this.settings.providerUrl = args.providerUrl;
        return true
    }
    
    async getTransaction(args,metadata) {
        let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
        return await starkExAPI.gateway.getTransaction(args.txId);
    }

    async getFirstUnusedTxId(args,metadata) {
        let val;
        try 
        {
            console.log("starkExAPI!!!!!!!!!!!!!!!!!!!");
            console.log(JSON.stringify(this.starkExAPI.gateway));
            console.log(JSON.stringify(this.starkExAPI.gateway.getFirstUnusedTxId));
            let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
            let val = await starkExAPI.gateway.getFirstUnusedTxId();
            console.log(val);
            return val;
        } 
        catch (e) 
        {
            console.log("error val")
            console.log(val)
            console.log(e)
            return val
            //return "1889";
        //    return {"error": `(b) ${e}, Could not access transaction id from this.starkExAPI.gateway.getFirstUnusedTxId`}; 
        }        
        
    }    


    async sendTransaction(args,metadata) {
        let txId;
        let response;
        try 
        {
            txId = await this.getFirstUnusedTxId({},{});
        } 
        catch (e) 
        {
            return {"error": `${e}, Could not access transaction id from this.starkExAPI.gateway.getFirstUnusedTxId`}; 
        }
        
        if (!args.type || !Object.keys(this.sendTransactionFuncs).includes(args.type))
            return {"error":`Could not find type ${args.type} in sendTransactionFuncs.`}

        try 
        {
            let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
            let val = await starkExAPI.gateway.getFirstUnusedTxId();
            Object.assign(args, {txId});
            const methodName = this.sendTransactionFuncs[args.type];
            //delete args[args.type]; 
            response = await starkExAPI.gateway[methodName](args);
        } catch (e) {
            return {"error":`Could not send transaction ${JSON.stringify(args)} ${JSON.stringify(e)} `}
        }
        return response;
    }

} 
module.exports = StarkExGateway;