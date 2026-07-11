#!/usr/bin/env node
// IAF R Analytics CORS Proxy Server
// Handles CORS for R Analytics requests from frontend
// Forwards requests to actual R Shiny service at port 4041

const http = require('http');
const https = require('https');
const url = require('url');

const PROXY_PORT = 4236;
const R_SHINY_HOST = '10.18.11.35';
const R_SHINY_PORT = 4041;

// CORS headers for IAF frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Tenant-ID, x-tenant-id, Accept, Origin, User-Agent, Cache-Control',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

// Mock analytics data
const mockData = {
  '/api/session': {
    status: 'active',
    sessionId: 'iaf-analytics-session',
    tenant: 'IAF',
    tenantSlug: 'iaf',
    bankingType: 'conventional',
    mode: 'conventional',
    port: 4236,
    startTime: new Date().toISOString(),
    uptime: 3600000, // 1 hour in milliseconds
    reused: false,
    iframeUrl: 'http://localhost:4236/?session=iaf-analytics-session&iframe=true',
    domainUrl: 'http://localhost:4236',
    timestamp: new Date().toISOString(),
    message: 'IAF R Analytics Session Active'
  },
  '/health': {
    status: 'healthy',
    service: 'IAF R Analytics API',
    port: 4236,
    timestamp: new Date().toISOString(),
    version: 'Node.js Proxy v1.0',
    tenant: 'IAF'
  },
  '/api/dashboard': {
    totalExposure: 'IDR 2.5T',
    totalECL: 'IDR 125M',
    stage2Ratio: '8.5%',
    coverage: '5.2%',
    portfolioData: {
      segments: ['Corporate', 'SME', 'Consumer', 'Mortgage'],
      exposure: [1200, 650, 450, 200],
      ecl: [45, 32, 28, 20]
    },
    lastUpdated: new Date().toISOString()
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname} from ${req.headers.origin || 'unknown'}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.keys(corsHeaders).forEach(key => {
      res.setHeader(key, corsHeaders[key]);
    });
    res.writeHead(200);
    res.end();
    return;
  }

  // Set CORS headers for all responses
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Proxy requests to actual R Shiny service
  const proxyToRShiny = () => {
    const options = {
      hostname: R_SHINY_HOST,
      port: R_SHINY_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        'host': `${R_SHINY_HOST}:${R_SHINY_PORT}`
      }
    };

    console.log(`🔄 Proxying ${req.method} ${req.url} to R Shiny at ${R_SHINY_HOST}:${R_SHINY_PORT}`);
    
    const proxyReq = http.request(options, (proxyRes) => {
      // Copy headers from R Shiny response
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });
      
      // Re-apply CORS headers to override any conflicting headers
      Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
      });
      
      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error(`❌ Proxy error:`, error.message);
      res.writeHead(503);
      res.end(JSON.stringify({
        error: 'Service Unavailable',
        message: `R Shiny service at ${R_SHINY_HOST}:${R_SHINY_PORT} is not accessible`,
        details: error.message
      }, null, 2));
    });

    // Forward request body if it exists
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  };

  // Handle API endpoints with mock data first (for local development)
  if (mockData[pathname]) {
    res.writeHead(200);
    res.end(JSON.stringify(mockData[pathname], null, 2));
    return;
  }

  // 🔧 FIX: Handle /session endpoint (frontend calls this directly)
  if (pathname === '/session' && req.method === 'POST') {
    console.log('🔄 Handling /session endpoint - redirecting to mock data');
    res.writeHead(200);
    res.end(JSON.stringify(mockData['/api/session'], null, 2));
    return;
  }

  // Try to proxy to R Shiny for other endpoints
  if (pathname.startsWith('/api/') || pathname === '/health') {
    proxyToRShiny();
    return;
  }

  // Handle ECL calculation
  if (pathname === '/api/ecl/calculate' && req.method === 'POST') {
    const response = {
      calculationId: `ECL_${new Date().toISOString().replace(/[:.]/g, '')}`,
      status: 'completed',
      results: {
        stage1ECL: 'IDR 65,430,000',
        stage2ECL: 'IDR 45,230,000',
        stage3ECL: 'IDR 18,750,000',
        totalECL: 'IDR 129,410,000',
        coverage: '5.2%'
      },
      executionTime: '2.3 seconds',
      recordsProcessed: 15847,
      timestamp: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Handle portfolio analysis
  if (pathname === '/api/portfolio/analysis') {
    const response = {
      portfolioDistribution: {
        products: ['Corporate Loans', 'SME Loans', 'Consumer Loans', 'Mortgages', 'Credit Cards'],
        amounts: [1200, 650, 450, 200, 150],
        percentages: [40, 22, 15, 7, 5]
      },
      topExposures: [
        { customer: 'PT Mandiri Corp', exposure: '150B', stage: 1 },
        { customer: 'PT Sinar Mas', exposure: '125B', stage: 1 },
        { customer: 'PT Astra Intl', exposure: '98B', stage: 2 }
      ],
      lastUpdated: new Date().toISOString()
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }

  // Default response for unknown endpoints
  res.writeHead(404);
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Endpoint ${pathname} not found`,
    availableEndpoints: Object.keys(mockData).concat(['/api/ecl/calculate', '/api/portfolio/analysis'])
  }, null, 2));
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`🚀 IAF R Analytics CORS Proxy running on port ${PROXY_PORT}`);
  console.log(`📊 Service Information:`);
  console.log(`   ✅ Status: RUNNING`);
  console.log(`   ✅ Proxy Port: ${PROXY_PORT}`);
  console.log(`   ✅ R Shiny Target: ${R_SHINY_HOST}:${R_SHINY_PORT}`);
  console.log(`   ✅ CORS: Enabled for all origins`);
  console.log(`   ✅ Domain: http://analytics-calc-ristix.bdo-ki.com (no port needed)`);
  console.log(`   ✅ Internal: http://10.18.11.35:${PROXY_PORT}`);
  console.log(`   ✅ Tenant: IAF (Indonesia Airawata Finance)`);
  console.log(`   ✅ Mode: Conventional Banking`);
  console.log(`\n📝 Available Endpoints:`);
  Object.keys(mockData).forEach(endpoint => {
    console.log(`   📋 GET ${endpoint}`);
  });
  console.log(`   📋 POST /api/ecl/calculate`);
  console.log(`   📋 GET /api/portfolio/analysis`);
  console.log(`\n🛠️ Management Commands:`);
  console.log(`   📊 Check Status: curl http://localhost:${PROXY_PORT}/health`);
  console.log(`   🛑 Stop Service: kill ${process.pid}`);
  console.log(`   📋 View Logs: Check console output`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down IAF R Analytics CORS Proxy...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Error handling
server.on('error', (err) => {
  console.error('❌ Server error:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err.message);
});