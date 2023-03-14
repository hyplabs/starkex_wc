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
          console.log('Error submitting request: ' + response.statusText);
          return { "error": response.statusText };
        }
        const data = await response.json();
        console.log('Request submitted successfully!', data);
        return data;
      } catch (error) {
        console.error('Error submitting request:', error);
        return { "error": error.toString() };
      }
    }

    async post(args, target_path) {
      let tx_id = 0;
      try {
        if (!this.endpoint)
          return { "error": "no endpoint set" };
        if (!args.txId)
          return { "error": "no transaction id" };

        tx_id = args.txId;
        delete args.txId;

        const response = await fetch(this.endpoint + target_path, {
          method: 'POST',
          body: JSON.stringify({ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.log('(A) Error submitting request:', response.statusText,{ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id });
          return { "error": response.statusText,"data":{ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id } };
        }

        const data = await response.json();
        console.log('Request submitted successfully!', data);
        return data;
      } catch (error) {
        console.log('(B) Error submitting request:', error,{ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id });
        return { "error": error.toString(),"data":{ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id } };
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