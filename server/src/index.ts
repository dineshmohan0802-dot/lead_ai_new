import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env';
import routes from './routes';
import { Scheduler } from './jobs/scheduler';

// Validate environment on startup
validateEnv();

const app = express();

const frontendUrl = env.APP_BASE_URL.replace(/\/$/, '');
const allowedOrigins = [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api', routes);

// Start server
app.listen(env.PORT, () => {
  console.log(`\n🚀 LeadPulse server running on http://localhost:${env.PORT}`);
  console.log(`   Frontend: ${env.APP_BASE_URL}`);
  console.log('');

  // Start scheduler
  const scheduler = new Scheduler();
  scheduler.start();

  // Optional: run initial ingestion on startup
  // Uncomment to auto-ingest when server starts:
  // setTimeout(() => scheduler.runInitial(), 5000);
});

export default app;
