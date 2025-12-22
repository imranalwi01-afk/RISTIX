// packages/backend/src/routes/auth.ts
// ============================================================================
// 🩹 SURGICAL FIX: Complete working auth routes with your existing structure
// ============================================================================
// ✅ FIXED: Import paths match your existing JWT service structure
// ✅ FIXED: Uses your existing auth controller methods
// ✅ FIXED: Refresh endpoint implementation (was returning 501)
// ============================================================================

import { Router } from 'express';
import { login, logout, refreshToken, getProfile, healthCheck } from '../api/controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ✅ SURGICAL FIX: Public authentication routes
router.post('/login', login);
router.post('/refresh', refreshToken); // ✅ FIXED: Was returning 501

// ✅ SURGICAL FIX: Protected authentication routes  
router.post('/logout', authenticate({ required: true }), logout);
router.get('/me', authenticate({ required: true }), getProfile);
router.get('/verify', authenticate({ required: true }), getProfile); // ✅ ADDED: For token verification

// ✅ Health check route
router.get('/health', healthCheck);

export default router;