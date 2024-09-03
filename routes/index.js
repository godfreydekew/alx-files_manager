import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const express = require('express');

const app = express();

app.use(express.json());
app.get('/status', AppController.getStatus);
app.get('/stats', AppController.getStats);
app.post('/users', UsersController.postNew);
export default app;
