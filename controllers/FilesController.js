import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import mongoDBCore from 'mongodb/lib/core';

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

    if (!data && type !== 'folder') { return res.status(400).json({ error: 'Missing data' }); }

    if (parentId) {
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!file) { return res.status(400).json({ error: 'Parent not found' }); }

      if (file.type !== 'folder') { return res.status(400).json({ error: 'Parent is not a folder' }); }
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
      return res.status(201).json({ id: result.insertedId, ...fileInfo });
    }
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
    return res.status(201).json({ id: newFile.insertedId, ...fileInfo });
  }

  // GET /files => FilesController.getIndex
  static async getIndex(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    const userId = await redisClient.get(`auth_${xToken}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId ? new ObjectId(req.query.parentId) : 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    try {
      const filesList = await dbClient.db.collection('files').aggregate([
        { $match: { userId: new ObjectId(userId), parentId } },
        { $sort: { createdAt: -1 } },
        { $skip: page * pageSize },
        { $limit: pageSize },
      ]).toArray();

      return res.status(200).json(filesList.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        localPath: file.localPath,
      })));
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // GET /files/:id => FilesController.getShow
  static async getShow(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    const userId = await redisClient.get(`auth_${xToken}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Return the file document without MongoDB's internal `_id` field
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // PUT /files/:id/publish => FilesController.putPublish
  static async putPublish(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    if (!xToken) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${xToken}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      file.isPublic = true;
      await dbClient.db.collection('files').updateOne({ _id: file._id }, { $set: file });
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // PUT /files/:id/publish => FilesController.putUnpublish
  static async putUnpublish(req, res) {
    const xToken = req.headers['X-Token'] || req.headers['x-token'];
    if (!xToken) return res.status(401).json({ error: 'Unauthorized' });
    const userId = await redisClient.get(`auth_${xToken}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      file.isPublic = false;
      await dbClient.db.collection('files').updateOne({ _id: file._id }, { $set: file });
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async getFile(req, res) {
    const fileId = req.params.id;
    const fileCollection = dbClient.db.collection('files');
    const file = await fileCollection.findOne({ _id: ObjectId(fileId) });

    if (!file) return res.status(404).json({ error: 'Not found' });

    const token = req.header('X-Token');
    const id = await redisClient.get(`auth_${token}`);
    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(id) });
    if ((!id || !user || file.userId.toString() !== id) && !file.isPublic) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: 'A folder doesn\'t have a content' });
    }

    const { size } = req.query;
    let fileLocalPath = file.localPath;
    if (size) {
      fileLocalPath = `${file.localPath}_${size}`;
    }

    if (!fs.existsSync(fileLocalPath)) return res.status(404).json({ error: 'Not found' });

    const data = await fs.promises.readFile(fileLocalPath);
    const headerContentType = mime.contentType(file.name);
    return res.header('Content-Type', headerContentType).status(200).send(data);
  }
}

export default FilesController;
