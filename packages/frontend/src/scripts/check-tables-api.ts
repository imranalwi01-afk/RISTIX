
const API_URL = 'http://localhost:5232/api/v1';
const LOGIN_URL = `${API_URL}/auth/login`;
const TABLES_URL = `${API_URL}/banking/business-settings/tables`;

const CREDENTIALS = {
  email: 'testadmin@example.com',
  password: 'password123'
};

async function checkApi() {
  try {
    const loginResponse = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS)
    });

    if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        throw new Error(`Login failed: ${loginResponse.status} ${errorText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.token; 
    
    if (!token) {
        throw new Error('No token found in login response');
    }

    const tablesResponse = await fetch(TABLES_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!tablesResponse.ok) {
        const errorText = await tablesResponse.text();
        throw new Error(`Tables fetch failed: ${tablesResponse.status} ${errorText}`);
    }

    const tablesData = await tablesResponse.json();

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkApi();
