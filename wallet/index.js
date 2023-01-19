const readline = require('readline');
const  Wallet  = require('./wallet.js');


let admin = undefined;
let main = async () =>{
  admin = new Wallet();
  await admin.wc_listen();   
  console.log("running"); 
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('line', async (input) => {
  const words = input.split(' ');
  const command = words[0];
  const args = words.slice(1); 

  if (command === 'echo') {
    console.log(`Echoing: ${args.join(' ')}`);

  } else if (command === 'test_emit') {      
      let topics = Object.keys(system_topics);
  
  } else if (command === 'session_list') {
    console.log(system_topics);

  } else if (command === 'add') {
    const result = args.reduce((acc, val) => acc + Number(val), 0);
    console.log(`Result: ${result}`);

  } else if (command === 'auth') {
      // AUTH OF DEEP LINk
      console.log("Pairing.. "+args[0]);
      await admin.wc_pair(args[0]); // Wallet looks for pairing at relay
      
  } else {
    console.log(`Unknown command: ${command}`);
  }
});
rl.prompt();
main();
//rm -rf node_modules/.cache/