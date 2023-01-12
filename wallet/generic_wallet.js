/**
 * GenericWalletGateway
 * This is a generic wallet that manages both (a) an underlying wallet and (b) proposing and settlement of transactions
 * - Generating of a new user
 */


class WalletGateway {
    constructor() {
        this.walletObjects = {'exw':new ExampleWallet()} 
    }

    // Install a new wallet into the gateway
    installWallet(id,obj) {
        this.walletObjects[id] = obj; 
    }

    // Run a command from a registered wallet, and return the result
    run(command,args) {
        target_wallet_id = command.split('_')[0];
        targetCommand = command.replace(target_wallet_id+"_",'');

        if (target_wallet_id not in Object.keys(this.walletRegistry))
            return {"error":"this wallet in not supported, or registered"};            
        
        if (targetCommand not in this.walletRegistry[target_wallet_id])
            return {"error":"Could not find this functioon"};          
              
        return this.walletRegistry[target_wallet_id].targetCommand(args);
    }

}

export default WalletGateway;