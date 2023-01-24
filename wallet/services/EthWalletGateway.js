const ethers = require('ethers');
const {IService} = require('./ServiceManager.js');
const crypto = require('crypto');
const BIP39 = require('bip39');
const ethUtil = require('ethereumjs-util');
const { BigNumber } = require('ethers');

/**
 * EthWalletGateway: IService
 * An example implementation of a wallet + gateway combination. Partial implementation meant to be instuctive in nature.
 */
class EthWalletGateway /* implements IService */ {
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,privateKey,providerUrl) {
        this.setting = {}
        this.setting.privateKey = privateKey;
        this.setting.privateKey = providerUrl;
        this.serviceManager = serviceManager;
    }
    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        return "eth_wallet_gateway"
    } 

    /**
     * Run a command, and return some result after.
     * @param {Object} args Arguments intended for your command
     * @param {Object} metadata associated with your command (command, service, role)
     * @return {Object}
     */        
    run(args,metadata){
        return {"error":"Likely not using service router in this simple example Wallet Service"}
        let event = {...metadata};
        //this.serviceManager.emit(this.serviceName(), metadata); // emit an event
        return this[metadata['command']](args);
    }

    /**
     * Return a dictionary that defines all methods, and roles that can access that method
     * @return {Object}
     */    
    methodRoles(){
        return {
            "admin": {"generate_eth_account":this.generate_eth_account.bind(this),
                        "derive_account_from_private_key":this.derive_account_from_private_key.bind(this),
                        "signTransaction":this.signTransaction.bind(this),
                        "sendSignedTransaction":this.sendSignedTransaction.bind(this),
                        "getTransactionStatus":this.getTransactionStatus.bind(this)
                     },
            "user" : {}
        };
    }  
    
    async generate_eth_account(args,metadata) {
        // args -- unused
        // metadata -- unused
        const mnemonic = BIP39.generateMnemonic();
        let buf = await BIP39.mnemonicToSeed(mnemonic);    
        const privateKey = ethUtil.keccak(buf);
        const publicKey = ethUtil.privateToPublic(privateKey);
        const pubKeyHash = ethUtil.keccak(publicKey);    
        const address = ethUtil.publicToAddress(publicKey).toString('hex');
        
        return {
            mnemonic:mnemonic,
            address:address,
            publicKey:publicKey.toString('hex'),
            privateKey:privateKey.toString('hex')}
    }
      
    derive_account_from_private_key(args,metadata){
        // metadata -- unused        
        let private_key_hex = args["privateKey"];
        let accountData = {'privateKey':private_key_hex}
        const privateKeyBuffer = ethUtil.toBuffer("0x"+private_key_hex);
        const privateKey = privateKeyBuffer;      
        const publicKey = ethUtil.privateToPublic(privateKey);    
        const pubKeyHash = ethUtil.keccak(publicKey);
        const address = ethUtil.publicToAddress(publicKey).toString('hex');
        accountData.address= address; 
        accountData.publicKey= publicKey.toString('hex');
        return accountData
    }  

    async signTransaction(args,metadata) {

        if (chainId != 5)
            return {"error":"Only goerli is supported"} 
        if (args.privateKey == undefined && this.setting.privateKey == undefined )
            return {"error":"Require a eth privateKey argument"}
        const provider = new ethers.providers.JsonRpcProvider(self.setting.providerUrl);        
        let wallet = undefined;
        if (args.privateKey == undefined)
            wallet = new ethers.Wallet(this.setting.privateKey);
        else
            wallet = new ethers.Wallet(args.privateKey);

        let nonce = await provider.getTransactionCount(wallet.address);

        const transaction = {
            to: args['to'],
            value: ethers.utils.parseEther(args['value']),
            gasLimit: args['gasLimit'],
            maxPriorityFeePerGas: ethers.utils.parseUnits("5", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("20", "gwei"),
            nonce: nonce,
            type: args['type'],
            chainId: args['chainId'],
        };       

        const rawTransaction = await wallet.signTransaction(transaction);    
        return rawTransaction;
    }

    async sendSignedTransaction(args,metadata) {
        // metadata -- unused
        let signedTransaction = args["signedTransaction"];
    
        let provider = new ethers.providers.JsonRpcProvider();
        let transaction = await provider.sendTransaction(signedTransaction);
        let transactionId = transaction.hash;
        return transactionId;
    }
    
    async getTransactionStatus(args,metadata) {
        // metadata -- unused
        let transactionId = args["transactionId"];
    
        let provider = new ethers.providers.JsonRpcProvider();
        let transaction = await provider.getTransaction(transactionId);
        let status = transaction.blockNumber != null ? "confirmed" : "pending";
        return status;
    }

} 
module.exports = EthWalletGateway;