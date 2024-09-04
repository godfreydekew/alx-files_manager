import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('GET /connect', () => {
  it('should connect and return a token', (done) => {
    chai.request(app)
      .get('/connect')
      .set('Authorization', 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=') // Adjust auth header as needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        done();
      });
  });
});

