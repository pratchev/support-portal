import { Router } from 'express';
import ticketsRouter from './tickets';
import responsesRouter from './responses';
import usersRouter from './users';
import authRouter from './auth';
import kbRouter from './kb';
import ratingsRouter from './ratings';
import attachmentsRouter from './attachments';
import reportsRouter from './reports';
import notificationsRouter from './notifications';

const router = Router();

router.use('/auth', authRouter);
router.use('/tickets', ticketsRouter);
router.use('/responses', responsesRouter);
router.use('/users', usersRouter);
router.use('/kb', kbRouter);
router.use('/ratings', ratingsRouter);
router.use('/attachments', attachmentsRouter);
router.use('/reports', reportsRouter);
router.use('/notifications', notificationsRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'support-portal-api',
  });
});

export default router;
