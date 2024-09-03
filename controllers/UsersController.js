import sha1 from 'sha1';
import dbCLient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    console.log('ins');
    const { email, password } = req.body;
    console.log(email);

    if (password === undefined) {
      return res.status(400).json({ error: 'Missing password' });
    }

    if (email === undefined) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if user already exists
    if (dbCLient.isAlive()) {
      const user = await dbCLient.dataBase.collection('users').findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const hashedPassword = sha1(password);
      const result = await dbCLient.dataBase.collection('users').insertOne({ email, hashedPassword });
      const newUserId = result.insertedId;
      return res.status(201).send({ email, id: newUserId });
    }
    return res.status(500).json({ error: 'Database connection failed' });
  }
}

export default UsersController;
