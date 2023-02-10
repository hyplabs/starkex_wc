import React, { Component } from 'react';
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { Container, Row, Col } from 'react-bootstrap';
import MainComponent from './components/MainComponent';
import { Web3Modal } from '@web3modal/standalone'
const WCApp = require(  './components/WCApp.js'); 

class App extends Component {
  constructor(props)
  {
    super(props);  
    this.projectId = 'b700887b888adad39517894fc9ab22e1'
    this.namespaces = {
      eip155: { methods: ['personal_sign',
                          'generate_account',
                          'expose_account',
                          'sendTransaction',
                          'sign_message',
                          'set_gateway',
                          'getFirstUnusedTxId',
                          'set_admin_account',
                          'select_account',
                          'generate_stark_account_from_private_key',
                          'signTransaction'], 
                chains: ['eip155:1'], 
                events: ['accountsChanged'] }
    }
    this.web3Modal = new Web3Modal({ projectId:this.projectId, standaloneChains: this.namespaces.eip155.chains })
    this.app = new WCApp();   
    this.userInfo = {};
  }
     
  handleConnect = async () => {
      try {        
        const { deep_link, approval } = await this.app.doConnect(this.namespaces,this.projectId);
        let uri = deep_link;

        if (uri) {
          this.web3Modal.openModal({ uri })
          let res = await approval; 
          //console.log("Connected 2");
          //console.log(res)
          this.web3Modal.closeModal()
          let sessionApproval = res;
          this.userInfo.connected =  true;
          this.setInfo(JSON.stringify(this.userInfo,null,2));      
          console.log(sessionApproval);
        }
      } catch (err) {
        console.error(err)
      }
  }

    /**
     * With admin approval, lets actually expose keys. The Wallet will have to voluntairly send this data over.
     * (Go ahead and try to say Y and then N to this request)
     */
  handleGenerateAccount = async () => {
    // Here we demo:
    // (1) ETH private key Generation. This can be used for L1 functions such deposting into StarkEx.
    let results = {}
    results.ethProvider =  "https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514";
    results.starkProvider =  "https://gw.playground-v2.starkex.co";
    
    await this.run("set_gateway","ethgate",   {"providerUrl":results.ethProvider});
    //await this.request("set_admin_account", "starkex", {"providerUrl":results.starkProvider});

    results.ethResponse = await this.run("generate_account","eth",{});
    
    // (2) Eth user selection
    results.ethAccount  = await this.run("select_account","eth",{publicKey: results.ethResponse.publicKey}); 
    
    // (3) Eth expose details
    results.ethPrivateAccount  = await this.run("expose_account","eth",{publicKey: results.ethResponse.publicKey}); 

    // (3) StarkEx key Generation.
    results.starkResponse = await this.request("generate_stark_account_from_private_key","starkex",{'privateKey':results.ethPrivateAccount.privateKey});
    
    // (4) Stark user selection.
    results.starkAccount = await this.request("select_account","starkex",{starkKey:results.starkResponse.starkKey});

    //alert(JSON.stringify(ethAccount));
    //alert(JSON.stringify(starkAccount));
    this.userInfo = results;
    
    this.setInfo(JSON.stringify(this.userInfo,null,2));
    // Notes / Next Steps:
    // It is possible to more deeply use SignClient on both the wallet and dApp side to handle session management.
    // This functionality in WC 2.0 is not fully documented, so it may take weeks of hours to tackle this upgrade.
    // Instead, we opted to build session management into the wallet kernel itself, which has the effect that sessions 
    // also propagate to the Command Line, and any other interfaces. It would be a great goal for a repositor contributer
    // to tackle WalletConnect session management under WC 2.0. 

    // It is also possible to list the current accounts, and to ask
    //let publicKeys = await this.request("list_accounts","eth_wallet_gateway",{});
  }


  doL1Deposit = async () => {
    // Move L1 currency into Starkware with a Deposit
    let args = {};
    let metadata = {};  
    let value = "0.001"; // 0.001 Ether
    let gasPrice = "2000000000"; // 2 Gwei
    let gasLimit = "21000";
    let chainId = 5;
    args = {
        to: "31349e0c9d36f3d11b980df145a1abc871399b8a",
        value: value,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        type:1,
        chainId: chainId,
    };
    metadata = {};
  
    // (1.a) Sign a transaction moving L1 to the starkEx depost function
    let signedEthTransaction = await this.run("signTransaction","eth",args);
    //console.log("signedEthTransaction");
    //console.log(signedEthTransaction);    
    args = {"hex":signedEthTransaction};
    let sentEthTransaction = await this.run("sendTransaction","ethgate",args);
    return {signedEthTransaction, sentEthTransaction};

  }

