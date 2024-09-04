import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Basic ')) {
      const token = authHeader.slice(6);
      const decodedCredentials = Buffer.from(token, 'base64').toString('utf-8');
      const userInfo = decodedCredentials.split(':');
      if (!userInfo || userInfo.length !== 2) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const [email, password] = userInfo;
      const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const authToken = uuidv4();
      const authKey = `auth_${authToken}`;
      // set the key to expire in 24hrs
      await redisClient.set(authKey, user._id.toString(), 24 * 60 * 60);
      return res.status(200).json({ token: authToken });
    }
    return res.status(401).json({ error: 'Unauthorized' });
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
      return res.status(204).end();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
