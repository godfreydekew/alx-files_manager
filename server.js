import express from 'express';
import router from './routes/index';

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(router);

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
export default app;
