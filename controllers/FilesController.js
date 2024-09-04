import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    const redisKey = `auth_${xToken}`;

    const user = await redisClient.get(redisKey);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.body.parentId || 0;
    const isPublic = req.body.isPublic || false;
    const { name, type, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || ['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') { return res.status(400).json({ error: 'Missing tyepe' }); }

    if (parentId) {
      // Check if parent exists
      const file = await dbClient.dataBase.collection('files').findOne({ parentId });
      if (!file) { return res.status(404).json({ error: 'Parent not found' }); }

      if (file.type !== 'folder') { return res.status(404).json({ error: 'Parent is not a folder' }); }
    }
  }
}

export default FilesController;
