const jwt = require('jsonwebtoken');

// Secret from .env file
const JWT_SECRET = 'y4L3+9Z7uiV5+4SfRX96dG2IhqodFa/JmBPo/1xDQ22FgCcBwRd1Gs4ZrZVOupscCioQy2JouV8aSC0kG+YBCw==';

const payload = {
  userId: '550e8400-e29b-41d4-a716-446655440001',
  email: 'admin@ifrspro.id',
  username: 'admin',
  fullName: 'Platform Administrator',
  role: 'platform_super_admin',
  roles: ['platform_super_admin', 'admin'],
  permissions: ['*'],
  userType: 'platform',
  bankingAccess: 'BOTH',
  syariahCertified: true,
  // Standard claims
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
  iss: 'ifrspro-backend',
  aud: 'ifrspro-frontend'
};

const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });

const fs = require('fs');
fs.writeFileSync('token.txt', token);
console.log('Token written to token.txt');
