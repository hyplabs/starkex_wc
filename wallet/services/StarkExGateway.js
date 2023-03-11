const {IService} = require('./ServiceManager.js');
//const StarkExAPI = require('@starkware-industries/starkex-js');
const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const crypto = require('crypto');
const StarkExAPI = require('./StarkExConnection.js');
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
    constructor(serviceManager,uri,remote_url) {
        this.settings = {}
        this.serviceManager = serviceManager;
        this.starkExUri = undefined;
        if (uri)
            this.starkExUri = uri;
        /*
        this.sendTransactionFuncs= {
            "DepositRequest": 'deposit',
            "WithdrawalRequest": 'withdrawal',
            "SettlementRequest": 'settlement',
            "TransferRequest": 'transfer',
            "ConditionalTransferRequest": 'conditionalTransfer',
            "MultiTransactionRequest": 'multiTransaction',
        };*/
        
        this.loadRegistry(remote_url).then((reg)=>{this.registry =reg;});        
    }

    /**
     * load the hash function registry
     * @param {string} remote_url to search for the registry 
     * @return {string}
     */        
    async loadRegistry(remote_url) {
      let path = 'wallet/registry.json'; // replace with your file path
      let jsonString = '';

      if (remote_url) {
        const response = await fetch(remote_url);
        if (response.ok) {
          jsonString = await response.text();
        } else {
          throw new Error(`Failed to load JSON file from ${remote_path}: ${response.status} ${response.statusText}`);
        }
      } else {
        // Check if running in a Node.js environment
        if (typeof module !== 'undefined' && module.exports) {
          const fs = require('fs');
          const pathModule = require('path');
          const parentDir = pathModule.join(__dirname, '../../');
          path = pathModule.join(parentDir, path);
          try {
            jsonString = fs.readFileSync(path, { encoding: 'utf-8' });
          } catch (err) {
            throw new Error(`Failed to read JSON file from ${path}: ${err.message}`);
          }
        } else {
          const response = await fetch(path);
          if (response.ok) {
            jsonString = await response.text();
          } else {
            throw new Error(`Failed to load JSON file from ${path}: ${response.status} ${response.statusText}`);
          }
        }
      }
        
      try {
        const data = JSON.parse(jsonString);
        return data;
      } catch (err) {
        throw new Error(`Failed to parse JSON file: ${err.message}`);
      }        
    }
    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        console.log("starkexgate----------------------------------------------------------------------");
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
            "admin": { 
                "getTransaction":this.getTransaction.bind(this),
                "sendTransaction":this.sendTransaction.bind(this),
                "set_gateway":this.set_gateway.bind(this),
                "getFirstUnusedTxId":this.getFirstUnusedTxId.bind(this),
                "getTransaction":this.getTransaction.bind(this),
            
            },
            "user" : {
                "getTransaction":this.getTransaction.bind(this),
                "sendTransaction":this.sendTransaction.bind(this),
                "set_gateway":this.set_gateway.bind(this),
                "getFirstUnusedTxId":this.getFirstUnusedTxId.bind(this),
                "getTransaction":this.getTransaction.bind(this),
            }
        }; 
        return roles;
    }

    async set_gateway(args,metadata) {
        if (args.providerUrl)
        {
            this.settings.providerUrl = args.providerUrl;
            return true;
        }
        return false;
    }
    
    async getTransaction(args,metadata) {
        let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
        return await starkExAPI.gateway.getTransaction(args.txId);
    }

    async getFirstUnusedTxId(args,metadata) {
        let val;
        try 
        {
            let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
            console.log("starkExAPI!!!!!!!!!!!!!!!!!!!");
            console.log(JSON.stringify(starkExAPI.gateway));
            console.log(JSON.stringify(starkExAPI.gateway.getFirstUnusedTxId));
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
        }        
        
    }    

    async sendTransaction(args,metadata) {
        let txId;
        let response;
        try 
        {
            txId = await this.getFirstUnusedTxId({},{});
            txId = txId + args.tx_add;
        } 
        catch (e) 
        {
            return {"error": `${e}, Could not access transaction id from this.starkExAPI.gateway.getFirstUnusedTxId`}; 
        }
        if (!this.registry)
            return {"error":`No Registry loaded.`}
        
        if (!args.type || !Object.keys(this.registry).includes(args.type))
            return {"error":`Could not find type ${args.type} in sendTransactionFuncs.`}
        if (!this.registry[args.type].gatewayFunction)
            return {"error":`Could not find type gatewayFunction in ${args.type}, within the registry.`}
        if (!this.registry[args.type].gatewayArgs)
            return {"error":`Could not find gatewayArguments for ${args.type} within the registry.`}
        let subArgs = {};
        let methodName = "unknown";
        try 
        {
            let starkExAPI = new StarkExAPI({endpoint: "https://gw.playground-v2.starkex.co"});            
            Object.assign(args, {txId});
            methodName = this.registry[args.type]['gatewayFunction'];
            
            let tempateArgs = [... this.registry[args.type].gatewayArgs];
            tempateArgs.push("feeInfoUser"); // Fee information support
            tempateArgs.push("feeInfo");
            tempateArgs.push("feeToken");
            tempateArgs.push("feeInfoExchange");
            
            subArgs = Object.fromEntries(
              Object.entries(args).filter(([key, value]) => tempateArgs.includes(key))
            );            
            console.log("SUBARGS----------------------------------------------------");
            console.log(methodName);
            console.log(subArgs);
            console.log(starkExAPI);
            console.log(starkExAPI.gateway);
            console.log("END----------------------------------------------------");
            response = await starkExAPI.gateway[methodName](subArgs);
            console.log(subArgs);
        } catch (e) {
            return {"error":`Could not send transaction ${JSON.stringify(subArgs)} with ${methodName} ${e.message}. Stack trace: ${e.stack} `}
        }
        return response;
    }

} 
module.exports = StarkExGateway;