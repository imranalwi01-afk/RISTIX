// packages/backend/src/api/routes/journal-parameter.routes.ts
// ============================================================================
// 🗄️ JOURNAL PARAMETER ROUTES: RESTful endpoints for frs9_param_journal
// ============================================================================
// ✅ PATTERN: Standalone CRUD routes (not master-detail)
// ✅ ENDPOINTS: GET, POST, PUT, DELETE + Health check
// ✅ VALIDATION: Input validation via controller
// ✅ AUDIT: Request logging and tracking
// ============================================================================

import { Router } from 'express';
import { journalParameterController } from '../controllers/journal-parameter.controller';

const router = Router();

// ============================================================================
// JOURNAL PARAMETER ROUTES
// ============================================================================

// Health check endpoint (must be before /:gl_code routes)
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 [JOUR-002] Journal parameter health check');
    await journalParameterController.healthCheck(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-002] Health check route error:', error);
    res.status(500).json({
      success: false,
      error: 'HEALTH_CHECK_ERROR',
      message: 'Health check endpoint failed',
      details: error.message
    });
  }
});

// ============================================================================
// BUSINESS SETTINGS OPTIONS ENDPOINTS (must be before /:gl_code routes)
// ============================================================================

// Get GL Group options from rule based setting
router.get('/gl-group-options', async (req, res) => {
  try {
    console.log('📋 [JOUR-003] GL group options requested');
    await journalParameterController.getGLGroupOptions(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-003] GL group options route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process GL group options request',
      details: error.message
    });
  }
});

// Get Currency options from B0001
router.get('/currency-options', async (req, res) => {
  try {
    console.log('📋 [JOUR-003] Currency options requested');
    await journalParameterController.getCurrencyOptions(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-003] Currency options route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process currency options request',
      details: error.message
    });
  }
});

// Get Journal Type options from B0005
router.get('/journal-type-options', async (req, res) => {
  try {
    console.log('📋 [JOUR-003] Journal type options requested');
    await journalParameterController.getJournalTypeOptions(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-003] Journal type options route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process journal type options request',
      details: error.message
    });
  }
});

// Get Journal Code options from B0006
router.get('/journal-code-options', async (req, res) => {
  try {
    console.log('📋 [JOUR-003] Journal code options requested');
    await journalParameterController.getJournalCodeOptions(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-003] Journal code options route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process journal code options request',
      details: error.message
    });
  }
});

// Get DB/CR options from B0007
router.get('/dbcr-options', async (req, res) => {
  try {
    console.log('📋 [JOUR-003] DB/CR options requested');
    await journalParameterController.getDbCrOptions(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-003] DB/CR options route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process DB/CR options request',
      details: error.message
    });
  }
});

// Get all journal parameters with pagination and filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 [JOUR-002] Journal parameters requested');
    await journalParameterController.getJournalParameters(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-002] Get journal parameters route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process journal parameters request',
      details: error.message
    });
  }
});

// Create new journal parameter
router.post('/', async (req, res) => {
  try {
    console.log('➕ [JOUR-002] Create journal parameter requested');
    await journalParameterController.createJournalParameter(req, res);
  } catch (error: any) {
    console.error('❌ [JOUR-002] Create journal parameter route error:', error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process create journal parameter request',
      details: error.message
    });
  }
});

// Get single journal parameter by GL code
router.get('/:gl_code', async (req, res) => {
  try {
    console.log(`🔍 [JOUR-002] Get journal parameter requested: ${req.params.gl_code}`);
    await journalParameterController.getJournalParameter(req, res);
  } catch (error: any) {
    console.error(`❌ [JOUR-002] Get journal parameter route error for ${req.params.gl_code}:`, error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process get journal parameter request',
      details: error.message
    });
  }
});

// Update journal parameter by GL code
router.put('/:gl_code', async (req, res) => {
  try {
    console.log(`✏️ [JOUR-002] Update journal parameter requested: ${req.params.gl_code}`);
    await journalParameterController.updateJournalParameter(req, res);
  } catch (error: any) {
    console.error(`❌ [JOUR-002] Update journal parameter route error for ${req.params.gl_code}:`, error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process update journal parameter request',
      details: error.message
    });
  }
});

// Delete journal parameter by GL code
router.delete('/:gl_code', async (req, res) => {
  try {
    console.log(`🗑️ [JOUR-002] Delete journal parameter requested: ${req.params.gl_code}`);
    await journalParameterController.deleteJournalParameter(req, res);
  } catch (error: any) {
    console.error(`❌ [JOUR-002] Delete journal parameter route error for ${req.params.gl_code}:`, error);
    res.status(500).json({
      success: false,
      error: 'ROUTE_ERROR',
      message: 'Failed to process delete journal parameter request',
      details: error.message
    });
  }
});

// Export router
export default router;