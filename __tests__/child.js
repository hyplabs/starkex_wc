process.stdout.on('data', (message) => {
    console.log(`parent said: ${message}`);
    process.stdout.write('hello from child 2');    
    if (message === 'exit') {
        process.exit();
    }
});
