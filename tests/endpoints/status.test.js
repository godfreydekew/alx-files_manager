import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('GET /status', () => {
  it('should return status 200', (done) => {
    chai.request(app)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

