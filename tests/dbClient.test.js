import { expect } from 'chai';
import dbClient from '../utils/db'; // Adjust path if needed

describe('dbClient', () => {
  it('should connect to MongoDB', (done) => {
    dbClient.db.command({ ping: 1 }, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.have.property('ok', 1);
      done();
    });
  });
});

