import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO' });
async function checkData() {
  try {
    // 1. Cek semua record di bulan Mei 2026
    console.log("--- 1. Cek Data Mei 2026 ---");
    const mayData = await pool.query(`
      SELECT prc_date, COUNT(*) as row_count 
      FROM public.frs9_ecl_summary 
      WHERE prc_date >= '2026-05-01' AND prc_date <= '2026-05-31'
      GROUP BY prc_date
    `);
    if (mayData.rows.length === 0) {
        console.log("TIDAK ADA DATA sama sekali di bulan Mei 2026.");
    } else {
        console.table(mayData.rows);
    }

    // 2. Cek 5 tanggal prc_date terbaru yang ADA di tabel ini
    console.log("\n--- 2. 5 Tanggal Terbaru (Paling Update) di tabel frs9_ecl_summary ---");
    const latestDates = await pool.query(`
      SELECT prc_date, COUNT(*) as row_count 
      FROM public.frs9_ecl_summary 
      GROUP BY prc_date 
      ORDER BY prc_date DESC 
      LIMIT 5
    `);
    console.table(latestDates.rows);

  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}
checkData();
