async function run() {
  try {
    const res = await fetch('http://localhost:5232/api/v1/ifrs9/reports/lifetime-pd/account-details?prc_date=2025-12-31&pd_config_id=1&limit=20&page=1', {
      headers: {
        'x-tenant-id': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be',
        'Authorization': 'Bearer mock'
      }
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text.substring(0, 1000));
  } catch (e) {
    console.error("Fetch error:", e);
  }
}
run();
