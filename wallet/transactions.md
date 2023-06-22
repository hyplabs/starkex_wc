# Transactions
The general API spec provided by the system is outlined in [spec.md](spec.md). If you want to understand how to use this system, head over to the spec. 

This transaction document outlines StarkEx `transation` support specifically. In short, all spot and perpetual StarkEx transactions are supported, as the StarkExGateway is a [proxy service](https://en.wikipedia.org/wiki/Proxy_server). If you have issues with any transactions, please review the StarkEx API documentation or contact the StarkEx team with your environment and transaction details.

1. Supported Spot Transactions: [Spot API](https://docs.starkware.co/starkex/api/spot/) 
2. Supported Perpetual Transactions: [Perpetual API]( https://docs.starkware.co/starkex/api/perpetual/ ) 

# How to test transactions
1. run `npm run test` in the project root

Please see the [transactions.json](../transactions.json) for the updated list of transactions. You can add the transactions you would like tested here, and they will be run duing a "npm run test". For each transaction, you will need to explain behaviour:

1. "test_type":"spot_signed" Send the message to the Spot gateway, and sign it
2. "test_type":"spot" Send the message to the Spot gateway
3. "test_type":"perpetual_signed" Send the message to the Perpetual gateway, and sign it
4. "test_type":"perpetual" Send the message to the perpetual gateway

# How to configure the whitelist of transactions
In spec.md, the sign_message and and sendTransactioon methods require you to supply a valid transaction. These are the valid transactions are are configured by using a [Wallet Registry](../wallet/registry.json) and [dApp Registry](../web3modal/wallet/registry.json) file. Within the specification you can supply the following fields.

If you are adding or maintaining the set of supported transactions, you will have to customize the regisrty.json entries. An example entry follows. Feel free to add / remove the set of supported transactions.
```
{
    "TransferRequest": {
        "gatewayFunction": "/v2/gateway/add_transaction",
        "gatewayArgs": ["senderPublicKey","txId","signature","type","amount", "nonce", "senderVaultId", "token", "receiverVaultId", "receiverPublicKey", "expirationTimestamp"],
        "hashFunction": "getTransferMsgHash",
        "hashArgs": [ "amount", "nonce", "senderVaultId", "token", "receiverVaultId", "receiverPublicKey", "expirationTimestamp"],
        "hashFunctionWithFee": "getTransferMsgHashWithFee",
        "hashArgsWithFee":["amount","nonce","senderVaultId","token","receiverVaultId","receiverPublicKey","expirationTimestamp","feeInfoUser.token","feeInfoUser.sourceVaultId","feeInfoUser.feeLimit"]  
}
```
- `type: string` - "TransferRequest" The type sent to the gateway which uniquely identifies the request.  
- `hashFunction: string` - The hash function to use with the hashArgs list, starkwareCrypto\['hashFunction\](\{hashArgs\}) will be invoked to hash the request.
- `gatewayArgs: list<string>` - A list of arguments sent to the gateway via POST
- `hashArgs: list<string>` - A list of arguments to pass to the hash function (starkwareCrypto\['hashFunction\](\{args\}))
- `hashFunctionWithFee: string` - The hash function to use with fees
- `hashFunctionWithFee: list<string>` - The hash function to use with the hashFunctionWithFee list, starkwareCrypto\['hashFunction\](\{hashArgs\}) will be invoked to hash the request.

Please see the [registry.json](./registry.json) for the updated list of transactions for this pilot project.
