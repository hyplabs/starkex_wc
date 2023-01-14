import { SignClient } from "@walletconnect/sign-client";
import { Core } from "@walletconnect/core";
import readline from  'readline';
import { inspect } from 'util';
import StorageEngine from './storage_engine.js';
import { TEST_CONNECT_PARAMS,TEST_APPROVE_PARAMS,TEST_REQUIRED_NAMESPACES,TEST_RESPOND_PARAMS} from "./values.js"

 


/**
[ ] - changeChain
[ ] - changeAccount
[ ] - Signoff
[ ] - wrap ETH
[ ] --- generate Wallet
[ ] --- send Transaction
[ ] --- getData
[ ] - wrap DEC
[ ] ---- Sign Message
[ ] ---- Encode Cipher
[ ] ---- Decode Cipher
[ ] ---- Save Secret
[ ] ---- Load Secret 
 */

let system_topics = {};
let storageEngine = new StorageEngine();
storageEngine.insertKVStoreData("test","value");
console.log("DB test");
let valtest = storageEngine.getValueForKey("test");
console.log(valtest);



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
/**
 * 
const obj = { a: 1, b: 2, c: { d: 3, e: 4 } };
console.log(util.inspect(obj, { depth: null, colors: true }));
 * 
 */
//const util = require('util');
/**
{
  id: 1673364561752430,
  params: {
    id: 1673364561752430,
    pairingTopic: 'c72e857c2f899a2fef1dfa64e3c315d35b1c85a6a22618469e4e1ddd56c9cd45',
    expiry: 1673364870,
    requiredNamespaces: {
      eip155: {
        methods: [ 'personal_sign' ],
        chains: [ 'eip155:1' ],
        events: [ 'accountsChanged' ]
      }
    },
    relays: [ { protocol: 'irn' } ],
    proposer: {
      publicKey: '83e79871b7e7579a3f3b0e5de594a2ef4ebfcc78744524829fdac26261c0fb0a',
      metadata: {
        description: 'Web site created using create-react-app',
        url: 'http://localhost:5000',
        icons: [
          'http://localhost:5000/favicon.ico',
          'http://localhost:5000/logo192.png'
        ],
        name: 'React App'
      }
    }
  }
}
 * 
 */

function approveNamespaces(namespaces)
{
  // DO SOME NAMESPACE VALIDATION HERE, and return false if it fails. Name spaces look like this:
  // namespaces= {
  //  eip155: {
  //    methods: [ 'personal_sign' ],
  //    chains: [ 'eip155:1' ],
  //    events: [ 'accountsChanged' ]
  //  }

  return true;
}
function addAccountsToNamespaces(namespaces)
{
  let newSpace = namespaces;
  newSpace["eip155"]
  // This assumes a namespace eip155 exists.

}


signClient.on("session_proposal", async (event) => {
  console.log("Session Event");
  console.log(inspect(event, { depth: null, colors: true }));
  if (approveNamespaces(event.params.requiredNamespaces) == false)
    addAccountsToNamespaces
  /// TODO -- Request the user to approve the session
  let apprv = {
    "id":event.id,
    "namespaces":{
      "eip155":{
        "methods":["eth_sendTransaction",
                  "eth_signTransaction",
                  "personal_sign",
                  "eth_signTypedData"],
        "accounts":["eip155:1:0xbe1E971E8e5E50F7698C74656520F0E788a0518D",
                    "eip155:42161:0x3c582121909DE92Dc89A36898633C1aE4790382b",
                    "eip155:43114:0x3c582121909DE92Dc89A36898633C1aE4790382b"],
        "events":["chainChanged",
          "accountsChanged"]
              }
      }
  }
    const { topic, acknowledged } = await signClient.approve(apprv)
    console.log("Session Event Ack");
    console.log(acknowledged);
    console.log("Session Event Topic");
    console.log(topic);


    
    let tpk = {
      "acknowledged":acknowledged,
      "approved":apprv,
      "messages":[]
    };
    system_topics[topic] = tpk;

});

signClient.on("session_request", (event) => {
  console.log ("SESSION REQUEST");
  console.log(event);
  signClient.respond({
                        "topic": event.topic,
                        "response":{"id":event.id,
                                  "jsonrpc":"2.0",
                                  "result":{'test_message':'hey world'}}});
});

// Show session proposal data to the user i.e. in a modal with options to approve / reject it
signClient.on("session_proposal", (event) => {});
// Handle session events, such as "chainChanged", "accountsChanged", etc.
signClient.on("session_event", (event) => {});
// React to session ping event
signClient.on("session_ping", (event) => {});
// React to session delete event
signClient.on("session_delete", (event) => {});



// Create a readline interface for accepting user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


/**
    const result = await signClient.request({
      topic: sessionApproval.topic,
      chainId: "eip155:1",
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "personal_sign",
        params: [
          "0x1d85568eEAbad713fBB5293B45ea066e552A90De",
          "0x7468697320697320612074657374206d65737361676520746f206265207369676e6564",
        ],
      },
    });
 */

