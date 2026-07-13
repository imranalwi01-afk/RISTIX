const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@172.25.0.25:5432/FRS9PRO'
});

async function run() {
  try {
    await client.connect();
    
    // First query: max prc_date
    console.log("Querying MAX prc_date...");
    const effectiveDateResult = await client.query(`
        SELECT MAX(prc_date) AS effective_date
        FROM public.frs9_imp_ca_lgd_h
    `);
    const effectiveDate = effectiveDateResult.rows[0]?.effective_date;
    const effectiveDateStr = effectiveDate.toISOString().slice(0, 10);
    console.log(`Max prc_date: ${effectiveDateStr}`);

    // Second query: resolve config id
    console.log("Querying config id...");
    const configResult = await client.query(`
        SELECT lgd_config_id
        FROM public.frs9_imp_ca_lgd_h
        WHERE prc_date = '${effectiveDateStr}'
        ORDER BY lgd_config_id
        LIMIT 1
    `);
    const lgdConfigId = configResult.rows[0]?.lgd_config_id || 1;
    console.log(`Config id: ${lgdConfigId}`);

    // Third query: main query
    console.log("Querying main data...");
    const mainQuery = `
        WITH recovery AS (
            SELECT
                account_id,
                lgd_config_id,
                seq,
                SUM(COALESCE(npv_eqv_rec, 0)) AS pv_recovery
            FROM public.frs9_imp_ca_lgd_rec_d
            WHERE prc_date <= '${effectiveDateStr}'
            AND lgd_config_id = ${lgdConfigId}
            GROUP BY account_id, lgd_config_id, seq
        ),
        latest_metric_dates AS (
            SELECT
                account_id,
                lgd_config_id,
                MAX(prc_date) AS prc_date
            FROM public.frs9_imp_ca_lgd_d
            WHERE prc_date <= '${effectiveDateStr}'
            AND lgd_config_id = ${lgdConfigId}
            GROUP BY account_id, lgd_config_id
        ),
        latest_metrics AS (
            SELECT DISTINCT ON (metric.account_id, metric.lgd_config_id)
                metric.account_id,
                metric.lgd_config_id,
                metric.lgd,
                metric.rec_rate,
                metric.npv_eqv_rec
            FROM public.frs9_imp_ca_lgd_d metric
            INNER JOIN latest_metric_dates latest
                ON metric.account_id = latest.account_id
                AND metric.lgd_config_id = latest.lgd_config_id
                AND metric.prc_date = latest.prc_date
            WHERE metric.lgd_config_id = ${lgdConfigId}
            ORDER BY metric.account_id, metric.lgd_config_id, metric.prc_date DESC
        )
        SELECT 
            A.account_id,
            A.account_number,
            A.cif_name,
            B.prc_date AS first_npl_date,
            B.eqv_at_default AS os_at_default,
            D.lgd AS lgd_rate,
            D.rec_rate AS recovery_rate,
            D.npv_eqv_rec AS recovery_amount_pv,
            C.seq,
            C.pv_recovery
        FROM public.frs9_account_id A
        INNER JOIN public.frs9_imp_ca_lgd_data B ON A.account_id = B.account_id
        INNER JOIN recovery C ON B.account_id = C.account_id
            AND B.lgd_config_id = C.lgd_config_id
        LEFT JOIN latest_metrics D ON B.account_id = D.account_id
            AND B.lgd_config_id = D.lgd_config_id
        LEFT JOIN public.frs9_imp_ca_lgd_config F ON B.lgd_config_id = F.pkid
        WHERE B.prc_date <= '${effectiveDateStr}' AND B.lgd_config_id = ${lgdConfigId}
        ORDER BY A.account_number, C.seq
        LIMIT 10
    `;
    const dataRes = await client.query(mainQuery);
    console.log(`Main query returned ${dataRes.rows.length} rows`);

  } catch (err) {
    console.error("Error executing queries:", err.message);
  } finally {
    await client.end();
  }
}

run();
