
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

//export default IService;
module.exports = IService;