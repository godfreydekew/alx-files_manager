import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import dbClient from './utils/db';

const queue = new Queue('fileQueue');

queue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    return done(new Error('Missing fileId'));
  }
  if (!userId) {
    return done(new Error('Missing userId'));
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: ObjectId(fileId),
    userId: ObjectId(userId),
  });

  if (!file) {
    return done(new Error('File not found'));
  }

  // Creating thumbnails of different sizes
  try {
    const thumbnail500 = await imageThumbnail(file.localPath, { width: 500 });
    const thumbnail250 = await imageThumbnail(file.localPath, { width: 250 });
    const thumbnail100 = await imageThumbnail(file.localPath, { width: 100 });

    console.log('Saved thumbnails to filepath');
    await fs.promises.writeFile(`${file.localPath}_500`, thumbnail500);
    await fs.promises.writeFile(`${file.localPath}_250`, thumbnail250);
    await fs.promises.writeFile(`${file.localPath}_100`, thumbnail100);

    done();
  } catch (error) {
    done(error);
  }
});
