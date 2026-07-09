import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import dashboardRoutes from './dashboard.routes';
import signalsRoutes from './signals.routes';
import leadsRoutes from './leads.routes';
import settingsRoutes from './settings.routes';
import ingestionRoutes from './ingestion.routes';

const router = Router();

// All routes require authentication
router.use('/dashboard', authMiddleware, dashboardRoutes);
router.use('/signals', authMiddleware, signalsRoutes);
router.use('/leads', authMiddleware, leadsRoutes);
router.use('/settings', authMiddleware, settingsRoutes);
router.use('/ingestion', authMiddleware, ingestionRoutes);

// Health check (no auth)
router.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
