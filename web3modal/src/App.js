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
                          'select_account',
                          'generate_stark_account_from_public_key',
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
        }
      } catch (err) {
        console.error(err)
      }
      this.userInfo.connected =  true;
      //this.userInfo.starkAccount =  starkAccount;
      this.setInfo(JSON.stringify(this.userInfo,null,2));      
  }

    /**
     * With admin approval, lets actually expose keys. The Wallet will have to voluntairly send this data over.
     * (Go ahead and try to say Y and then N to this request)
     */
  handleGenerateAccount = async () => {
    // Here we demo:
    // (1) ETH private key Generation. This can be used for L1 functions such deposting into StarkEx.
    let ethResponse = await this.app.request("generate_account","eth",{});
    
    // (2) Eth user selection
    let ethAccount  = await this.app.request("select_account","eth",{publicKey: ethResponse.publicKey});
    
    // (3) StarkEx key Generation.
    let starkResponse = await this.app.request("generate_stark_account_from_public_key","starkex",{publicKey: ethResponse.publicKey});
    
    // (4) Stark user selection.
    let starkAccount = await this.app.request("select_account","starkex",{starkKey:starkResponse.starkKey});

    //alert(JSON.stringify(ethAccount));
    //alert(JSON.stringify(starkAccount));
    this.userInfo.publicKey =  ethAccount;
    this.userInfo.starkKey =  starkAccount;
    this.setInfo(JSON.stringify(this.userInfo,null,2));
    // Notes / Next Steps:
    // It is possible to more deeply use SignClient on both the wallet and dApp side to handle session management.
    // This functionality in WC 2.0 is not fully documented, so it may take weeks of hours to tackle this upgrade.
    // Instead, we opted to build session management into the wallet kernel itself, which has the effect that sessions 
    // also propagate to the Command Line, and any other interfaces. It would be a great goal for a repositor contributer
    // to tackle WalletConnect session management under WC 2.0. 

    // It is also possible to list the current accounts, and to ask
    //let publicKeys = await this.app.request("list_accounts","eth_wallet_gateway",{});
  }
  /*
  handleFundingEth = async () => {
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
    let signedEthTransaction = await this.app.request("signTransaction","eth",args);
    alert(JSON.stringify(signedEthTransaction ));


  }*/
  state = {
    stateInfoArea: "",
    commands: []
  };

  addToCommands = command => {
    this.setState({ commands: [...this.state.commands, command] });
  };
  setInfo = info => {
    this.setState({ stateInfoArea: info });
  };
  doAddition = () => {
    this.addToCommands("This is a command");
    this.setInfo("Hellow world");
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
                    This button will connect to the network. In this demo,
                    you will not have an account.
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
                  <Form.Label>Test Add</Form.Label>
                  <Form.Control
                    type="button"
                    value="Generate Account"
                    onClick={this.doAddition}
                  />
                  <Form.Text className="text-muted">
                    This button will generate a new ETH and Stark account.
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
                      <li key={i}>{command}</li>
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