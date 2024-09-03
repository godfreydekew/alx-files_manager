import AppController from '../controllers/AppController';

const express = require('express');

const app = express();

app.use(express.json());
app.get('/status', AppController.getStatus);
app.get('/stats', AppController.getStats);

export default app;
