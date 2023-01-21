//import SQL from 'sql.js';


//const initSqlJs = require('sql.js');
// or if you are in a browser:
// const initSqlJs = window.initSqlJs;
import initSqlJs from 'sql.js'

const SQL = await initSqlJs({
    // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
    // You can omit locateFile completely when running in node
    //locateFile: file => `https://sql.js.org/dist/${file}`
  });

class StorageEngine {
    // Initialize SQL.js
    constructor() {
        this.db = new SQL.Database();
        this.createKVStoreTable();
    }

    // Create a key-value store table
    createKVStoreTable() {
        this.db.run("CREATE TABLE kvstore (key TEXT PRIMARY KEY, value TEXT);");
    }

    // Insert key-value store data
    insertKVStoreData(key, value) {
        this.db.run("INSERT INTO kvstore (key, value) VALUES (?, ?)", [key, value]);
    }

    getValueForKey(key) {
        let result = this.db.exec("SELECT value FROM kvstore WHERE key = ?", [key]);
        if (result[0]) {
            return result[0].values[0][0];
        } else {
            return undefined;
        }
    }    
}

export default StorageEngine;