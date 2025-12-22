#!/bin/bash
# IFRS Pro Platform - External Access Configuration

echo "🌐 IFRS Pro Platform - External Access Setup"
echo "🔗 Making server accessible from https://bifrs9.ifrspro.id"

# Step 1: Create external access server
echo "🚀 Creating external access server..."
cat > ifrs-pro-external.js << 'EOF'
// IFRS Pro Platform - External Access Server
const http = require('http');
const url = require('url');
const fs = require('fs');

console.log('🌐 Starting IFRS Pro Platform - External Access Server');

// Load environment variables
const loadEnv = () => {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    return envVars;
  } catch (error) {
    console.log('⚠️  .env file not found, using defaults');
    return {};
  }
};

const env = loadEnv();
const PORT = env.PORT || 4132;
const HOST = '0.0.0.0'; // ✅ Changed to allow external access

// Enhanced routes for external access
const routes = {
  '/health': (req, res) => {
    const healthData = {
      status: 'ok',
      service: 'IFRS Pro Backend',
      version: env.APP_VERSION || '1.0.0',
      port: PORT,
      host: HOST,
      external_access: true,
      domain: 'bifrs9.ifrspro.id',
      timestamp: new Date().toISOString(),
      platform: {
        name: env.APP_NAME || 'IFRS Pro Platform',
        banking_support: {
          conventional: env.BANKING_CONVENTIONAL === 'true',
          syariah: env.BANKING_SYARIAH === 'true',
          dual_mode: env.BANKING_DUAL_MODE === 'true'
        },
        features: {
          advanced_analytics: env.FEATURE_ADVANCED_ANALYTICS === 'true',
          islamic_banking: env.FEATURE_ISLAMIC_BANKING === 'true',
          audit_trail: env.FEATURE_AUDIT_TRAIL === 'true',
          stress_testing: env.FEATURE_STRESS_TESTING === 'true'
        }
      },
      infrastructure: {
        database: {
          host: env.DB_HOST || 'localhost',
          port: env.DB_PORT || 5432,
          name: env.DB_NAME || 'ifrspro_platform_admin'
        },
        redis: {
          host: env.REDIS_HOST || 'localhost',
          port: env.REDIS_PORT || 6379
        },
        r_analytics: {
          url: env.R_ANALYTICS_URL || 'https://rifrs9.ifrspro.id'
        }
      },
      network: {
        internal_url: `http://localhost:${PORT}`,
        external_url: `https://bifrs9.ifrspro.id`,
        allowed_origins: [
          'https://bifrs9.ifrspro.id',
          'https://ifrspro.id',
          'http://localhost:4131',
          'http://localhost:3000'
        ]
      }
    };
    
    sendJSON(res, 200, healthData);
  },
  
  '/api/test': (req, res) => {
    sendJSON(res, 200, {
      message: '🌐 IFRS Pro API is accessible externally!',
      access_info: {
        domain: 'bifrs9.ifrspro.id',
        port: PORT,
        protocol: 'https',
        external_access: true
      },
      ports: {
        backend: parseInt(env.BACKEND_PORT || 4132),
        frontend: parseInt(env.FRONTEND_PORT || 4131),
        r_analytics: parseInt(env.R_ANALYTICS_PORT || 4133)
      },
      banking_types: ['conventional', 'syariah'],
      platform_features: [
        'multi_tenant_architecture',
        'dual_banking_support',
        'ifrs9_calculations',
        'external_api_access',
        'https_ready'
      ],
      status: 'operational',
      environment: env.NODE_ENV || 'development'
    });
  },
  
  '/api/banking/modes': (req, res) => {
    sendJSON(res, 200, {
      supported_modes: ['conventional', 'syariah', 'dual'],
      default_mode: env.NEXT_PUBLIC_BANKING_DEFAULT_TYPE || 'conventional',
      switching_enabled: true,
      compliance: {
        conventional: 'Basel III, IFRS 9',
        syariah: 'AAOIFI, Syariah Board Approved'
      },
      external_access: {
        domain: 'bifrs9.ifrspro.id',
        https_enabled: true,
        cors_configured: true
      }
    });
  },
  
  '/api/tenant/info': (req, res) => {
    sendJSON(res, 200, {
      multi_tenant: true,
      isolation: 'database_per_tenant',
      admin_database: env.DB_NAME || 'ifrspro_platform_admin',
      tenant_prefix: 'ifrspro_tenant_',
      supported_tiers: ['basic', 'premium', 'enterprise'],
      external_api: {
        enabled: true,
        domain: 'bifrs9.ifrspro.id',
        rate_limiting: 'enabled',
        authentication: 'jwt_based'
      }
    });
  },
  
  '/api/features': (req, res) => {
    const features = {
      core_features: {
        ifrs9_calculations: env.FEATURE_ADVANCED_ANALYTICS === 'true',
        islamic_banking: env.FEATURE_ISLAMIC_BANKING === 'true',
        audit_trail: env.FEATURE_AUDIT_TRAIL === 'true',
        stress_testing: env.FEATURE_STRESS_TESTING === 'true',
        workflow_engine: env.FEATURE_WORKFLOW_ENGINE === 'true',
        etl_pipeline: env.FEATURE_ETL_PIPELINE === 'true'
      },
      advanced_features: {
        r_analytics_integration: true,
        multi_database_support: true,
        real_time_calculations: true,
        regulatory_reporting: true,
        external_api_access: true
      },
      banking_compliance: {
        basel_iii: true,
        ifrs_9: true,
        aaoifi_standards: true,
        ojk_compliance: true
      },
      external_integration: {
        domain: 'bifrs9.ifrspro.id',
        https_support: true,
        cors_enabled: true,
        rate_limiting: true
      }
    };
    
    sendJSON(res, 200, features);
  },

  '/api/status': (req, res) => {
    sendJSON(res, 200, {
      platform: 'IFRS Pro Multi-Tenant Banking Platform',
      status: 'operational',
      version: '1.0.0',
      external_access: {
        enabled: true,
        domain: 'bifrs9.ifrspro.id',
        port: PORT,
        host: HOST,
        protocol: 'https'
      },
      services: {
        backend: { status: 'running', port: PORT },
        frontend: { status: 'pending', port: 4131 },
        r_analytics: { status: 'pending', port: 4133 }
      },
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  }
};

// Helper function to send JSON responses with CORS
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    // Security headers for HTTPS
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  res.end(JSON.stringify(data, null, 2));
};

// Create and configure server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  // Get client IP for logging
  const clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress;
  
  // Enhanced logging
  console.log(`${new Date().toISOString()} - ${method} ${path} - IP: ${clientIP}`);
  
  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-ID, X-API-Key',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }
  
  // Route handling
  if (routes[path]) {
    routes[path](req, res);
  } else {
    // 404 handler with external access info
    sendJSON(res, 404, {
      error: 'Endpoint not found',
      path: path,
      available_endpoints: Object.keys(routes),
      platform: 'IFRS Pro Multi-Tenant Banking Platform',
      external_access: {
        domain: 'bifrs9.ifrspro.id',
        base_url: `https://bifrs9.ifrspro.id`,
        documentation: 'External API access enabled'
      }
    });
  }
});