// Add an event listener for the 'line' event, which is emitted when the user enters a line of text
rl.on('line', async (input) => {
  const words = input.split(' ');
  const command = words[0];
  const args = words.slice(1); 

  if (command === 'echo') {
    console.log(`Echoing: ${args.join(' ')}`);
  
  } else if (command === 'ping_topic') {
    let keys = Object.keys(system_topics);
    console.log(keys);
    console.log("ping");
    const result = await signClient.request({
      topic: keys[0],
      chainId: "eip155:1",
      request: {
        id: 1,
        jsonrpc: "2.0",
        method: "personal_sign",
        params: [
          "0x1d85568eEAbad713fBB5293B45ea066e552A90De",
          "0x7468697320697320612074657374206d65737361676520746f206265207369676e6564",
        ],
      },
    });
    console.log("finished");
    console.log(result);
  /*
    signClient:
        opts
        protocol
        version
        name
        events
        on
        once
        off
        removeListener
        removeAllListeners
        connect
        pair
        approve
        reject
        update
        extend
        request
        respond
        ping
        emit
        disconnect
        find
        getPendingSessionRequests
        metadata
        core
        logger
        session
        proposal
        pendingRequest
        engine   
      signClient.core:
        opts
        protocol
        version
        name
        events
        initialized
        on
        once
        off
        removeListener
        projectId
        logger
        heartbeat
        crypto
        history
        expirer
        storage
        relayer
        pairing         
      
      */
  } else if (command === 'signClient') {      
      const object = {};
      Object.getOwnPropertyNames(signClient).forEach(name => console.log(name));
    } else if (command === 'signClient.core') {      
      const object = {};
      Object.getOwnPropertyNames(signClient.core).forEach(name => console.log(name));

  } else if (command === 'test_emit') {      
      let topics = Object.keys(system_topics);
    
      const requestId = Math.random().toString(36).substring(7);
      const event = {
        id: requestId,
        topic:topics[0],
        chainId: "eip155:1",
        event:{
          method: 'session_update',
          params: [
            {
              from: '0x0000000000000000000000000000000000000000',
              to: '0x0000000000000000000000000000000000000000',
              value: '0x00'
            }
          ]            
        }
      };
      signClient.emit(event).then(() => {
        console.log(`Event sent: ${requestId}`);
      });
  
  } else if (command === 'session_list') {
    console.log(system_topics);

  } else if (command === 'add') {
    const result = args.reduce((acc, val) => acc + Number(val), 0);
    console.log(`Result: ${result}`);
  } else if (command === 'auth') {
    console.log(args[0])
    //let link = 'wc:758c5c02550bfe24d3fc4df42955a0678e7d5f981cd18e3424ff646a0f0635d0@2?relay-protocol=irn&symKey=ce7d0e81126bcf96b04a14ffe9e7b517cb29626af8d68a9514af92b748f3597a'
    let link = args[0];
    let step1 = await signClient.core.pairing.pair({ uri: link })
    console.log("Step 1")
    console.log(step1);
    
    let step2 =await signClient.core.pairing.activate({ topic: step1.topic })
    console.log("Step 2")
    console.log(step2);
    
    const pairings = signClient.core.pairing.getPairings()
    console.log("List")
    console.log(pairings);

  } else {
    console.log(`Unknown command: ${command}`);
  }
});
rl.prompt();





/**
// This will trigger the `session_proposal` event
await signClient.pair({ uri });

// Approve session proposal, use id from session proposal event and respond with namespace(s) that satisfy dapps request and contain approved accounts
const { topic, acknowledged } = await signClient.approve({
  id: 123,
  namespaces: {
    eip155: {
      accounts: ["eip155:1:0x0000000000..."],
      methods: ["personal_sign", "eth_sendTransaction"],
      events: ["accountsChanged"],
      extension: [
        {
          accounts: ["eip:137"],
          methods: ["eth_sign"],
          events: [],
        },
      ],
    },
  },
});

// Optionally await acknowledgement from dapp
const session = await acknowledged();

// Or reject session proposal
await signClient.reject({
  id: 123,
  reason: {
    code: 1,
    message: "rejected",
  },
});
 * 
        extension: [
          {
            accounts: ["eip155:1:0xbe1E971E8e5E50F7698C74656520F0E788a0518D"],
            methods: ["eth_sign"],
            events: [],
          },
        ],
//
[ ] - Auth / Signoff
[ ] - changeChain
[ ] - changeAccount
[ ] - wrap ETH
[ ] --- generate Wallet
[ ] --- send Transaction
[ ] --- getData
[ ] - wrap DEC
[ ] ---- Sign Message
[ ] ---- Encode Cipher
[ ] ---- Decode Cipher
[ ] ---- Save Secret
[ ] ---- Load Secret

- 

 */





/*
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
*/
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
