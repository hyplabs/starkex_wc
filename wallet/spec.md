# The StarkEx Spec

StarkEx_wc can sign messages and send transactions to StarkEx. This file covers supported spot transactions and perpetual transactions with a focus on preparing and customizing transactions. The file also contains examples for different transaction types and instructions for adding new transaction support over time. Additionally, it describes various account-related operations like listing accounts, selecting accounts, generating accounts from private keys, and fetching public keys. Lastly, it discusses generating request hashes, signing messages, and working with key materials.

1. For react-js usage,  read [app.js](../web3modal/src/App.js)
1. For nodejs usage, read [transactions.js](../__tests__/transactions.js)

# sign_message
This function takes a StarkEx transaction request and returns a message signature. It prepares the transaction by removing the outer JSON, revealing the INNER_TRANSACTION, and customizing it with necessary details. This function is useful for engineers to sign and prepare transactions for StarkEx. Returns a message signature.

### How to prepare a Transaction
1. Select a transaction you would like to use.
      1. Supported Spot Transactions: [Spot API](https://docs.starkware.co/starkex/api/spot/) 
      2. Supported Perpetual Transactions: [Perpetual API]( https://docs.starkware.co/starkex/api/perpetual/ ) 
3. Remove the outer Json {"tx":{INNER_TRANSACTION}, "txid":- } to reveal {INNER_TRANSACTION}. This is because starkex_wc automatically retrieves the txid for you.
4. Customize the INNER_TRANSACTION:
  * `systemId: string` - A unique System ID for this transaction to protect the wallet from signing duplicate transactions 
  * `type: string` - The StarkEx transaction type, as listed on the StarkEx website
  * `{\...other fields}\:json` All other transaction fields, as specified on the starkEx Gateway, per transaction
5. Please review some examples in [test_transactions](../__tests__/transactions.json) 

### Example
```
let req = {
      "type":"TransferRequest",
      "amount": "1001",
      "senderPublicKey": "0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4",
      "senderVaultId": 1,
      "token": "0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4",
      "receiverPublicKey": "0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020",
      "receiverVaultId": 1,
      "expirationTimestamp": 438953
    }
let sig = await app.request( "sign_message", "starkex", req);
```

### How to add in new transaction support over time?
If you would like to customize the set of transactions, please visit [transactions.md](./transactions.md). For security and reliability reasons, this gateway provides controls as to what transactions can be signed or sent. To configure this list please review [transactions.md](./transactions.md) and update any related registry.json.

# sendTransaction
This function sends a transaction directly to StarkEx's endpoint and returns transaction information or an error. It supports all StarkEx transactions and requires preparing the INNER_TRANSACTION similar to the sign_message function. Returns transaction information, or an error, directly from StarkEx's endpoint. All StarkEx transactions are supported.

### How to prepare a Transaction.
1. Supported Spot Transactions: [Spot API](https://docs.starkware.co/starkex/api/spot/) 
2. Supported Perpetual Transactions: [Perpetual API]( https://docs.starkware.co/starkex/api/perpetual/ ) 
3. Remove the outer Json {"tx":{INNER_TRANSACTION}, "txid":- } to reveal {INNER_TRANSACTION}. This is because starkex_wc automatically retrieves the txid for you.
4. Customize the INNER_TRANSACTION:
  * `systemId: string` - A unique System ID for this transaction to protect the wallet from signing duplicate transactions 
  * `type: string` - The StarkEx transaction type, as listed on the StarkEx website
  * `{\...other fields}\:json` All other transaction fields, as specified on the starkEx Gateway, per transaction
3. Please review some examples in [test_transactions](../__tests__/transactions.json) 

### Example
```
let req = {
        "tokenId": "0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6",
        "amount": "1000",
        "vaultId": 1,
        "starkKey": "0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80",
        "type": "DepositRequest"
    }
let sig = await app.request( "sendTransaction", "starkex", req);
```

### How to add in new transaction support over time?
If you would like to customize the set of transactions, please visit [transactions.md](./transactions.md). For security and reliability reasons, this gateway provides controls as to what transactions can be signed or sent. To configure this list please review [transactions.md](./transactions.md) and update any related registry.json.


# list_accounts
This function returns an object with the account names as public keys. It is useful for engineers to retrieve a list of accounts associated with the wallet. Returns an object with the account names as public keys.

# select_account
This function returns the selected starkKey if it exists, or an object with an error property if it does not. It takes a starkKey as an argument and is useful for selecting a specific account to interact with. Returns the selected starkKey if it exists, or an object with an error property if it does not.

* `args: Object`
  * `starkKey: string` - The starkKey associated with the account to select.
* `metadata: Object`



# generate_stark_account_from_private_key
This function generates a Stark account and starkKey from a provided private key, and adds the generated account to the settings accounts list. It is useful for creating new accounts based on private keys. Returns an object with the generated account and starkKey as properties. Adds the generated account to the settings accounts list. 

* `args: Object`
  * `privateKey: string` - The private key to generate the account and starkKey from.


# get_public_key
This function returns a promise that resolves to an object with the public keys of existing accounts as keys. It helps engineers to fetch public keys associated with the wallet's accounts. Returns a promise that resolves to an object with the public keys of the existing accounts as keys.

# generate_request_hash
This function takes a transaction request as an argument and generates a hash representing the request. The request contains details like type, amount, nonce, sender and receiver vault IDs, token IDs, expiration timestamp, and fee information. It is useful for engineers to generate a hash before signing a transaction. Returns a promise that resolves to a string representing the generated hash. Please see transactions.md for information on transactions. To understand supported transactions, and change the list of supported transactions, please see transactions.md

* `args: Object`
  * `type: string` - The type of request (examples are of "TransferRequest", "ConditionalTransferRequest", or "OrderRequest").
  * `amount: number` - The amount to transfer or trade.
  * `nonce: number` - A unique identifier for the request.
  * `senderVaultId: number` - The vault ID of the sender.
  * `token: string` - The id of the token being transferred or traded.
  * `receiverVaultId: number` - The vault ID of the receiver.
  * `receiverPublicKey: string` - The public key of the receiver.
  * `expirationTimestamp: number` - The expiration timestamp for the request.
  * `feeInfo: Object?`
    * `token: string` - The id of the token used for the fee.
    * `sourceVaultId: number` - The vault ID of the fee payer.
    * `feeLimit: number` - The maximum fee allowed.
  * `feeInfoUser: Object?`
    * `token: string` - The name of the token used for the fee.
    * `sourceVaultId: number` - The vault ID of the fee payer.
    * `feeLimit: number` - The maximum fee allowed.

# sign_message
This function returns a promise that resolves to an object with the message signature (r and s values) as properties. If a hash is not provided, it will call generate_request_hash with the provided arguments to generate the hash. This function is useful for signing a message with the hash of the transaction. Returns a promise that resolves to an object with the message signature (`r` and `s` values) as properties.

* `args: Object`
  * `hash: string?` - The hash of the message to sign. If not provided, the function will call generate_request_hash with `args` to generate the hash.

# get_key_material
This function returns a promise that resolves to an object with the deterministic random number generated from the key material as a property. It takes an optional seed and number as arguments. It is useful for generating key material to be used in other cryptographic operations. Returns a promise that resolves to an object with the deterministic random number generated from the key material as a property.

* `args: Object`
  * `seed: string?` - The seed to use when generating the key material. If not provided, an empty string is used.
  * `number: number?` - The number to use when generating the key material. If not provided, 0 is used.
  
