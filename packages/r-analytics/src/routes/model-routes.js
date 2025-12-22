// packages/r-analytics/src/routes/model-routes.js
// Model management routes

const express = require('express');
const router = express.Router();

// Get available models
router.get('/', (req, res) => {
  res.json({
    success: true,
    models: [
      {
        id: 'basic_pd_model',
        name: 'Basic PD Model',
        type: 'probability_of_default',
        version: '1.0.0',
        status: 'active'
      },
      {
        id: 'basic_lgd_model',
        name: 'Basic LGD Model',
        type: 'loss_given_default',
        version: '1.0.0',
        status: 'active'
      }
    ]
  });
});

// Get model details
router.get('/:modelId', (req, res) => {
  const { modelId } = req.params;
  
  res.json({
    success: true,
    model: {
      id: modelId,
      name: `Model ${modelId}`,
      type: 'statistical',
      version: '1.0.0',
      parameters: {},
      last_trained: new Date().toISOString()
    }
  });
});

module.exports = router;
