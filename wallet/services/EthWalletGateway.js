const ethers = require('ethers');
const {IService} = require('./ServiceManager.js');
const crypto = require('crypto');
const BIP39 = require('bip39');
const ethUtil = require('ethereumjs-util');

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
    constructor(serviceManager) {
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
        // metadata -- unused
        let privateKey = args["privateKey"];
        let to = args["to"];
        let value = args["value"];
        let gasPrice = args["gasPrice"];
        let gasLimit = args["gasLimit"];
        let nonce = args["nonce"];
        let chainId = args["chainId"];
        let data = args["data"];
    
        let wallet = new ethers.Wallet(privateKey);
        let rawTransaction = {
            nonce: ethers.utils.bigNumberify(nonce),
            gasPrice: ethers.utils.bigNumberify(gasPrice),
            gasLimit: ethers.utils.bigNumberify(gasLimit),
            to: to,
            value: ethers.utils.bigNumberify(value),
            data: data,
            chainId: ethers.utils.bigNumberify(chainId)
        };
        let signedTransaction = await wallet.sign(rawTransaction);
        return signedTransaction;
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