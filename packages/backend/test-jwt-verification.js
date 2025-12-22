// Test JWT verification using the same configuration as the backend
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Use the same JWT configuration service as the backend
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = 'ifrs9-platform-development'; // From token
const JWT_AUDIENCE = 'ifrs9-platform-users'; // From token

console.log('🔐 JWT Verification Test');
console.log('JWT_SECRET present:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET ? JWT_SECRET.length : 'N/A');
console.log('JWT_ISSUER:', JWT_ISSUER);
console.log('JWT_AUDIENCE:', JWT_AUDIENCE);

// Use the same token from the previous test
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlNWY0ZWNkMi1kYzFlLTQ2MjAtYTgwYS02YjBlNzNlMzQ4NzgiLCJ1c2VybmFtZSI6ImlmcnMubWFuYWdlckBpYWYuY28uaWQiLCJlbWFpbCI6ImlmcnMubWFuYWdlckBpYWYuY28uaWQiLCJyb2xlIjoiQkFOS19VU0VSIiwicGVybWlzc2lvbnMiOlsidXNlcnNfcmVhZCIsInVzZXJzX2NyZWF0ZSIsInVzZXJzX3VwZGF0ZSIsInBvcnRmb2xpb19yZWFkIiwicG9ydGZvbGlvX3dyaXRlIiwiaWZyczlfcmVhZCIsImlmcnM5X3dyaXRlIiwiZGF0YV91cGxvYWQiLCJkYXRhX3Byb2Nlc3MiLCJyZXBvcnRzX3JlYWQiXSwidGVuYW50SWQiOiJhMjRhZjZkMi0zMDMyLTRkNTMtYWU4Mi05Y2ZhODRmOTdhMjAiLCJ0ZW5hbnRTbHVnIjoiaWFmIiwiYmFua2luZ1R5cGUiOiJjb252ZW50aW9uYWwiLCJ1c2VyVHlwZSI6InRlbmFudCIsInNlc3Npb25JZCI6InNlc3Npb25fMTc2MjA5MjI3MTIyOF9iOTdwZG02enYiLCJpYXQiOjE3NjIwOTIyNzEsImV4cCI6MTc2MjEyMTA3MSwiYXVkIjoiaWZyczktcGxhdGZvcm0tdXNlcnMiLCJpc3MiOiJpZnJzOS1wbGF0Zm9ybS1kZXZlbG9wbWVudCJ9.4ag7knnyQ8woN1sAhRcKQP_oCwUR9qwIk4kN9yIJGvM';

try {
  const decoded = jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithms: ['HS256']
  });

  console.log('✅ JWT Verification successful!');
  console.log('Decoded payload userId:', decoded.userId);
  console.log('Decoded payload userType:', decoded.userType);
} catch (error) {
  console.error('❌ JWT Verification failed:', error.message);

  // Try without issuer/audience check
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT Verification successful without issuer/audience check');
    console.log('Decoded payload userId:', decoded.userId);
    console.log('Decoded payload userType:', decoded.userType);
  } catch (error2) {
    console.error('❌ JWT Verification failed completely:', error2.message);

    // Try legacy issuers
    const legacyIssuers = [
      'ifrs9-platform-development',
      'ifrs9-platform-production',
      'ifrs9-platform-localdev',
      'ifrs9-platform-iafecs'
    ];

    for (const issuer of legacyIssuers) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET, {
          issuer: issuer,
          audience: 'ifrs9-platform-users',
          algorithms: ['HS256']
        });
        console.log(`✅ JWT Verification successful with legacy issuer: ${issuer}`);
        console.log('Decoded payload userId:', decoded.userId);
        break;
      } catch (error3) {
        continue;
      }
    }
  }
}