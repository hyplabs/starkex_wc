import React, { Component } from 'react';
import { Navbar, Nav, Form, FormControl, Button,  } from 'react-bootstrap';
import { Container, Row, Col } from 'react-bootstrap';
import MainComponent from './components/MainComponent';
import { Web3Modal } from '@web3modal/standalone'
const WCApp = require(  './components/WCApp.js'); 

// IMPORTANT CONSTANTS. FILL THESE IN.
// These constants are here, so as a developer you can just focus on understanding
// However, you should set up environment variables for any production application.
const c_projectID = 'b700887b888adad39517894fc9ab22e1'; // This is the WalletConnect project ID for the wallet you are making / using
const c_starkProvider = "https://gw.playground-v2.starkex.co"; // This is the gateway you would like to talk to
const c_ethProvider = "https://goerli.infura.io/v3/37519f5fe2fb4d2cac2711a66aa06514"; // This is the gateway you would like to talk to


// TRAINING COMMANDS - some toy commands to play with
let g_exampleCommands = {}  
g_exampleCommands['eth.transfer'] = {
        service:"eth",
        type:"run",
        command:"signAndSend",
        args:{
            to: "31349e0c9d36f3d11b980df145a1abc871399b8a",
            value: "0.001",
            gasPrice: "2000000000",
            gasLimit: "21000",
            type:1,
            chainId: 5,
            }    
}

g_exampleCommands['stark.getFirstUnusedTxId'] = {
        service:"starkexgate",
        type:"request",
        command:"getFirstUnusedTxId",
        args: {}   
} 

g_exampleCommands['stark.send'] = {
        service:"starkexgate",
        type:"request",
        command:"sendTransaction",
        args: {
          "type": "DepositRequest",
          "tokenId": '0x0b333e3142fe16b78628f19bb15afddaef437e72d6d7f5c6c20c6801a27fba6',
          "amount": '1000',
          "vaultId": 1,
          "starkKey": '0x041ee3cca9025d451b8b3cc780829ec2090ef538b6940df1e264aaf19fb62f80',
          }   
} 

g_exampleCommands['stark.sign_message'] = {
        service:"starkex",
        type:"request",
        command:"sign_message",
        args: {"type":"TransferRequest",
              amount: '1000',
              nonce: 1519522183,
              senderPublicKey: '0x59a543d42bcc9475917247fa7f136298bb385a6388c3df7309955fcb39b8dd4',
              senderVaultId: 1,
              token: '0x3003a65651d3b9fb2eff934a4416db301afd112a8492aaf8d7297fc87dcd9f4',
              receiverPublicKey: '0x5fa3383597691ea9d827a79e1a4f0f7949435ced18ca9619de8ab97e661020',
              receiverVaultId: 1,
              expirationTimestamp: 438953}  
} 

class App extends Component {
  constructor(props)
  {
    super(props);  
    this.projectId = c_projectID;
    this.namespaces = {
      eip155: { methods: ['generate_account',
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
    this.selectedOption = "";
    this.exampleCommands = g_exampleCommands;
  }
    
  state = {
    stateInfoArea: "",
    commands: [],
    selectedQuery: ""  
  };


  handleSelectChange = (event) => {
    this.selectedOption = event.target.value;
    this.setState({ selectedQuery:JSON.stringify(this.exampleCommands[this.selectedOption],null,2) });
  };
    

  handleQuery = async () => {
      let query = JSON.parse(this.state.selectedQuery)
      if (query.command == "signAndSend")
          return this.signAndSend(query);
      if (query.type == "request")
          return await this.request(query.command,query.service,query.args);
      if (query.type == "run")
          return await this.run(query.command,query.service,query.args);
  }

  signAndSend = async (query) => {
    if (query.service == "eth")
    {
        if (this.userInfo.ethPrivateAccount == undefined)
        {
            alert("Please generate an ETH account first")
            return;
        }          
        let signedEthTransaction = await this.run("signTransaction","eth",query.args);
        query.args = {"hex":signedEthTransaction};
        let sentEthTransaction = await this.run("sendTransaction","ethgate",query.args);
        return {signedEthTransaction, sentEthTransaction};
    }
    if (query.service == "stark")
    {
        alert("not yet")
    }      
  }
  
  sign = async (query) => {
    if (query.service == "eth")
    {
        if (this.userInfo.ethPrivateAccount == undefined)
        {
            alert("Please generate an ETH account first")
            return;
        }
        let signedEthTransaction = await this.run("signTransaction","eth",query.args);
        return {signedEthTransaction};
    }
    if (query.service == "stark")
    {
        return await this.request( "sign_message", "stark", query.args);
    }      
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
  handleStarkGenerateAccount = async () => {
    let results = {}
    if (this.userInfo.ethPrivateAccount == undefined)
    {
        alert("Please generate an ETH account first")
        return;
    }
    if (this.userInfo.starkResponse != undefined)
    {
        alert("You have already set up a stark account")
        return;
    }
    results.starkProvider =  c_starkProvider;
    results.starkResponse = await this.request("generate_stark_account_from_private_key","starkex",{'privateKey':this.userInfo.ethPrivateAccount.privateKey}); 
    results.starkAccount = await this.request("select_account","starkex",{starkKey:results.starkResponse.starkKey});
    this.userInfo = { ...this.userInfo,...results}      
    this.setInfo(JSON.stringify(this.userInfo,null,2));
  }
    
  handleEthGenerateAccount = async () => {
    let results = {}
    if (this.userInfo.ethPrivateAccount != undefined)
    {
        alert("You already have an account setup")
        return;
    }
    results.ethProvider =  c_ethProvider;
    await this.run("set_gateway","ethgate",   {"providerUrl":results.ethProvider});
    results.ethResponse = await this.run("generate_account","eth",{});
    results.ethAccount  = await this.run("select_account","eth",{publicKey: results.ethResponse.publicKey}); 
    results.ethPrivateAccount  = await this.run("expose_account","eth",{publicKey: results.ethResponse.publicKey}); 
    this.userInfo = { ...this.userInfo,...results}      
    this.setInfo(JSON.stringify(this.userInfo,null,2));      
  }

  doStarkDeposit = async () => {

    alert ("Soon I will do a full Stark transfer!")
      
  }

  doStarkTransfer = async () => {
    alert ("Soon I will do a full Stark transfer!")
  }


  addToCommands = command => {
    this.setState({ commands: [ command,...this.state.commands] });
  };
  setInfo = info => {
    this.setState({ stateInfoArea: info });
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
        <Container>
          <Row>
            <Col xs={12} md={4}>
              <Form xs={12} md={4}>
                <Form.Group>
                  <Form.Control
                    type="button"
                    value="Connect"
                    onClick={this.handleConnect}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="button"
                    value="Generate ETH Account"
                    onClick={this.handleEthGenerateAccount}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="button"
                    value="Get public key"
                    onClick={this.handleStarkGenerateAccount}
                  />
                </Form.Group>
              <Form.Group controlId="transactionSelect">
                  <Form.Control
                    as="select"
                    value={this.selectedOption}
                    onChange={this.handleSelectChange}
                  >
                    <option value="">Select...</option>
                      {Object.keys(this.exampleCommands).map((key) => (
                        <option key={key} value={key}>
                          {key}
                        </option>
                      ))}
                  </Form.Control>
                  <Form.Control as="textarea" rows="15" 
                    defaultValue={this.state.selectedQuery}
                    onChange={(event) => this.setState({ selectedQuery: event.target.value })}
                  />
            <Form.Control
                    type="button"
                    value="Run Query"
                    onClick={this.handleQuery}
                  />
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