import http from 'http';

http.get('http://localhost:4232/api/v1/ifrs9/reports/ecl-result?limit=2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
