import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('GET /disconnect', () => {
  it('should disconnect and return 200', (done) => {
    chai.request(app)
      .get('/disconnect')
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

