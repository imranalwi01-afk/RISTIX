-- Seed: Normalize legacy system control flags to binary strings ('1' / '0')
-- Safe to run repeatedly (idempotent).

DO $$
DECLARE
    v_schema text;
BEGIN
    IF to_regclass('public.frs9_param_commonh') IS NOT NULL
       AND to_regclass('public.frs9_param_commond') IS NOT NULL THEN
        v_schema := 'public';
    ELSIF to_regclass('ifrs9.frs9_param_commonh') IS NOT NULL
       AND to_regclass('ifrs9.frs9_param_commond') IS NOT NULL THEN
        v_schema := 'ifrs9';
    ELSE
        RAISE NOTICE 'Skipping 014 seed: frs9_param_commonh/frs9_param_commond not found';
        RETURN;
    END IF;

    EXECUTE format($sql$
        INSERT INTO %I.frs9_param_commonh (
            param_code, param_name, param_usage, param_type,
            createdby, createddate, createdhost
        )
        VALUES
            ('S1003', 'IS_PAYM_UPLOAD', '1', 'S', 'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1004', 'INTERVAL_MODEL_RUN', '1', 'S', 'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1006', 'WO INCREMENT', '0', 'S', 'SYSTEM', CURRENT_DATE, 'seed')
        ON CONFLICT (param_code) DO UPDATE
        SET
            param_name = EXCLUDED.param_name,
            param_type = EXCLUDED.param_type,
            updatedby = 'SYSTEM',
            updateddate = CURRENT_DATE,
            updatedhost = 'seed';
    $sql$, v_schema);

    EXECUTE format($sql$
        INSERT INTO %I.frs9_param_commond (
            param_code, param_seq, value1, value2, value3, paramdesc,
            createdby, createddate, createdhost
        )
        VALUES
            ('S1003', 1, '1', 'Enabled',  'Y',   'Enable Payment Upload',        'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1003', 2, '0', 'Disabled', 'N',   'Disable Payment Upload',       'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1004', 1, 'Daily',   '1',  'DAILY',   'Run model daily',          'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1004', 2, 'Weekly',  '7',  'WEEKLY',  'Run model weekly',         'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1004', 3, 'Monthly', '30', 'MONTHLY', 'Run model monthly',        'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1006', 1, '0', 'Disabled', 'NO',  'Write Off increment disabled', 'SYSTEM', CURRENT_DATE, 'seed'),
            ('S1006', 2, '1', 'Enabled',  'YES', 'Write Off increment enabled',  'SYSTEM', CURRENT_DATE, 'seed')
        ON CONFLICT (param_code, param_seq) DO UPDATE
        SET
            value1 = EXCLUDED.value1,
            value2 = EXCLUDED.value2,
            value3 = EXCLUDED.value3,
            paramdesc = EXCLUDED.paramdesc,
            updatedby = 'SYSTEM',
            updateddate = CURRENT_DATE,
            updatedhost = 'seed';
    $sql$, v_schema);

    EXECUTE format($sql$
        WITH first_binary_detail AS (
            SELECT
                d.param_code,
                d.value1,
                row_number() OVER (PARTITION BY d.param_code ORDER BY d.param_seq) AS rn
            FROM %I.frs9_param_commond d
            WHERE d.value1 IN ('0', '1')
        ),
        binary_flag_codes AS (
            SELECT
                h.param_code,
                COALESCE(f.value1, '1') AS default_usage
            FROM %I.frs9_param_commonh h
            JOIN %I.frs9_param_commond d
              ON d.param_code = h.param_code
            LEFT JOIN first_binary_detail f
              ON f.param_code = h.param_code
             AND f.rn = 1
            WHERE h.param_type = 'S'
            GROUP BY h.param_code, f.value1
            HAVING bool_or(d.value1 = '1') AND bool_or(d.value1 = '0')
        ),
        resolved_usage AS (
            SELECT
                h.param_code,
                CASE
                    WHEN lower(trim(coalesce(h.param_usage, ''))) IN ('1', 'true', 't', 'yes', 'y', 'on', 'enabled') THEN '1'
                    WHEN lower(trim(coalesce(h.param_usage, ''))) IN ('0', 'false', 'f', 'no', 'n', 'off', 'disabled') THEN '0'
                    ELSE b.default_usage
                END AS new_usage
            FROM %I.frs9_param_commonh h
            JOIN binary_flag_codes b
              ON b.param_code = h.param_code
        )
        UPDATE %I.frs9_param_commonh h
        SET
            param_usage = r.new_usage,
            updatedby = 'SYSTEM',
            updateddate = CURRENT_DATE,
            updatedhost = 'seed'
        FROM resolved_usage r
        WHERE h.param_code = r.param_code
          AND h.param_usage IS DISTINCT FROM r.new_usage;
    $sql$, v_schema, v_schema, v_schema, v_schema, v_schema);

    EXECUTE format($sql$
        WITH default_interval AS (
            SELECT d.value2 AS default_value
            FROM %I.frs9_param_commond d
            WHERE d.param_code = 'S1004'
            ORDER BY d.param_seq
            LIMIT 1
        )
        UPDATE %I.frs9_param_commonh h
        SET
            param_usage = CASE
                WHEN trim(coalesce(h.param_usage, '')) ~ '^[0-9]+$' THEN trim(h.param_usage)
                ELSE coalesce((SELECT default_value FROM default_interval), '1')
            END,
            updatedby = 'SYSTEM',
            updateddate = CURRENT_DATE,
            updatedhost = 'seed'
        WHERE h.param_code = 'S1004'
          AND h.param_type = 'S'
          AND h.param_usage IS DISTINCT FROM CASE
              WHEN trim(coalesce(h.param_usage, '')) ~ '^[0-9]+$' THEN trim(h.param_usage)
              ELSE coalesce((SELECT default_value FROM default_interval), '1')
          END;
    $sql$, v_schema, v_schema);
END $$;
