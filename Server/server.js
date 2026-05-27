// server.js — Jangid Express Backend
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { serve } from 'inngest/express';

import { inngest }        from './src/inngest/client.js';
import { inngestFunctions } from './src/inngest/functions.js';
import { errorHandler }   from './src/middleware/errorHandler.js';

// ─── ROUTES ─────────────────────────────────────
import authRoutes     from './src/routes/auth.js';
import productRoutes  from './src/routes/products.js';
import orderRoutes    from './src/routes/orders.js';
import paymentRoutes  from './src/routes/payments.js';
import uploadRoutes   from './src/routes/upload.js';
import contactRoutes  from './src/routes/contact.js';
import adminRoutes     from './src/routes/admin.js';
import settingsRoutes from './src/routes/settings.js';

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ──────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true,
  methods:     ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Raw body for Cashfree webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── REQUEST LOGGER (dev) ───────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`→ ${req.method} ${req.path}`);
    next();
  });
}

// ─── HEALTH CHECK ───────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'Jangid API',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ─── API ROUTES ──────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/settings', settingsRoutes);

// ─── INNGEST (background jobs) ───────────────────
app.use(
  '/api/inngest',
  serve({ client: inngest, functions: inngestFunctions })
);

// ─── 404 HANDLER ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────
app.use(errorHandler);

// ─── START ──────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🪵  Jangid API running`);
  console.log(`   ➜ http://localhost:${PORT}`);
  console.log(`   ➜ Health: http://localhost:${PORT}/health`);
  console.log(`   ➜ Inngest: http://localhost:${PORT}/api/inngest`);
  console.log(`   ➜ ENV: ${process.env.NODE_ENV}\n`);
});

export default app;
