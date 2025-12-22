// IFRS Pro Platform - Minimal Server Test (Correct Ports)
import express from 'express';
import cors from 'cors';

console.log('🏦 Starting IFRS Pro minimal server...');

const app = express();
const PORT = process.env.PORT || 4132;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'IFRS Pro Backend',
    version: '1.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
    banking_types: ['conventional', 'syariah'],
    features: ['multi_tenant', 'dual_banking', 'ifrs9_calculations']
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'IFRS Pro API is working!',
    correct_ports: {
      backend: 4132,
      frontend: 4131,
      r_analytics: 4133
    },
    banking_modes: ['conventional', 'syariah', 'dual'],
    platform: 'Multi-Tenant IFRS Pro',
    status: 'operational'
  });
});

// Start server on correct port
app.listen(PORT, () => {
  console.log(`✅ IFRS Pro Backend running on correct port ${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`📡 Expected: Backend 4132, Frontend 4131, R Analytics 4133`);
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});
