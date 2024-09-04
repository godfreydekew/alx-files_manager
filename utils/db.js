import { MongoClient } from 'mongodb';

const port = process.env.DB_PORT || 27017;
const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME || 'files_manager';
const url = `mongodb://${host}:${port}/${database}`;

class DBClient {
  constructor() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.client = client;
    this.client.connect();
    this.db = client.db(database);
  }

  isAlive() {
    if (this.client && this.client.topology && this.client.topology.isConnected()) {
      return true;
    }
    return false;
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

const dbClient = new DBClient();
export default dbClient;
