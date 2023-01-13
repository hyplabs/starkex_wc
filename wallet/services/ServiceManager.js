/**
 * ServiceManager class
 * The service manager allows the easy modular linking of multiple services
 * into consumers (like CLI Interfaces, WalletConnect, and dApps).
 * Importantly, the Service Manager tests emulate a browser and nodejs enviornment, so you
 * can feel somewhat confident that your wallet application can work anywhere.
 * 
 * The ServiceManager provides Services:
 * Examples include: ethers.js, starkEx.js, and other classes
 * The ServiceManager allows for Interfaces:
 * Examples include: CLI, WalletConnect
 *  
 * The major objects within Service Manager are 
 *  - services - Services are defined as Objects that imlement the IService interface.
 *  --- events - Both Interfaces and Services may subscribe to events. Only Services emit events.
 *  --- commands - Each Service has a list of commands, which are simply functions which take a JSON object as an argument.
 *  - roles - There are two roles. User, and Admin. In IServices, each command is required to be configured for a User or Admin.
 * ----Typically a local wallet CLI will be granted Admin access, whereas a dApp will be granted User access. In general Users can not see private keys, or inspect other secret data. 
 */
class ServiceManager {
    /**
     * Create a new ServiceManager instance.
     * @constructor
     */    
    constructor() {
        this.services = {}
    }

    /**
     * Returns the string "foo".
     * @param {IService} the service instance to register
     * @return {bool}
     */    
    registerService(iServiceInstance)
    {
        if (this.services[iServiceInstance.serviceName()] != undefined)
            return false
        this.services[iServiceInstance.serviceName()] = iServiceInstance
        return true;
    }

    /**
     * Returns the string "foo".
     * @param {string} someParam
     * @return {string}
     */
    foo(someParam){
        return "foo"
    }


    /**
     * Emit an event to all event listeners
     * @param {string} someParam
     * @return {string}
     */    
    emit(iserviceName, event)
    {
        console.log("EVENT "+ iserviceName);
        console.log(event);
    }
    
    
    /**
     * Run a command, and return some result after.
     * @param {string} command a string command
     * @param {string} role a string matching a supported role
     * @param {Object} args in valid JSON/Object
     * @return {Object}
     */        
    run(service,role,command,args){
        if(!(Object.keys(this.services).includes(service)))
            return {"error":"Do not have a service '"+service+"' registered."}
        if(!(['admin','user'].includes(role)))
            return {"error":"Do not have a role '"+role+"'  supported."}        
        if(this.services[service].methodRoles == undefined)
            return {"error":"Could not find methodRoles in the selected service"}
        
        let roleCommandsMap = this.services[service].methodRoles();        
        if(!(Object.keys(roleCommandsMap).includes(role)))
            return {"error":"Do not have a role '"+role+"'  supported in the Service."}        

        if(!(Object.keys(roleCommandsMap[role]).includes(command)))
            return {"error":"Command '"+command+"' not supported in the Service."}        
        let func = roleCommandsMap[role][command];
        
        let event = {...args};

        event['service'] = service;
        event['command'] = command;
        event['role'] = role;
        //event['example_metadata']= 'ran command';
        this.emit(service, event); // emit an event, noting a function call
        return func(args,event);
    }    
}


/**
 * IService Interface (class)
 * Simply cut and paste IService into ./services, and customize, to add a new service into the ServiceManager
 */
class IService {
    /**
     * Create a new ServiceManager instance.
     * @param {Object} serviceManager our Service Manager
     * @constructor
     */    
    constructor(serviceManager) {
        this.serviceManager = serviceManager;
        this.hello_message = "hello world";
    }


    /**
     * Echo the Object back as a JSON string
     * @param {Object} arg as json / Object 
     * @return {String}
     */  
    hello_world(args){
        return this.hello_message;
    }

    /**
     * Echo the Object back as a JSON string
     * @param {Object} arg as json / Object 
     * @return {Object}
     */  
    echo_args(args){
        return JSON.stringify(args);
    }

    /**
     * set the hello world message
     * @param {Object} arg with {'message':String} 
     * @return {bool}
     */      
    set_hello(args){
        if (args.message == undefined)
            return {'error':'no message defined'}
        this.hello_message = args['message'];
        return true;
    }

    /**
     * The name of the current Service
     * @return {string}
     */        
    serviceName(){
        return "iservice"
    }


    /**
     * Run a command, and return some result after.
     * @param {Object} args Arguments intended for your command
     * @param {Object} metadata associated with your command (command, service, role)
     * @return {Object}
     */        
    run(args,metadata){
        let event = {...metadata};
        //this.serviceManager.emit(this.serviceName(), metadata); // emit an event
        return this[metadata['command']](args);
    }

    /**
     * Return a dictionary that defines all methods, and roles that can access that method
     * @return {Object}
     */    
    methodRoles(){
        return {
            "admin": {"hello_world":this.run.bind(this), 
                     "echo_args":this.run.bind(this), 
                     "set_hello":this.run.bind(this)},
            "user" : {"echo_args":this.run.bind(this), 
                    "hello_world":this.run.bind(this)}
        };
    }    
} 

module.exports = ServiceManager;
module.exports.IService = IService;