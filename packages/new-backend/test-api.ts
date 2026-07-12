import { hc } from 'hono/client';

async function test() {
  const res = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/watchlist?page=1&limit=10', {
    headers: {
      'Authorization': 'Bearer test', // Mock or real token might be needed?
    }
  });
  console.log(res.status);
  const json = await res.json();
  console.log(JSON.stringify(json.data.slice(0, 2), null, 2));
}

test();
