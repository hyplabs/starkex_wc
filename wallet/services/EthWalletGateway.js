const ethers = require('ethers');
const {IService} = require('./ServiceManager.js');


/**
 * IService Interface (class)
 * Simply cut and paste IService into ./services, and customize, to add a new service into the ServiceManager
 */
class EthWalletGateway extends IService {
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
        return "iservice"
    }

    /**
     * Run a command, and return some result after.
     * @param {Object} args Arguments intended for your command
     * @param {Object} metadata associated with your command (command, service, role)
     * @return {Object}
     */        
    run(args,metadata){
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
            "admin": {"hello_world":this.run.bind(this), 
                     "echo_args":this.run.bind(this), 
                     "set_hello":this.run.bind(this)},
            "user" : {"echo_args":this.run.bind(this), 
                    "hello_world":this.run.bind(this)}
        };
    }  
    
    generate_eth_account() {
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
      
    derive_account_from_private_key(private_key_hex){
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
///////////////////////////////////

const crypto = require('crypto');
function sha256(string) {
  return crypto.createHash('sha256').update(string).digest('hex');
}
const BIP39 = require('bip39');
const hdkey = require('hdkey');
const EC = require('elliptic').ec;
const ethUtil = require('ethereumjs-util');
const util = require('util');

async function generate_account() {
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
    console.log("FINISHED KEYGEN");
}
  
async function derive_account_from_private_key(private_key_hex){
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


module.exports = {
    generate_account: generate_account,
    derive_account_from_private_key:derive_account_from_private_key
};




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
