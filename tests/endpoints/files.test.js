import { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust path if needed

chai.use(chaiHttp);

describe('POST /files', () => {
  it('should create a file', (done) => {
    chai.request(app)
      .post('/files')
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .attach('file', 'path/to/file') // Adjust file path
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        done();
      });
  });
});

describe('GET /files/:id', () => {
  it('should get a file by ID', (done) => {
    chai.request(app)
      .get('/files/some-file-id') // Replace with a valid file ID
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');
        done();
      });
  });
});

describe('GET /files', () => {
  it('should list files with pagination', (done) => {
    chai.request(app)
      .get('/files?page=1')
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

describe('PUT /files/:id/publish', () => {
  it('should publish a file', (done) => {
    chai.request(app)
      .put('/files/some-file-id/publish') // Replace with a valid file ID
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', true);
        done();
      });
  });
});

describe('PUT /files/:id/unpublish', () => {
  it('should unpublish a file', (done) => {
    chai.request(app)
      .put('/files/some-file-id/unpublish') // Replace with a valid file ID
      .set('X-Token', 'some-valid-token') // Replace with a valid token if needed
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('isPublic', false);
        done();
      });
  });
});