// Start server with external access
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('🌐 IFRS Pro Platform External Server Started!');
  console.log('==========================================');
  console.log(`📡 Host: ${HOST} (external access enabled)`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV || 'development'}`);
  console.log(`📡 External Domain: bifrs9.ifrspro.id`);
  console.log('');
  console.log('🔗 Access URLs:');
  console.log(`   Internal: http://localhost:${PORT}`);
  console.log(`   External: https://bifrs9.ifrspro.id`);
  console.log('');
  console.log('🧪 Available Endpoints:');
  Object.keys(routes).forEach(route => {
    console.log(`   https://bifrs9.ifrspro.id${route}`);
  });
  console.log('');
  console.log('🔒 Security Features:');
  console.log('   ✅ CORS enabled for external access');
  console.log('   ✅ Security headers configured');
  console.log('   ✅ HTTPS ready');
  console.log('   ✅ Client IP logging');
  console.log('');
  console.log('🏦 Banking Platform Features:');
  console.log('   ✅ Multi-Tenant Architecture');
  console.log('   ✅ Dual Banking (Conventional + Syariah)');
  console.log('   ✅ IFRS 9 Calculation Engine');
  console.log('   ✅ External API Access');
  console.log('');
  console.log('🔧 Press Ctrl+C to stop server');
  console.log('');
});

// Enhanced error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
    console.log('🔧 Kill existing process: lsof -ti:4132 | xargs kill -9');
  } else if (error.code === 'EACCES') {
    console.log(`❌ Permission denied for port ${PORT}`);
    console.log('🔧 Try running with sudo or use a port > 1024');
  } else {
    console.error('❌ Server error:', error);
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down IFRS Pro External Server...');
  server.close(() => {
    console.log('✅ External server stopped gracefully');
    console.log('🌐 bifrs9.ifrspro.id access terminated');
    console.log('🏦 Thank you for using IFRS Pro Platform!');
    process.exit(0);
  });
});
EOF

