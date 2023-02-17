const {IService} = require('./ServiceManager.js');
const StarkExAPI = require('@starkware-industries/starkex-js');
const starkwareCrypto = require('@starkware-industries/starkware-crypto-utils');
const crypto = require('crypto');

/**
 * StarkExWallet: implements IService.js template
 * An implementation of a StarkExWallet. Can sign transactions. Meant to be instuctive in nature.
 */
class StarkExWallet /* implements IService */ { 
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,uri) {
        this.settings = {}
        this.serviceManager = serviceManager;
        this.starkExUri = uri;
        this.settings.accounts = {}
        this.settings.selectedAccount = undefined

        this.registry = {
            "TransferRequest": { //Tested
                "hashFunction": 'getTransferMsgHash',
                "args": [ 'amount', 'nonce', 'senderVaultId', 'token', 'receiverVaultId', 'receiverPublicKey', 'expirationTimestamp'], //'type'
            },
            "ConditionalTransferRequest": { //Tested
                "hashFunction": 'getTransferMsgHash',
                "args": ['amount', 'nonce', 'senderVaultId', 'token', 'receiverVaultId', 'receiverPublicKey', 'expirationTimestamp', 'receiverPublicKey'], //'type'
            },
            "OrderRequest": { //Tested
                "hashFunction": 'getLimitOrderMsgHash',
                "args": ['vaultIdSell', 'vaultIdBuy', 'amountSell', 'amountBuy', 'tokenSell', 'tokenBuy', 'nonce', 'expirationTimestamp'],
            },
            "LimitOrderWithFeesRequest": {
                "args": ['type', 'amountBuy', 'amountSell', 'feeLimit', 'feeToken', 'feeVaultId', 'nonce', 'expirationTimestamp', 'tokenBuy', 'tokenSell', 'vaultBuy', 'vaultSell'],
            },
            "TransferWithFeesRequest": {
                "args": ['type', 'amount', 'feeLimit', 'feeToken', 'feeVaultId', 'nonce', 'expirationTimestamp', 'receiverPublicKey', 'receiverVaultId', 'senderVaultId', 'token'],
            },
            "ConditionalTransferWithFeesRequest": {
                "args": ['type', 'amount', 'feeLimit', 'feeToken', 'feeVaultId', 'nonce', 'expirationTimestamp', 'receiverPublicKey', 'receiverVaultId', 'senderVaultId', 'token', 'condition'],
            },
            "MultiAssetOrderOffchainRequest": {
                "args": ['type', 'expirationTimestamp', 'give', 'nonce', 'receive'],
            },
            // Perpetual
            "PerpetualTransferRequest": {
                "args": ['type', 'assetId', 'assetIdFee', 'amount', 'maxAmountFee', 'nonce', 'receiverPublicKey', 'receiverPositionId', 'senderPositionId', 'srcFeePositionId', 'expirationTimestamp'],
            },
            "PerpetualConditionalTransferRequest": {
                "args": ['type', 'assetId', 'assetIdFee', 'amount', 'condition', 'maxAmountFee', 'nonce', 'receiverPublicKey', 'receiverPositionId', 'senderPositionId', 'srcFeePositionId', 'expirationTimestamp'],
            },

            "WithdrawalToAddressRequest": {
                "args": ['type', 'amount', 'assetIdCollateral', 'ethAddress', 'nonce', 'expirationTimestamp', 'positionId'],
            },
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
                        "generate_stark_account_from_public_key":this.generate_stark_account_from_public_key.bind(this),
                        "generate_stark_account_from_private_key":this.generate_stark_account_from_private_key.bind(this),
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
     * generate_stark_account_from_public_key
     * @param {Object} args - an object containing a "publicKey" field
     * @param {Object} metadata - empty
     * @return {Object} - the new stark account information or an error object
     */        
    async generate_stark_account_from_public_key(args,metadata){
        if (!args.publicKey)
        {
            return {"error":"you do not have a publicKey argument"}
        }
        // Request of the linked service that we want private account details
        // Since we are in an admin context, we can just run this.
        let ethAccount = await this.serviceManager.run("eth", "admin",  "expose_account", 
        {
          "publicKey": args.publicKey,
        });       
        if (ethAccount.error)
            return {"error":"got an error from the eth service looking up the publicKey :"+ethAccount.error}
        if (!ethAccount.privateKey)
            return {"error":"Internal error. Somehow do not have a private Key"}

        if (!ethAccount.publicKey)
            return {"error":"Internal error. Somehow do not have a public Key"}
        let starkAcc = this.generate_stark_account_from_private_key({"privateKey":ethAccount.privateKey},{})
        this.settings.accounts[starkAcc.starkKey] = starkAcc;
        return {"starkKey":starkAcc.starkKey}      
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
            return {"error":"you do not have a publicKey argument"}
        }
        let dat = {privateKey:args.privateKey}        
        const keyPair = starkwareCrypto.ec.keyFromPrivate(args.privateKey, "hex");
        const acc = starkwareCrypto.ec.keyFromPublic(keyPair.getPublic(true, "hex"), "hex");
        dat['account'] =  acc.pub.getX().toString("hex");
        dat['starkKey'] =  keyPair.getPublic(true, "hex");
        this.settings.accounts[dat.starkKey] = dat;
        return dat;
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
        } else if(request.feeInfo) {
            requestTemplate.args.push('feeInfo.token', 'feeInfo.sourceVaultId', 'feeInfo.feeLimit');

        } else if(request.feeToken) {
            requestTemplate.args.push('feeToken.token', 'feeToken.sourceVaultId', 'feeToken.feeLimit');
        }
        if (!requestTemplate.hashFunction) 
            return {"error":`Unsupported hashFunction type: ${requestType}.${requestTemplate.hashFunction}`}
        
        let anError = null;
        requestTemplate.args.forEach((param) =>{
            if(!Object.keys(request).includes(param))  
                anError = `Missing param for : ${requestType}.${requestTemplate.hashFunction}  ${param}`;
        });
        if (anError) return {"error":anError};
        let tonyStarkFunc = starkwareCrypto[requestTemplate.hashFunction];         
        msgHash = tonyStarkFunc(...requestTemplate.args.map(arg => request[arg]));
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
        if (!(args.hash))
            msgHash = this.generate_request_hash(args);
        else
            msgHash = args.hash;
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
module.exports = StarkExWallet;