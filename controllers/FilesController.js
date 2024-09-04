import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];

    const userId = await redisClient.get(`auth_${xToken}`);
    if (!userId) { return res.status(401).json({ error: 'Unauthorized' }); }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) { return res.status(400).json({ error: 'Missing name' }); }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    console.log('Uploading');

    if (!data && type !== 'folder') { return res.status(400).json({ error: 'Missing data' }); }

    if (parentId !== 0) {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!file) { return res.status(404).json({ error: 'Parent not found' }); }

      if (file.type !== 'folder') { return res.status(404).json({ error: 'Parent is not a folder' }); }
    }

    const fileInfo = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    // parentId = user._id;
    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne({ ...fileInfo });

      res.status(200).json({ id: result.insertedId, ...fileInfo });
    } else {
      // create the folder

      const relativePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(relativePath)) {
        fs.mkdirSync((relativePath));
      }
      const identity = uuidv4();
      const localPath = `${relativePath}/${identity}`;
      fs.writeFile(localPath, data, 'base64', (err) => {
        if (err) console.log(err);
      });
      const newFile = await dbClient.db.collection('files').insertOne({
        ...fileInfo,
        localPath,
      });
      res.status(201).json({ id: newFile.insertedId, ...fileInfo });
    }
  }
}

export default FilesController;
