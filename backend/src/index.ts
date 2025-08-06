import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: 'http://localhost:3000' })); // http://localhost:3000からのリクエストを許可
app.use(express.json());

app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
