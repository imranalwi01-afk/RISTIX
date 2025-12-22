// Test PD Setup routes - minimal version
import { Router, Request, Response } from 'express';

const router = Router();

// Simple test endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'PD Setup test routes working',
    timestamp: new Date().toISOString()
  });
});

export default router;