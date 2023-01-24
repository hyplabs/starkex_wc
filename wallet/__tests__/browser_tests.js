const { JSDOM } = require('jsdom');
const { window } = new JSDOM('', {
  url: "http://localhost",
  resources: "usable",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
 
// Remove or disable Node.js-specific features
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.HTMLElement = window.HTMLElement;
global.XMLHttpRequest = window.XMLHttpRequest;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;

Object.defineProperties(global.navigator, {
  userAgent: { value: "jsdom" },
  platform: { value: "jsdom" },
});

delete global.window.document.createRange;
delete global.window.document.getSelection;
delete global.window.localStorage;


test('Test ServiceManager registration as a browser', () => {
  const dom = new JSDOM();
  global.document = dom.window.document;
  const ServiceManager = require('../services/ServiceManager.js');
  const {IService} = require('../services/ServiceManager.js');
  sm = new ServiceManager();
  expect(sm.foo()).toEqual('foo');


  let resp = sm.run("iservice", "admin", "test_testCommand",{"message":"some data"});
  expect(resp['error']).toEqual("Do not have a service 'iservice' registered.");
    
  let testService = new IService();
  sm.registerService(testService);  
  resp = sm.run("iservice", "new_role", "test_testCommand",{"message":"some data"});
  expect(resp['error']).toEqual("Do not have a role 'new_role'  supported." );
  
  resp = sm.run("iservice", "admin", "fail_testCommand",{"message":"some data"});
  expect(resp['error']).toEqual("Command 'fail_testCommand' not supported in the Service." );
  
  resp = sm.run("iservice", "admin", "hello_world",{});
  expect(resp).toEqual("hello world" );

  resp = sm.run("iservice", "admin", "set_hello",{'message':"new hello"});
  resp = sm.run("iservice", "admin", "hello_world",{});
  expect(resp).toEqual("new hello" );

  console.log(resp);
});

test('Test ServiceManager registration with ethers.js', async () => {
  const dom = new JSDOM();
  global.document = dom.window.document;
  
  // Init
  const ServiceManager = require('../services/ServiceManager.js');
  const EthWalletGateway = require('../services/EthWalletGateway.js');
  sm = new ServiceManager();
  sm.registerService(new EthWalletGateway());  

  // Tests
  let resp = await sm.run("eth_wallet_gateway", "admin", "generate_eth_account",{});
  console.log(resp);
  expect(Object.keys(resp).includes("mnemonic")).toEqual(true);

  resp = await sm.run("eth_wallet_gateway", "user", "generate_eth_account",{});
  console.log(resp);
  expect(resp['error']).toEqual("Command 'generate_eth_account' not supported in the Service.");
    
});
