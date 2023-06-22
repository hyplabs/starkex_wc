const {IService} = require('./ServiceManager.js');
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
        
        this.loadRegistry(remote_url).then((reg)=>{this.registry =reg;});        
    }

    /**
     * load the hash function registry
     * @param {string} remote_url to search for the registry 
     * @return {string}
     */        
      async loadRegistry(remote_url) {
        let path = 'registry.json';
        let jsonString = '';
        if (typeof process !== 'undefined' && process.release && process.release.name === 'node' && typeof module !== 'undefined' && module.exports) {

          try {
              const fs = require('fs');
              const pathModule = require('path');
              const parentDir = pathModule.join(__dirname, '../../wallet/');
              path = pathModule.join(parentDir, path);
            jsonString = fs.readFileSync(path, { encoding: 'utf-8' });
          } catch (err) {
            throw new Error(`Failed to read JSON file from ${path}: ${err.message}`);
          }
          /////
          try {
              const data = JSON.parse(jsonString);
              return data;
          } catch (err) {
              throw new Error(`Failed to parse JSON file: ${err.message}`);
          }
            return undefined;
        }          
          
        if (remote_url) {
          const response = await fetch(remote_url);
          if (response.ok) {
            jsonString = await response.text();
          } else {
            throw new Error(`Failed to load JSON file from ${remote_url}: ${response.status} ${response.statusText}`);
          }
        } else {
          const response = await fetch(path);
          if (response.ok) {
            jsonString = await response.text();
          } else {
            throw new Error(`Failed to load JSON file from ${path}: ${response.status} ${response.statusText}`);
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
                "sendTransaction":this.sendTransaction.bind(this),
                "set_gateway":this.set_gateway.bind(this),
                "getFirstUnusedTxId":this.getFirstUnusedTxId.bind(this),
            
            },
            "user" : {
                "sendTransaction":this.sendTransaction.bind(this),
                "set_gateway":this.set_gateway.bind(this),
                "getFirstUnusedTxId":this.getFirstUnusedTxId.bind(this),
            }
        }; 
        return roles;
    }

    async set_gateway(args,metadata) {
        if (args.providerUrl && args.getFirstUnusedTxIdUrl)
        {
            this.settings.providerUrl = args.providerUrl;
            this.settings.getFirstUnusedTxIdUrl = args.getFirstUnusedTxIdUrl;
            return true;
        }
        return false;
    }

    async getFirstUnusedTxId(args,metadata) {
        if( this.settings.providerUrl == undefined) 
            return {"error":"set_gateway() to a valid endpoint before submitting queries"};        
        if( this.settings.getFirstUnusedTxIdUrl == undefined) 
            return {"error":"set_gateway() to a valid getFirstUnusedTxIdUrl before submitting queries"};        
        let val;
        try 
        {
            let starkExAPI = new StarkExAPI({endpoint: this.settings.providerUrl});            
            let val = await starkExAPI.gateway.get(this.settings.getFirstUnusedTxIdUrl);
            return val;
        } 
        catch (e) 
        {
            return val
        }        
        
    }    

    async sendTransaction(args,metadata) {
        let txId;
        let response;
        if( this.settings.providerUrl == undefined) 
            return {"error":"set_gateway() to a valid endpoint before submitting queries"};        
        
        try 
        {
            txId = await this.getFirstUnusedTxId({},{});
            if (args.tx_add)
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
            
            let starkExAPI = new StarkExAPI({endpoint: this.settings.providerUrl});            
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
            let asTransaction = true;
            response = await starkExAPI.gateway.post(subArgs,methodName,asTransaction);
        } catch (e) {
            return {"error":`Could not send transaction ${JSON.stringify(subArgs)} with ${methodName} ${e.message}. Stack trace: ${e.stack} `}
        }
        return response;
    }

} 
module.exports = StarkExGateway;