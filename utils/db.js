
const { MongoClient } = require('mongodb');

const port = process.env.DB_PORT || 27017;
const host = process.env.DB_HOST || 'localhost';
const db_name = process.env.DB_NAME || 'files_manager';

class DBClient {
    constructor(db) {
            this.connected = false;
            this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
            this.client.connect();
            this.connected = true;
            this.db = this.client.db(db_name);
    };

    isAlive() {
        return this.connected;
    }

    async nbUsers() {
        const usersCollection = this.db.collection('users');
        const numberOfDocuments = await usersCollection.countDocuments();
        return numberOfDocuments;
    }

    async nbFiles() {
        const usersCollection = this.db.collection('files'); 
        const numberOfDocuments = await usersCollection.countDocuments();
        return numberOfDocuments;
    }

}

const dbCLient = new DBClient;
export default dbCLient;

