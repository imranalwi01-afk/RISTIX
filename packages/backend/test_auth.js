const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4232,
  path: '/api/v1/ifrs9/reports/health',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer demo_token_PLATFORM_SUPER_ADMIN'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
