import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check for missing email
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check for missing password
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Ensure database connection is alive
    if (dbClient.isAlive()) {
      try {
        // Check if user already exists
        const user = await dbClient.dataBase.collection('users').findOne({ email });
        if (user) {
          return res.status(400).json({ error: 'Already exist' });
        }

        // Hash the password and insert the new user
        const hashedPassword = sha1(password);
        const result = await dbClient.dataBase.collection('users').insertOne({ email, password: hashedPassword });

        // Respond with the new user details
        return res.status(201).json({ id: result.insertedId.toString(), email });
      } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
}

export default UsersController;
