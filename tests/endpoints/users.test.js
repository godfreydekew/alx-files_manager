import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('POST /users', () => {
  it('should create a user', (done) => {
    chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('userId');
        done();
      });
  });
});

