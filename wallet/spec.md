# list_accounts
Returns an object with the account names as public keys.

# select_account
Returns the selected starkKey if it exists, or an object with an error property if it does not.

* `args: Object`
  * `starkKey: string` - The starkKey associated with the account to select.
* `metadata: Object`

# generate_stark_account_from_public_key
Returns an object with the generated starkKey as a property. Adds the generated account to the settings accounts list. Only works if bound to a locally avaliable EthWallet via the ServiceManager.

* `args: Object`
  * `publicKey: string` - The public key to generate the starkKey from.


# generate_stark_account_from_private_key
Returns an object with the generated account and starkKey as properties. Adds the generated account to the settings accounts list. 

* `args: Object`
  * `privateKey: string` - The private key to generate the account and starkKey from.


# get_public_key
Returns a promise that resolves to an object with the public keys of the existing accounts as keys.

# generate_request_hash
Returns a promise that resolves to a string representing the generated hash. Please see transactions.md for information on transactions. To understand supported transactions, and change the list of supported transactions, please see transactions.md

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
Returns a promise that resolves to an object with the message signature (`r` and `s` values) as properties.

* `args: Object`
  * `hash: string?` - The hash of the message to sign. If not provided, the function will call generate_request_hash with `args` to generate the hash.

# get_key_material
Returns a promise that resolves to an object with the deterministic random number generated from the key material as a property.

* `args: Object`
  * `seed: string?` - The seed to use when generating the key material. If not provided, an empty string is used.
  * `number: number?` - The number to use when generating the key material. If not provided, 0 is used.
  
  
  
  
  
registry.json -- will sit in the /wallet/ directory, and lists out arguments for each registered hash request
spec.md is in the /wallet/ directory, and will need to be edited as well to registry.json

Task list:
- systemId support (in progress)
- How to update the registry guide
- Load registry dynamically from json file
- Re-test he GUI dApp
- Remove ETH and other artifacts
- Extraction of configuration variables into configuration locations.
- Create list of questions for Fireblocks
- remove services/starkExGateway
- change StarkEx wallet to Stark wallet
- remove generate a starkex account from a public key
- When referring to keys it should always be said if it is an Eth key