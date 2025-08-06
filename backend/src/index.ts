import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth';
import challengeRoutes from './routes/challenge';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const prisma = new PrismaClient();

app.use(cors({ origin: `${process.env.FRONTEND_URL}` })); // http://localhost:3000からのリクエストを許可
app.use(express.json());

// Prisma Client를 req 객체에 추가하여 라우트 핸들러에서 접근할 수 있도록 함
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use('/auth', authRouter);
app.use('/challenges', challengeRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// 애플리케이션 종료 시 Prisma 연결 해제
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
