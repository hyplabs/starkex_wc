# How to use transactions
In spec.md, the sign_message and and generate_request_hash methods require you to supply a valid transaction. These are the valid transactions are below, and are configured by using a registry.json file. 

# How to maintain the supported transactions
If you are adding or maintaining the set of supported transactions, you will have to customize the regisrty.json entries. An example entry follows. Feel free to add / remove the set of supported transactions.
```
"SpotTransferRequest": {
    "hashFunction": "getTransferMsgHash",
    "args": [ "systemId","amount", "nonce", "senderVaultId", "token", "receiverVaultId", "receiverPublicKey", "expirationTimestamp"],
    "hashArgs": [ "amount", "nonce", "senderVaultId", "token", "receiverVaultId", "receiverPublicKey", "expirationTimestamp"]
},
```
- `key: string` - A unique ID to a specific application.
- `hashFunction: string` - The hash function to use with the hashArgs list, starkwareCrypto\['hashFunction\](\{hashArgs\}) will be invoked to hash the request.
- `args: list<string>` - A list of strings to require from the user
- `hashArgs: list<string>` - A list of arguments to pass too the hash function (starkwareCrypto\['hashFunction\](\{args\}))


## TransactionType: SpotTransferRequest
Using the Spot API, you can initiate a transfer request.
- `systemId: string` - A unique ID to a specific application.
- `amount: number` - The amount to transfer or trade.
- `nonce: number` - A unique identifier for the request.
- `senderVaultId: number` - The vault ID of the sender.
- `token: string` - The ID of the token being transferred or traded.
- `receiverVaultId: number` - The vault ID of the receiver.
- `receiverPublicKey: string` - The public key of the receiver.
- `expirationTimestamp: number` - The expiration timestamp for the request.

## TransactionType: SpotConditionalTransferRequest
Using the Spot API, you can initiate a conditional transfer request, which will only execute if a certain condition is met.
- `systemId: string` - A unique ID to a specific application.
- `amount: number` - The amount to transfer or trade.
- `nonce: number` - A unique identifier for the request.
- `senderVaultId: number` - The vault ID of the sender.
- `token: string` - The ID of the token being transferred or traded.
- `receiverVaultId: number` - The vault ID of the receiver.
- `receiverPublicKey: string` - The public key of the receiver.
- `expirationTimestamp: number` - The expiration timestamp for the request.

## TransactionType: SpotOrderRequest
Using the Spot API, you can submit an order request for a specific token pair.
- `systemId: string` - A unique ID to a specific application.
- `vaultIdSell: number` - The vault ID of the token being sold.
- `vaultIdBuy: number` - The vault ID of the token being bought.
- `amountSell: number` - The amount of tokens being sold.
- `amountBuy: number` - The amount of tokens being bought.
- `tokenSell: string` - The ID of the token being sold.
- `tokenBuy: string` - The ID of the token being bought.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.

## TransactionType: SpotLimitOrderRequest
Using the Spot API, you can submit a limit order request for a specific token pair.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the order (e.g. "buy" or "sell").
- `amountBuy: number` - The amount of tokens to be bought.
- `amountSell: number` - The amount of tokens to be sold.
- `feeLimit: number` - The maximum fee allowed for the transaction.
- `feeToken: string` - The ID of the token used for the fee.
- `feeVaultId: number` - The vault ID of the fee payer.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `tokenBuy: string` - The ID of the token being bought.
- `tokenSell: string` - The ID of the token being sold.
- `vaultBuy: number` - The vault ID of the token being bought.
- `vaultSell: number` - The vault ID of the token being sold.

## TransactionType: SpotLimitOrderWithFeesRequest
Using the Spot API, you can submit a limit order request for a specific token pair that includes fees.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the order (e.g. "buy" or "sell").
- `amountBuy: number` - The amount of tokens to be bought.
- `amountSell: number` - The amount of tokens to be sold.
- `feeLimit: number` - The maximum fee allowed for the transaction.
- `feeToken: string` - The ID of the token used for the fee.
- `feeVaultId: number` - The vault ID of the fee payer.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `tokenBuy: string` - The ID of the token being bought.
- `tokenSell: string` - The ID of the token being sold.
- `vaultBuy: number` - The vault ID of the token being bought.
- `vaultSell: number` - The vault ID of the token being sold.

## TransactionType: SpotMultiAssetOrderOffchainRequest
Using the Spot API, you can submit a multi-asset offchain order request.
- `unknown`: The specific arguments for this transaction type are not provided.

## TransactionType: SpotTransferWithFeesRequest
Using the Spot API, you can initiate a transfer request that includes fees.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the transfer (e.g. "send" or "receive").
- `amount: number` - The amount of tokens to transfer or trade.
- `feeLimit: number` - The maximum fee allowed for the transaction.
- `feeToken: string` - The ID of the token used for the fee.
- `feeVaultId: number` - The vault ID of the fee payer.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `receiverPublicKey: string` - The public key of the receiver.
- `receiverVaultId: number` - The vault ID of the receiver.
- `senderVaultId: number` - The vault ID of the sender.
- `token: string` - The ID of the token being transferred or traded.


## TransactionType: SpotConditionalTransferWithFeesRequest
Using the Spot API, you can initiate a conditional transfer request that includes fees.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the transfer (e.g. "send" or "receive").
- `amount: number` - The amount of tokens to transfer or trade.
- `feeLimit: number` - The maximum fee allowed for the transaction.
- `feeToken: string` - The ID of the token used for the fee.
- `feeVaultId: number` - The vault ID of the fee payer.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `receiverPublicKey: string` - The public key of the receiver.
- `receiverVaultId: number` - The vault ID of the receiver.
- `senderVaultId: number` - The vault ID of the sender.
- `token: string` - The ID of the token being transferred or traded.
- `condition`: The condition that must be met for the transfer to execute. The specifics of the condition will depend on the implementation.


## TransactionType: SptMultiAssetOrderOffchainRequest
Using the Spot API, you can submit a multi-asset offchain order request.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the order (e.g. "buy" or "sell").
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `give`: An object that specifies the token being given in the trade, and the amount.
    * `amount: number` - The amount of tokens being given.
    * `token: string` - The ID of the token being given.
- `nonce: number` - A unique identifier for the request.
- `receive`: An object that specifies the token being received in the trade, and the amount.
    * `amount: number` - The amount of tokens being received.
    * `token: string` - The ID of the token being received.

## TransactionType: PerpetualLimitOrderRequest
Using the Perpetual API, you can submit a perpetual limit order request.
- `unknown`: The specific arguments for this transaction type are not provided.

## TransactionType: PerpetualWithdrawalRequest
Using the Perpetual API, you can submit a withdrawal request for a perpetual contract.
- `unknown`: The specific arguments for this transaction type are not provided.

## TransactionType: PerpetualTransferRequest
Using the Perpetual API, you can initiate a transfer request for a perpetual contract.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the transfer (e.g. "send" or "receive").
- `assetId: string` - The ID of the asset being transferred.
- `assetIdFee: string` - The ID of the asset used to pay the fee.
- `amount: number` - The amount of assets to transfer.
- `maxAmountFee: number` - The maximum amount of the asset used to pay the fee.
- `nonce: number` - A unique identifier for the request.
- `receiverPublicKey: string` - The public key of the receiver.
- `receiverPositionId: number` - The position ID of the receiver.
- `senderPositionId: number` - The position ID of the sender.
- `srcFeePositionId: number` - The position ID of the account paying the fee.
- `expirationTimestamp: number` - The expiration timestamp for the request.

## TransactionType: PerpetualConditionalTransferRequest
Using the Spot API, you can initiate a conditional transfer request for a perpetual contract.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the transfer (e.g. "send" or "receive").
- `assetId: string` - The ID of the asset being transferred.
- `assetIdFee: string` - The ID of the asset used to pay the fee.
- `amount: number` - The amount of assets to transfer.
- `condition`: The condition that must be met for the transfer to execute. The specifics of the condition will depend on the implementation.
- `maxAmountFee: number` - The maximum amount of the asset used to pay the fee.
- `nonce: number` - A unique identifier for the request.
- `receiverPublicKey: string` - The public key of the receiver.
- `receiverPositionId: number` - The position ID of the receiver.
- `senderPositionId: number` - The position ID of the sender.
- `srcFeePositionId: number` - The position ID of the account paying the fee.
- `expirationTimestamp: number` - The expiration timestamp for the request.

## TransactionType: PerpetualWithdrawalToAddressRequest
Using the Spot API, you can submit a withdrawal request for a perpetual contract, sending the funds to an Ethereum address.
- `systemId: string` - A unique ID to a specific application.
- `type: string` - The type of the withdrawal (e.g. "normal" or "emergency").
- `amount: number` - The amount of assets to withdraw.
- `assetIdCollateral: string` - The ID of the collateral asset.
- `ethAddress: string` - The Ethereum address where the funds will be sent.
- `nonce: number` - A unique identifier for the request.
- `expirationTimestamp: number` - The expiration timestamp for the request.
- `positionId: number` - The position ID of the account making the withdrawal.