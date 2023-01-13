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


test('Test ServiceManager registration with ethers.js', async () => {
  // Test the CLI and Website interaction. To do this, we will start two threads, and run some scrip
  
  
  
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


const { spawn } = require('./wallet_conversation_process');

test('spawn a child thread', () => {
  // spawn the child thread
  const child = spawn('node', ['child.js']);

  // send data to the child thread
  child.stdin.write('hello from parent');

  // listen for data from the child thread
  child.stdout.on('data', (data) => {
    console.log(`child said: ${data}`);
  });

  // listen for the child thread to exit
  child.on('exit', (code) => {
    console.log(`child exited with code ${code}`);
  });

  // make sure to kill the child process when the test is done
  afterAll(() => {
    child.kill();
  });
});


/**
 const { Worker } = require('worker_threads');

test('spawn a child thread', () => {
  // spawn the child thread
  const worker = new Worker('./child.js');

  // listen for data from the child thread
  worker.on('message', (data) => {
    console.log(`child said: ${data}`);
  });

  // send data to the child thread
  worker.postMessage('hello from parent');

  // listen for the child thread to exit
  worker.on('exit', (code) => {
    console.log(`child exited with code ${code}`);
  });

  // make sure to terminate the worker when the test is done
  afterAll(() => {
    worker.terminate();
  });
});

node --experimental-worker your-script.js
npx jest --experimental-worker your-script.js
 * 
 * 
 */
