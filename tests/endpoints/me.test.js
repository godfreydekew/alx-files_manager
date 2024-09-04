import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('GET /users/me', () => {
  it('should return user info', (done) => {
    chai.request(app)
      .get('/users/me')
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('email');
        done();
      });
  });
});

