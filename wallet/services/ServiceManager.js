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
        this.services = {};
        this.pending_requests = {};
        this.admin_handles = [];
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
     * @param {IService} the service instance to register
     * @return {bool}
     */    
    registerAdminHandler(func)
    {
        this.admin_handles.push(func);
    }


    /**
     * Emit an admin event to all admin event listeners
     * @param {string} someParam
     * @return {string}
     */    
    emit(event)
    {
        // This is not a production grade event system!!!
        // This function could be expanded to route events intelligently, considering roles and functions. All we do now, is broadcast to any bound handle.
        this.admin_handles.forEach((func)=>{
            func(event);
        })        
    }
    
    /**
     * Request a user run a command for you, that you can not run
     * @param {string} command a string command
     * @param {string} role a string matching a supported role
     * @param {Object} args in valid JSON/Object
     * @return {Object}
     */        
    request(service,role,command,args){
        let req = {}
        let uid = Date.now().toString() + Math.floor(Math.random() * 100).toString();
        req['id'] = uid;
        req['service'] = service;
        req['role'] = role;
        req['command'] = command;
        req['args'] = args;
        req['promise_response'] = new Promise((resolve, reject) => {
            let timeoutId = setTimeout(() => {
                delete this.pending_requests[uid];
                reject(new Error("Promise timed out after 2 minutes")); }, 120000);            
            
            req['func_reject'] = (val) => {
                delete this.pending_requests[uid];
                clearTimeout(timeoutId);
                reject(val); };

            req['func_resolve'] = (val) => {
                delete this.pending_requests[uid];
                clearTimeout(timeoutId);
                resolve(val);}; 
          });
        this.pending_requests[uid] = req;
        this.emit(req); // emit an event, noting a request has arrived that needs attention
        return req['promise_response'] // Return the promise for awaiting, so the requester can just hang off this.
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
        {
            console.log(role);
            console.log(Object.keys(roleCommandsMap[role]));
            return {"error":"Command '"+command+"' not supported in the Service."}        
        }
        let func = roleCommandsMap[role][command];
        
        let event = {...args};

        event['service'] = service;
        event['command'] = command;
        event['role'] = role;
        //event['example_metadata']= 'ran command';
        //this.emit(service, event); // emit an event, noting a function call
        return func(args,event);
    }    
}

module.exports = ServiceManager;