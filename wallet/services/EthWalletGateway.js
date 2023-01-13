const ethers = require('ethers');
const {IService} = require('./ServiceManager.js');
const crypto = require('crypto');
const BIP39 = require('bip39');
const ethUtil = require('ethereumjs-util');

//const hdkey = require('hdkey');
//const EC = require('elliptic').ec;
//const util = require('util');
//function sha256(string) {
//  return crypto.createHash('sha256').update(string).digest('hex');
//}

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
} 
module.exports = EthWalletGateway;

/*
class EthWalletGateway {
    constructor() {
    }
    setWallet(privateKey,network,projectId){
        this.provider = provider;
        let provider = new ethers.providers.InfuraProvider(network,projectId);
        this.wallet = new ethers.Wallet(privateKey,provider);
    }

    async createNewKeyPair() {
        const wallet = ethers.Wallet.createRandom();
        return {
            publicKey: wallet.address,
            privateKey: wallet.privateKey
        };
    }

    async signTransaction(transaction) {
        const signedTransaction = await this.wallet.sign(transaction);
        return signedTransaction;
    }

    async sendTransaction(signedTransaction) {
        const transaction = await this.provider.sendTransaction(signedTransaction);
        return transaction.hash;
    }

    async getTransaction(transactionHash) {
        const transaction = await this.provider.getTransaction(transactionHash);
        return transaction;
    }

    async handle(params) {
        if (!params.functionName) {
            throw new Error('params.functionName must be provided');
        }

        switch (params.functionName) {
            case 'getBalance':
                return await this.getBalance(params.address);
            case 'getTransactionReceipt':
                return await this.getTransactionReceipt(params.transactionHash);
            case 'deployContract':
                return await this.deployContract(params.contractBytecode, params.args);
            case 'callContract':
                return await this.callContract(params.contractAddress, params.contractABI, params.functionName, params.args);
            case 'estimateGas':
                return await this.estimateGas(params.transaction);
            // ... more cases for other functions here ...
            default:
                throw new Error(`Unrecognized functionName: ${params.functionName}`);
        }
    }
    
}
*/