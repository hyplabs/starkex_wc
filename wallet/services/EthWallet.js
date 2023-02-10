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
class EthWallet /* implements IService */ {
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager,privateKey) {
        this.settings = {}
        this.settings.accounts = {}
        this.settings.selectedAccount = undefined
        this.serviceManager = serviceManager;
        if (privateKey)
            this.set_admin_account({'privateKey':privateKey},{})
    }
    
    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        return "eth"
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
            "admin": {
                        "generate_account":this.generate_account.bind(this),
                        "derive_account_from_private_key":this.derive_account_from_private_key.bind(this),
                        "expose_account":this.expose_account.bind(this),
                        "signTransaction":this.signTransaction.bind(this),
                        "set_admin_account":this.set_admin_account.bind(this),
                        "select_account":this.select_account.bind(this),
                     },
            "user" : {}
        };
    }  
    
    /**
     * Generate a new ETH account
     * @return {Object}
     */        
    async generate_account(args,metadata) {
        const mnemonic = BIP39.generateMnemonic();
        let buf = await BIP39.mnemonicToSeed(mnemonic);    
        const privateKey = ethUtil.keccak(buf);
        const publicKey = ethUtil.privateToPublic(privateKey);
        const pubKeyHash = ethUtil.keccak(publicKey);    
        const address = ethUtil.publicToAddress(publicKey).toString('hex');

        let acc= {
            mnemonic:mnemonic,
            address:address,
            publicKey:publicKey.toString('hex'),
            privateKey:privateKey.toString('hex')}
        
        this.settings.accounts[acc.publicKey] = acc; 
        return {publicKey:acc.publicKey}
        
    }

    /**
     * list_accounts
     * @return {Object}
     */        
    list_accounts(args,metadata) {
    return Object.keys(this.settings.accounts);    
    }      

    /**
     * select_account
     * @return {Object}
     */        
    select_account(args,metadata) {
        if (Object.keys(this.settings.accounts).includes(args.publicKey))
        { 
            this.settings.selectedAccount = this.settings.accounts[args.publicKey];
            return args.publicKey;
        }
        return {"error":"could not find account associated with the public key supplied"}        
    }

    expose_account(args,metadata){
        if (args.publicKey == undefined)
            return {"error":"need to supply publicKey"}

        if (this.settings.accounts[args.publicKey] == undefined)
            return {"error":"do not have an entry for this key"}
        return this.settings.accounts[args.publicKey]; 
    }
       
    
    /**
     * Given a private key, derive other account details
     * @param {String} args.privateKey The private key
     * @param {Object} metadata associated with your command (command, service, role). This makes it possible to constrain user types that can use this command.
     * @return {Object}
     */        
    derive_account_from_private_key(args,metadata){
        // metadata -- unused        
        let private_key_hex = args["privateKey"];
        let accountData = {'privateKey':private_key_hex}
        const privateKeyBuffer = ethUtil.toBuffer(private_key_hex);
        const privateKey = privateKeyBuffer;      
        const publicKey = ethUtil.privateToPublic(privateKey);    
        const pubKeyHash = ethUtil.keccak(publicKey);
        const address = ethUtil.publicToAddress(publicKey).toString('hex');
        accountData.address= address; 
        accountData.publicKey= publicKey.toString('hex');
        accountData.privateKey= privateKey.toString('hex');
        return accountData
    }  

    /**
     * Given a private key, derive other account details
     * @param {String} args.privateKey The private key
     * @param {String} args.providerUrl The URL of the Eth RPC proovider
     * @param {Object} metadata associated with your command (command, service, role). This makes it possible to constrain user types that can use this command.
     * @return {Object}
     */        
    async set_admin_account(args,metadata) {
        if (args.privateKey)
        {
            let account = this.derive_account_from_private_key (args,metadata);
            this.settings.selectedAccount = account;
            this.settings.accounts[account.publicKey] = account;
        }
        return true
    }

    /**
     * Given a private key, derive other account details
     * @param {Object} args A valid ETH transacton
     * @param {Object} metadata associated with your command (command, service, role). This makes it possible to constrain user types that can use this command.
     * @return {Object}
     */        
    async signTransaction(args,metadata) {
        if (args['chainId'] != 5)
            return {"error":"Only goerli is supported"} 
        if (args.privateKey == undefined && this.settings.selectedAccount == undefined )
            return {"error":"Require a eth privateKey argument"}
        let wallet = undefined;
        if (args.privateKey == undefined)
        {    
            wallet = new ethers.Wallet(this.settings.selectedAccount.privateKey);
        }
        else
        {
            wallet = new ethers.Wallet(args.privateKey);
        }
        
        const transaction = {
            to: args['to'],
            value: ethers.utils.parseEther(args['value']),
            gasLimit: args['gasLimit'],
            maxPriorityFeePerGas: ethers.utils.parseUnits("5", "gwei"),
            maxFeePerGas: ethers.utils.parseUnits("20", "gwei"),
            nonce: args['nonce'],
            type: args['type'],
            chainId: args['chainId'],
        };

        const rawTransaction = await wallet.signTransaction(transaction);    
        return rawTransaction;
    }

} 
module.exports = EthWallet;