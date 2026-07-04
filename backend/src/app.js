import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'HRMS backend is running' });
});

app.use('/api/auth', authRoutes);

export default app;
