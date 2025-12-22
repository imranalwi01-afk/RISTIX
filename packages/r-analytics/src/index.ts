// packages/r-analytics/src/index.ts
// IFRS 9 Multi-Tenant Platform R Analytics - Statistical Computing Service

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment configuration
dotenv.config();

const app = express();
const PORT = process.env.R_ANALYTICS_PORT || 4236;

// Security middleware
app.use(helmet());
app.use(cors());

// Basic middleware
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ifrs9-r-analytics',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📈 IFRS 9 R Analytics running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
