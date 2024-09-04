import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    if (dbClient.isAlive()) {
      try {
        const user = await dbClient.db.collection('users').findOne({ email });
        if (user) {
          return res.status(400).json({ error: 'Already exist' });
        }

        const hashedPassword = sha1(password);
        const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

        return res.status(201).json({ id: result.insertedId.toString(), email });
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  static async getMe(req, res) {
    const xToken = req.headers['x-token'];
    if (!xToken) { return res.status(401).json({ error: 'Unauthorized' }); }

    const redisKey = `auth_${xToken}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) { return res.status(401).json({ error: 'Unauthorized' }); }
    try {
      const userDetails = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });

      if (!userDetails) { return res.status(401).json({ error: 'Unauthorized' }); }

      return res.status(200).json({ id: userDetails._id.toString(), email: userDetails.email });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
