import { expect } from 'chai';
import redisClient from '../utils/redis'; // Adjust path if needed

describe('redisClient', () => {
  it('should connect to Redis', (done) => {
    redisClient.get('test_key', (err, reply) => {
      expect(err).to.be.null;
      expect(reply).to.be.null;
      done();
    });
  });

  it('should set and get a value', (done) => {
    redisClient.set('test_key', 'test_value', (err) => {
      expect(err).to.be.null;
      redisClient.get('test_key', (err, reply) => {
        expect(err).to.be.null;
        expect(reply).to.equal('test_value');
        done();
      });
    });
  });
});
