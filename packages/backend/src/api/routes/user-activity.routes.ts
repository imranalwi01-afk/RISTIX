// packages/backend/src/api/routes/user-activity.routes.ts
// ============================================================================
// USER ACTIVITY TRACKING API ROUTES - TEMPORARY MINIMAL VERSION
// ============================================================================
// Purpose: Temporary minimal routes to resolve compilation errors
// Date: 2025-01-11

import { Router } from 'express';

const router = Router();

// Health check endpoint for now
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'User Activity Tracking service - Minimal version operational',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Temporary placeholder endpoints
router.get('/summary', (req, res) => {
  res.json({
    success: true,
    message: 'User Activity Summary - Coming soon after TypeScript fixes',
    data: {
      totalActivities: 0,
      activeUsers: 0,
      topActivities: []
    }
  });
});

export default router;