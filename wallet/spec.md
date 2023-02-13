# list_accounts() => Object
Returns an object with the account names as public keys.

# select_account(args: Object) => string | Object
Returns the selected starkKey if it exists, or an object with an error property if it does not.

* `args: Object`
  * `starkKey: string` - The starkKey associated with the account to select.
* `metadata: Object`

# generate_stark_account_from_public_key(args: Object) => Object
Returns an object with the generated starkKey as a property. Adds the generated account to the settings accounts list. Only works if bound to a locally avaliable EthWallet via the ServiceManager.

* `args: Object`
  * `publicKey: string` - The public key to generate the starkKey from.


# generate_stark_account_from_private_key(args: Object) => Object
Returns an object with the generated account and starkKey as properties. Adds the generated account to the settings accounts list. 

* `args: Object`
  * `privateKey: string` - The private key to generate the account and starkKey from.



# get_public_key() => Object
Returns a promise that resolves to an object with the public keys of the existing accounts as keys.

# generate_request_hash(request: Object)  => Object
Returns a promise that resolves to a string representing the generated hash.

* `request: Object`
  * `type: string` - The type of request (one of "TransferRequest", "ConditionalTransferRequest", or "OrderRequest").
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

