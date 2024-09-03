import { MongoClient } from 'mongodb';

const port = process.env.DB_PORT || 27017;
const host = process.env.DB_HOST || 'localhost';
const database = process.env.DB_NAME || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    this.connected = false;
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        this.dataBase = client.db(database);
        this.connected = true;
      } else {
        console.log(err.message);
        this.connected = false;
      }
    });
  }

  isAlive() {
    return this.connected;
  }

  async nbUsers() {
    const usersCollection = this.dataBase.collection('users');
    const numberOfDocuments = await usersCollection.countDocuments();
    return numberOfDocuments;
  }

  async nbFiles() {
    const usersCollection = this.dataBase.collection('files');
    const numberOfDocuments = await usersCollection.countDocuments();
    return numberOfDocuments;
  }
}

const dbClient = new DBClient();
export default dbClient;
