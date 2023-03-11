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
    
    async getFirstUnusedTxId() {
      try {
        const response = await fetch(this.endpoint + '/v2/gateway/testing/get_first_unused_tx_id', {
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

    async deposit(args){
        return await this.send(args,'/v2/gateway/add_transaction')    
    }
    async transfer(args){
        return await this.send(args,'/v2/gateway/add_transaction')
    }
    async withdrawal(args){
        return await this.send(args,'/v2/gateway/add_transaction')
    }    
    async send(args, target_path) {
      try {
        if (!this.endpoint)
          return { "error": "no endpoint set" };
        if (!args.txId)
          return { "error": "no transaction id" };

        const tx_id = args.txId;
        delete args.txId;

        const response = await fetch(this.endpoint + target_path, {
          method: 'POST',
          body: JSON.stringify({ "tx": this.convertKeysToSnakeCase(args), "tx_id": tx_id }),
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
}

class StarkExAPI {
    constructor(args) 
    {
        this.endpoint = args.endpoint; 
        this.gateway = new Gateway(this.endpoint);
    }
} 
module.exports = StarkExAPI;