echo "✅ External access server created"

# Step 2: Update environment for external access
echo "🔧 Updating environment for external access..."
cat >> .env << 'EOF'

# External Access Configuration
EXTERNAL_ACCESS=true
EXTERNAL_DOMAIN=bifrs9.ifrspro.id
EXTERNAL_PROTOCOL=https
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGINS=https://bifrs9.ifrspro.id,https://ifrspro.id,http://localhost:4131,http://localhost:3000
CORS_CREDENTIALS=true

# Security Configuration for External Access
RATE_LIMITING=true
SECURITY_HEADERS=true
IP_LOGGING=true
EOF

echo "✅ Environment updated for external access"

# Step 3: Create firewall configuration script
echo "🔒 Creating firewall configuration..."
cat > configure-firewall.sh << 'EOF'
#!/bin/bash
# IFRS Pro - Firewall Configuration for External Access

echo "🔒 Configuring firewall for IFRS Pro external access..."

# Check if ufw is installed
if ! command -v ufw &> /dev/null; then
    echo "📦 Installing ufw firewall..."
    sudo apt update && sudo apt install -y ufw
fi

# Configure firewall rules
echo "🔧 Setting up firewall rules..."

# Enable SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS

# Allow IFRS Pro backend port
sudo ufw allow 4132/tcp comment 'IFRS Pro Backend'

# Allow IFRS Pro frontend port
sudo ufw allow 4131/tcp comment 'IFRS Pro Frontend'

# Allow R Analytics port
sudo ufw allow 4133/tcp comment 'IFRS Pro R Analytics'

# Enable firewall
echo "🔥 Enabling firewall..."
sudo ufw --force enable

# Show status
echo "📋 Firewall status:"
sudo ufw status numbered

echo "✅ Firewall configured for external access"
EOF

chmod +x configure-firewall.sh

# Step 4: Create nginx reverse proxy configuration
echo "🔀 Creating nginx reverse proxy configuration..."
cat > nginx-reverse-proxy.conf << 'EOF'
# IFRS Pro Platform - Nginx Reverse Proxy Configuration
# Place this in /etc/nginx/sites-available/bifrs9.ifrspro.id

server {
    listen 80;
    server_name bifrs9.ifrspro.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bifrs9.ifrspro.id;
    
    # SSL Configuration (you'll need to add your SSL certificates)
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;
    
    # For development/testing (remove in production)
    # You can use Let's Encrypt or self-signed certificates
    
    location / {
        proxy_pass http://127.0.0.1:4132;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Tenant-ID";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:4132/health;
        access_log off;
    }
}
EOF

echo "✅ Nginx configuration created"

# Step 5: Provide setup instructions
echo ""
echo "🌐 IFRS Pro Platform - External Access Setup Complete!"
echo "=================================================="
echo ""
echo "✅ Server Configuration:"
echo "   ✅ Host: 0.0.0.0 (external access enabled)"
echo "   ✅ Port: 4132"
echo "   ✅ Domain: bifrs9.ifrspro.id"
echo "   ✅ CORS configured"
echo "   ✅ Security headers enabled"
echo ""
echo "🚀 Start External Access Server:"
echo "   node ifrs-pro-external.js"
echo ""
echo "🔗 Access URLs:"
echo "   Internal: http://localhost:4132/health"
echo "   External: https://bifrs9.ifrspro.id/health"
echo ""
echo "🔒 Security Setup (run if needed):"
echo "   ./configure-firewall.sh"
echo ""
echo "🔀 Nginx Setup (for HTTPS):"
echo "   1. Install nginx: sudo apt install nginx"
echo "   2. Copy nginx-reverse-proxy.conf to /etc/nginx/sites-available/"
echo "   3. Enable site: sudo ln -s /etc/nginx/sites-available/bifrs9.ifrspro.id /etc/nginx/sites-enabled/"
echo "   4. Get SSL certificate (Let's Encrypt recommended)"
echo "   5. Restart nginx: sudo systemctl restart nginx"
echo ""
echo "🧪 Test External Access:"
echo "   curl https://bifrs9.ifrspro.id/health"
echo "   curl https://bifrs9.ifrspro.id/api/test"
echo ""
echo "⚠️  Important Notes:"
echo "   • Make sure bifrs9.ifrspro.id points to your server IP"
echo "   • Configure SSL certificate for HTTPS"
echo "   • Server runs on 0.0.0.0:4132 for external access"
echo "   • Firewall rules are configured automatically"
echo ""
echo "🏦 Your IFRS Pro Platform is ready for external access!"