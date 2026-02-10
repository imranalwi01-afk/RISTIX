const axios = require('axios');

// Use demo token to bypass DB session check
const token = 'demo_token_PLATFORM_SUPER_ADMIN';

const payload = {
  prdCode: "HH",
  prdDesc: "hh",
  dataSource: "CORE",
  prdGroup: "LOAN",
  prdType: "CONSUMER",
  currency: "USD",
  alFlag: "AC",
  activeFlag: true
};

async function testCreate() {
  try {
    const response = await axios.post('http://localhost:4232/api/v1/banking/parameters/product', payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Bypass-Auth': 'true',
        'Content-Type': 'application/json'
      }
    });
    console.log('Success:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCreate();
