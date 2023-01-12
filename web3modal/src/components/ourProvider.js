import { ethers } from "ethers";
import UniversalProvider from "@walletconnect/universal-provider";

async function createProvider() {
//  Initialize the provider
const provider = await UniversalProvider.init({
  logger: "info",
  relayUrl: "ws://relay.walletconnect.com",
  projectId: "50197516080c85a654bb740a68888c9f",
  metadata: {
    name: "React App",
    description: "React App for WalletConnect",
    url: "https://walletconnect.com/",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  },
  client: undefined, // optional instance of @walletconnect/sign-client
});

//  create sub providers for each namespace/chain
await provider.connect({
  namespaces: {
    eip155: {
      methods: [
        "eth_sendTransaction",
        "eth_signTransaction",
        "eth_sign",
        "personal_sign",
        "eth_signTypedData",
      ],
      chains: ["eip155:80001"],
      events: ["chainChanged", "accountsChanged"],
      rpcMap: {
        80001: "https://rpc.walletconnect.com?chainId=eip155:80001&projectId=50197516080c85a654bb740a68888c9f",
      },
    },
    pairingTopic: "<123...topic>", // optional topic to connect to
    skipPairing: false, // optional to skip pairing ( later it can be resumed by invoking .pair())
  },
});
    
//  Create Web3 Provider
const ourProvider = new ethers.providers.Web3Provider(provider);
return ourProvider;
}    
    
export {createProvider};