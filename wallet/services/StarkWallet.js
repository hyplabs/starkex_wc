const {IService} = require('./ServiceManager.js');
const StarkExAPI = require('@starkware-industries/starkex-js');
const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const crypto = require('crypto');

/**
 * StarkWallet: implements IService.js template
 * An implementation of a StarkExWallet. Can sign transactions. Meant to be instuctive in nature.
 */
class StarkWallet /* implements IService */ { 
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,uri,remote_url) {
        this.settings = {}
        this.serviceManager = serviceManager;
        this.starkExUri = uri;
        this.settings.accounts = {}
        this.settings.selectedAccount = undefined
        this.settings.signedMessages = {}
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
        return "starkex"
    } 

    /**
     * Return a dictionary that defines all methods, and roles that can access that method
     * @return {Object}
     */    
    methodRoles(){
        let roles = {
            "admin": {  
                        "get_public_key":this.get_public_key.bind(this),
                        "sign_message":this.sign_message.bind(this),
                        "select_account":this.select_account.bind(this),
                        "get_selected_account":this.get_selected_account.bind(this),
                        "expose_account":this.expose_account.bind(this),                       "generate_stark_account_from_private_key":this.generate_stark_account_from_private_key.bind(this),
                        "get_key_material":this.get_key_material.bind(this),
                        "generate_request_hash":this.generate_request_hash.bind(this),
                        },
            "user" : {
            }
        }; 
        return roles;
    }

    /**
     * list_accounts
     * @param {Object} args - empty
     * @param {Object} metadata - empty
     * @return {Object} - a list of all account keys
     */             
    list_accounts(args,metadata) {
        return Object.keys(this.settings.accounts);    
    }      
    
    /**
     * select_account
     * @param {Object} args - an object containing a "starkKey" field
     * @param {Object} metadata - empty
     * @return {Object} - the starkKey of the selected account or an error object
     */           
    select_account(args,metadata) {
        if (Object.keys(this.settings.accounts).includes(args.starkKey))
        {
            this.settings.selectedAccount = this.settings.accounts[args.starkKey];
            return args.starkKey;
        }//
        return {"error":"could not find account associated with the starkKey supplied"}        
    }
    
    /**
     * get_selected_account
     * @param {Object} args - empty
     * @return {Object} - the starkKey of the selected account or an error object
     */           
    get_selected_account(args,metadata) {
        if (this.settings.selectedAccount= undefined)
            return {"error":" there is no account selected"}
        return this.settings.selectedAccount.starkKey;
    }
    
    /**
     * expose_account
     * @param {Object} args - an object containing a "starkKey" field
     * @param {Object} metadata - empty
     * @return {Object} - the starkKey of the selected account or an error object
     */           
    expose_account(args,metadata) {
        if (args.starkKey == undefined )
            return {"error":" there is no starkKey property"}
        if (Object.keys(this.settings.accounts).includes(args.starkKey))
            return this.settings.accounts[args.starkKey];
        return {"error":"could not find account associated with the starkKey supplied"}        
    }
    
    /**
     * generate_stark_account_from_private_key
     * @param {Object} args - an object containing a "privateKey" field
     * @param {Object} metadata - empty
     * @return {Object} - the new stark account information
     */        
    generate_stark_account_from_private_key(args,metadata) {
        if (!args.privateKey)
        {
            return {"error":"you do not have a ETH privateKey argument"}
        }
        let dat = {privateKey:args.privateKey}        
        const keyPair = starkwareCrypto.ec.keyFromPrivate(args.privateKey, "hex");
        const acc = starkwareCrypto.ec.keyFromPublic(keyPair.getPublic(true, "hex"), "hex");
        dat['account'] =  acc.pub.getX().toString("hex");
        dat['starkKey'] =  keyPair.getPublic(true, "hex");
        this.settings.accounts[dat.starkKey] = dat;
        let retDat = {...dat};
        delete retDat['privateKey']
        return retDat;
    }

    /**
     * get_public_key
     * @param {Object} args - empty
     * @param {Object} metadata - empty
     * @return {Object} - a list of all account keys
     */               
    async get_public_key(args,metadata) {
        return Object.keys(this.settings.accounts);   
    } 

    /**
     * generate_request_hash
     * @param {Object} request - an object containing the request fields
     * @param {Object} metadata - empty
     * @return {Object} - the hash of the request or an error object
     */        
    async generate_request_hash(request,metadata) {
        let msgHash;
        const requestType = request.type;
        if (!this.registry[requestType]) 
            return {"error":`Unsupported request type: ${requestType}`}

        let requestTemplate = this.registry[requestType]; 
        if (request.feeInfoUser) {
            requestTemplate.args.push('feeInfoUser.token', 'feeInfoUser.sourceVaultId', 'feeInfoUser.feeLimit');
            requestTemplate.hashArgs.push('feeInfoUser.token', 'feeInfoUser.sourceVaultId', 'feeInfoUser.feeLimit');
        } else if(request.feeInfo) {
            requestTemplate.args.push('feeInfo.token', 'feeInfo.sourceVaultId', 'feeInfo.feeLimit');
            requestTemplate.hashArgs.push('feeInfo.token', 'feeInfo.sourceVaultId', 'feeInfo.feeLimit');

        } else if(request.feeToken) {
            requestTemplate.args.push('feeToken.token', 'feeToken.sourceVaultId', 'feeToken.feeLimit');
            requestTemplate.hashArgs.push('feeToken.token', 'feeToken.sourceVaultId', 'feeToken.feeLimit');
        }
        if (!requestTemplate.hashFunction) 
            return {"error":`Unsupported hashFunction type: ${requestType}.${requestTemplate.hashFunction}`}
        
        let anError = null;
        requestTemplate.args.forEach((param) =>{
            if(!Object.keys(request).includes(param))  
                anError = `Missing param for : ${requestType}.${requestTemplate.hashFunction}  ${param}`;
        });
        if (anError) return {"error":anError};
        let hashFunc = starkwareCrypto[requestTemplate.hashFunction];         
        msgHash = hashFunc(...requestTemplate.hashArgs.map(arg => request[arg]));
        return msgHash.toString(16);
        //let msgHashRecover = parseInt(hexString, 16);
    }

    /**
     * sign_message
     * @param {Object} args - an object containing either a "hash" field or a request object
     * @param {Object} metadata - empty
     * @return {Object} - an object with the "r" and "s" signature fields
     */        
    async sign_message(args,metadata) {
        // /return {'error':"not finished"}
        let msgHash;
        if (!(args.systemId))
            return {"error":"systemId required"}
        if (!(args.hash))
        {
            let hashArgs = {...args}
            delete hashArgs['systemId']
            msgHash = this.generate_request_hash(args);
        }
        else
            msgHash = args.hash;
        
        // TODO, to developer, implement your own gatekeeping method using systemId to prevent replay attacks.
        let messageUid = args.systemId+msgHash.toString().slice(-12);
        if (Object.keys(this.settings.signedMessages).includes(messageUid))
            return {"error":"you have already signed this message during the current session"}
        this.settings.signedMessages[messageUid] = true;
        
        const keyPair = starkwareCrypto.ec.keyFromPrivate(this.settings.selectedAccount.starkKey, 'hex');
        let msgHashRecover = parseInt(msgHash, 16);

        const msgSignature = starkwareCrypto.sign(keyPair, msgHashRecover);
        return {r: '0x' + msgSignature.r.toString(16), s: '0x' + msgSignature.s.toString(16)};
    }


    /**
     * get_key_material
     * @param {Object} args - an object containing a "seed" field and an optional "number" field
     * @param {Object} metadata - empty
     * @return {Object} - an object with the "result" deterministic random number field
     */        
    async get_key_material(args, metadata) {
        let seed = args.seed || '';
        let number = args.number || 0;
        let seedNumber = seed + number.toString();
        let keyMaterial = crypto.createHmac('sha256', seedNumber)
            .update(Math.random().toString())
            .digest('hex');
        let deterministicRandomNumber = parseInt(keyMaterial.slice(0,8),16);
        return {
            "result": deterministicRandomNumber.toString(16)
         }
    }
} 
module.exports = StarkWallet;