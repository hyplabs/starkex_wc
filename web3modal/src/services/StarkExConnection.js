/**
 * StarkExWalletGateway: IService
 * An implementation of a wallet + gateway combination. Partial implementation meant to be instuctive in nature.
 */
class Gateway
{
    constructor(endpoint,apiInstance) 
    {
        this.endpoint = endpoint; 
    }
    convertKeysToSnakeCase(obj) {
      if (obj === null || obj === undefined) {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map((value) => this.convertKeysToSnakeCase(value));
      }
      if (typeof obj !== "object") {
        return obj;
      }
      const snakeCaseObj = {};
      for (let [key, value] of Object.entries(obj)) {
        const snakeCaseKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        snakeCaseObj[snakeCaseKey] = this.convertKeysToSnakeCase(value);
      }
      return snakeCaseObj;
    }    
    
    async get(target_path) {
      try {
        const response = await fetch(this.endpoint + target_path, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return { "error": response.statusText };
        }
        const data = await response.json();
        return data;
      } catch (error) {
        return { "error": error.toString() };
      }
    }

    async post(args, target_path,as_transaction = false) {
      let tx_id = 0;
      let reqs = { "error": "no request generated" };
      
      try {
        if (!this.endpoint)
          return { "error": "no endpoint set" };
        if (!args.txId)
          return { "error": "no transaction id" };

        tx_id = args.txId;
        delete args.txId;
        
        if (as_transaction == true)
            reqs = { "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id };
        else
            reqs = this.convertKeysToSnakeCase(args) ;
            
        const response = await fetch(this.endpoint + target_path, {
          method: 'POST',
          body: JSON.stringify(reqs),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          return { "error": response.statusText,"data":reqs };
        }

        const data = await response.json();
        return data;
      } catch (error) {
        return { "error": error.toString(),"data":reqs };
      }
    }
}

class StarkExAPI {
    constructor(args) 
    {
        this.endpoint = args.endpoint; 
        this.gateway = new Gateway(this.endpoint);
    }
} 
module.exports = StarkExAPI;