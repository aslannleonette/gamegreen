import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rewards', rewardRoutes);

export default app;
