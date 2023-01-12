// A Simple class that wraps a wallet
// This is just an exmaple of a wallet. This wallet is compatible with the WalletGateway
class ExampleWalletGateway{
    
    createNewKeyPair(params) {
        return {
            'publicKey':'12345',
            'privateKey':'fbajkfbaj'
        };
    }

    signTransaction(params) {
        params['sig'] = '0xtf78adfjadkf';
        return params['sig'];
    }

    sendTransaction(params) {
        let transaction_id = "0x12354"
        return transaction_id;
    }
    
    getTransaction(params) {
        return {'finished':true};
    }
}
