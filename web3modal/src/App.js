import React, { Component } from 'react';
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';
import { Container, Row, Col } from 'react-bootstrap';
import MainComponent from './components/MainComponent';

// The important stuff
import { Web3Modal } from '@web3modal/standalone'
const WCApp = require(  './components/WCApp.js'); 
// See this file for examples of how to use SignClient directly.
// WCApp is structured this way, so that this module can be unit tested by running npm test

class App extends Component {
  constructor(props)
  {
    super(props);  
    this.projectId = 'b700887b888adad39517894fc9ab22e1'
    this.namespaces = {
      eip155: { methods: ['personal_sign','generate_eth_account'], 
                chains: ['eip155:1'], 
                events: ['accountsChanged'] }
    }
    this.web3Modal = new Web3Modal({ projectId:this.projectId, standaloneChains: this.namespaces.eip155.chains })
    //let sessionApproval = undefined;
    //let signClient = undefined;
    this.app = new WCApp();   
  
  }
  
  
  handleConnect = async () => {
      try {
        
        //const { uri, approval } = await signClient.connect({ requiredNamespaces: namespaces })
        const { deep_link, approval } = await this.app.doConnect(this.namespaces,this.projectId);
        //let appConnectPromise = app.listen();   
        let uri = deep_link;

        if (uri) {
          this.web3Modal.openModal({ uri })
          let res = await approval; // WHAT
          console.log("Connected 2");
          console.log(res)
          this.web3Modal.closeModal()
          let sessionApproval = res;
          //handleWalletEvents(signClient);
          
        }

      } catch (err) {
        console.error(err)
      }

    

  }

  handleGenerateAccount = () => {
    // JavaScript handler for the "Generate Account" button
  }

  handleGetAccountData = () => {
    // JavaScript handler for the "Get Account Data" button
  }

  handleSignTransaction = () => {
    // JavaScript handler for the "Sign Transaction" button
  }

  handleSendTransaction = () => {
    // JavaScript handler for the "Send Transaction" button
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
            <Nav.Link href="#user-sign-in"><i className="fas fa-user-circle"></i></Nav.Link>
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
                  <Form.Control type="button" value="Connect" onClick={this.handleConnect} />
                  <Form.Text className="text-muted">
                      This button will connect to the network.
                  </Form.Text>
              </Form.Group>
              <Form.Group>
                  <Form.Label>Generate Account</Form.Label>
                  <Form.Control type="button" value="Generate Account" onClick={this.handleGenerateAccount} />
                  <Form.Text className="text-muted">
                      This button will generate a new account.
                  </Form.Text>
              </Form.Group>
              <Form.Group>
                  <Form.Label>Get Account Data</Form.Label>
                  <Form.Control type="button" value="Get Account Data" onClick={this.handleGetAccountData} />
                  <Form.Text className="text-muted">
                      This button will retrieve data for the current account.
                  </Form.Text>
              </Form.Group>
              <Form.Group>
                  <Form.Label>Sign Transaction</Form.Label>
                  <Form.Control type="button" value="Sign Transaction" onClick={this.handleSignTransaction} />
                  <Form.Text className="text-muted">
                      This button will sign the current transaction.
                  </Form.Text>
              </Form.Group>
              <Form.Group>
                  <Form.Label>Send Transaction</Form.Label>
                  <Form.Control type="button" value="Send Transaction" onClick={this.handleSendTransaction} />
                  <Form.Text className="text-muted">
                      This button will send a dummy transaction.
                  </Form.Text>
              </Form.Group>
          </Form>
        </Col>
        </Row>
        </Container>

        </div>
      </div>
    );
  }
}

export default App;