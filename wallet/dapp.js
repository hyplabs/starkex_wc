import SignClient from "@walletconnect/sign-client";
import Web3Modal from "@web3modal/standalone";

const signClient = await SignClient.init({
  projectId: "b700887b888adad39517894fc9ab22e1",
  metadata: {
    name: "Example Dapp",
    description: "Example Dapp",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
});

signClient.on("session_event", ({ event }) => {
    // Handle session events, such as "chainChanged", "accountsChanged", etc.
  });
  
  signClient.on("session_update", ({ topic, params }) => {
    const { namespaces } = params;
    const _session = signClient.session.get(topic);
    // Overwrite the `namespaces` of the existing session with the incoming one.
    const updatedSession = { ..._session, namespaces };
    // Integrate the updated session state into your dapp state.
    onSessionUpdate(updatedSession);
  });
  
  signClient.on("session_delete", () => {
    // Session was deleted -> reset the dapp state, clean up from user session, etc.
  });



const web3Modal = new Web3Modal({
  projectId: "<YOUR_PROJECT_ID>",
  // `standaloneChains` can also be specified when calling `web3Modal.openModal(...)` later on.
  standaloneChains: ["eip155:1"],
});


try {
    const { uri, approval } = await signClient.connect({
      // Optionally: pass a known prior pairing (e.g. from `signClient.core.pairing.getPairings()`) to skip the `uri` step.
      pairingTopic: pairing?.topic,
      // Provide the namespaces and chains (e.g. `eip155` for EVM-based chains) we want to use in this session.
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_signTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData",
          ],
          chains: ["eip155:1"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });
  
    // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
    if (uri) {
      web3Modal.openModal({ uri });
      // Await session approval from the wallet.
      const session = await approval();
      // Handle the returned session (e.g. update UI to "connected" state).
      // * You will need to create this function *
      onSessionConnect(session);
      // Close the QRCode modal in case it was open.
      web3Modal.closeModal();
    }
  } catch (e) {
    console.error(e);
  }



  const result = await signClient.request({
    topic: session.topic,
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