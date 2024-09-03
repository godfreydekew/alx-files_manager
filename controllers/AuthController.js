import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const base64 = require('base-64');
const { ObjectId } = require('mongodb');

class AuthController {
  static async getConnect(req, res) {
    const encoded = req.headers.authorization.split(' ')[1];
    const decoded = base64.decode(encoded);
    const [email, password] = decoded.split(':');

    if (dbClient.isAlive()) {
      const user = await dbClient.dataBase.collection('users').findOne({ email });
      // Check if user exists
      if (user && sha1(password) === user.password) {
        const token = uuidv4();
        const redisKey = `auth_${token}`;
        try {
          // Store the token in Redis
          await redisClient.set(redisKey, user._id.toString(), 3600);
          return res.status(200).json({ token });
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  static async getDisconnect(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    const redisKey = `auth_${xToken}`;

    const user = await redisClient.get(redisKey);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      await redisClient.del(redisKey);
      return res.status(204);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getMe(req, res) {
    // Implementation for getting the user's info (based on the token)
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    const redisKey = `auth_${xToken}`;
    const user = await redisClient.get(redisKey);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const userDetails = await dbClient.dataBase.collection('users').findOne({ _id: new ObjectId(user) });
      return res.status(200).json({ id: user, email: userDetails.email });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default AuthController;