  doL2Deposit = async (app,admin) => {
    let results = {}
    results['sign_message'] = await this.request("sign_message","starkex",         
      {"type":"TransferRequest",
      amount: '1000',
      nonce: 1519522183,
      senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
      senderVaultId: 1,
      token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
      receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
      receiverVaultId: 1,
      expirationTimestamp: 438953});

    results['getFirstUnusedTxId']  = await this.request("getFirstUnusedTxId","starkexgate", {});

    results['sendTransaction'] = await this.request( "sendTransaction", "starkexgate", 
      {
      "type": "DepositRequest",
      "tokenId": '0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
      "amount": '1000',
      "vaultId": 1,
      "starkKey": '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
      });

      return results;
  }  

  state = {
    stateInfoArea: "",
    commands: []
  };

  addToCommands = command => {
    this.setState({ commands: [ command,...this.state.commands] });
  };
  setInfo = info => {
    this.setState({ stateInfoArea: info });
  };
  doAddition = () => {
    this.addToCommands("This is a command");
    this.setInfo("Hellow world");
  };

  request = async (command,service,args) =>{
    let resStr = [];
    resStr.push("Command:"+command);
    resStr.push("service:"+service);
    let results = await this.app.request( command, service, args);
    resStr.push("REQUESTING---------------");
    resStr.push(JSON.stringify(args,null,2));
    resStr.push("------");
    resStr.push(JSON.stringify(results,null,2));
    resStr.push("---------------------");
    this.addToCommands(resStr.join("\n"));
    return results;
  }

  run = async (command,service,args) =>{
    let resStr = [];
    resStr.push("Command:"+command);
    resStr.push("service:"+service);
    let results = await this.app.run( command, service, args);
    resStr.push("RUNNING---------------");
    resStr.push(JSON.stringify(args,null,2));
    resStr.push("------");
    resStr.push(JSON.stringify(results,null,2));
    resStr.push("---------------------");
    this.addToCommands(resStr.join("\n"));
    return results;
  }    
    

  render() {
    return (
      <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">dApp Example</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
          </Nav>
          <Nav.Link href="#user-sign-in">
            <i className="fas fa-user-circle" />
          </Nav.Link>
        </Navbar.Collapse>
      </Navbar>
      <div className="container">
        <h1>dApp Example</h1>
        <Container>
          <Row>
            <Col xs={12} md={4}>
              <Form xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Connect</Form.Label>
                  <Form.Control
                    type="button"
                    value="Connect"
                    onClick={this.handleConnect}
                  />
                  <Form.Text className="text-muted">
                    This button will connect to the network.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Generate Account</Form.Label>
                  <Form.Control
                    type="button"
                    value="Generate Account"
                    onClick={this.handleGenerateAccount}
                  />
                  <Form.Text className="text-muted">
                    This button will generate a new ETH and Stark account.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Hard coded L1 Transactions</Form.Label>
                  <Form.Control
                    type="button"
                    value="ETH Deposit Transactions"
                    onClick={this.doL1Deposit}
                  />
                  <Form.Text className="text-muted">
                    This button will Demo a L1 Deposit transaction with ETH.
                  </Form.Text>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Hard coded L2 Transactions</Form.Label>
                  <Form.Control
                    type="button"
                    value="StarkEx Example Transactions"
                    onClick={this.doL2Deposit}
                  />
                  <Form.Text className="text-muted">
                    This button will Demo a L2 Deposit transaction with ETH.
                  </Form.Text>
                </Form.Group>                                
              </Form>
            </Col>
            <Col xs={12} md={8}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "1em" }}>
                  <h5>Account Info:</h5>
                  <pre><code>{this.state.stateInfoArea}</code></pre>
                </div>
                <div>
                  <h5>Previous Commands:</h5>
                  <ul>
                    {this.state.commands.map((command, i) => (
                      <li key={i}><pre>{command}</pre></li>
                    ))}
                  </ul>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
    );
  }
}

export default App;