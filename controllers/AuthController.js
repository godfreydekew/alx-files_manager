import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import base64 from 'base-64';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encoded = authorizationHeader.split(' ')[1];
    const decoded = base64.decode(encoded);
    const [email, password] = decoded.split(':');

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    if (dbClient.isAlive()) {
      const user = await dbClient.dataBase.collection('users').findOne({ email });
      if (user && sha1(password) === user.password) {
        const token = uuidv4();
        const redisKey = `auth_${token}`;
        try {
          await redisClient.set(redisKey, user._id.toString(), 86400); // 24 hours
          return res.status(200).json({ token });
        } catch (error) {
          return res.status(500).json({ error: 'Failed to store token in Redis' });
        }
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    } else {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  static async getDisconnect(req, res) {
    const xToken = req.headers['x-token'];
    if (!xToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const redisKey = `auth_${xToken}`;
    const userId = await redisClient.get(redisKey);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      await redisClient.del(redisKey);
      return res.status(204).end(); // 204 No Content
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete token from Redis' });
    }
  }
}

export default AuthController;
