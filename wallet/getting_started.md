# Wallet Getting Started

This is a CLI wallet. Ideally, you are a developer who is looking to create or extend a wallet for the StarkEx platform. This wallet application encloses two services, a StarkExWallet service, which can sign requsts and create keys, and a StarkExGateway service which can talk to an external gateway. These services reside in the /wallet/services/ directory. Using the CLI you can authorize requests originating from a WalletConnect user. A future version may remove the StarkExGateway.

# Example Usage (wallet only)
- To start the wallet, run "node index.js".
- When you want to bind to a wallet, type > "auth wc:THE_LONG_CODE" which you can get from clicking copy on the wallet connect popup
- type "approve" as you see transactions to approve pop up
- If you want to focus on dApp development, it can be useful to type in "auto_approve". This will tell the wallet to auto_approve all messages it gets.

# Commands:
- echo: This will echo the text you type. This just shows how to get data from the command line and make sure the wallet is running. 
- auto_approve: From now on, approve all requests
- list: List the current WalletConnect sessions
- approve: Approve all of the recent transactions (usually the only transaction displayed. It is possible if you connect two wallets, to handle multiple requests, in theory.)
- reject: Rejects all the requests in the current approval queue
- auth [wc:wallet_connect_deep_link]: Connect to WalletConnect, and create a session. That session will be visible in a list

