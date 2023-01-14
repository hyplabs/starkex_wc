import { SignClient } from "@walletconnect/sign-client";
import { Core } from "@walletconnect/core";

const signClient = await SignClient.init({
  projectId: "b700887b888adad39517894fc9ab22e1",
  //optional parameters
  relayUrl: "wss://relay.walletconnect.com", 
  metadata: {
    name: "Wallet name",
    description: "A short description for your wallet",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
});

console.log(signClient);

 // Creates a new (inactive) pairing. Returns the URI for a peer to consume via `pair`, as well as the pairing topic.
 const {topic, uri} = await signClient.core.pairing.create()

 console.log(topic);
 console.log(uri);

 console.log("PAIR");
 // Pair with a peer's proposed pairing, extracted from the provided `uri` parameter.
await signClient.core.pairing.pair({ uri: uri })


console.log("TOPIC");
// Activate a previously created pairing (e.g. after the peer has paired), by providing the pairing topic.
await signClient.core.pairing.activate({ topic: topic })

console.log("END");

const pairings = signClient.core.pairing.getPairings()

console.log(pairings);

/** PARING EXXAMPLE
 // Creates a new (inactive) pairing. Returns the URI for a peer to consume via `pair`, as well as the pairing topic.
 const {topic, uri} = await signClient.core.pairing.create()

// Pair with a peer's proposed pairing, extracted from the provided `uri` parameter.
await sdkClient.core.pairing.pair({ uri: "wc:1b3eda3f4..." })

// Activate a previously created pairing (e.g. after the peer has paired), by providing the pairing topic.
await sdkClient.core.pairing.activate({ topic: "1b3eda3f4..." })

// Updates the expiry of an existing pairing, by providing the pairing topic and an `expiry` in seconds (e.g. `60` for one minute from now)
await sdkClient.core.pairing.updateExpiry({ topic: "1b3eda3f4...", expiry: 60 })

// Updates a pairing's metadata, by providing the pairing topic and the desired metadata.
await sdkClient.core.pairing.updateMetadata({ topic: "1b3eda3f4...", metadata: { name: "MyDapp", ... } })

// Returns an array of all existing pairings.
const pairings = sdkClient.core.pairing.getPairings()

// Pings a pairing's peer, by providing the pairing topic.
await sdkClient.core.pairing.ping({ topic: "1b3eda3f4..." })

// Disconnects/Removes a pairing, by providing the pairing topic.
await sdkClient.core.pairing.disconnect({ topic: "1b3eda3f4..." })
 * 
 * 
 * 
 */


/**
 * 
 * 
import { Core } from "@walletconnect/core";
import SignClient from "@walletconnect/sign-client";
import { AuthClient } from "@walletconnect/auth-client";

// First instantiate a separate `Core` instance.
const core = new Core({
  projectId: "<YOUR_PROJECT_ID>",
});

const metadata = {
  name: "Example Dapp",
  description: "Example Dapp",
  url: "#",
  icons: ["https://walletconnect.com/walletconnect-logo.png"],
};

// Pass `core` to the SignClient on init.
const signClient = await SignClient.init({ core, metadata });

// Pass `core` to the AuthClient on init.
const authClient = await AuthClient.init({ core, metadata }); * 
 */




signClient.on("session_proposal", (event) => {
  // Show session proposal data to the user i.e. in a modal with options to approve / reject it

  /*  
  interface Event {
    id: number;
    params: {
      id: number;
      expiry: number;
      relays: { protocol: string; data?: string }[];
      proposer: {
        publicKey: string;
        metadata: {
          name: string;
          description: string;
          url: string;
          icons: string[];
        };
      };
      requiredNamespaces: Record<
        string,
        {
          chains: string[];
          methods: string[];
          events: string[];
          extension?: {
            chains: string[];
            methods: string[];
            events: string[];
          }[];
        }
      >;
      pairingTopic?: string;
    };
  }*/
});

signClient.on("session_event", (event) => {
  // Handle session events, such as "chainChanged", "accountsChanged", etc.

  /*  
  interface Event {
    id: number;
    topic: string;
    params: {
      event: { name: string; data: any };
      chainId: string;
    };
  }*/
});

signClient.on("session_request", (event) => {
  // Handle session method requests, such as "eth_sign", "eth_sendTransaction", etc.

  /*  
  interface Event {
    id: number;
    topic: string;
    params: {
      request: { method: string; params: any };
      chainId: string;
    };
  }*/
});

signClient.on("session_ping", (event) => {
  // React to session ping event

  /*  
  interface Event {
    id: number;
    topic: string;
  }*/
});

signClient.on("session_delete", (event) => {
  // React to session delete event

  /*  
  interface Event {
    id: number;
    topic: string;
  }*/
});



