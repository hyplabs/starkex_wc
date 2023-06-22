import React, { Component } from 'react';
import { Navbar, Nav, Form, FormControl, Button,  } from 'react-bootstrap';
import { Container, Row, Col } from 'react-bootstrap';
import { Web3Modal } from '@web3modal/standalone'
const WCApp = require(  './components/WCApp.js'); 
const config = require(  './config.json'); 
const transactions = require(  './transactions.json'); 

const c_projectID = config.projectID;
const c_starkProvider = config.starkProvider;
const c_ethProvider = config.ethProvider; 
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

transactions.forEach((t)=>{
    if (['spot','perpetual','spot_signed','perpetual_signed'].includes( t.test_type))
    {
        t.systemId = "sys_0";
        let command = "send";
        if (t.test_type.includes("_signed"))
            command = "signAndSend";
        
        g_exampleCommands[t.gui_label] = {
            service:"starkex",
            type:"request",
            command:command,
            args: t         
        }
    }
        
})

g_exampleCommands['stark.sign_message'] = {
        service:"starkex",
        type:"request",
        command:"signAndSend",
        args: {"type":"TransferRequest",
              systemId: "0",
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
      if (query.command == "send")
          return this.send(query);
      if (query.type == "request")
          return await this.request(query.command,query.service,query.args);
      if (query.type == "run")
          return await this.run(query.command,query.service,query.args);
  }
  /*  signAndSend - *Example compound transaction*
      Sign and send both signs a local ETH transaction, it also sends the signed transaction
      Mostly, however, this is an example of how to create a compound transaction within
      the App.js. You can use this function as inspiration when developing your own
      multi-step queries
  */
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
    if (query.service == "starkex")
    {  
        if (this.userInfo.starkProvider == undefined)
        {
            alert("Please set up a stark account with the above button")
            return;
        }          
        let req = query.args;
        req['nonce'] = Math.floor(Math.random() * 900000) + 100000;
        let sig = await this.request( "sign_message", "starkex", query.args);
        req['signature'] = sig;
        if (req.test_type.includes("spot"))
            await this.run( "set_gateway", "starkexgate", {"providerUrl":"https://gw.playground-v2.starkex.co",
                                                      "getFirstUnusedTxIdUrl":"/v2/gateway/testing/get_first_unused_tx_id"});
        else
            await this.run( "set_gateway", "starkexgate", {"providerUrl":"https://perpetual-playground-v2.starkex.co",
                                                      "getFirstUnusedTxIdUrl":"/get_first_unused_tx_id"});
                
        let sent = await this.run("sendTransaction","starkexgate",req);
        return {req, sent};
    }      
  }
  send = async (query) => {
    if (query.service == "eth")
    {
        if (this.userInfo.ethPrivateAccount == undefined)
        {
            alert("Please generate an ETH account first")
            return;
        }          
        let sentEthTransaction = await this.run("sendTransaction","ethgate",query.args);
        return {sentEthTransaction};
    }
    if (query.service == "starkex")
    {  
        if (this.userInfo.starkProvider == undefined)
        {
            alert("Please set up a stark account with the above button")
            return;
        }          
        let req = query.args;
        req['nonce'] = Math.floor(Math.random() * 900000) + 100000;
        await this.run( "set_gateway", "starkexgate", {"providerUrl":this.userInfo.starkProvider,
                                                      "getFirstUnusedTxIdUrl":"/v2/gateway/testing/get_first_unused_tx_id"});
        
        let sent = await this.run("sendTransaction","starkexgate",req);
        return {sent};
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
          this.web3Modal.closeModal()
          let sessionApproval = res;
          this.userInfo.connected =  true;
          this.setInfo(JSON.stringify(this.userInfo,null,2));      
        }
      } catch (err) {
        console.error(err)
      }
  }

    /**
     * With admin approval, lets actually expose keys. The Wallet will have to voluntairly send this data over.
     * (Go ahead and try to say Y and then N to these requests in the /wallet/index.js application)
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
    let starkKeyData = await this.request("generate_stark_account_from_private_key","starkex",{'privateKey':this.userInfo.ethPrivateAccount.privateKey}); 
    results.starkKey = starkKeyData.starkKey;
    results.starkAccount = starkKeyData.account;
    results.starkSelected = await this.request("select_account","starkex",{starkKey:results.starkKey});
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
    let ethAcct = await this.run("generate_account","eth",{});    
    await this.run("set_gateway","ethgate",   {"providerUrl":results.ethProvider});
    results.ethPrivateAccount  = await this.run("expose_account","eth",{publicKey: ethAcct.publicKey}); 
    this.userInfo = { ...this.userInfo,...results}      
    this.setInfo(JSON.stringify(this.userInfo,null,2));      
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
                    value="1. create browser eth keys"
                    onClick={this.handleEthGenerateAccount}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    type="button"
                    value="2. connect to stark-wallet"
                    onClick={this.handleConnect}
                  />
                </Form.Group>    
                <Form.Group>
                  <Form.Control
                    type="button"
                    value="3. create stark-wallet key"
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
                  <Form.Control as="textarea" rows="7" 
                    defaultValue={this.state.selectedQuery}
                    onChange={(event) => this.setState({ selectedQuery: event.target.value })}
                  />
            <Form.Control
                    type="button"
                    value="4. run example query"
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