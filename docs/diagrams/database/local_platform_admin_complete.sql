--
-- PostgreSQL database dump
--

\restrict jr0JBdZNU6aRXx7D4yhft0R9NNawiRTtAfSYI9dfgrSp6hUkAWosMkGNNs2ASPv

-- Dumped from database version 16.11
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: approval; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA approval;


ALTER SCHEMA approval OWNER TO postgres;

--
-- Name: audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA audit;


ALTER SCHEMA audit OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: core; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA core;


ALTER SCHEMA core OWNER TO postgres;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: ifrs9; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA ifrs9;


ALTER SCHEMA ifrs9 OWNER TO postgres;

--
-- Name: platform_audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_audit;


ALTER SCHEMA platform_audit OWNER TO postgres;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: filter_rule; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.filter_rule AS (
	column_name text,
	operator text,
	value text
);


ALTER TYPE public.filter_rule OWNER TO postgres;

--
-- Name: fn_adjust_30_360_daycount(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_adjust_30_360_daycount(p_day1 integer, p_day2 integer, p_last_day1 integer) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$

BEGIN
    RETURN 
        LEAST(p_day2, 30) 
        + (p_last_day1 - p_day1) 
        - 30;
END;
$$;


ALTER FUNCTION public.fn_adjust_30_360_daycount(p_day1 integer, p_day2 integer, p_last_day1 integer) OWNER TO postgres;

--
-- Name: fn_build_query_group(text, text, text, text, text, text, text, boolean, boolean, boolean, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_build_query_group(INOUT v_script text, p_column_name text, p_operator text, p_value1 text, p_value2 text, p_data_type text, p_condition text, p_is_first_group boolean, p_is_first_seq boolean, p_is_last_seq boolean, p_is_last_group boolean) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    
    -- Opening Bracket
    IF p_is_first_group AND NOT p_is_last_group THEN 
      v_script = '(';
    END IF;

    IF p_is_first_seq THEN
      IF NOT p_is_first_group THEN
        v_script = v_script || ' ' || p_condition || ' ' || '(';
      ELSE
        v_script = v_script || '(';
      END IF;
    ELSE
        v_script = v_script || ' ' || p_condition || ' ';
    END IF;


    -- Where clause construction
    v_script := v_script || fn_build_where_clause(
        p_column_name
        , p_operator
        , p_value1
        , p_value2
        , p_data_type
    );

    -- Closing Bracket
    IF p_is_last_seq THEN
      v_script = v_script || ')';
    END IF;

    IF NOT p_is_first_group AND p_is_last_group AND p_is_last_seq THEN 
      v_script = v_script || ')';
    END IF;

END;
$$;


ALTER FUNCTION public.fn_build_query_group(INOUT v_script text, p_column_name text, p_operator text, p_value1 text, p_value2 text, p_data_type text, p_condition text, p_is_first_group boolean, p_is_first_seq boolean, p_is_last_seq boolean, p_is_last_group boolean) OWNER TO postgres;

--
-- Name: fn_build_where_clause(text, text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_build_where_clause(p_column text, p_operator text, p_value1 text, p_value2 text, p_data_type text) RETURNS text
    LANGUAGE plpgsql
    AS $$
  
  DECLARE
  v_is_quoted BOOLEAN := TRUE;
  v_val1 TEXT := NULL;
  v_val2 TEXT := NULL;
  v_operator TEXT := NULL;
  
BEGIN
    -- Normalize
    p_column := TRIM(LOWER(p_column));
    p_operator := TRIM(p_operator);
    
    SELECT val1, val2, operator INTO v_val1, v_val2, v_operator
    FROM fn_normalize_values(p_data_type, p_value1, p_value2, p_operator);
    
    -- quoted
    IF TRIM(p_data_type) ILIKE ANY (ARRAY['NUMBER' ,'DECIMAL' ,'NUMERIC' ,'FLOAT' ,'INT', 'BIT']) THEN
      v_is_quoted := FALSE;
    END IF;
    

    -- Handle BETWEEN
    IF LOWER(v_operator) = 'between' THEN
        IF v_is_quoted THEN
            RETURN FORMAT('%I BETWEEN %L AND %L',
                p_column,
                v_val1,
                v_val2);
        ELSE
            RETURN FORMAT('%I BETWEEN %s AND %s',
                p_column,
                v_val1,
                v_val2);
        END IF;

    -- Handle IN
    ELSIF LOWER(v_operator) = 'in' THEN
        IF v_is_quoted THEN
            RETURN FORMAT('%I IN (%s)', p_column,
                array_to_string(
                    ARRAY(SELECT quote_literal(trim(val))
                          FROM unnest(string_to_array(v_val1, ',')) AS val),
                    ', '
                ));
        ELSE
            RETURN FORMAT('%I IN (%s)', p_column, v_val1);
        END IF;

    -- Handle standard binary operators
    ELSE
        IF v_is_quoted THEN
            RETURN FORMAT('%I %s %L', p_column, v_operator, v_val1);
        ELSE
            RETURN FORMAT('%I %s %s', p_column, v_operator, v_val1);
        END IF;
    END IF;
END;
$$;


ALTER FUNCTION public.fn_build_where_clause(p_column text, p_operator text, p_value1 text, p_value2 text, p_data_type text) OWNER TO postgres;

--
-- Name: fn_eomonth(date, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_eomonth(base_date date, offset_months integer DEFAULT 0) RETURNS date
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN (
        date_trunc('month', base_date + INTERVAL '1 month' * offset_months)
        + INTERVAL '1 month' - INTERVAL '1 day'
    )::DATE;
END;
$$;


ALTER FUNCTION public.fn_eomonth(base_date date, offset_months integer) OWNER TO postgres;

--
-- Name: fn_frs9_cnt_days_30_360(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_cnt_days_30_360(date1 date, date2 date) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
  -- static
  eom1 DATE := fn_eomonth(date1,0);
  eom2 DATE := fn_eomonth(date2,0);
  day1 INT := EXTRACT(DAY FROM date1)::INT;
  day2 INT := EXTRACT(DAY FROM date2)::INT;
  month1 INT := EXTRACT(MONTH FROM date1)::INT;
  month2 INT := EXTRACT(MONTH FROM date2)::INT;
  
  v1 INT;
  last_day1 INT := EXTRACT(DAY FROM eom1)::INT;
  last_day2 INT := EXTRACT(DAY FROM eom2)::INT;
BEGIN
  
  IF last_day1 > 30 AND last_day1 <> day1 THEN
      last_day1 := 30;
  END IF;

  IF last_day2 > 30 AND last_day2 <> day2 THEN
      last_day2 := 30;
  END IF;

  /*
  v1 := (DATE_PART('month', date2) - DATE_PART('month', date1)
        + (DATE_PART('year', date2) - DATE_PART('year', date1)) * 12) * 30;
  */
  
  v1 := fn_get_total_months(eom1, eom2) * 30;
  
  IF day1 <> day2 THEN
    
    IF month1 = month2 THEN
      -- Are both dates EOMONTH?
      IF day1 = EXTRACT(DAY FROM eom1)::INT AND day2 = EXTRACT(DAY FROM eom2) THEN
        -- no adjustment
      ELSE
        v1 := v1 + (day2 - day1);
      END IF;
    
    ELSE
      
      -- Is @DATE2 in February?
      IF month1 =1 OR month2 = 2 THEN
        v1 := v1 + fn_adjust_30_360_daycount(day1, day2, last_day1);
        
      ELSE
--         v1 := v1 - 30 + (LEAST(30, d2) + (last_day1 - day1));
        v1 := v1 + fn_adjust_30_360_daycount(day1, day2, last_day1);
      END IF;
  
    END IF;
  
  END IF;

  RETURN v1;
END;
$$;


ALTER FUNCTION public.fn_frs9_cnt_days_30_360(date1 date, date2 date) OWNER TO postgres;

--
-- Name: fn_frs9_get_sicr_rule(integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_get_sicr_rule(p_rule_id integer, p_stage_from text) RETURNS text
    LANGUAGE plpgsql
    AS $$
  
  DECLARE
  stage_rec RECORD;
  cond_rec RECORD;
  
  
  v_sql TEXT;
  v_script1 TEXT;
  v_script2 TEXT;
BEGIN

  FOR stage_rec IN
    SELECT * FROM (
      SELECT 
        rule_id, stage_to
      FROM frs9_param_scenario_rulesd
      WHERE rule_id = P_rule_id AND detail_type = 'SICR' AND stage_from = p_stage_from
      GROUP BY rule_id, stage_to
    ) a
    ORDER BY stage_to DESC
  LOOP
    /*
    -- Debug stage_rec
    RAISE NOTICE 'Processing rule_id: %, stage_to: %', 
      stage_rec.rule_id
      , stage_rec.stage_to;
    */
    v_script1 := '';
    v_sql := '';
    FOR cond_rec IN
      SELECT 
        query_group = MIN(query_group) OVER () AS is_first_group,
        d_seq = MIN(d_seq) OVER (PARTITION BY query_group) AS is_first_seq,
        d_seq = MAX(d_seq) OVER (PARTITION BY query_group) AS is_last_seq,
        query_group = MAX(query_group) OVER () AS is_last_group,
        query_group,
        d_seq AS seq,
        "table_name",
        "column_name",
        data_type,
        "operator",
        value1,
        value2,
        "condition"
      FROM view_param_scenario_rules
      WHERE 
        rule_id = stage_rec.rule_id 
        AND detail_type = 'SICR'
        AND stage_from = p_stage_from
        AND stage_to = stage_rec.stage_to
      ORDER BY query_group,seq
    LOOP
    /*
      RAISE NOTICE 'is_first_group: %, is_first_seq: %, is_last_seq: %, is_last_group: %, query_group: %, seq: %, table_name: %, column_name: %, data_type: %, operator: %, value1: %, value2: %, condition: %'
        , cond_rec.is_first_group
        , cond_rec.is_first_seq
        , cond_rec.is_last_seq
        , cond_rec.is_last_group
        , cond_rec.query_group
        , cond_rec.seq
        , cond_rec.table_name
        , cond_rec.column_name
        , cond_rec.data_type
        , cond_rec.operator
        , cond_rec.value1
        , cond_rec.value2
        , cond_rec.condition;
    */
      -- Build Condition
      SELECT fn_build_query_group(
        v_script1
        , cond_rec.column_name
        , cond_rec.operator
        , cond_rec.value1
        , cond_rec.value2
        , cond_rec.data_type
        , cond_rec.condition
        , cond_rec.is_first_group
        , cond_rec.is_first_seq
        , cond_rec.is_last_seq
        , cond_rec.is_last_group
      ) INTO v_script1;
      
    END LOOP;
    
    v_sql := v_sql || format('WHEN %s THEN %L', v_script1, stage_rec.stage_to);
--     RAISE NOTICE 'Condition: %', v_sql;
    
    v_script2 := COALESCE(v_script2,'') || v_sql;
  END LOOP;

--     RAISE NOTICE 'Condition: %', v_script2;

  RETURN trim(v_script2);
END
$$;


ALTER FUNCTION public.fn_frs9_get_sicr_rule(p_rule_id integer, p_stage_from text) OWNER TO postgres;

--
-- Name: fn_frs9_getprocesstime(timestamp without time zone, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_getprocesstime(v_start timestamp without time zone, v_end timestamp without time zone) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    range_seconds INTEGER;
    hours TEXT;
    minutes TEXT;
    seconds TEXT;
    process_time TEXT;
BEGIN
    -- Total duration in seconds
    range_seconds := EXTRACT(EPOCH FROM v_end - v_start);

    -- Calculate hours, minutes, seconds
    hours := LPAD(
        CAST(FLOOR(range_seconds / 3600) AS TEXT),
        2, '0'
    );

    minutes := LPAD(
        CAST(FLOOR(MOD(range_seconds, 3600) / 60) AS TEXT),
        2, '0'
    );

    seconds := LPAD(
        CAST(FLOOR(MOD(range_seconds, 60)) AS TEXT),
        2, '0'
    );

    -- Format as HH:MM:SS
    process_time := hours || ':' || minutes || ':' || seconds;

    RETURN process_time;
END;
$$;


ALTER FUNCTION public.fn_frs9_getprocesstime(v_start timestamp without time zone, v_end timestamp without time zone) OWNER TO postgres;

--
-- Name: fn_frs9_imp_ca_ead_process_interest_amt(text, date, date, text, text, numeric, double precision, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_imp_ca_ead_process_interest_amt(grace_type text, next_payment_date date, grace_end_date date, payment_code text, interest_base text, os_balance numeric, interest_rate double precision, fix_interest_amt numeric) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
  IF LOWER(grace_type) IN ('b','i') AND next_payment_date <= grace_end_date THEN
    RETURN 0;
  ELSIF payment_code = '2' THEN
    RETURN fix_interest_amt;
  ELSIF interest_base = '6' THEN
    RETURN os_balance * interest_rate / 100 / 12;
  ELSE
    RETURN 0;
  END IF;
END;
$$;


ALTER FUNCTION public.fn_frs9_imp_ca_ead_process_interest_amt(grace_type text, next_payment_date date, grace_end_date date, payment_code text, interest_base text, os_balance numeric, interest_rate double precision, fix_interest_amt numeric) OWNER TO postgres;

--
-- Name: fn_frs9_imp_ca_ead_process_principal_amt(date, date, numeric, text, date, text, text, double precision, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_imp_ca_ead_process_principal_amt(next_payment_date date, maturity_date date, os_balance numeric, grace_type text, grace_end_date date, payment_code text, interest_base text, interest_rate double precision, installment numeric, fix_principal_amt numeric) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
  computed_amt NUMERIC(32,6);
BEGIN
  -- Step 1: Compute the base amount
  computed_amt := CASE
    WHEN LOWER(grace_type) IN ('b','p') AND next_payment_date <= grace_end_date THEN 0
    ELSE CASE
      WHEN payment_code = '0' THEN installment -
        CASE WHEN interest_base = '6' THEN os_balance * interest_rate / 100 / 12
             ELSE 0 END
      WHEN payment_code = '1' THEN 0
      WHEN payment_code = '2' THEN fix_principal_amt
      ELSE 0
    END
  END;

  -- Step 2: Apply maturity and balance logic
  IF next_payment_date >= maturity_date OR (os_balance - computed_amt <= 0) THEN
    RETURN os_balance;
  ELSE
    RETURN computed_amt;
  END IF;
END;
$$;


ALTER FUNCTION public.fn_frs9_imp_ca_ead_process_principal_amt(next_payment_date date, maturity_date date, os_balance numeric, grace_type text, grace_end_date date, payment_code text, interest_base text, interest_rate double precision, installment numeric, fix_principal_amt numeric) OWNER TO postgres;

--
-- Name: fn_frs9_pv(double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_frs9_pv(i_input double precision, n_input double precision, pmt_input double precision) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    pv_result NUMERIC(32,6);
BEGIN
    pv_result := pmt_input * (1.0 / POWER(1.0 + i_input, n_input));
    RETURN pv_result;
END;
$$;


ALTER FUNCTION public.fn_frs9_pv(i_input double precision, n_input double precision, pmt_input double precision) OWNER TO postgres;

--
-- Name: fn_get_total_months(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_total_months(start_date date, end_date date) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
  RETURN (
    (EXTRACT(YEAR FROM end_date) - EXTRACT(YEAR FROM start_date)) * 12
    + (EXTRACT(MONTH FROM end_date) - EXTRACT(MONTH FROM start_date))
  );
END;
$$;


ALTER FUNCTION public.fn_get_total_months(start_date date, end_date date) OWNER TO postgres;

--
-- Name: fn_get_total_quarter(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_total_quarter(start_date date, end_date date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
 RETURN (EXTRACT(YEAR FROM end_date) * 4 + EXTRACT(QUARTER FROM end_date)::int)
       - (EXTRACT(YEAR FROM start_date) * 4 + EXTRACT(QUARTER FROM start_date)::int);
END
$$;


ALTER FUNCTION public.fn_get_total_quarter(start_date date, end_date date) OWNER TO postgres;

--
-- Name: fn_get_total_year(date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_total_year(start_date date, end_date date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM end_date)::INT
       - EXTRACT(YEAR FROM start_date)::INT;
END
$$;


ALTER FUNCTION public.fn_get_total_year(start_date date, end_date date) OWNER TO postgres;

--
-- Name: fn_is_leap_year(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_is_leap_year(p_date date) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM p_date)::INT % 4 = 0
           AND (EXTRACT(YEAR FROM p_date)::INT % 100 <> 0 OR EXTRACT(YEAR FROM p_date)::INT % 400 = 0);
END;
$$;


ALTER FUNCTION public.fn_is_leap_year(p_date date) OWNER TO postgres;

--
-- Name: fn_normalize_values(text, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_normalize_values(p_data_type text, p_value1 text, p_value2 text, p_operator text) RETURNS TABLE(val1 text, val2 text, operator text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 🔁 Normalize operator for BIT
    operator := CASE
        WHEN TRIM(p_data_type) ILIKE 'BIT' THEN
            CASE TRIM(p_operator)
                WHEN '=' THEN 'IS'
                WHEN '<>' THEN 'IS NOT'
                ELSE p_operator
            END
        ELSE p_operator
    END;

    -- 📅 DATE/DATETIME normalization
    IF TRIM(p_data_type) ILIKE ANY (ARRAY['DATE','DATETIME']) THEN
        val1 := REPLACE(REPLACE(TRIM(p_value1), '/', '-'), '.', '-');
        val2 := REPLACE(REPLACE(TRIM(p_value2), '/', '-'), '.', '-');

        IF val1 IS NULL OR val1 = '' THEN
            val1 := '1900-01-01';
        END IF;

        IF val2 IS NULL OR val2 = '' THEN
            val2 := '2099-12-31';
        END IF;

    -- 🔘 BIT normalization
    ELSIF TRIM(p_data_type) ILIKE 'BIT' THEN
        val1 := LOWER(TRIM(COALESCE(p_value1, '0')));
        val2 := LOWER(TRIM(COALESCE(p_value2, '0')));

        val1 := CASE val1
            WHEN '1' THEN 'TRUE' WHEN 'y' THEN 'TRUE' WHEN 'true' THEN 'TRUE'
            WHEN '0' THEN 'FALSE' WHEN 'n' THEN 'FALSE' WHEN 'false' THEN 'FALSE'
            ELSE val1
        END;

        val2 := CASE val2
            WHEN '1' THEN 'TRUE' WHEN 'y' THEN 'TRUE' WHEN 'true' THEN 'TRUE'
            WHEN '0' THEN 'FALSE' WHEN 'n' THEN 'FALSE' WHEN 'false' THEN 'FALSE'
            ELSE val2
        END;

    -- 🔄 Default passthrough
    ELSE
        val1 := p_value1;
        val2 := p_value2;
    END IF;

    RETURN NEXT;
END;
$$;


ALTER FUNCTION public.fn_normalize_values(p_data_type text, p_value1 text, p_value2 text, p_operator text) OWNER TO postgres;

--
-- Name: fn_reset_sequence(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_reset_sequence(table_name text, col_id text DEFAULT 'pkid'::text) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    seq_name text;
    next_val bigint;
    full_query text;
BEGIN
    -- Get the sequence linked to the pkid column
    SELECT pg_get_serial_sequence(table_name, col_id) INTO seq_name;

    IF seq_name IS NULL THEN
        RAISE NOTICE 'No serial sequence found for %.pkid', table_name;
        RETURN NULL;
    END IF;

    -- Build and execute dynamic SQL to reset the sequence
    full_query := format(
        'SELECT setval(''%s'', (SELECT COALESCE(MAX(%s), 0) + 1 FROM %I), false)',
        seq_name,
        col_id,
        table_name
    );

    EXECUTE full_query INTO next_val;

    RETURN next_val;
END;
$$;


ALTER FUNCTION public.fn_reset_sequence(table_name text, col_id text) OWNER TO postgres;

--
-- Name: sp_frs9_account_id(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_account_id(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN

  -- : query
  WITH dedup AS (
    SELECT
      TRIM(account_number) AS account_number,
      TRIM(facility_number) AS facility_number,
      TRIM(cif_number) AS cif_number,
      TRIM(cif_name) AS cif_name,
      ROW_NUMBER() OVER (
        PARTITION BY TRIM(account_number)
        ORDER BY prc_date DESC  -- Take latest per account
      ) AS rn
    FROM stg_frs9_master_account_bpf
    WHERE prc_date = p_prc_date
  )
  INSERT INTO frs9_account_id (
    account_number,
    facility_number,
    cif_number,
    cif_name
  )
  SELECT
    d.account_number,
    d.facility_number,
    d.cif_number,
    d.cif_name
  FROM dedup d
  LEFT JOIN frs9_account_id f ON f.account_number = d.account_number
  WHERE d.rn = 1
    AND f.account_number IS NULL;

END;
$$;


ALTER PROCEDURE public.sp_frs9_account_id(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_ecl_sequence(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_ecl_sequence()
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE;
    v_param TEXT;
    param_prc_name TEXT := 'IMP SEQUENCE';
    v_sessionid UUID;
    v_counter INTEGER;
    is_paym_fromcore BOOLEAN;
BEGIN
    -- Step 2: Load Context
    SELECT currdate INTO v_currdate
    FROM frs9_prc_date;

    SELECT param_usage INTO is_paym_fromcore
    FROM frs9_param_commonh
    WHERE param_code = 'S1003';

    SELECT COALESCE(MAX(counter), 0) + 1 INTO v_counter
    FROM frs9_statistic
    WHERE sp_name = 'ECL SEQUENCE' AND prc_name = param_prc_name;

    -- Step 3: Build Execution Context
    v_param := quote_literal(v_currdate) || ', ' || quote_literal('M') || ', 0';
    v_sessionid := gen_random_uuid();

    -- Step 4: Update Session & Log Start
    UPDATE frs9_prc_date
    SET sessionid = v_sessionid;

    INSERT INTO frs9_statistic (
        prc_date,
        sp_name,
        start_date,
        iscomplete,
        counter,
        prc_name,
        sessionid,
        remark
    )
    VALUES (
        v_currdate,
        'ECL SEQUENCE',
        CURRENT_TIMESTAMP,
        'N',
        v_counter,
        param_prc_name,
        v_sessionid,
        'RUNNING'
    );

    -- Step 5: Execute Sub-Procedures via Wrapper
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_result_d', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_result_h', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_update_ima', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_update_ima', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_journal_data', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_movement_data', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_nominative', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_finish_ecl', param_prc_name, v_currdate, v_param, 'Y');

    -- Step 6: Finalize Status
    UPDATE frs9_prc_date
    SET batch_status = 'FINISHED',
        remark = 'ECL SEQUENCE';

    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'Y',
        prc_process_time = fn_frs9_getprocesstime(start_date::TIMESTAMP, NOW()::TIMESTAMP),
        remark = 'SUCCEED'
    WHERE prc_date = v_currdate
      AND sp_name = 'ECL SEQUENCE'
      AND prc_name = param_prc_name
      AND sessionid = v_sessionid::TEXT;
END;
$$;


ALTER PROCEDURE public.sp_frs9_ecl_sequence() OWNER TO postgres;

--
-- Name: sp_frs9_exec_and_log(character varying, character varying, date, text, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_exec_and_log(IN p_sp_name character varying, IN p_prc_name character varying DEFAULT 'IMP'::character varying, IN p_prc_date date DEFAULT NULL::date, IN p_parameter text DEFAULT ''::text, IN p_execute_flag character DEFAULT 'Y'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_counter               INTEGER;
    v_currdate              DATE;
    v_sessionid             UUID;
    v_minstartdate_session  TIMESTAMP;
    v_str_sql               TEXT;
    v_errm                  TEXT;
BEGIN
    -- Get current date and session ID
    IF p_prc_date IS NOT NULL THEN
        SELECT sessionid INTO v_sessionid FROM frs9_prc_date;
        v_currdate := p_prc_date;
    ELSE
        SELECT sessionid, currdate INTO v_sessionid, v_currdate FROM frs9_prc_date;
    END IF;

    -- Get counter and session start time
    SELECT COALESCE(MAX(counter), 0) + 1,
           COALESCE(MIN(start_date), CURRENT_TIMESTAMP)
    INTO v_counter, v_minstartdate_session
    FROM frs9_statistic
    WHERE prc_name = p_prc_name
      AND prc_date = v_currdate
      AND sessionid = v_sessionid::text;

    -- Update status
    UPDATE frs9_prc_date
    SET batch_status = 'RUNNING..',
        remark = p_sp_name;

    DELETE FROM frs9_statistic
    WHERE prc_date = v_currdate
      AND sp_name = p_sp_name
      AND prc_name = p_prc_name;

    INSERT INTO frs9_statistic (
        prc_date, sp_name, start_date, iscomplete,
        counter, prc_name, sessionid, remark, parameter
    )
    VALUES (
        v_currdate, p_sp_name, CURRENT_TIMESTAMP, 'N',
        v_counter, p_prc_name, v_sessionid, 'RUNNING..', p_parameter
    );

    -- Execute dynamic SQL
    IF p_execute_flag = 'Y' THEN
        -- Safely format the procedure call with parameters
        v_str_sql := format('CALL %I(%s)', p_sp_name, p_parameter);

        RAISE NOTICE 'Executing: %', v_str_sql;

        EXECUTE v_str_sql;
    END IF;

    -- Final updates
    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'Y',
        prc_process_time = fn_frs9_getprocesstime(start_date::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP),
        remark = 'SUCCEED'
    WHERE prc_date = v_currdate
      AND sp_name = p_sp_name
      AND prc_name = p_prc_name;

    UPDATE frs9_statistic
    SET session_process_time = fn_frs9_getprocesstime(v_minstartdate_session::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP)
    WHERE prc_date = v_currdate
      AND prc_name = p_prc_name;

    UPDATE frs9_prc_date
    SET batch_status = 'FINISHED',
        remark = format('EXECUTE %s IS SUCCEED', p_sp_name),
        last_process_date = currdate;

EXCEPTION WHEN OTHERS THEN
    v_errm := SQLERRM;

    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'N',
        remark = format('ERROR - %s', v_errm)
    WHERE prc_date = v_currdate
      AND sp_name = p_sp_name
      AND prc_name = p_prc_name;

    UPDATE frs9_prc_date
    SET batch_status = 'ERROR!!',
        remark = format('%s (%s)', v_errm, p_prc_name);

    RAISE EXCEPTION '%', v_errm;
END;
$$;


ALTER PROCEDURE public.sp_frs9_exec_and_log(IN p_sp_name character varying, IN p_prc_name character varying, IN p_prc_date date, IN p_parameter text, IN p_execute_flag character) OWNER TO postgres;

--
-- Name: sp_frs9_exec_rule(date, text, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_exec_rule(IN p_prc_date date, IN p_scenario_rule_type text, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Step 1: Initialize working variables and declare loop records
    v_currdate DATE := p_prc_date;
    v_updated_table TEXT;
    v_updated_column TEXT;
    v_rule_type TEXT;
    v_rule_code TEXT;
    v_rule_id INT;
    v_script TEXT;
    v_str_sql TEXT;
    
    -- cursor
    rules_h RECORD;
    rules_d RECORD;
BEGIN

  -- Step 2: Iterate over ranked rule headers using a subquery
  FOR rules_h IN
    SELECT
      rule_id,
      CASE WHEN p_prc = 'M' THEN updated_table ELSE 'tmp_fma_preview' END AS updated_table,
      updated_column,
      "value" AS rule_code,
      rule_type
    FROM view_param_scenario_rules
    WHERE active_flag IS TRUE AND rule_type = p_scenario_rule_type
    GROUP BY updated_table, updated_column, rule_type, "value", rule_id
  LOOP

    -- Step 3: Assign header values to working variables
    v_updated_table := TRIM(LOWER(rules_h.updated_table));
    v_updated_column := TRIM(LOWER(rules_h.updated_column));
    v_rule_type := rules_h.rule_type;
    v_rule_code := rules_h.rule_code;
    v_rule_id := rules_h.rule_id;
    v_script := '';

    -- Debug the output
    RAISE NOTICE 'STEP3: Variables Assigned -> Table: %, Column: %, Type: %, Code: %, ID: %',
        v_updated_table,
        v_updated_column,
        v_rule_type,
        v_rule_code,
        v_rule_id;
        
    -- Step 4: Iterate over rule conditions
    FOR rules_d IN 
      SELECT
        query_group = MIN(query_group) OVER () AS is_first_group,
        seq = MIN(seq) OVER (PARTITION BY query_group) AS is_first_seq,
        seq = MAX(seq) OVER (PARTITION BY query_group) AS is_last_seq,
        query_group = MAX(query_group) OVER () AS is_last_group,
        seq,
        column_name,
        data_type,
        operator,
        value1,
        value2,
        condition
      FROM frs9_param_scenario_rulesd
      WHERE rule_id = v_rule_id
      ORDER BY query_group, seq
    LOOP
      
      -- rules_d output :
      RAISE NOTICE 'is_first_group=%, is_first_seq=%, is_last_seq=%, is_last_group=%, seq=%, column_name=%, data_type=%, operator=%, value1=%, value2=%, condition=%',
        rules_d.is_first_group,
        rules_d.is_first_seq,
        rules_d.is_last_seq,
        rules_d.is_last_group,
        rules_d.seq,
        rules_d.column_name,
        rules_d.data_type,
        rules_d.operator,
        rules_d.value1,
        rules_d.value2,
        rules_d.condition;
    
      SELECT fn_build_query_group(
        v_script
        , rules_d.column_name
        , rules_d.operator
        , rules_d.value1
        , rules_d.value2
        , rules_d.data_type
        , rules_d.condition
        , rules_d.is_first_group
        , rules_d.is_first_seq
        , rules_d.is_last_seq
        , rules_d.is_last_group
      ) INTO v_script;
    
    END LOOP;
    
--     RAISE NOTICE 'Where Clause: %', v_script;
    
    v_str_sql = FORMAT('UPDATE %I SET %I = %L WHERE prc_date=%L AND %s',
      v_updated_table
      , v_updated_column
      , v_rule_code
      , v_currdate
      , v_script
    );
    RAISE NOTICE 'SQL: %', v_str_sql;
    EXECUTE v_str_sql;

  END LOOP;

END;
$$;


ALTER PROCEDURE public.sp_frs9_exec_rule(IN p_prc_date date, IN p_scenario_rule_type text, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_exec_rule_stage(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_exec_rule_stage(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_table_name TEXT := CASE WHEN p_prc = 'M' THEN 'frs9_master_account' ELSE 'tmp_fma_preview' END;
    v_script1 TEXT := '';
    v_script2 TEXT := '';
    v_sql TEXT := '';
    --
    rules_h RECORD;
    rules_d RECORD;
    
BEGIN
    
  -- Step 1: Reset STAGE and SICR_FLAG
  EXECUTE format(
    'UPDATE %I SET stage = 0, sicr_flag = FALSE WHERE prc_date = %L',
    v_table_name, p_prc_date
  );
   
  -- Step 2: Iterate Over Active STAGE Rules
  FOR rules_h IN
    WITH ecl_config AS (
      SELECT
        stage_rule_id
        , pf_segment_id
      FROM view_imp_ca_ecl_config
      WHERE 
        effective_date <= p_prc_date
        AND (ecl_model_id = p_ecl_model_id OR (p_ecl_model_id = 0 AND active_flag IS TRUE))
    ), scene_rules AS (
      SELECT
        rule_id
        , updated_column
        , rule_type
        , table_name
        , detail_type
      FROM view_param_scenario_rules
      WHERE 
        rule_type = 'STAGE'
        AND detail_type <> 'SICR'
        AND active_flag IS TRUE 
    )

    SELECT 
    a.rule_id
    , a.updated_column
    , a.rule_type
    , a.table_name
    , a.detail_type
    , b.pf_segment_id
    FROM scene_rules a JOIN ecl_config b
      ON a.rule_id=b.stage_rule_id
    GROUP BY
      a.rule_id
      , a.updated_column
      , a.rule_type
      , a.table_name
      , a.detail_type
      , b.pf_segment_id
    ORDER BY
      a.rule_id
      , a.updated_column
      , a.rule_type
      , a.table_name
      , a.detail_type
      , b.pf_segment_id
  LOOP
    
    -- Debug output :
    RAISE NOTICE 'Applying rule_id: %, column: %, table: %, segment: %, type: %, detail: %',
      rules_h.rule_id,
      rules_h.updated_column,
      rules_h.table_name,
      rules_h.pf_segment_id,
      rules_h.rule_type,
      rules_h.detail_type;
    
    -- Step 3: Build rule condition dynamically
    v_script1 := '';
    FOR rules_d IN
      SELECT 
        query_group = MIN(query_group) OVER () AS is_first_group,
        d_seq = MIN(d_seq) OVER (PARTITION BY query_group) AS is_first_seq,
        d_seq = MAX(d_seq) OVER (PARTITION BY query_group) AS is_last_seq,
        query_group = MAX(query_group) OVER () AS is_last_group,
        query_group,
        d_seq AS seq,
        "table_name",
        "column_name",
        data_type,
        "operator",
        value1,
        value2,
        "condition"
      FROM view_param_scenario_rules
      WHERE rule_id = rules_h.rule_id::INT AND detail_type = rules_h.detail_type::TEXT
      ORDER BY query_group, d_seq
    LOOP
    
      -- debug output:
      RAISE NOTICE 'Grp: %, Seq: %, FirstGrp: %, LastGrp: %, FirstSeq: %, LastSeq: %, Table: %, Col: %, Type: %, Op: %, Val1: %, Val2: %, Cond: %',
        rules_d.query_group,
        rules_d.seq,
        rules_d.is_first_group,
        rules_d.is_last_group,
        rules_d.is_first_seq,
        rules_d.is_last_seq,
        rules_d.table_name,
        rules_d.column_name,
        rules_d.data_type,
        rules_d.operator,
        rules_d.value1,
        rules_d.value2,
        rules_d.condition;
        
      -- Build WHERE Clause
      SELECT fn_build_query_group(
        v_script1
        , rules_d.column_name
        , rules_d.operator
        , rules_d.value1
        , rules_d.value2
        , rules_d.data_type
        , rules_d.condition
        , rules_d.is_first_group
        , rules_d.is_first_seq
        , rules_d.is_last_seq
        , rules_d.is_last_group
      ) INTO v_script1;

    END LOOP;
    
    -- Step 4: Get SICR rule logic
    SELECT fn_frs9_get_sicr_rule(rules_h.rule_id, rules_h.detail_type) INTO v_script2;
--     RAISE NOTICE 'Where Clause: %, SICR: %', v_script1, v_script2;
    
    -- Wrap SICR logic in CASE expression
    v_script2 := format('CASE %s WHEN %L = %L THEN %L END',
      v_script2, rules_h.detail_type, rules_h.detail_type, rules_h.detail_type
    );
--     RAISE NOTICE 'Script: %', v_script2;

    -- Step 6: Build final dynamic UPDATE
    v_sql := format('
      UPDATE %I SET 
        %I = %s, sicr_flag = CASE WHEN %L = %s THEN FALSE ELSE TRUE END
      WHERE prc_date = %L
        AND account_status IN (''A'',''R'')
        AND %s
        AND segment_id = %L
    ',
      v_table_name,
      lower(rules_h.updated_column),
      v_script2,
      rules_h.detail_type,
      v_script2,
      p_prc_date,
      v_script1,
      rules_h.pf_segment_id
    );
    RAISE NOTICE 'Script: %', v_sql;
    EXECUTE v_sql;

  END LOOP;
  
END;
$$;


ALTER PROCEDURE public.sp_frs9_exec_rule_stage(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_account_event(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_account_event(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialize current and previous month-end dates
  v_currdate DATE := fn_eomonth(p_prc_date, 0);
  v_sql TEXT;
  v_table_name TEXT;
  
--   v_prevdate DATE := date_trunc('month', p_prc_date) - INTERVAL '1 day';
BEGIN

  -- Step 7: Persist results based on mode
  IF p_prc = 'M' THEN
    DELETE FROM frs9_imp_ca_account_event WHERE prc_date = v_currdate;
    v_table_name := 'frs9_imp_ca_account_event';
  ELSE
    TRUNCATE TABLE frs9_imp_ca_account_event_prv;
    v_table_name := 'frs9_imp_ca_account_event_prv';
  END IF;

  -- Step 2: Create temporary event table
  DROP TABLE IF EXISTS tmp_event;
  CREATE TEMP TABLE tmp_event (
    prc_date DATE,
    account_id BIGINT,
    event_id SMALLINT,
    old_value VARCHAR(100),
    new_value VARCHAR(100),
    remarks VARCHAR(100),
    createdby VARCHAR(50),
    createddate TIMESTAMP
  ) ON COMMIT DROP;

  WITH master AS (
    SELECT 
      a.prc_date
      , b.prc_date as prev_date
      , a.account_id
      , CASE 
          WHEN b.prc_date IS NULL THEN TRUE
          ELSE FALSE 
        END AS new_account
      , b.interest_rate::TEXT AS old_interest
      , a.interest_rate::TEXT AS new_interest
      , b.maturity_date::TEXT AS old_maturity_date
      , a.maturity_date::TEXT AS new_maturity_date
      , b.installment_amt::TEXT AS old_installment_amt
      , a.installment_amt::TEXT AS new_installment_amt
    FROM tmp_frs9_ecl_fma a
    LEFT JOIN tmp_frs9_master_account_prev b ON a.account_id=b.account_id
    WHERE a.prc_date=v_currdate AND (b.prc_date=fn_eomonth(v_currdate, -1) OR b.prc_date IS NULL)

  ), new_account AS (

    -- Step 3: Detect NEW ACCOUNT (Event ID = 1)
    SELECT
      prc_date
      , account_id
      , 1 as event_id
      , '0' as old_value
      , '1' as new_value
      , 'NEW ACCOUNT' as remarks
      , 'FRS9_IMP_CA_ACCOUNT_EVENT1' as createdby,
      CURRENT_TIMESTAMP as createddate
    FROM master 
    WHERE new_account IS TRUE

  ), interest_rate AS (
    
    -- Step 4: Detect INTEREST RATE CHANGE (Event ID = 2)
    SELECT
      prc_date
      , account_id
      , 2 as event_id
      , old_interest as old_value
      , new_interest as new_value
      , 'INT RATE CHANGE' as remarks
      , 'FRS9_IMP_CA_ACCOUNT_EVENT1' as createdby,
      CURRENT_TIMESTAMP as createddate
    FROM master 
    WHERE new_account IS FALSE AND old_interest <> new_interest
    
  ), maturity_date AS (
    
    -- Step 5: Detect MATURITY DATE CHANGE (Event ID = 3)
      SELECT
      prc_date
      , account_id
      , 3 as event_id
      , old_maturity_date as old_value
      , new_maturity_date as new_value
      , 'MATURITY DATE CHANGE' as remarks
      , 'FRS9_IMP_CA_ACCOUNT_EVENT1' as createdby,
      CURRENT_TIMESTAMP as createddate
    FROM master 
    WHERE new_account IS FALSE AND old_maturity_date <> new_maturity_date

  ), installment_amt AS (

    -- Step 6: Detect INSTALLMENT AMOUNT CHANGE (Event ID = 4)
    SELECT
      prc_date
      , account_id
      , 3 AS event_id
      , old_installment_amt as old_value
      , new_installment_amt as new_value
      , 'MATURITY DATE CHANGE' as remarks
      , 'FRS9_IMP_CA_ACCOUNT_EVENT1' as createdby,
      CURRENT_TIMESTAMP as createddate
    FROM master 
    WHERE new_account IS FALSE AND old_installment_amt <> new_installment_amt

  )
  
  INSERT INTO tmp_event (
    prc_date, account_id, event_id, old_value, new_value, remarks, createdby, createddate
  )
  SELECT * FROM new_account
    UNION
  SELECT * FROM interest_rate
    UNION
  SELECT * FROM maturity_date
    UNION 
  SELECT * from installment_amt;
  
  v_sql := format($f$
    INSERT INTO %I (prc_date, account_id, event_id, old_value, new_value, remarks, createdby, createddate)
    SELECT prc_date, account_id, event_id, old_value, new_value, remarks, createdby, createddate FROM tmp_event
    ON CONFLICT (prc_date,account_id) DO NOTHING;
  $f$,v_table_name);
  
  RAISE NOTICE 'SQL: %',v_sql;
  EXECUTE v_sql;
  
END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_account_event(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_default_rule(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_default_rule(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_tablename TEXT := CASE WHEN p_prc = 'M' THEN 'frs9_master_account' ELSE 'tmp_fma_preview' END;
    v_sql TEXT;
    v_script TEXT;
       
    --
    rules_h RECORD;
    rules_d RECORD;
    
BEGIN
  -- Step 1: Reset NPL_FLAG
  IF p_prc = 'M' THEN
    DELETE FROM frs9_default WHERE prc_date = p_prc_date;
  END IF;

  EXECUTE format(
    'UPDATE %I SET npl_flag = FALSE WHERE prc_date = %L AND account_status IN (%L, %L)'
    , v_tablename, p_prc_date, 'A', 'R'
  );

  -- Step 2: Iterate over active default rules
  FOR rules_h IN
    WITH rules AS (
      SELECT
        updated_column,
        rule_type,
        rule_name,
        rule_id
      FROM view_param_scenario_rules
      WHERE rule_type = 'DEFAULT' AND active_flag IS TRUE
    )
    SELECT
      rule_id,
      rule_name AS rule_code,
      v_tablename AS updated_table,
      updated_column,
      rule_type
    FROM rules
    GROUP BY updated_column, rule_type, rule_name, rule_id
    
  LOOP
    
    -- 🔍 Debug rules_h Information
    RAISE NOTICE 'Processing rule_id: %, rule_code: %, updated_column: %, rule_type: %',
      rules_h.rule_id,
      rules_h.rule_code,
      rules_h.updated_column,
      rules_h.rule_type;
          
    --
    v_script:='';
        
    FOR rules_d IN
      SELECT
        query_group = MIN(query_group) OVER () AS is_first_group,
        seq = MIN(seq) OVER (PARTITION BY query_group) AS is_first_seq,
        seq = MAX(seq) OVER (PARTITION BY query_group) AS is_last_seq,
        query_group = MAX(query_group) OVER () AS is_last_group,
        seq,
        column_name,
        data_type,
        operator,
        value1,
        value2,
        condition
      FROM frs9_param_scenario_rulesd
      WHERE rule_id = rules_h.rule_id
      ORDER BY query_group, seq
    LOOP
      
    -- Debug rules_d Information
    RAISE NOTICE 'FirstGrp: %, FirstSeq: %, LastSeq: %, LastGrp: %, Seq: %, Col: %, Type: %, Op: %, Val1: %, Val2: %, Cond: %',
      rules_d.is_first_group,
      rules_d.is_first_seq,
      rules_d.is_last_seq,
      rules_d.is_last_group,
      rules_d.seq,
      rules_d.column_name,
      rules_d.data_type,
      rules_d.operator,
      rules_d.value1,
      rules_d.value2,
      rules_d.condition;
          
     -- Build WHERE Clause
     SELECT fn_build_query_group(
        v_script
        , rules_d.column_name
        , rules_d.operator
        , rules_d.value1
        , rules_d.value2
        , rules_d.data_type
        , rules_d.condition
        , rules_d.is_first_group
        , rules_d.is_first_seq
        , rules_d.is_last_seq
        , rules_d.is_last_group
      ) INTO v_script;
        
    END LOOP;
      
--     RAISE NOTICE 'Where Clause: %', v_script;
    v_sql := format($f$		
      UPDATE %I SET npl_flag = TRUE
      WHERE prc_date = %L AND account_status IN('A','R') AND %s
    $f$, v_tablename, p_prc_date, v_script); 
      
    RAISE NOTICE 'SQL: %', v_sql;
    EXECUTE v_sql;
      
    -- Insert flagged accounts into FRS9_DEFAULT
    IF p_prc = 'M' THEN
      EXECUTE format($f$
        INSERT INTO frs9_default (
            prc_date, account_id, rule_id, os_at_default, eqv_at_default, eir_at_default, createdby, createddate
        )
        SELECT
            prc_date,
            account_id,
            %L,
            outstanding,
            outstanding * COALESCE(exchange_rate, 1),
            CASE
                WHEN eff_interest_rate > 0 THEN eff_interest_rate
                WHEN interest_rate > 0 THEN interest_rate
                WHEN weighted_eff_interest_rate > 0 THEN weighted_eff_interest_rate
                ELSE weighted_interest_rate
            END,
            'SP_FRS9_IMP_CA_DEFAULT_RULE',
            CURRENT_TIMESTAMP
        FROM frs9_master_account
        WHERE prc_date = %L
          AND account_status IN ('A', 'R')
          AND npl_flag IS TRUE
    $f$, rules_h.rule_id, p_prc_date);
    END IF;
 
  END LOOP;
    
END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_default_rule(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_ead_paym_avg(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_ead_paym_avg(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE := p_prc_date;
BEGIN
    -- Step 2: Cleanup
    DROP TABLE IF EXISTS tmp1;
    DROP TABLE IF EXISTS tmp2;
    TRUNCATE TABLE tmp_frs9_imp_ca_ead_paym_avg;

    IF p_prc = 'M' THEN
        DELETE FROM frs9_imp_ca_ead_paym_avg WHERE prc_date = p_prc_date;
    END IF;

    -- Step 3: Recursive CTE to simulate payment schedule
    CREATE TEMP TABLE tmp1 AS
      WITH RECURSIVE ps AS (
        SELECT 
          prc_date,
          account_id,
          segment_id,
          0 AS seq,
          payment_freq,
          tenor,
          remaining_tenor,
          CAST(0 AS NUMERIC(32,6)) AS principal_amt,
          fix_principal_amt,
          outstanding
        FROM frs9_imp_ca_scenario_data
        WHERE prc_date = p_prc_date
        
        UNION ALL
        
        SELECT 
          prc_date,
          account_id,
          segment_id,
          seq + 1,
          payment_freq,
          tenor,
          remaining_tenor,
          CASE
              WHEN seq + 1 > tenor - remaining_tenor AND (seq + 1) % payment_freq = 0 
                  THEN CAST(fix_principal_amt AS NUMERIC(32,6))
              ELSE CAST(0 AS NUMERIC(32,6))
          END,
          fix_principal_amt,
          outstanding
        FROM ps
        WHERE seq + 1 <= tenor
      )
    
    -- Step 4: Aggregate principal by segment and SEQ
    SELECT 
        prc_date,
        segment_id,
        seq AS counter,
        tenor,
        SUM(principal_amt) AS principal_amt
    FROM ps
    WHERE principal_amt > 0
    GROUP BY prc_date, segment_id, seq, tenor;
    
    -- Step 5: Aggregate total principal by segment and tenor
    CREATE TEMP TABLE tmp2 AS
    SELECT 
        prc_date,
        segment_id,
        tenor,
        SUM(principal_amt) AS principal_amt
    FROM tmp1
    GROUP BY prc_date, segment_id, tenor;

    -- Step 6: Calculate payment average and insert into temp table
    INSERT INTO tmp_frs9_imp_ca_ead_paym_avg (
        prc_date, segment_id, tenor, counter, paym_avg, createdby, createddate
    )
    SELECT 
        a.prc_date,
        a.segment_id,
        a.tenor,
        a.counter,
        a.principal_amt::DOUBLE PRECISION / NULLIF(b.principal_amt, 0) AS paym_avg,
        'SP_FRS9_IMP_CA_EAD_PAYM_AVG',
        CURRENT_TIMESTAMP
    FROM tmp1 a
    JOIN tmp2 b ON a.segment_id = b.segment_id AND a.tenor = b.tenor
    ORDER BY a.segment_id, a.tenor, a.counter;

    -- Step 7: Persist results to final table if p_prc = 'M'
    IF p_prc = 'M' THEN
        INSERT INTO frs9_imp_ca_ead_paym_avg (
            prc_date, segment_id, tenor, counter, paym_avg, createdby, createddate
        )
        SELECT 
            a.prc_date,
            a.segment_id,
            a.tenor,
            a.counter,
            a.principal_amt::DOUBLE PRECISION / NULLIF(b.principal_amt, 0) AS paym_avg,
            'SP_FRS9_IMP_CA_EAD_PAYM_AVG',
            CURRENT_TIMESTAMP
        FROM tmp1 a
        JOIN tmp2 b ON a.segment_id = b.segment_id AND a.tenor = b.tenor
        ORDER BY a.segment_id, a.tenor, a.counter;
    END IF;
    
    --
    DROP TABLE IF EXISTS tmp1;
    DROP TABLE IF EXISTS tmp2;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_ead_paym_avg(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_ead_process(date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_ead_process(IN p_prc_date date DEFAULT NULL::date)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate          DATE;
  --v_prevdate          DATE;
  v_counter_pay       INTEGER := 0;
  v_max_counterpay    INTEGER := 0;
  v_next_counter_pay  INTEGER := 1;

BEGIN
  -- Step 2: Load CURRDATE and PREVDATE
  SELECT
    CASE WHEN p_prc_date IS NULL THEN currdate ELSE p_prc_date END
    --, CASE WHEN p_prc_date IS NULL THEN prevdate ELSE p_prc_date - INTERVAL '1 day' END
  INTO v_currdate --, v_prevdate
  FROM frs9_prc_date;
    
  -- Step 3: Truncate staging and output tables
  TRUNCATE TABLE tmp_imp_ca_ead_curr;
  TRUNCATE TABLE tmp_imp_ca_ead_prev;
  TRUNCATE TABLE frs9_imp_ca_schd;
  TRUNCATE TABLE frs9_imp_ca_ead;

  -- Step 4: Insert initial snapshot into tmp_imp_ca_ead_curr
  INSERT INTO tmp_imp_ca_ead_curr (
    prc_date,
    account_id,
    account_number,
    start_date,
    maturity_date,
    payment_start_date,
    stage,
    remaining_tenor,
    interest_rate,
    payment_code,
    interest_base,
    next_eom_payment_date,
    next_payment_date,
    payment_term,
    payment_freq,
    next_sch_prin_date,
    int_pmt_term,
    int_pmt_freq,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    fix_principal_amt,
    fix_interest_amt,
    mob,
    idays,
    eom_payment_date,
    payment_date,
    os_balance,
    installment,
    principal,
    interest
  )
  SELECT
    fn_eomonth(m.prc_date, 0) AS prc_date,
    m.account_id,
    m.account_number,
    m.start_date,
    m.maturity_date,
    m.next_payment_date AS payment_start_date,
    m.stage,
    CASE
      WHEN m.bucket_id = 5 THEN 0
      WHEN m.remaining_tenor <= 0 THEN 1
      ELSE m.remaining_tenor
    END AS remaining_tenor,
    m.interest_rate,
    m.payment_code,
    m.interest_base,
    fn_eomonth(m.next_payment_date, 0) AS next_eom_payment_date,
    m.next_payment_date,
    m.payment_term,
    m.payment_freq,
    m.next_sch_prin_date,
    m.int_pmt_term,
    m.int_pmt_freq,
    m.next_sch_int_date,
    m.grace_type,
    m.grace_start_date,
    m.grace_end_date,
    m.fib_flag,
    m.fib_start_date,
    m.fib_tenor,
    m.fib_amt,
    m.fix_principal_amt,
    m.fix_interest_amt,
    0 AS mob,
    0 AS idays,
    fn_eomonth(m.prc_date, 0) AS eom_payment_date,
    m.prc_date AS payment_date,
    m.outstanding AS os_balance,
    m.installment_amt AS installment,
    0 AS principal,
    0 AS interest
  FROM frs9_master_account m
  WHERE 
    m.prc_date = v_currdate
    AND EXISTS (
        SELECT 1
        FROM frs9_imp_ca_account_event e
        WHERE e.prc_date = v_currdate
          AND e.account_id = m.account_id
    );

  -- Step 5: Copy initial snapshot into frs9_imp_ca_schd
  INSERT INTO frs9_imp_ca_schd (
    prc_date,
    account_id,
    account_number,
    mob,
    idays,
    payment_date,
    os_balance,
    principal,
    interest,
    installment
  )
  SELECT
    prc_date,
    account_id,
    account_number,
    mob,
    idays,
    payment_date,
    os_balance,
    principal,
    interest,
    installment
  FROM tmp_imp_ca_ead_curr;

-- Step 6: Loop Through Tenor Buckets
  SELECT MAX(remaining_tenor)
  INTO v_max_counterpay
  FROM tmp_imp_ca_ead_curr;
  
  WHILE v_counter_pay <= v_max_counterpay LOOP
    
    -- Increment loop counters
    v_counter_pay := v_counter_pay + 1;
    v_next_counter_pay := v_next_counter_pay + 1;
    
    RAISE NOTICE 'Processing counter pay: % to %', v_counter_pay, v_max_counterpay;
    
    -- Step 6.1: Truncate Previous Snapshot
    TRUNCATE TABLE tmp_imp_ca_ead_prev;

    -- Step 6.2: Insert projected snapshot using modular view

    INSERT INTO tmp_imp_ca_ead_prev (
      prc_date,
      account_id,
      account_number,
      start_date,
      maturity_date,
      payment_start_date,
      stage,
      remaining_tenor,
      interest_rate,
      payment_code,
      interest_base,
      next_eom_payment_date,
      next_payment_date,
      payment_term,
      payment_freq,
      next_sch_prin_date,
      int_pmt_term,
      int_pmt_freq,
      next_sch_int_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      fib_flag,
      fib_start_date,
      fib_tenor,
      fib_amt,
      fix_principal_amt,
      fix_interest_amt,
      mob,
      idays,
      eom_payment_date,
      payment_date,
      os_balance,
      installment,
      principal,
      interest
    )
    SELECT
      prc_date,
      account_id,
      account_number,
      start_date,
      maturity_date,
      payment_start_date,
      stage,
      remaining_tenor,
      interest_rate,
      payment_code,
      interest_base,
      fn_eomonth((payment_start_date + (v_counter_pay || ' months')::interval)::date, 0) AS next_eom_payment_date, -- End-of-month for the projected payment date
      (payment_start_date + (v_counter_pay || ' months')::interval)::date AS next_payment_date,  -- Next payment date by adding MOB months
      payment_term,
      payment_freq,
      next_sch_prin_date,
      int_pmt_term,
      int_pmt_freq,
      next_sch_int_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      fib_flag,
      fib_start_date,
      fib_tenor,
      fib_amt,
      fix_principal_amt,
      fix_interest_amt,
      v_counter_pay AS mob,
      idays,
      eom_payment_date,
      payment_date,
      os_balance,
      installment,
      principal,
      interest
    FROM vw_frs9_imp_ca_ead_process_ead_curr
    WHERE remaining_tenor >= v_counter_pay;

  -- Step 6.3: Refresh current snapshot with projected data
  TRUNCATE TABLE tmp_imp_ca_ead_curr;

  INSERT INTO tmp_imp_ca_ead_curr (
    prc_date,
    account_id,
    account_number,
    start_date,
    maturity_date,
    payment_start_date,
    stage,
    remaining_tenor,
    interest_rate,
    payment_code,
    interest_base,
    next_eom_payment_date,
    next_payment_date,
    payment_term,
    payment_freq,
    next_sch_prin_date,
    int_pmt_term,
    int_pmt_freq,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    fix_principal_amt,
    fix_interest_amt,
    mob,
    idays,
    eom_payment_date,
    payment_date,
    os_balance,
    installment,
    principal,
    interest
  )
  SELECT
    a.prc_date,
    a.account_id,
    a.account_number,
    a.start_date,
    a.maturity_date,
    a.payment_start_date,
    a.stage,
    a.remaining_tenor,
    a.interest_rate,
    a.payment_code,
    a.interest_base,
    a.next_eom_payment_date,
    a.next_payment_date,
    a.payment_term,
    a.payment_freq,
    a.next_sch_prin_date,
    a.int_pmt_term,
    a.int_pmt_freq,
    a.next_sch_int_date,
    a.grace_type,
    a.grace_start_date,
    a.grace_end_date,
    a.fib_flag,
    a.fib_start_date,
    a.fib_tenor,
    a.fib_amt,
    a.fix_principal_amt,
    a.fix_interest_amt,
    a.mob,
    a.idays,
    a.eom_payment_date,
    a.payment_date,
    a.os_balance,
    a.installment,
    a.principal,
    a.interest
  FROM tmp_imp_ca_ead_prev a;

  -- Step 6.4: Append current projection to schedule table
  INSERT INTO frs9_imp_ca_schd (
    prc_date,
    account_id,
    account_number,
    mob,
    idays,
    payment_date,
    os_balance,
    principal,
    interest,
    installment
  )
  SELECT
    prc_date,
    account_id,
    account_number,
    mob,
    idays,
    payment_date,
    os_balance,
    principal,
    interest,
    principal + interest AS installment
  FROM tmp_imp_ca_ead_curr;


  END LOOP;

  -- Step 7: Final EAD Calculation
  INSERT INTO frs9_imp_ca_ead (
    prc_date,
    account_id,
    account_number,
    mob,
    idays,
    payment_date,
    os_balance,
    principal,
    interest,
    installment,
    next_interest,
    ead_amt
  )
  SELECT
    a.prc_date,
    a.account_id,
    a.account_number,
    a.mob,
    a.idays,
    a.payment_date,
    a.os_balance,
    a.principal,
    a.interest,
    a.installment,

    COALESCE(
      LEAD(a.interest) OVER (PARTITION BY a.account_id ORDER BY a.mob),
      0
    ) AS next_interest,

    CASE
      WHEN a.mob = 0 THEN
        a.os_balance + COALESCE(b.accrued_interest, 0)
      ELSE
        a.os_balance + COALESCE(
          LEAD(a.interest) OVER (PARTITION BY a.account_id ORDER BY a.mob),
          0
        )
    END AS ead_amt

  FROM frs9_imp_ca_schd a
  INNER JOIN frs9_master_account b
    ON a.account_id = b.account_id
  WHERE b.prc_date = v_currdate;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_ead_process(IN p_prc_date date) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_ecl_process(date, integer, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_ecl_process(IN p_prc_date date DEFAULT NULL::date, IN p_ecl_model_id integer DEFAULT 0, IN p_segment_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate DATE;
BEGIN
  -- Step 1: Resolve processing date
  SELECT COALESCE(p_prc_date, currdate) INTO v_currdate FROM frs9_prc_date;

  -- Step 2: Clean previous ECL results
  DELETE FROM frs9_imp_ca_ecl_sum WHERE prc_date = v_currdate;
  DELETE FROM frs9_imp_ca_ecl_detail WHERE prc_date = v_currdate;
  DELETE FROM frs9_imp_ca_ecl_ts WHERE prc_date = v_currdate;

  -- Step 3: Insert time series ECL records
  INSERT INTO frs9_imp_ca_ecl_ts (
    prc_date,
    account_id,
    account_number,
    ecl_model_id,
    segment_id,
    payment_date,
    mob,
    os_balance,
    principal,
    interest,
    next_interest,
    ead_onbs,
    ead_offbs,
    pd_rate,
    lgd_rate,
    ccf_rate,
    prepayment_rate,
    discount_rate,
    ecl_amt_ca_onbs,
    ecl_amt_ca_offbs
  )
  SELECT
    v_currdate,
    a.account_id,
    a.account_number,
    a.segment_id AS ecl_model_id,
    a.segment_id,
    d.payment_date,
    COALESCE(d.mob, c.pd_sequence),
    d.os_balance,
    d.principal,
    d.interest,
    d.next_interest,
    d.ead_amt,
    a.unused_amt,
    c.pd_rate,
    e.lgd_rate,
    1,
    1,
    1 / POWER(1 + COALESCE(a.eff_interest_rate, a.interest_rate) / 100 / 12, c.pd_sequence),
    d.ead_amt *
    (1 / POWER(1 + COALESCE(a.eff_interest_rate, a.interest_rate) / 100 / 12, c.pd_sequence)) *
    c.pd_rate *
    e.lgd_rate,
    0
  FROM frs9_master_account a
  INNER JOIN frs9_ecl_model_mapping b
    ON a.segment_id = b.pf_segment_id AND b.ecl_model_id = p_ecl_model_id
  INNER JOIN frs9_imp_ca_pd_ts c
    ON b.pd_model_id = c.pd_model_id
    AND b.eff_date = c.prc_date
    AND a.bucket_id = c.bucket_id
    AND c.pd_sequence <= CASE
      WHEN a.stage::INT = 1 THEN LEAST(a.remaining_tenor, 11)
      ELSE COALESCE(a.remaining_tenor, 11)
    END
  INNER JOIN frs9_imp_ca_ead d
    ON a.account_id = d.account_id AND d.mob = c.pd_sequence
  LEFT JOIN frs9_imp_ca_lgd e
    ON b.lgd_model_id = e.lgd_model_id AND b.eff_date = e.prc_date
  WHERE a.prc_date = v_currdate;

  -- Step 4: Aggregate ECL per account
  INSERT INTO frs9_imp_ca_ecl_detail (
    prc_date,
    account_id,
    account_number,
    start_date,
    maturity_date,
    branch_code,
    prd_code,
    remaining_tenor,
    expected_life,
    interest_rate,
    eff_interest_rate,
    outstanding,
    unused_amt,
    accrued_interest,
    installment_amt,
    impaired_flag,
    dpd,
    collectability,
    internal_rating_code,
    stage,
    bucket_id,
    ecl_model_id,
    segment_id,
    ecl_amt_ca_onbs,
    ecl_amt_ca_offbs
  )
  SELECT
    b.prc_date,
    a.account_id,
    a.account_number,
    a.start_date,
    a.maturity_date,
    a.branch_code,
    a.prd_code,
    a.remaining_tenor,
    a.remaining_tenor,
    a.interest_rate,
    a.eff_interest_rate,
    a.outstanding,
    a.unused_amt,
    a.accrued_interest,
    a.installment_amt,
    a.impaired_flag,
    a.dpd,
    a.collectability,
    a.internal_rating_code,
    a.stage,
    a.bucket_id,
    b.ecl_model_id,
    b.segment_id,
    SUM(b.ecl_amt_ca_onbs),
    SUM(b.ecl_amt_ca_offbs)
  FROM frs9_master_account a
  INNER JOIN frs9_imp_ca_ecl_ts b
    ON a.account_id = b.account_id
  WHERE a.prc_date = v_currdate AND b.prc_date = v_currdate
  GROUP BY
    b.prc_date,
    a.account_id,
    a.account_number,
    a.start_date,
    a.maturity_date,
    a.branch_code,
    a.prd_code,
    a.remaining_tenor,
    a.interest_rate,
    a.eff_interest_rate,
    a.outstanding,
    a.unused_amt,
    a.accrued_interest,
    a.installment_amt,
    a.impaired_flag,
    a.dpd,
    a.collectability,
    a.internal_rating_code,
    a.stage,
    a.bucket_id,
    b.ecl_model_id,
    b.segment_id;

  -- Step 5: Summarize ECL by segment/stage/bucket
  INSERT INTO frs9_imp_ca_ecl_sum (
    prc_date,
    ecl_model_id,
    segment_id,
    branch_code,
    prd_code,
    stage,
    bucket_id,
    impaired_flag,
    outstanding,
    unused_amt,
    accrued_interest,
    ecl_amt_ca_onbs,
    ecl_amt_ca_offbs
  )
  SELECT
    prc_date,
    ecl_model_id,
    segment_id,
    branch_code,
    prd_code,
    stage,
    bucket_id,
    impaired_flag,
    SUM(COALESCE(outstanding, 0)),
    SUM(COALESCE(unused_amt, 0)),
    SUM(COALESCE(accrued_interest, 0)),
    SUM(COALESCE(ecl_amt_ca_onbs, 0)),
    SUM(COALESCE(ecl_amt_ca_offbs, 0))
  FROM frs9_imp_ca_ecl_detail
  WHERE prc_date = v_currdate
  GROUP BY
    prc_date,
    ecl_model_id,
    segment_id,
    branch_code,
    prd_code,
    stage,
    bucket_id,
    impaired_flag;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_ecl_process(IN p_prc_date date, IN p_ecl_model_id integer, IN p_segment_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_finish_ecl(date, character, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_finish_ecl(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id bigint DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
    -- Step 1: Set internal date
    DECLARE v_currdate DATE := p_prc_date;
BEGIN

    -- Step 2: Update configuration status
    UPDATE frs9_imp_ca_ecl_configh
    SET last_run_status = 'FINISH'
    WHERE effective_date <= v_currdate
      AND (
          pkid = p_ecl_model_id
          OR (p_ecl_model_id = 0 AND active_flag IS TRUE)
      );
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_finish_ecl(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id bigint) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_generate_fma(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_generate_fma(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE := p_prc_date;
  v_strsql TEXT := '';
  v_qry_rn INT := 1;
  v_table_name TEXT;

  ecl_config RECORD;

BEGIN
  -- Choose source table
  v_table_name := CASE WHEN p_prc = 'M' THEN 'frs9_master_account' ELSE 'tmp_fma_preview' END;

  -- Clear target table
  TRUNCATE TABLE tmp_frs9_ecl_fma;
  CALL sp_reset_sequence('tmp_frs9_ecl_fma','pkid','Y');
  
  -- Step 2: Build Configuration Snapshot
  FOR ecl_config IN 
    SELECT 
      b.ecl_model_id,
      b.pf_segment_id AS segment_id,
      b.stage_rule_id,
      b.lgd_model_id AS lgd_config_id,
      b.pd_model_id AS pd_config_id,
      e.bucket_group,
      b.ead_model_id AS ead_config_id,
      c.ead_method,
      c.calc_method AS ead_calc_method,
      'OUTSTANDING' AS ead_balance,
      b.overlay_rate,
      CASE b.period_type
        WHEN 1 THEN fn_eomonth(v_currdate, 0)
        WHEN 2 THEN fn_eomonth(v_currdate, -1)
        WHEN 3 THEN fn_eomonth(v_currdate, -3)
        WHEN 4 THEN fn_eomonth(v_currdate, -12)
        WHEN 5 THEN b.period_date
      END AS period_date
    FROM frs9_imp_ca_ecl_configh a
    JOIN frs9_imp_ca_ecl_configd b ON a.pkid = b.ecl_model_id
    JOIN frs9_imp_ca_ead_config c ON b.ead_model_id = c.pkid
    JOIN frs9_imp_ca_pd_config e ON b.pd_model_id = e.pkid
    WHERE 
      ((a.active_flag IS TRUE AND p_ecl_model_id = 0) OR a.pkid = p_ecl_model_id)
      AND a.effective_date <= v_currdate
  LOOP
    RAISE NOTICE 'ECL Config → ecl_model_id: %, segment_id: %, stage_rule_id: %, lgd_config_id: %, pd_config_id: %, bucket_group: %, ead_config_id: %, ead_method: %, ead_calc_method: %, ead_balance: %, overlay_rate: %, period_date: %',
      ecl_config.ecl_model_id,
      ecl_config.segment_id,
      ecl_config.stage_rule_id,
      ecl_config.lgd_config_id,
      ecl_config.pd_config_id,
      ecl_config.bucket_group,
      ecl_config.ead_config_id,
      ecl_config.ead_method,
      ecl_config.ead_calc_method,
      ecl_config.ead_balance,
      ecl_config.overlay_rate,
      ecl_config.period_date;

      -- Step 3: Generate Dynamic Queries per Segment
      v_strsql := format($f$
      INSERT INTO tmp_frs9_ecl_fma (
        prc_date,
        account_id,
        account_number,
        facility_number,
        cif_number,
        segment_id,
        remaining_tenor,
        start_date,
        maturity_date,
        next_payment_date,
        next_sch_prin_date,
        next_sch_int_date,
        grace_type,
        grace_start_date,
        grace_end_date,
        fib_flag,
        fib_start_date,
        fib_tenor,
        payment_term,
        payment_freq,
        int_pmt_term,
        int_pmt_freq,
        default_flag,
        dpd,
        internal_rating_code,
        ext_rating_code,
        ext_rating_id,
        ecl_model_id,
        pd_config_id,
        lgd_config_id,
        ead_config_id,
        ead_method,
        ead_calc_method,
        bucket_group,
        bucket_id,
        currency,
        stage,
        interest_base,
        interest_rate,
        eir,
        exchange_rate,
        installment_amt,
        fix_principal_amt,
        fix_interest_amt,
        outstanding,
        plafond,
        fib_amt,
        accrued_interest,
        unamort_cost_amt,
        unamort_fee_amt,
        ead_balance,
        beginning_balance,
        ecl_amount,
        ia_unwinding_amount,
        ia_unwinding_sum_amount,
        writeback_amount,
        charge_amount,
        createdby,
        createddate
      ) 
      SELECT 
        prc_date,
        account_id,
        account_number,
        facility_number,
        cif_number,
        segment_id,
        remaining_tenor,
        start_date,
        maturity_date,
        next_payment_date,
        next_sch_prin_date,
        next_sch_int_date,
        grace_type,
        grace_start_date,
        grace_end_date,
        fib_flag,
        fib_start_date,
        fib_tenor,
        payment_term,
        payment_freq,
        int_pmt_term,
        int_pmt_freq,
        npl_flag AS default_flag,
        dpd,
        internal_rating_code,
        ext_rating_code,
        ext_rating_id,
        %L AS ecl_model_id,
        %L AS pd_config_id,
        %L AS lgd_config_id,
        %L AS ead_config_id,
        %L AS ead_method,
        %L AS ead_calc_method,
        %L AS bucket_group,
        0 AS bucket_id,
        currency,
        stage::INT,
        interest_base,
        interest_rate,
        COALESCE(eff_interest_rate, interest_rate, weighted_eff_interest_rate, weighted_interest_rate, 0) AS eir,
        exchange_rate,
        COALESCE(installment_amt, 0),
        COALESCE(fix_principal_amt, 0),
        COALESCE(fix_interest_amt, 0),
        COALESCE(outstanding, 0),
        COALESCE(plafond, 0),
        COALESCE(fib_amt, 0),
        COALESCE(accrued_interest, 0),
        COALESCE(unamort_cost_amt, 0),
        COALESCE(unamort_fee_amt, 0),
        outstanding AS ead_balance,
        ecl_beginning_balance,
        0 AS ecl_amount,
        0 AS ia_unwinding_amount,
        0 AS ia_unwinding_sum_amount,
        0 AS writeback_amount,
        0 AS charge_amount,
        'SP_FRS9_IMP_CA_GENERATE_FMA' AS createdby,
        CURRENT_TIMESTAMP AS createddate
      FROM %I
      WHERE prc_date = %L
            AND account_status IN ('A', 'R')
            AND impaired_flag IS TRUE
            AND COALESCE(asset_class, '') <> 'FVTPL'
            AND segment_id = %L
      $f$,
        ecl_config.ecl_model_id,
        ecl_config.pd_config_id,
        ecl_config.lgd_config_id,
        ecl_config.ead_config_id,
        ecl_config.ead_method,
        ecl_config.ead_calc_method,
        ecl_config.bucket_group,
        v_table_name,
        v_currdate,
        ecl_config.segment_id
      );

      -- Step 4: Execute Dynamic Inserts
      --RAISE NOTICE 'SQL:%',v_strsql;
      EXECUTE v_strsql;

  END LOOP;
  
  -- Step 5: Assign BUCKET_ID
  WITH data AS (
    SELECT
      a.pkid,
      CASE
        WHEN a.default_flag IS TRUE THEN d.bucket_id
        ELSE c.bucket_id
      END AS new_bucket_id
    FROM tmp_frs9_ecl_fma a
    JOIN frs9_param_bucketh b ON a.bucket_group = b.bucket_group
    LEFT JOIN frs9_param_bucketd c 
      ON  b.pkid = c.pkid_header
          AND (
            (b.basis = 'R' AND a.ext_rating_id BETWEEN c.range_start AND c.range_end) OR 
            (b.basis = 'D' AND a.dpd BETWEEN c.range_start AND c.range_end)
          )
    JOIN vw_frs9_max_bucket d ON b.bucket_group = d.bucket_group
    WHERE a.prc_date = v_currdate
  )
  
  UPDATE tmp_frs9_ecl_fma a
  SET bucket_id = b.new_bucket_id
  FROM data b
  WHERE a.pkid=b.pkid;
  
    -- Step 6: Optional post-processing (commented out)
    -- UPDATE tmp_frs9_ecl_fma SET stage = 3 WHERE default_flag = 1;
    -- UPDATE tmp_frs9_ecl_fma SET remaining_tenor = 0 WHERE remaining_tenor < 0;

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_generate_fma(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_initial(date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_initial(IN p_prc_date date DEFAULT NULL::date)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate DATE;
BEGIN
  -- Step 1: Resolve processing date
  SELECT COALESCE(p_prc_date, currdate) INTO v_currdate FROM frs9_prc_date;

  -- Step 2: Clean previous snapshot
  DELETE FROM frs9_master_account
  WHERE prc_date = v_currdate;

  -- Step 3: Insert fresh snapshot from staging
  INSERT INTO frs9_master_account (
    prc_date,
    account_number,
    account_id,
    facility_number,
    cif_number,
    cif_name,
    sub_segment,
    bucket_id,
    bucket_id_obligor,
    stage,
    start_date,
    maturity_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    restructure_flag,
    restructure_date,
    outstanding,
    installment_amt,
    interest_rate,
    eff_interest_rate,
    tenor_org,
    remaining_tenor,
    unused_amt,
    prd_type,
    prd_group,
    branch_code,
    account_status,
    data_source,
    next_payment_date,
    payment_code,
    payment_term,
    payment_freq,
    impaired_flag,
    impaired_status,
    segment_id,
    interest_base
  )
  SELECT
    prc_date,
    TRIM(a.account_number),
    b.account_id,
    a.facility_number,
    a.cif_number,
    a.cif_name,
    a.segment AS sub_segment,
    1,
    1,
    1,
    a.start_date,
    a.maturity_date,
    a.grace_type,
    a.grace_start_date,
    a.grace_end_date,
    a.restructure_flag,
    a.restructure_date,
    a.outstanding,
    a.installment_amt,
    a.interest_rate,
    a.eff_interest_rate,
    a.tenor_org,
    fn_get_total_months(a.prc_date, a.maturity_date) AS remaining_tenor,
--     DATE_PART('month', AGE(a.maturity_date, prc_date))::INT,
    a.unused_amt,
    a.prd_type,
    a.prd_group,
    a.branch_code,
    'A',
    'LENDING',
    a.next_payment_date,
    '0',
    'M',
    1,
    TRUE,
    'C',
    1,
    '6'
  FROM stg_frs9_master_account_bpf a
  JOIN frs9_account_id b
    ON TRIM(a.account_number) = b.account_number
  WHERE prc_date = v_currdate;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_initial(IN p_prc_date date) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_coll_data(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_coll_data(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
    ----------------------------------------------------------------------
    -- Step 1: Delete existing LGD collateral data for the same PRC_DATE
    ----------------------------------------------------------------------
    DELETE FROM frs9_imp_ca_lgd_coll_data
    WHERE prc_date = p_prc_date;

    ----------------------------------------------------------------------
    -- Step 2: Insert new LGD collateral records
    ----------------------------------------------------------------------
    WITH src AS (
      SELECT
        A.prc_date,
        B.account_id,
        A.selling_date,
        -- SOLD_FLAG: 1 if sold before prc_date, else 0
        CASE
          WHEN COALESCE(A.selling_date, DATE '2900-01-01') >= p_prc_date THEN FALSE
          ELSE TRUE
        END AS sold_flag,
        A.collateral_value,
        A.selling_price
      FROM tblu_master_collateral A
        JOIN frs9_account_id B ON TRIM(A.account_number) = B.account_number
      WHERE A.prc_date <= p_prc_date
    )
    
    INSERT INTO frs9_imp_ca_lgd_coll_data (
        prc_date,
        pv_date,
        account_id,
        sold_flag,
        colla_amt,
        sell_amt,
        createdby,
        createddate
    )
    SELECT
     p_prc_date,  -- Processing date
     fn_eomonth(COALESCE(selling_date,prc_date)),
     account_id,
     sold_flag,
     collateral_value,
     selling_price,
     'SP_FRS9_IMP_CA_LGD_COLL_DATA',  -- Audit: procedure name
     CURRENT_TIMESTAMP  -- Audit: timestamp
    FROM src
    ;
END;

$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_coll_data(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_d(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_d(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Drop temp table if exists
  DROP TABLE IF EXISTS tmp_lgd_config;

  -- Stage active LGD configurations
  CREATE TEMP TABLE tmp_lgd_config AS
  SELECT 
    pkid AS lgd_config_id,
    segment_id,
    lgd_method,
    population_type,
    observation_period,
    observation_start_date,
    workout_period,
    fl_flag,
    lgd_rate
  FROM frs9_imp_ca_lgd_config
  WHERE active_flag IS TRUE AND (pkid = p_config_id OR p_config_id = 0);

  -- Delete existing LGD data for the same date/config
  DELETE FROM frs9_imp_ca_lgd_d
  WHERE prc_date = p_prc_date AND (lgd_config_id = p_config_id OR p_config_id = 0);

  -- Insert aggregated LGD recovery data
  INSERT INTO frs9_imp_ca_lgd_d (
    prc_date,
    lgd_config_id,
    lgd_method,
    account_id,
    eqv_os, 
    eqv_rec,
    npv_eqv_rec,
    createdby,
    createddate
  )
  SELECT 
    p_prc_date AS prc_date,
    a.lgd_config_id,
    a.lgd_method,
    a.account_id,
    MAX(COALESCE(a.eqv_os,0)),
    SUM(COALESCE(a.eqv_rec,0)),
    SUM(COALESCE(a.npv_eqv_rec,0)),
    'SP_FRS9_IMP_CA_LGD_D',
    CURRENT_TIMESTAMP
  FROM 
    frs9_imp_ca_lgd_rec_d a
    JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
  WHERE a.prc_date = p_prc_date
  GROUP BY 
      a.lgd_config_id,
      a.account_id,
      a.lgd_method;

  -- Cap NPV recovery and calculate recovery rate
  WITH npv AS (
      SELECT
        a.lgd_config_id
        , a.account_id
        , CASE
            WHEN a.npv_eqv_rec > a.eqv_os then a.eqv_os
            ELSE a.npv_eqv_rec
          END AS npv_eqv_rec
      FROM 
        frs9_imp_ca_lgd_d a
        INNER JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
      WHERE a.prc_date = p_prc_date
  )
  
  UPDATE frs9_imp_ca_lgd_d a
  SET npv_eqv_rec = b.npv_eqv_rec,
      rec_rate = b.npv_eqv_rec::FLOAT / a.eqv_os::FLOAT,
      lgd = 1 - (b.npv_eqv_rec::FLOAT / a.eqv_os::FLOAT)
  FROM npv b
  WHERE 
    a.lgd_config_id = b.lgd_config_id 
    AND a.account_id = b.account_id
    AND a.eqv_os > 0
    AND a.prc_date = p_prc_date;

/*
  -- Final LGD calculation
  UPDATE frs9_imp_ca_lgd_d a
  SET lgd = 1 - a.rec_rate
  FROM tmp_lgd_config b
  WHERE a.lgd_config_id = b.lgd_config_id
    AND a.prc_date = p_prc_date;
*/

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_d(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_data(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_data(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
    ------------------------------------------------
    -- Step 1: Stage active LGD configurations
    ------------------------------------------------
    DROP TABLE IF EXISTS tmp_lgd_config;

    CREATE TEMP TABLE tmp_lgd_config AS
    SELECT 
        pkid AS lgd_config_id,
        segment_id,
        lgd_method,
        population_type,
        observation_period,
        observation_start_date,
        workout_period,
        fl_flag,
        lgd_rate
    FROM frs9_imp_ca_lgd_config
    WHERE active_flag IS TRUE
      AND (pkid = p_config_id OR p_config_id = 0)
      AND lgd_method <> 3;

    ------------------------------------------------
    -- Step 2: Clean up existing LGD data
    ------------------------------------------------
    DELETE FROM frs9_imp_ca_lgd_data
    WHERE prc_date = p_prc_date AND (lgd_config_id = p_config_id OR p_config_id = 0);

    ------------------------------------------------
    -- Step 3: Insert new LGD data
    ------------------------------------------------
    INSERT INTO frs9_imp_ca_lgd_data (
        prc_date,
        lgd_config_id,
        lgd_method,
        account_id,
        eqv_at_default,
        wo_date,
        repo_date,
        closed_date,
        account_status,
        eqv_wo,
        eqv_repo,
        eir_at_default,
        createdby,
        createddate
    )
    SELECT 
        a.prc_date,
        c.lgd_config_id,
        c.lgd_method,
        a.account_id,
        a.eqv_at_default,
        d.prc_date,
        e.prc_date,
        NULL,
        b.account_status,
        COALESCE(d.eqv_os_wo, 0),
        COALESCE(e.eqv_os_repo, 0),
        a.eir_at_default,
        'SP_FRS9_IMP_CA_LGD_DATA2',
        CURRENT_TIMESTAMP
    FROM 
      vw_frs9_first_default a
      JOIN frs9_imp_ca_scenario_data b ON a.account_id = b.account_id
      JOIN tmp_lgd_config c ON b.segment_id = c.segment_id
      LEFT JOIN frs9_master_account_wo d ON b.account_id = d.account_id AND b.prc_date = d.prc_date
      LEFT JOIN frs9_master_account_repo e ON b.account_id = e.account_id AND b.prc_date = e.prc_date
    WHERE 
      b.prc_date = p_prc_date
      AND a.prc_date >= c.observation_start_date
      AND c.lgd_method IN (1, 2)
      AND b.segment_type = 'LGD'
      AND NOT EXISTS (
          SELECT 1
          FROM frs9_imp_ca_lgd_data x
          WHERE x.lgd_config_id = c.lgd_config_id
            AND x.account_id = a.account_id
            AND x.prc_date <= p_prc_date
      );

    ------------------------------------------------
    -- Step 4: Update REPO status
    ------------------------------------------------
    UPDATE frs9_imp_ca_lgd_data a
    SET repo_date = p_prc_date,
        account_status = 'R',
        eqv_repo = c.eqv_os_repo,
        updatedby = 'SP_FRS9_IMP_CA_LGD_DATA_R1',
        updateddate = CURRENT_TIMESTAMP
    FROM tmp_lgd_config b, frs9_master_account_repo c
    WHERE a.lgd_config_id = b.lgd_config_id
      AND a.prc_date <= p_prc_date
      AND a.repo_date IS NULL
      AND c.prc_date = p_prc_date
      AND a.account_id = c.account_id;

    ------------------------------------------------
    -- Step 5: Update WO status
    ------------------------------------------------
    UPDATE frs9_imp_ca_lgd_data a
    SET wo_date = p_prc_date,
        account_status = 'W',
        eqv_wo = c.eqv_os_wo,
        updatedby = 'SP_FRS9_IMP_CA_LGD_DATA3',
        updateddate = CURRENT_TIMESTAMP
    FROM tmp_lgd_config b, frs9_master_account_wo c
    WHERE a.lgd_config_id = b.lgd_config_id
      AND a.prc_date <= p_prc_date
      AND a.wo_date IS NULL
      AND c.prc_date = p_prc_date
      AND a.account_id = c.account_id;

    ------------------------------------------------
    -- Step 6: Update CLOSED status
    ------------------------------------------------
    UPDATE frs9_imp_ca_lgd_data a
    SET closed_date = p_prc_date,
        account_status = 'C',
        updatedby = 'SP_FRS9_IMP_CA_LGD_DATA4',
        updateddate = CURRENT_TIMESTAMP
    FROM tmp_lgd_config b
    WHERE a.lgd_config_id = b.lgd_config_id
      AND a.prc_date <= p_prc_date
      AND a.closed_date IS NULL
      AND a.account_status = 'A'
      AND NOT EXISTS (
          SELECT 1
          FROM frs9_imp_ca_scenario_data x
          WHERE x.segment_type = 'LGD'
            AND x.prc_date = p_prc_date
            AND x.account_id = a.account_id
            AND x.segment_id = b.segment_id
      );
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_data(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_h(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_h(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Drop temp table if exists
    DROP TABLE IF EXISTS tmp_lgd_config;

    -- Load active LGD configurations
    CREATE TEMP TABLE tmp_lgd_config AS
    SELECT 
        pkid AS lgd_config_id,
        segment_id,
        lgd_method,
        population_type,
        observation_period,
        observation_start_date,
        workout_period,
        fl_flag,
        CAST(lgd_rate AS FLOAT) / 100 AS lgd_rate
    FROM frs9_imp_ca_lgd_config
    WHERE active_flag IS TRUE AND (pkid = p_config_id OR p_config_id = 0);

    -- Delete existing LGD results
    DELETE FROM frs9_imp_ca_lgd_h
    WHERE prc_date = p_prc_date AND (lgd_config_id = p_config_id OR p_config_id = 0);

    -- Insert aggregated LGD data
    INSERT INTO frs9_imp_ca_lgd_h (
        prc_date,
        lgd_config_id, 
        lgd_method,
        model_id,
        eqv_os, 
        eqv_rec,
        npv_eqv_rec,
        createdby,
        createddate
    )
    SELECT 
        p_prc_date,
        a.lgd_config_id,
        a.lgd_method,
        0,
        SUM(a.eqv_os),
        SUM(a.eqv_rec),
        SUM(a.npv_eqv_rec),
        'SP_FRS9_IMP_CA_LGD_H',
        CURRENT_TIMESTAMP
    FROM frs9_imp_ca_lgd_d a
    JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
    WHERE a.prc_date = p_prc_date
    GROUP BY a.lgd_config_id, a.lgd_method;

    -- Update recovery rate
    UPDATE frs9_imp_ca_lgd_h a
    SET rec_rate = CASE 
                      WHEN eqv_os = 0 THEN 0 
                      ELSE CAST(npv_eqv_rec AS FLOAT) / eqv_os 
                   END
    FROM tmp_lgd_config b
    WHERE a.lgd_config_id = b.lgd_config_id AND a.prc_date = p_prc_date;

    -- Update LGD
    UPDATE frs9_imp_ca_lgd_h a
    SET lgd = 1 - rec_rate
    FROM tmp_lgd_config b
    WHERE a.lgd_config_id = b.lgd_config_id AND a.prc_date = p_prc_date;

    -- Insert fallback LGD for method 3
    INSERT INTO frs9_imp_ca_lgd_h (
        prc_date,
        lgd_config_id, 
        lgd_method,
        model_id,
        eqv_os, 
        eqv_rec,
        npv_eqv_rec,
        rec_rate,
        lgd,
        createdby,
        createddate
    )
    SELECT 
        p_prc_date,
        lgd_config_id,
        lgd_method,
        0,
        0, 0, 0, 0,
        lgd_rate,
        'SP_FRS9_IMP_CA_LGD_H1',
        CURRENT_TIMESTAMP
    FROM tmp_lgd_config
    WHERE lgd_method = 3;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_h(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_rec_d(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_rec_d(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE 
  v_interval1 DATE;
  v_interval2 DATE;
BEGIN
  -- Step 1: Stage LGD Config
  DROP TABLE IF EXISTS tmp_lgd_config;

  CREATE TEMP TABLE tmp_lgd_config AS
  SELECT 
    pkid AS lgd_config_id,
    segment_id,
    lgd_method,
    population_type,
    observation_period,
    observation_start_date,
    workout_period,
    fl_flag,
    lgd_rate
  FROM frs9_imp_ca_lgd_config
  WHERE active_flag IS TRUE
    AND (pkid = p_config_id OR p_config_id = 0);
    
  -- Step 2: Cleanup previous data
  DELETE FROM frs9_imp_ca_lgd_rec_d
  WHERE prc_date = p_prc_date AND (lgd_config_id = p_config_id OR p_config_id = 0);

  TRUNCATE TABLE tmp_frs9_imp_ca_lgd_rec_d;

  -- Step 3a: Insert from LGD_REC_DATA
  INSERT INTO tmp_frs9_imp_ca_lgd_rec_d (
    prc_date
    , lgd_config_id
    , lgd_method
    , account_id
    , eqv_os
    , eir
    , seq
    , eqv_rec
    , npv_eqv_rec
    , createdby
    , createddate
  )
  SELECT 
    p_prc_date,
    a.lgd_config_id,
    a.lgd_method,
    a.account_id,
    a.eqv_at_default AS eqv_os,
    a.eir_at_default AS eir,
    fn_get_total_months(a.prc_date, COALESCE(c.prc_date, a.prc_date)) AS seq,
    COALESCE(c.eqv_rec_os, 0) AS eqv_rec,
    0 AS npv_eqv_rec,
    'SP_FRS9_IMP_CA_LGD_REC_D' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM 
    frs9_imp_ca_lgd_data a
    JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
    LEFT JOIN frs9_imp_ca_lgd_rec_data c ON a.account_id = c.account_id AND c.prc_date <= p_prc_date
    WHERE 
      a.prc_date >= b.observation_start_date
      AND (
            (a.prc_date BETWEEN 
              fn_eomonth(p_prc_date::DATE, -(b.workout_period::INT + b.observation_period::INT)) AND
              fn_eomonth(p_prc_date, -b.workout_period::INT)
             AND b.population_type = '2')
          OR
            (a.prc_date <= 
              fn_eomonth(p_prc_date, -b.workout_period::INT)
              AND b.population_type = '1')
      )

      AND a.prc_date <= p_prc_date
      AND a.account_status = 'W'
      AND b.lgd_method = 1;

  -- Step 3b: Insert from COLL_DATA
  INSERT INTO tmp_frs9_imp_ca_lgd_rec_d (
    prc_date
    , lgd_config_id
    , lgd_method
    , account_id
    , eqv_os
    , eir
    , seq
    , eqv_rec
    , npv_eqv_rec
    , createdby
    , createddate
  )
  SELECT 
    p_prc_date,
    a.lgd_config_id,
    a.lgd_method,
    a.account_id,
    a.eqv_at_default AS eqv_os,
    a.eir_at_default AS eir,
    fn_get_total_months(a.prc_date, COALESCE(c.pv_date, a.prc_date)) AS seq,
    COALESCE(CASE WHEN c.sold_flag IS TRUE THEN c.sell_amt ELSE c.colla_amt END, 0) AS eqv_rec,
    0 AS npc_eqv_rec,
    'SP_FRS9_IMP_CA_LGD_REC_D',
    CURRENT_TIMESTAMP
  FROM frs9_imp_ca_lgd_data a
    JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
    JOIN frs9_imp_ca_lgd_coll_data c ON a.account_id = c.account_id AND c.prc_date = p_prc_date
  WHERE 
    a.prc_date >= b.observation_start_date
    AND (
          (a.prc_date BETWEEN 
              fn_eomonth(p_prc_date::DATE, -(b.workout_period::INT + b.observation_period::INT)) AND
              fn_eomonth(p_prc_date, -b.workout_period::INT)
           AND b.population_type = '2')
          OR
          (a.prc_date <= fn_eomonth(p_prc_date, -b.workout_period::INT) AND b.population_type = '1')
    )
    AND a.prc_date <= p_prc_date
    AND a.account_status IN ('W','R')
    AND b.lgd_method IN (1,2);

  -- Step 4: Final insert with ranking
  INSERT INTO frs9_imp_ca_lgd_rec_d (
    prc_date,
    lgd_config_id,
    lgd_method,
    account_id,
    eqv_os,
    eir,
    seq,
    eqv_rec,
    npv_eqv_rec,
    rn,
    createdby,
    createddate
  )
  SELECT 
    prc_date,
    lgd_config_id,
    lgd_method,
    account_id,
    eqv_os,
    eir,
    CASE WHEN seq < 0 THEN 0 ELSE seq END,
    eqv_rec,
    npv_eqv_rec,
    ROW_NUMBER() OVER (PARTITION BY lgd_config_id, account_id ORDER BY seq, eqv_rec ASC),
    createdby,
    createddate
  FROM tmp_frs9_imp_ca_lgd_rec_d;

  -- Step 5: Adjust recovery to avoid over-recovery
  WITH sum_cte AS (
    SELECT 
      a.lgd_config_id,
      a.account_id,
      a.rn,
      a.eqv_os,
      SUM(a.eqv_rec) OVER (PARTITION BY a.lgd_config_id, a.account_id ORDER BY rn) AS sum_eqv_rec
  FROM frs9_imp_ca_lgd_rec_d a
    JOIN tmp_lgd_config b ON a.lgd_config_id = b.lgd_config_id
  WHERE a.prc_date = p_prc_date
  
  ), join_cte AS (
    SELECT 
      a.lgd_config_id,
      a.account_id,
      a.rn,
      a.eqv_os,
      CASE 
        WHEN COALESCE(b.sum_eqv_rec, 0) > a.eqv_os THEN 0
          ELSE 
            CASE 
              WHEN COALESCE(b.sum_eqv_rec, 0) + a.eqv_rec < a.eqv_os THEN a.eqv_rec
              ELSE a.eqv_os - COALESCE(b.sum_eqv_rec, 0)
            END
        END AS eqv_rec
    FROM 
      frs9_imp_ca_lgd_rec_d a
      LEFT JOIN sum_cte b ON 
        a.lgd_config_id = b.lgd_config_id AND 
        a.account_id = b.account_id AND 
        a.rn = b.rn + 1
      JOIN tmp_lgd_config c ON a.lgd_config_id = c.lgd_config_id
    WHERE a.prc_date = p_prc_date
  )
  
  UPDATE frs9_imp_ca_lgd_rec_d a
    SET eqv_rec = join_cte.eqv_rec
  FROM join_cte
  WHERE
    a.lgd_config_id = join_cte.lgd_config_id
    AND a.account_id = join_cte.account_id
    AND a.rn = join_cte.rn
    AND a.prc_date = p_prc_date;

  -- Step 6: Calculate NPV of recoveries
  UPDATE frs9_imp_ca_lgd_rec_d a
  SET npv_eqv_rec = fn_frs9_pv(a.eir / 1200, a.seq, a.eqv_rec)
  FROM tmp_lgd_config b
  WHERE a.lgd_config_id = b.lgd_config_id
    AND a.prc_date = p_prc_date;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_rec_d(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_rec_data(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_rec_data(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- 🔹 Step 1: Delete existing recovery records for this date
  DELETE FROM frs9_imp_ca_lgd_rec_data WHERE prc_date = p_prc_date;
  
  -- 🔹 Step 2: Insert new recovery records
  WITH recovery_candidates AS (
    SELECT 
      a.account_id,
      c.rule_id,
      a.outstanding AS prev_outstanding,
      COALESCE(b.outstanding, 0) AS curr_outstanding,
      a.currency,
      d.exchange_rate,
      a.outstanding - COALESCE(b.outstanding, 0) AS rec_os,
      (a.outstanding - COALESCE(b.outstanding, 0)) * d.exchange_rate AS eqv_rec_os
    FROM tmp_frs9_master_account_prev a
      LEFT JOIN frs9_master_account b
        ON a.account_id = b.account_id AND b.prc_date = p_prc_date AND b.account_status = 'A'
    JOIN vw_frs9_first_default c
      ON a.account_id = c.account_id
    JOIN frs9_master_exchange_rate d
      ON a.currency = d.currency
    LEFT JOIN frs9_master_account x
      ON x.account_id = a.account_id AND x.prc_date = p_prc_date AND x.account_status = 'W'
    WHERE 
      a.prc_date = fn_eomonth(p_prc_date,-1)
      AND d.prc_date = p_prc_date
      AND c.prc_date < p_prc_date
      AND x.account_id IS NULL
  )
  INSERT INTO frs9_imp_ca_lgd_rec_data (
    prc_date,
    default_rule_id,
    account_id,
    rec_os,
    eqv_rec_os,
    createdby,
    createddate
  )
  SELECT 
    p_prc_date,
    rule_id,
    account_id,
    rec_os,
    eqv_rec_os,
    'SP_FRS9_IMP_CA_LGD_REC_DATA',
    NOW()
  FROM recovery_candidates
  WHERE rec_os > 0;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_rec_data(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_lgd_sequence(bigint, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_lgd_sequence(IN p_config_id bigint DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate DATE;
  v_rundate DATE;
  v_mindate DATE;
  v_param_imp TEXT;
  v_param TEXT;
  v_param_prc_name TEXT;
  v_sessionid UUID;
  v_counter INTEGER;
  v_interval SMALLINT;
BEGIN
  -- Step 2: Read Interval Parameter
  SELECT param_usage INTO v_interval
  FROM frs9_param_commonh
  WHERE param_code = 'S1004';

  -- Step 3: Generate Session ID
  v_sessionid := gen_random_uuid();
  UPDATE frs9_prc_date SET sessionid = v_sessionid;

  -- Step 4: Determine Date Range
  SELECT MIN(observation_start_date) INTO v_mindate
  FROM frs9_imp_ca_lgd_config
  WHERE active_flag IS TRUE AND (p_config_id = pkid OR p_config_id = 0);

  SELECT fn_eomonth(currdate, 0)
  INTO v_currdate
  FROM frs9_prc_date;

  v_rundate := CASE WHEN LOWER(p_prc) <> 's' THEN v_currdate ELSE v_mindate END;

  -- Step 5: Loop Through Each Run Date
  WHILE v_rundate <= v_currdate LOOP

    -- Step 6: Prepare Parameters
    -- For procedures with: (p_prc_date, p_config_id, p_prc)
    v_param := quote_literal(v_rundate) || ', ' || quote_literal(p_config_id) || ', ' || quote_literal(p_prc);

    -- For procedures with: (p_prc_date, p_prc, p_ecl_model_id)
    v_param_imp := quote_literal(v_rundate) || ', ' || quote_literal(p_prc) || ', ' || quote_literal(0);

    v_param_prc_name := format('LGD_%s_%s', p_prc, p_config_id);


    -- Step 7: Log Start of Execution
    SELECT COALESCE(MAX(counter), 0) + 1 INTO v_counter
    FROM frs9_statistic
    WHERE sp_name = 'LGD SEQUENCE' AND LOWER(prc_name) = LOWER(v_param_prc_name);

    INSERT INTO frs9_statistic (
      prc_date, sp_name, start_date, iscomplete,
      counter, prc_name, sessionid, remark
    )
    SELECT currdate, 'LGD SEQUENCE', CURRENT_TIMESTAMP, 'N',
           v_counter, v_param_prc_name, v_sessionid, 'RUNNING'
    FROM frs9_prc_date;

    -- Step 8: Execute Sub-Procedures via Logging Wrapper
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_segment_query', v_param_prc_name, v_currdate, v_param_imp, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_lgd', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_master_account_prev', v_param_prc_name, v_currdate, v_param_imp, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_coll_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_d', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_d', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_h', v_param_prc_name, v_currdate, v_param, 'Y');
 
    -- Step 9: Finalize Run Status
    UPDATE frs9_prc_date
    SET batch_status = 'FINISHED', remark = 'LGD SEQUENCE';

    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'Y',
        prc_process_time = fn_frs9_getprocesstime(start_date::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP),
        remark = 'SUCCEED'
    WHERE prc_date = v_currdate
      AND sp_name = 'LGD SEQUENCE'
      AND prc_name = v_param_prc_name
      AND sessionid = v_sessionid::TEXT;

    -- Step 10: Advance to Next Run Date
    v_rundate := fn_eomonth(v_rundate, 1);
  END LOOP;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_lgd_sequence(IN p_config_id bigint, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_main(date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_main(IN p_prc_date date DEFAULT NULL::date)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE;
BEGIN
    -- Determine current processing date
    SELECT CASE 
               WHEN p_prc_date IS NULL THEN currdate
               ELSE p_prc_date
           END
    INTO v_currdate
    FROM frs9_prc_date;

    -- Call sub-procedures
    CALL sp_frs9_imp_ca_initial(v_currdate);
    CALL sp_frs9_imp_ca_ead_process(v_currdate);
    CALL sp_frs9_imp_ca_ecl_process(v_currdate, 3);
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_main(IN p_prc_date date) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_model_sequence(integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_model_sequence(IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE;
    v_rundate DATE;
    v_mindate DATE;
    v_param_imp TEXT;
    v_param TEXT;
    v_param_prc_name TEXT;
    v_sessionid UUID := gen_random_uuid();
    v_counter INTEGER;
    v_interval SMALLINT;
BEGIN
  -- 🧩 Step 1: Get interval from parameter table
  SELECT param_usage INTO v_interval
  FROM frs9_param_commonh
  WHERE param_code = 'S1004';

  RAISE NOTICE 'Step 1 - Interval (v_interval): %', v_interval;

  -- 🆔 Step 2: Generate session ID and update process date table
  UPDATE frs9_prc_date
  SET sessionid = v_sessionid;

  RAISE NOTICE 'Step 2 - Session ID (v_sessionid): %', v_sessionid;

  -- 📅 Step 3: Get minimum observation start date
  SELECT MIN(observation_start_date) INTO v_mindate
  FROM frs9_imp_ca_pd_config
  WHERE active_flag IS TRUE
    AND (p_config_id = pkid OR p_config_id = 0);

  RAISE NOTICE 'Step 3 - Minimum Observation Date (v_mindate): %', v_mindate;

  -- 📅 Step 4: Calculate current processing date
  SELECT date_trunc('month', currdate + (v_interval || ' months')::interval) + interval '1 month - 1 day'
  INTO v_currdate
  FROM frs9_prc_date;

  RAISE NOTICE 'Step 4 - Current Processing Date (v_currdate): %', v_currdate;

  -- 📅 Step 5: Determine starting run date
  v_rundate := CASE WHEN p_prc <> 'S' THEN v_currdate ELSE v_mindate END;

  RAISE NOTICE 'Step 5 - Initial Run Date (v_rundate): %', v_rundate;

-- RETURN
  
  WHILE v_rundate <= v_currdate LOOP
    -- 🧪 Step 6.1: Build dynamic parameters
    v_param := quote_literal(v_currdate) || '::date, '|| '0::int,' || quote_literal('M') || '::text';
    
    /*
    v_param := format(
        '@PRC_DATE = ''%s'', @PRC = ''M'' , @CONFIG_ID = ''%s''',
        v_currdate, p_config_id
    );
    */
    
    v_param_imp := quote_literal(v_currdate) || '::date, ' || quote_literal('M') || '::text, ' || '0::int';
    
    /*
    v_param_imp := format(
        '@PRC_DATE = ''%s'', @PRC = ''M'' , @ECL_MODEL_ID = 0',
        v_currdate
    );
    */
    
    v_param_prc_name := format('MDL_%s_''%s''', p_prc, p_config_id);

    -- 🔍 Debug trace for parameter construction
    RAISE NOTICE 'Step 6.1 - Loop Run Date: %', v_rundate;
    RAISE NOTICE 'Step 6.1 - v_param: %', v_param;
    RAISE NOTICE 'Step 6.1 - v_param_imp: %', v_param_imp;
    RAISE NOTICE 'Step 6.1 - v_param_prc_name: %', v_param_prc_name;

    -- 📊 Step 6.2: Get execution counter
    SELECT COALESCE(MAX(counter), 0) + 1 INTO v_counter
    FROM frs9_statistic
    WHERE sp_name = 'MODEL SEQUENCE'
      AND prc_name = v_param_prc_name;

    RAISE NOTICE 'Step 6.2 - Execution Counter (v_counter): %', v_counter;

    -- 📝 Step 6.3: Insert initial log entry
    INSERT INTO frs9_statistic (
        prc_date, sp_name, start_date, iscomplete, counter,
        prc_name, sessionid, remark
    )
    SELECT currdate, 'MODEL SEQUENCE', CURRENT_TIMESTAMP, 'N',
           v_counter, v_param_prc_name, v_sessionid::TEXT, 'RUNNING'
    FROM frs9_prc_date;

    -- ⚙️ Step 6.4: Execute sub-procedures via wrapper
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_segment_query', v_param_prc_name, v_currdate, v_param_imp, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_lgd', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_master_account_prev', v_param_prc_name, v_currdate, v_param_imp, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_coll_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_d', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_d', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_h', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_pd', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_data', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_migration', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_enr', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_odr', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate_avg', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_proxy', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_mmult', v_param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_structure', v_param_prc_name, v_currdate, v_param, 'Y');
 
    -- ✅ Step 6.5: Update batch status
    UPDATE frs9_prc_date
    SET batch_status = 'FINISHED',
        remark = 'MODEL SEQUENCE';

    -- 🧾 Step 6.6: Finalize log entry
    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'Y',
        prc_process_time = fn_frs9_getprocesstime(start_date::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP),
        remark = 'SUCCEED'
    WHERE prc_date = v_currdate
      AND sp_name = 'MODEL SEQUENCE'
      AND prc_name = v_param_prc_name
      AND sessionid = v_sessionid::TEXT;

    -- ⏭️ Step 6.7: Advance to next month
    v_rundate := date_trunc('month', v_rundate + interval '1 month') + interval '1 month - 1 day';

  END LOOP;

    

    -- 🔁 Step 6: Loop through each month
    WHILE v_rundate <= v_currdate LOOP
        -- 🧪 Step 6.1: Build dynamic parameters
        v_param := format(
            '@PRC_DATE = ''%s'', @PRC = ''M'' , @CONFIG_ID = ''%s''',
            v_currdate, p_config_id
        );

        v_param_imp := format(
            '@PRC_DATE = ''%s'', @PRC = ''M'' , @ECL_MODEL_ID = 0',
            v_currdate
        );

        v_param_prc_name := format('MDL_%s_''%s''', p_prc, p_config_id);

        -- 📊 Step 6.2: Get counter
        SELECT COALESCE(MAX(counter), 0) + 1 INTO v_counter
        FROM frs9_statistic
        WHERE sp_name = 'MODEL SEQUENCE'
          AND prc_name = v_param_prc_name;

        -- 📝 Step 6.3: Insert initial log
        INSERT INTO frs9_statistic (
            prc_date, sp_name, start_date, iscomplete, counter,
            prc_name, sessionid, remark
        )
        SELECT currdate, 'MODEL SEQUENCE', CURRENT_TIMESTAMP, 'N',
               v_counter, v_param_prc_name, v_sessionid, 'RUNNING'
        FROM frs9_prc_date;

        -- ⚙️ Step 6.4: Execute sub-procedures via wrapper
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_segment_query', v_param_prc_name, v_currdate, v_param_imp, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_lgd', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_master_account_prev', v_param_prc_name, v_currdate, v_param_imp, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_data', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_coll_data', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_data', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_rec_d', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_d', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_lgd_h', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_pd', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_data', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_migration', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_enr', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_odr', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate_avg', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_proxy', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_mmult', v_param_prc_name, v_currdate, v_param, 'Y');
--         CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_structure', v_param_prc_name, v_currdate, v_param, 'Y');

        -- ✅ Step 6.5: Update batch status
        UPDATE frs9_prc_date
        SET batch_status = 'FINISHED',
            remark = 'MODEL SEQUENCE';

        -- 🧾 Step 6.6: Finalize log
        UPDATE frs9_statistic
        SET end_date = CURRENT_TIMESTAMP,
            iscomplete = 'Y',
            prc_process_time = fn_frs9_getprocesstime(start_date, CURRENT_TIMESTAMP),
            remark = 'SUCCEED'
        WHERE prc_date = v_currdate
          AND sp_name = 'MODEL SEQUENCE'
          AND prc_name = v_param_prc_name
          AND sessionid = v_sessionid;

        -- ⏭️ Step 6.7: Advance to next month
        v_rundate := date_trunc('month', v_rundate + interval '1 month') + interval '1 month - 1 day';
    END LOOP;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_model_sequence(IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_data(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_data(IN p_prc_date date DEFAULT '2020-06-30'::date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  wo_increment SMALLINT;
BEGIN
  -- 🔍 Retrieve write-off window parameter
  SELECT param_usage::INT INTO wo_increment
  FROM frs9_param_commonh
  WHERE param_code = 'S1006';

  -- 🧹 Clean up temp table if it exists
  DROP TABLE IF EXISTS tmp_historical_data_date;

  -- 🧼 Reset staging table
  TRUNCATE TABLE tmp_frs9_imp_ca_pd_data;

  -- 📅 Prepare historical config data
  WITH tmp_historical_data_date AS (
    SELECT DISTINCT ON (pd_config_id, segment_id, pd_method, bucket_group, ia_flag, observation_start_date, data_date) *
    FROM (
      SELECT 
        pkid AS pd_config_id,
        segment_id,
        pd_method,
        bucket_group,
        ia_flag,
        observation_start_date,
        fn_eomonth(p_prc_date, -interval) AS data_date
      FROM frs9_imp_ca_pd_config
      WHERE active_flag IS TRUE
        AND pd_method::INT <> 3
        AND (pkid = p_config_id OR p_config_id = 0)
    ) sub
  )

  -- 📥 Insert processed data
  INSERT INTO tmp_frs9_imp_ca_pd_data (
    prc_date,
    pd_config_id,
    pd_method,
    account_id,
    account_status,
    cif_number,
    facility_number,
    currency,
    bucket_default,
    include_closed_flag,
    include_wo_flag,
    bucket_group,
    bucket_id,
    dpd,
    collectability,
    internal_rating_code,
    ext_rating_code,
    ext_rating_id,
    default_flag,
    wo_flag,
    remaining_tenor,
    plafond,
    outstanding,
    createdby,
    createddate
  )
  SELECT
    a.prc_date AS prc_date,
    b.pd_config_id AS pd_config_id,
    b.pd_method::INT AS pd_method,
    a.account_id AS account_id,
    a.account_status AS account_status,
    a.cif_number AS cif_number,
    a.facility_number AS facility_number,
    a.currency AS currency,
    f.bucket_id AS bucket_default,
    d.closed_flag AS include_closed_flag,
    d.wo_flag AS include_wo_flag,
    b.bucket_group AS bucket_group,
    CASE 
        WHEN a.default_flag IS TRUE OR c.account_id IS NOT NULL THEN f.bucket_id
        ELSE COALESCE(e.bucket_id, 0)
    END AS bucket_id,
    a.dpd AS dpd,
    a.collectability AS collectability,
    a.internal_rating_code AS internal_rating_code,
    a.ext_rating_code AS ext_rating_code,
    a.ext_rating_id AS ext_rating_id,
    a.default_flag AS default_flag,
    CASE 
        WHEN c.account_id IS NULL THEN FALSE
        ELSE TRUE
    END AS wo_flag,
    a.remaining_tenor AS remaining_tenor,
    a.plafond * a.exchange_rate AS plafond,
    a.outstanding * a.exchange_rate AS outstanding,
    'SP_FRS9_IMP_CA_PD_DATA' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  
  FROM frs9_imp_ca_scenario_data a
  JOIN tmp_historical_data_date b
    ON  a.segment_id = b.segment_id
        AND a.prc_date >= b.observation_start_date
        AND (b.ia_flag IS TRUE OR (b.ia_flag IS FALSE AND a.impaired_status = 'C'))
  LEFT JOIN frs9_master_account_wo c
    ON  a.account_id = c.account_id
        AND a.prc_date = p_prc_date
        AND c.prc_date <= fn_eomonth(p_prc_date, wo_increment)
  JOIN frs9_param_bucketh d
    ON  b.bucket_group = d.bucket_group
  LEFT JOIN frs9_param_bucketd e
    ON  d.pkid = e.pkid_header
        AND (
          (d.basis = 'R' AND a.ext_rating_id BETWEEN e.range_start AND e.range_end)
          OR (d.basis = 'D' AND a.dpd BETWEEN e.range_start AND e.range_end)
        )
  JOIN vw_frs9_max_bucket f
    ON b.bucket_group = f.bucket_group
    
  WHERE a.segment_type = 'PD'
        AND (
          a.prc_date = p_prc_date
          OR (a.prc_date = b.data_date AND a.account_status = 'A'
        )
    );
  
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_data(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_enr(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_enr(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate DATE := p_prc_date;
  v_prevdate DATE := fn_eomonth(p_prc_date,-1);
BEGIN
  
  -- Step 4: Drop temp table if exists
  DROP TABLE IF EXISTS tmp_historical_data_date;

  -- Step 5: Create temp table
  CREATE TEMP TABLE tmp_historical_data_date AS
    SELECT 
      a.pkid AS pd_config_id,
      bucket_group,
      fn_eomonth(p_prc_date, -interval) AS data_date,
      observation_start_date
    FROM frs9_imp_ca_pd_config a
    WHERE COALESCE(a.active_flag, FALSE) IS TRUE
          AND pd_method::INT <> 3
          AND (p_config_id = 0 OR pkid = p_config_id);

  RAISE NOTICE 'Temp table created with % rows', (SELECT COUNT(*) FROM tmp_historical_data_date);

  -- Step 6: Delete Existing Enrichment Data
  DELETE FROM frs9_imp_ca_pd_enr
  WHERE prc_date = v_currdate AND (pd_config_id = p_config_id OR p_config_id = 0);

  -- Step 7: Insert Aggregated Migration Data
  INSERT INTO frs9_imp_ca_pd_enr (
    prc_date,
    base_date,
    pd_config_id,
    bucket_group,
    bucket_from,
    bucket_to,
    calc_amount,
    createdby,
    createddate
  )
  SELECT 
    a.prc_date AS prc_date,
    a.base_date AS base_date,
    a.pd_config_id AS pd_config_id,
    a.bucket_group AS bucket_group,
    a.bucket_from AS bucket_from,
    a.bucket_to AS bucket_to,
    SUM(calc_amount) AS calc_amount,
    'SP_FRS9_IMP_CA_PD_ENR1' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM frs9_imp_ca_pd_migration a
  JOIN tmp_historical_data_date b 
    ON a.pd_config_id = b.pd_config_id
  WHERE a.prc_date = v_currdate
  GROUP BY 
    a.prc_date,
    a.base_date,
    a.pd_config_id,
    a.bucket_group,
    a.bucket_from,
    a.bucket_to;
    
  -- Step 8: Insert Zero-Amount Placeholders
  INSERT INTO frs9_imp_ca_pd_enr (
    prc_date,
    base_date,
    pd_config_id,
    bucket_group,
    bucket_from,
    bucket_to,
    calc_amount,
    createdby,
    createddate
  )
  SELECT DISTINCT ON (
    a.data_date,
    a.pd_config_id,
    a.bucket_group,
    c.bucket_id,
    d.bucket_id
  )
    p_prc_date AS prc_date,
    a.data_date AS base_date,
    a.pd_config_id AS pd_config_id,
    a.bucket_group AS bucket_group,
    c.bucket_id AS bucket_from,
    d.bucket_id AS bucket_to,
    0 AS calc_amount,
    'SP_FRS9_IMP_CA_PD_ENR2' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM tmp_historical_data_date a
  JOIN frs9_param_bucketh b ON a.bucket_group = b.bucket_group
  JOIN frs9_param_bucketd c ON b.pkid = c.pkid_header
  JOIN frs9_param_bucketd d ON b.pkid = d.pkid_header
  WHERE 
    a.observation_start_date <= a.data_date
    AND NOT EXISTS (
        SELECT 1
        FROM frs9_imp_ca_pd_enr x
        WHERE x.pd_config_id = a.pd_config_id
          AND x.prc_date = v_currdate
          AND x.bucket_from = c.bucket_id
          AND x.bucket_to = d.bucket_id
    )
  ORDER BY 
    a.data_date,
    a.pd_config_id,
    a.bucket_group,
    c.bucket_id,
    d.bucket_id,
    a.observation_start_date DESC;
  
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_enr(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_flowrate(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_flowrate(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE := p_prc_date;
BEGIN
  
  WITH tmp_historical_data_date AS (
    -- Step 3: PD config snapshot
    SELECT DISTINCT ON (pkid, segment_id, pd_method, bucket_group, ia_flag, observation_start_date, interval)
      pkid AS pd_config_id,
      segment_id,
      pd_method,
      bucket_group,
      ia_flag,
      observation_start_date,
      fn_eomonth(v_currdate, -interval) AS data_date
    FROM frs9_imp_ca_pd_config
    WHERE active_flag IS TRUE
      AND pd_method::INT <> 3
      AND (pkid = p_config_id OR p_config_id = 0)

  ), tmp_pd_bucket AS (
    
    -- Step 5: Bucket-level aggregation
    SELECT 
      a.pd_config_id,
      a.base_date,
      a.bucket_group,
      a.bucket_from,
      CASE WHEN a.bucket_to = 0 THEN 1 ELSE a.bucket_to END AS bucket_to,
      SUM(a.calc_amount) AS calc_amount
    FROM frs9_imp_ca_pd_enr a
    JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
    WHERE a.prc_date = v_currdate
    GROUP BY 
      a.pd_config_id,
      a.base_date,
      a.bucket_group,
      a.bucket_from,
      CASE WHEN a.bucket_to = 0 THEN 1 ELSE a.bucket_to END
  
  ), tmp_pd_total AS (
     
    -- Step 6: Total bucket-from aggregation
    SELECT 
      a.pd_config_id,
      a.base_date,
      a.bucket_group,
      a.bucket_from,
      SUM(a.calc_amount) AS calc_amount
    FROM frs9_imp_ca_pd_enr a
    JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
    WHERE a.prc_date = v_currdate
    GROUP BY 
      a.pd_config_id,
      a.base_date,
      a.bucket_group,
      a.bucket_from
  )

  -- Step 7: Final insert using CTEs

  INSERT INTO frs9_imp_ca_pd_flowrate (
      prc_date,
      base_date,
      pd_config_id,
      bucket_group,
      bucket_from,
      bucket_to,
      flowrate,
      createdby,
      createddate
  )
  SELECT 
      v_currdate AS prc_date,
      a.base_date,
      a.pd_config_id,
      a.bucket_group,
      a.bucket_from,
      a.bucket_to,
      CASE 
          WHEN b.calc_amount = 0 THEN 0
          ELSE a.calc_amount::FLOAT / b.calc_amount
      END AS flowrate,
      'SP_FRS9_IMP_CA_PD_FLOWRATE1' AS createdby,
      CURRENT_DATE AS createddate
  FROM tmp_pd_bucket a
  JOIN tmp_pd_total b 
    ON a.pd_config_id = b.pd_config_id
   AND a.bucket_from = b.bucket_from;
 
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_flowrate(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_flowrate_avg(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_flowrate_avg(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Step 2: Declare and initialize working dates
    v_currdate DATE := p_prc_date;
BEGIN
  
  -- Step 4: Delete existing average flowrate data
  DELETE FROM frs9_imp_ca_pd_flowrate_avg
  WHERE prc_date = v_currdate AND (pd_config_id = p_config_id OR p_config_id = 0);

  -- Step 3 & Step 5: Use CTEs to compute config snapshot and insert average flowrate
  WITH tmp_historical_data_date AS (
    
    -- Step 3: Drop and create temp table for PD config snapshot
    SELECT DISTINCT ON (pkid, bucket_group, population_type, interval)
      pkid AS pd_config_id,
      bucket_group,
      CASE 
        WHEN population_type::INT = 1 THEN fn_eomonth('2023-12-31', -999)
        ELSE fn_eomonth('2023-12-31', -observation_period)
      END AS prevdate,
      fn_eomonth('2023-12-31', -interval) AS data_date
    FROM frs9_imp_ca_pd_config
    WHERE 
      active_flag IS TRUE
      AND pd_method::INT <> 3
      AND (pkid = 0 OR 0 = 0)
  )

  -- Step 5: Insert average flowrate results
  INSERT INTO frs9_imp_ca_pd_flowrate_avg (
    prc_date,
    base_date,
    pd_config_id,
    bucket_group,
    bucket_from,
    bucket_to,
    flowrate,
    createdby,
    createddate
  )
  SELECT 
    v_currdate AS prc_date,
    b.data_date AS base_date,
    a.pd_config_id,
    a.bucket_group,
    a.bucket_from,
    a.bucket_to,
    AVG(a.flowrate) AS flowrate,
    'SP_FRS9_IMP_CA_PD_FLOWRATE_AVG1' AS createdby,
    CURRENT_DATE AS createddate
  FROM frs9_imp_ca_pd_flowrate a
  JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
  WHERE a.prc_date BETWEEN b.prevdate AND v_currdate
  GROUP BY 
    b.data_date,
    a.pd_config_id,
    a.bucket_group,
    a.bucket_from,
    a.bucket_to;
    
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_flowrate_avg(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_marg_year(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_marg_year(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Initialize Current Date
  v_currdate DATE := p_prc_date;
  -- Step 5: Working Variables
  month_seq INT;
  mmult_fin DOUBLE PRECISION;

  rec RECORD;
BEGIN

  -- Step 2: Build Temporary PD Configuration
  DROP TABLE IF EXISTS tmp_pd_config;
  CREATE TEMP TABLE tmp_pd_config AS
  SELECT 
    a.pkid AS pd_config_id,
    a.fl_flag,
    b.bucket_id AS bucket_default,
    a.interval,
    a.pd_method,
    a.fl_scalar_id
  FROM frs9_imp_ca_pd_config a
  JOIN vw_frs9_max_bucket b ON a.bucket_group = b.bucket_group
  WHERE 
    COALESCE(a.active_flag, FALSE) IS TRUE
    AND (p_config_id = 0 OR a.pkid = p_config_id);

  -- Step 3: Build Temporary Scalar Table
  DROP TABLE IF EXISTS tmp_pd_scalar;
  CREATE TEMP TABLE tmp_pd_scalar AS
  SELECT 
    c.pd_config_id,
    c.fl_scalar_id,
    b.period,
    b.weighted_scalar::DOUBLE PRECISION / 100 AS weighted_scalar
  FROM frs9_imp_ca_fl_scalarh a
  JOIN frs9_imp_ca_fl_scalard b ON a.pkid = b.pkid
  JOIN tmp_pd_config c ON a.pkid = c.fl_scalar_id
  WHERE a.active_flag IS TRUE AND c.fl_flag IS TRUE;

  -- Step 4: Delete Existing Output
  DELETE FROM frs9_imp_ca_pd_structure
  WHERE
    prc_date = v_currdate
    AND (pd_config_id = p_config_id OR p_config_id = 0);

  -- Step 6: Truncate Staging Table
  TRUNCATE TABLE tmp_frs9_imp_ca_pd_structure;

  -- Step 7–10: Loop Over Multiplier Sequences and Compute Marginal PD
  FOR rec IN
    SELECT 
        a.prc_date,
        a.pd_config_id,
        a.fl_seq,
        b.interval,
        a.bucket_group,
        a.bucket_from AS bucket_id,
        a.mmult - COALESCE(c.mmult, 0) AS mmult,
        b.pd_method,
        b.bucket_default
    FROM frs9_imp_ca_pd_mmult a
    JOIN tmp_pd_config b ON a.pd_config_id = b.pd_config_id AND a.bucket_to = b.bucket_default
    LEFT JOIN frs9_imp_ca_pd_mmult c ON
        a.pd_config_id = c.pd_config_id AND
        a.prc_date = c.prc_date AND
        a.bucket_from = c.bucket_from AND
        a.bucket_to = c.bucket_to AND
        a.fl_seq = c.fl_seq + 1
    WHERE a.prc_date = p_prc_date
    ORDER BY a.bucket_from, a.fl_seq
  LOOP
    FOR month_seq IN 1..rec.interval LOOP
      -- Step 8: Monthly Marginalization Logic
      IF month_seq = 1 THEN
        mmult_fin := 1 - POWER((1 - rec.mmult), month_seq::DOUBLE PRECISION / rec.interval::DOUBLE PRECISION);
      ELSE
        mmult_fin := 
          1 - POWER((1 - rec.mmult), month_seq::DOUBLE PRECISION / rec.interval::DOUBLE PRECISION) -
          (1 - POWER((1 - rec.mmult), (month_seq::DOUBLE PRECISION - 1) / rec.interval::DOUBLE PRECISION));
      END IF;

        -- Step 9: Handle Default Bucket Override
        IF rec.bucket_id = rec.bucket_default THEN
            mmult_fin := CASE WHEN month_seq = 1 AND rec.fl_seq = 0 THEN 1 ELSE 0 END;
        END IF;

        -- Step 10: Insert into Staging Table
        INSERT INTO tmp_frs9_imp_ca_pd_structure (
          prc_date,
          pd_config_id,
          pd_method,
          bucket_group,
          bucket_id,
          fl_seq,
          fl_year,
          fl_month,
          pd
        )
        VALUES (
          rec.prc_date,
          rec.pd_config_id,
          rec.pd_method::INT,
          rec.bucket_group,
          rec.bucket_id,
          (rec.fl_seq * rec.interval) + month_seq - 1,
          ((rec.fl_seq * rec.interval) / 12) + 1,
          (((rec.fl_seq * rec.interval) + month_seq - 1) % 12) + 1,
          mmult_fin
        );
    END LOOP;
  END LOOP;

  -- Step 12: Final Insert with Scalar Adjustment
  INSERT INTO frs9_imp_ca_pd_structure (
    prc_date,
    pd_config_id,
    pd_method,
    scalar_id,
    scenario_no,
    bucket_group,
    bucket_id,
    fl_seq,
    fl_year,
    fl_month,
    pd,
    createdby,
    createddate
  )
  SELECT 
    a.prc_date,
    a.pd_config_id,
    a.pd_method,
    COALESCE(b.fl_scalar_id, 0),
    0,
    a.bucket_group,
    a.bucket_id,
    a.fl_seq,
    a.fl_year,
    a.fl_month,
    a.pd * COALESCE(b.weighted_scalar, 1),
    'sp_frs9_imp_ca_pd_marg_year',
    CURRENT_TIMESTAMP
  FROM tmp_frs9_imp_ca_pd_structure a
  LEFT JOIN tmp_pd_scalar b ON a.pd_config_id = b.pd_config_id AND a.fl_year = b.period;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_marg_year(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_migration(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_migration(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
BEGIN
  ------------------------------------------------------------
  -- Step 1: Prepare historical reference dates per config
  ------------------------------------------------------------
  DROP TABLE IF EXISTS tmp_historical_data_date;

  CREATE TEMP TABLE tmp_historical_data_date AS
    SELECT DISTINCT ON (pd_config_id, segment_id, pd_method, bucket_group, ia_flag, observation_start_date, data_date) *
    FROM (
      SELECT
        pkid AS pd_config_id,
        segment_id,
        pd_method,
        bucket_group,
        ia_flag,
        observation_start_date,
        fn_eomonth(p_prc_date, -interval) AS data_date
      FROM frs9_imp_ca_pd_config
      WHERE active_flag IS TRUE
            AND pd_method::INT <> 3
            AND (pkid = p_config_id OR p_config_id = 0)
    ) x;

  ------------------------------------------------------------
  -- Step 2: Clean up previous migration data
  ------------------------------------------------------------
  DELETE FROM frs9_imp_ca_pd_migration
  WHERE prc_date = p_prc_date AND (pd_config_id = p_config_id OR p_config_id = 0);

  ------------------------------------------------------------
  -- Step 3: Load previous-period scenario data
  ------------------------------------------------------------
  TRUNCATE TABLE tmp_frs9_imp_ca_pd_scn_prev;

  INSERT INTO tmp_frs9_imp_ca_pd_scn_prev (
    period,
    pd_config_id,
    bucket_group,
    account_id,
    account_status,
    cif_number,
    facility_number,
    bucket_id,
    calc_amount,
    wo_flag,
    include_wo_flag,
    include_closed_flag,
    createdby,
    createddate
  )
  SELECT
    a.prc_date AS period,
    a.pd_config_id AS pd_config_id,
    a.bucket_group AS bucket_group,
    a.account_id AS account_id,
    a.account_status AS account_status,
    a.cif_number AS cif_number,
    a.facility_number AS facility_number,
    a.bucket_id AS bucket_id,
    CASE WHEN a.pd_method = 2 THEN a.outstanding ELSE 1 END AS calc_amount,
    a.wo_flag AS wo_flag,
    a.include_wo_flag AS include_wo_flag,
    a.include_closed_flag AS include_closed_flag,
    'SP_FRS9_IMP_CA_PD_MIGRATION1' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM tmp_frs9_imp_ca_pd_data a
  JOIN tmp_historical_data_date b
    ON a.pd_config_id = b.pd_config_id
  WHERE a.prc_date = b.data_date;
  
  ------------------------------------------------------------
  -- Step 4: Load current-period scenario data
  ------------------------------------------------------------
  TRUNCATE TABLE tmp_frs9_imp_ca_pd_scn_curr;

  INSERT INTO tmp_frs9_imp_ca_pd_scn_curr (
    period,
    pd_config_id,
    bucket_group,
    account_id,
    account_status,
    cif_number,
    facility_number,
    bucket_id,
    calc_amount,
    wo_flag,
    include_wo_flag,
    include_closed_flag,
    createdby,
    createddate
  )
  SELECT
    a.prc_date AS period,
    a.pd_config_id AS pd_config_id,
    a.bucket_group AS bucket_group,
    a.account_id AS account_id,
    a.account_status AS account_status,
    a.cif_number AS cif_number,
    a.facility_number AS facility_number,
    a.bucket_id AS bucket_id,
    CASE WHEN a.pd_method = 2 THEN a.outstanding ELSE 1 END AS calc_amount,
    a.wo_flag AS wo_flag,
    a.include_wo_flag AS include_wo_flag,
    a.include_closed_flag AS include_closed_flag,
    'SP_FRS9_IMP_CA_PD_MIGRATION1' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM tmp_frs9_imp_ca_pd_data a
  JOIN tmp_historical_data_date b
    ON a.pd_config_id = b.pd_config_id
  WHERE a.prc_date = p_prc_date;

  ------------------------------------------------------------
  -- Step 5: Insert final migration records
  ------------------------------------------------------------
  INSERT INTO frs9_imp_ca_pd_migration (
    prc_date,
    base_date,
    pd_config_id,
    bucket_group,
    account_id,
    cif_number,
    facility_number,
    bucket_from,
    bucket_to,
    calc_amount,
    createdby,
    createddate
  )
  SELECT
    p_prc_date AS prc_date,
    c.data_date AS base_date,
    a.pd_config_id AS pd_config_id,
    a.bucket_group AS bucket_group,
    a.account_id AS account_id,
    a.cif_number AS cif_number,
    a.facility_number AS facility_number,
    a.bucket_id AS bucket_from,
    CASE
        WHEN a.bucket_id = d.bucket_id THEN d.bucket_id
        ELSE COALESCE(b.bucket_id, 0)
    END AS bucket_to,
    a.calc_amount AS calc_amount,
    'SP_FRS9_IMP_CA_PD_MIGRATION2' AS createdby,
    CURRENT_TIMESTAMP AS createddate
        
  FROM tmp_frs9_imp_ca_pd_scn_prev a
  LEFT JOIN tmp_frs9_imp_ca_pd_scn_curr b
    ON a.account_id = b.account_id AND a.pd_config_id = b.pd_config_id
  JOIN tmp_historical_data_date c ON a.pd_config_id = c.pd_config_id
  JOIN vw_frs9_max_bucket d ON a.bucket_group = d.bucket_group
  
  WHERE
    (a.include_closed_flag IS TRUE OR (a.include_closed_flag IS FALSE AND b.account_id IS NOT NULL))
    AND (a.include_wo_flag IS TRUE OR (a.include_wo_flag IS FALSE AND COALESCE(b.wo_flag, FALSE) = FALSE));

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_migration(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_mmult(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_mmult(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_max SMALLINT;
    v_currdate DATE := p_prc_date;
    v_seq SMALLINT := 1;
BEGIN
  
  -- ✅ Step 3: Clean Existing Data
  DELETE FROM frs9_imp_ca_pd_mmult
  WHERE prc_date = v_currdate
    AND (pd_config_id = p_config_id OR p_config_id = 0);
  
  -- Merge Step 1 and Step 2
  DROP TABLE IF EXISTS tmp_historical_data_date;
  CREATE TEMP TABLE tmp_historical_data_date AS
    WITH max_tenor AS (
    
    -- ✅ Step 1: Determine Maximum Remaining Tenor
      SELECT segment_id, MAX(remaining_tenor) AS remaining_tenor
      FROM frs9_imp_ca_scenario_data
      WHERE segment_type = 'PD'
        AND prc_date = p_prc_date
      GROUP BY segment_id
      
    ), historical_data AS (
    
    -- ✅ Step 2: Prepare Historical Data
      SELECT 
        a.pkid AS pd_config_id,
        a.interval,
        a.pd_method,
        CASE 
          WHEN ((b.remaining_tenor + 1)::INT / a.interval) + 1 > a.multiplication THEN ((b.remaining_tenor + 1)::INT / a.interval) + 1
          ELSE a.multiplication
        END AS multiplication,
        fn_eomonth(p_prc_date, -a.interval) AS base_date
      FROM frs9_imp_ca_pd_config a
      JOIN max_tenor b ON a.segment_id = b.segment_id
      WHERE COALESCE(a.active_flag, FALSE) IS TRUE AND (p_config_id = 0 OR a.pkid = p_config_id)
    
    )
    SELECT * FROM historical_data;
  
  -- ✅ Step 4: Determine Max Multiplication
  SELECT MAX(multiplication) INTO v_max FROM tmp_historical_data_date;
  
  -- ✅ Step 5: Prepare Flowrate Data
  DROP TABLE IF EXISTS tmp_pd_flowrate;
  CREATE TEMP TABLE tmp_pd_flowrate AS
    SELECT a.prc_date,
       a.base_date,
       a.pd_config_id,
       a.bucket_group,
       a.bucket_from,
       a.bucket_to,
       a.flowrate
    FROM frs9_imp_ca_pd_flowrate_avg a
    JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
    WHERE a.prc_date = v_currdate AND b.pd_method::INT <> 3
    
    UNION ALL

    SELECT a.prc_date,
       a.base_date,
       a.pd_config_id,
       a.bucket_group,
       a.bucket_from,
       a.bucket_to,
       a.pd AS flowrate
    FROM frs9_imp_ca_pd_proxy a
    JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
    WHERE a.prc_date = v_currdate AND b.pd_method::INT = 3;

  -- ✅ Step 6: Insert Initial MMULT Records
  INSERT INTO frs9_imp_ca_pd_mmult (
    prc_date,
    pd_config_id,
    fl_seq,
    bucket_group,
    bucket_from,
    bucket_to,
    mmult,
    createdby,
    createddate
  )
  SELECT 
    a.prc_date AS prc_date,
    a.pd_config_id AS pd_config_id,
    0 AS fl_seq,
    a.bucket_group AS bucket_group,
    a.bucket_from AS bucket_from,
    a.bucket_to AS bucket_to,
    a.flowrate AS mmult,
    'SP_FRS9_IMP_CA_PD_FLOWRATE_AVG1' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM tmp_pd_flowrate a
  JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
  WHERE a.prc_date = v_currdate
  ORDER BY 
    a.prc_date,
    a.pd_config_id,
    a.bucket_group,
    a.bucket_from,
    a.bucket_to;

  -- ✅ Step 7: Iterative MMULT Calculation
  WHILE v_seq <= v_max LOOP

    -- ✅ Step 7a: Calculate MMULT for current sequence
    INSERT INTO frs9_imp_ca_pd_mmult (
      prc_date,
      pd_config_id,
      fl_seq,
      bucket_group,
      bucket_from,
      bucket_to,
      mmult,
      createdby,
      createddate
    )
    SELECT 
      a.prc_date AS prc_date,
      a.pd_config_id AS pd_config_id,
      v_seq AS fl_seq,
      a.bucket_group AS bucket_group,
      c.bucket_from AS bucket_from,
      a.bucket_to AS bucket_to,
      SUM(a.flowrate * c.mmult) AS mmult,
      'SP_FRS9_IMP_CA_PD_FLOWRATE_AVG2' AS createdby,
      CURRENT_TIMESTAMP AS createddate
    FROM tmp_pd_flowrate a
    JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
    JOIN frs9_imp_ca_pd_mmult c
      ON  a.prc_date = c.prc_date 
          AND a.pd_config_id = c.pd_config_id 
          AND a.bucket_from = c.bucket_to
    WHERE a.prc_date = v_currdate AND c.fl_seq = v_seq - 1
    GROUP BY 
      a.prc_date,
      a.pd_config_id,
      a.bucket_group,
      c.bucket_from,
      a.bucket_to
    ORDER BY 
      a.prc_date,
      a.pd_config_id,
      a.bucket_group,
      c.bucket_from,
      a.bucket_to;

    -- ✅ Step 7b: Increment loop counter
    v_seq := v_seq + 1;

  END LOOP;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_mmult(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_odr(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_odr(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 2: Declare working variables
  v_currdate DATE;
  v_prevdate DATE;
BEGIN

  -- Step 3: Assign current processing date
  v_currdate := p_prc_date;

  -- Step 4: Calculate previous month-end date
  v_prevdate := fn_eomonth(p_prc_date,-1);

  -- Step 5: Drop temp table if it already exists
  DROP TABLE IF EXISTS tmp_historical_data_date;

  -- Step 6: Load active PD configurations into temp table
  CREATE TEMP TABLE tmp_historical_data_date AS
    SELECT 
      pkid AS pd_config_id,
      bucket_group,
      fn_eomonth(p_prc_date, -interval) AS data_date
    FROM frs9_imp_ca_pd_config
    WHERE 
      COALESCE(active_flag, FALSE) IS TRUE
      AND pd_method::INT <> 3
      AND (p_config_id = 0 OR pkid = p_config_id);

  -- Step 7: Delete existing ODR records for the current date and config
  DELETE FROM frs9_imp_ca_pd_odr
  WHERE prc_date = v_currdate AND (pd_config_id = p_config_id OR p_config_id = 0);

  -- Step 8: Insert aggregated transition data into ODR table
  INSERT INTO frs9_imp_ca_pd_odr (prc_date, base_date, pd_config_id, tot_default, non_default, odr, createdby, createddate) 
  SELECT 
    a.prc_date AS prc_date,
    a.base_date AS base_date,
    a.pd_config_id AS pd_config_id,
    SUM(
        CASE 
            WHEN a.bucket_to = c.bucket_id AND a.bucket_from <> c.bucket_id 
            THEN a.calc_amount 
            ELSE 0 
        END
    ) AS tot_default,
    SUM(
        CASE 
            WHEN a.bucket_from <> c.bucket_id AND a.bucket_to <> c.bucket_id 
            THEN a.calc_amount 
            ELSE 0 
        END
    ) AS non_default,
    0 AS odr,
    'SP_IFRS_PD_MAA_ODR1' AS createdby,
    CURRENT_DATE AS createddate
  FROM frs9_imp_ca_pd_enr a
  JOIN tmp_historical_data_date b ON a.pd_config_id = b.pd_config_id
  JOIN vw_frs9_max_bucket c ON a.bucket_group = c.bucket_group
  WHERE a.prc_date = v_currdate
  GROUP BY 
    a.prc_date,
    a.base_date,
    a.pd_config_id;
    
  -- Step 9: Update ODR values based on inserted data
  UPDATE frs9_imp_ca_pd_odr a
  SET odr = CASE 
              WHEN a.non_default = 0 THEN 0
              ELSE a.tot_default::FLOAT / a.non_default
            END
    FROM tmp_historical_data_date b
    WHERE a.pd_config_id = b.pd_config_id
          AND a.prc_date = v_currdate;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_odr(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_proxy(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_proxy(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Declare and initialize working date
  v_currdate DATE := p_prc_date;
BEGIN
  -- Step 3: Delete existing proxy PD records
  DELETE FROM frs9_imp_ca_pd_proxy
  WHERE prc_date = v_currdate AND (pd_config_id = p_config_id OR p_config_id = 0);

  RAISE NOTICE 'Step 3: Deleted existing rows from frs9_imp_ca_pd_proxy for date % and config %', v_currdate, p_config_id;

  -- Step 2 (refactored) + Step 4 + Step 5: CTEs and final insert
  WITH pd_config_snapshot AS (
    -- Step 2: PD config snapshot (method = 3 only)
    SELECT 
      pkid AS pd_config_id,
      bucket_group,
      fn_eomonth(v_currdate, -interval) AS base_date
    FROM frs9_imp_ca_pd_config
    WHERE active_flag IS TRUE AND pd_method::INT = 3 AND (pkid = p_config_id OR p_config_id = 0)
    
  ), latest_proxy AS (
    -- Step 4: Latest proxy PD rates
    SELECT 
      a.prc_date,
      a.rating_agency,
      b.value3::INT AS bucket_from,
      c.value3::INT AS bucket_to,
      a.pd_rate,
      RANK() OVER (ORDER BY a.prc_date DESC) AS rn
    FROM tblu_master_pd_proxy a
    JOIN frs9_param_commond b ON a.rating_agency = b.value1 AND a.rating_from = b.value2
    JOIN frs9_param_commond c ON a.rating_agency = c.value1 AND a.rating_to = c.value2
    WHERE b.param_code = 'S1001'
          AND c.param_code = 'S1001'
          AND a.prc_date <= v_currdate
  )
  
  -- Step 5: Final insert
  INSERT INTO frs9_imp_ca_pd_proxy (
    prc_date,
    base_date,
    pd_config_id,
    bucket_group,
    bucket_from,
    bucket_to,
    pd,
    createdby,
    createddate
  )
  SELECT 
    v_currdate AS prc_date,
    b.base_date,
    b.pd_config_id,
    b.bucket_group,
    a.bucket_from,
    a.bucket_to,
    a.pd_rate,
    'SP_FRS9_IMP_CA_PD_PROXY' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM latest_proxy a
  JOIN frs9_param_commond c ON a.rating_agency = c.value1
  JOIN pd_config_snapshot b ON c.value2 = b.bucket_group
  WHERE a.rn = 1;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_proxy(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_sequence(bigint, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_sequence(IN p_config_id bigint DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
-- Step 1: Declare Variables
  v_currdate DATE;
  v_rundate DATE;
  v_mindate DATE;
  v_param_imp TEXT;
  v_param TEXT;
  v_prc_name TEXT;
  v_sessionid UUID := gen_random_uuid();
  v_counter INT;
  v_interval SMALLINT;

BEGIN
  -- Step 2: Get Interval Parameter
  SELECT param_usage INTO v_interval
  FROM frs9_param_commonh
  WHERE param_code = 'S1004';

  -- Step 3: Initialize Session
  UPDATE frs9_prc_date SET sessionid = v_sessionid;

  -- Step 4: Get Minimum Observation Date
  SELECT MIN(observation_start_date) INTO v_mindate
  FROM frs9_imp_ca_pd_config
  WHERE active_flag IS TRUE AND (p_config_id = pkid OR p_config_id = 0);

  -- Step 5: Calculate Current Processing Date
  SELECT fn_eomonth(currdate, 0)
  INTO v_currdate
  FROM frs9_prc_date;

  -- Step 6: Determine Run Date
  v_rundate := CASE WHEN LOWER(p_prc) <> 's' THEN v_currdate ELSE v_mindate END;

  -- Step 7: Loop Through Processing Dates
  WHILE v_rundate <= v_currdate LOOP
        
    -- Assemble Parameters
    v_param := 
      quote_literal(v_currdate) || ', ' ||
      quote_literal(p_config_id::TEXT) || ', ' ||
      quote_literal('M');

    v_param_imp := 
      quote_literal(v_currdate) || ', ' ||
      quote_literal('M') || ', ' ||
      quote_literal('0');

    v_prc_name := format('PD_%s_%s', p_prc, p_config_id);

    -- Log Start
    SELECT COALESCE(MAX(counter), 0) + 1 INTO v_counter
    FROM frs9_statistic
    WHERE sp_name = 'PD SEQUENCE' AND LOWER(prc_name) = LOWER(v_prc_name);

    INSERT INTO frs9_statistic (
      prc_date,
      sp_name,
      start_date,
      iscomplete,
      counter,
      prc_name,
      sessionid,
      remark
    )
    SELECT
      currdate,
      'PD SEQUENCE',
      CURRENT_TIMESTAMP,
      'N',
      v_counter,
      v_prc_name,
      v_sessionid,
      'RUNNING'
    FROM frs9_prc_date;

    -- Step 8: Execute PD subprocedures via logging wrapper (CALL version)
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_segment_query', v_prc_name, v_currdate, v_param_imp, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_pd', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_data', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_migration', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_enr', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_odr', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_flowrate_avg', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_proxy', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_mmult', v_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_pd_structure', v_prc_name, v_currdate, v_param, 'Y');

    -- Step 9: Log Completion
    UPDATE frs9_prc_date SET batch_status = 'FINISHED', remark = 'PD SEQUENCE';

    UPDATE frs9_statistic
    SET end_date = CURRENT_TIMESTAMP,
        iscomplete = 'Y',
        prc_process_time = fn_frs9_getprocesstime(start_date::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP),
        remark = 'SUCCEED'
    WHERE 
      prc_date = v_currdate
      AND sp_name = 'PD SEQUENCE'
      AND prc_name = v_prc_name
      AND sessionid = v_sessionid::TEXT;

    -- Step 10: Advance Run Date
    v_rundate := fn_eomonth(v_rundate, 1);
  END LOOP;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_sequence(IN p_config_id bigint, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_pd_structure(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_pd_structure(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Initialize Processing Date
  v_currdate DATE := p_prc_date;

  -- Step 5: Declare Variables for Loop
  v_eff_date DATE;
  v_pd_config_id INT;
  v_pd_method VARCHAR;
  v_bucket_grp VARCHAR;
  v_bucket_id SMALLINT;
  v_seq INT;
  v_increment INT;
  v_mmult DOUBLE PRECISION;
  v_month_seq DOUBLE PRECISION;
  v_mmult_fin DOUBLE PRECISION;
  v_default_bucket INT;
  
  rec RECORD;
BEGIN

  -- Step 4: Clean Target Table
  DELETE FROM frs9_imp_ca_pd_structure
  WHERE prc_date = v_currdate AND (pd_config_id = p_config_id OR p_config_id = 0);
      
  -- Step 2: Prepare Temporary PD Configuration
  DROP TABLE IF EXISTS tmp_pd_config;
  CREATE TEMP TABLE tmp_pd_config AS
    SELECT 
      a.pkid AS pd_config_id,
      a.fl_flag,
      b.bucket_id AS bucket_default,
      a.interval,
      a.pd_method,
      a.fl_scalar_id
    FROM frs9_imp_ca_pd_config a
    JOIN vw_frs9_max_bucket b ON a.bucket_group = b.bucket_group
    WHERE COALESCE(a.active_flag, FALSE) IS TRUE AND (p_config_id = 0 OR a.pkid = p_config_id);
    
  -- Step 3: Prepare Temporary Scalar Weights
  DROP TABLE IF EXISTS tmp_pd_scalar;
  CREATE TEMP TABLE tmp_pd_scalar AS
    SELECT 
      c.pd_config_id,
      c.fl_scalar_id,
      b.period,
      b.weighted_scalar::DOUBLE PRECISION AS weighted_scalar
    FROM frs9_imp_ca_fl_scalarh a
    JOIN frs9_imp_ca_fl_scalard b ON a.pkid = b.scalar_id
    JOIN tmp_pd_config c ON a.pkid = c.fl_scalar_id
    WHERE a.active_flag IS TRUE AND c.fl_flag IS TRUE;

  -- Step 6: Truncate Staging Table
  TRUNCATE TABLE tmp_frs9_imp_ca_pd_structure;

  -- Step 7–8: Cursor Loop – Monthly PD Calculation
  FOR rec IN
    SELECT 
      a.prc_date,
      a.pd_config_id,
      a.fl_seq::DOUBLE PRECISION,
      b.interval::DOUBLE PRECISION,
      a.bucket_group,
      a.bucket_from,
      a.mmult::DOUBLE PRECISION - COALESCE(c.mmult, 0)::DOUBLE PRECISION AS mmult_delta,
      b.pd_method,
      b.bucket_default
    FROM frs9_imp_ca_pd_mmult a
    JOIN tmp_pd_config b ON a.pd_config_id = b.pd_config_id AND a.bucket_to = b.bucket_default
    LEFT JOIN frs9_imp_ca_pd_mmult c 
      ON  a.pd_config_id = c.pd_config_id
          AND a.prc_date = c.prc_date
          AND a.bucket_from = c.bucket_from
          AND a.bucket_to = c.bucket_to
          AND a.fl_seq = c.fl_seq + 1
    WHERE a.prc_date = v_currdate
    ORDER BY a.bucket_from, a.fl_seq
  LOOP
    v_month_seq := 1;
    WHILE v_month_seq <= rec.interval LOOP
    
      IF v_month_seq = 1 THEN
        v_mmult_fin := 1 - POWER((1 - rec.mmult_delta), (v_month_seq / rec.interval));
      ELSE
        v_mmult_fin :=  1 - POWER((1 - rec.mmult_delta), (v_month_seq / rec.interval)) 
                        - (1 - POWER((1 - rec.mmult_delta), ((v_month_seq - 1) / rec.interval)));
      END IF;
      
      IF rec.bucket_from = rec.bucket_default THEN
        v_mmult_fin := CASE WHEN v_month_seq = 1 AND rec.fl_seq = 0 THEN 1 ELSE 0 END;
      END IF;
      
      INSERT INTO tmp_frs9_imp_ca_pd_structure (
        prc_date,
        pd_config_id,
        pd_method,
        bucket_group,
        bucket_id,
        fl_seq,
        fl_year,
        fl_month,
        pd
      ) VALUES (
        rec.prc_date,
        rec.pd_config_id,
        rec.pd_method::INT,
        rec.bucket_group,
        rec.bucket_from,
        (rec.fl_seq * rec.interval) + v_month_seq - 1,
        ((rec.fl_seq * rec.interval) / 12) + 1,
        (((rec.fl_seq * rec.interval) + v_month_seq - 1)::INT % 12) + 1,
        v_mmult_fin
      );

      v_month_seq := v_month_seq + 1;
    END LOOP;
    
  END LOOP;

  -- Step 9: Final Insert into Main Table
  INSERT INTO frs9_imp_ca_pd_structure (
    prc_date,
    pd_config_id,
    pd_method,
    scalar_id,
    scenario_no,
    bucket_group,
    bucket_id,
    fl_seq,
    fl_year,
    fl_month,
    weighted_scalar,
    pd_non_fl,
    pd,
    createdby,
    createddate
  )
  SELECT 
    a.prc_date,
    a.pd_config_id,
    a.pd_method,
    COALESCE(b.fl_scalar_id, 0),
    0,
    a.bucket_group,
    a.bucket_id,
    a.fl_seq,
    a.fl_year,
    a.fl_month,
    COALESCE(b.weighted_scalar, 1),
    a.pd * CASE WHEN a.bucket_id = c.bucket_id THEN 1 ELSE COALESCE(b.weighted_scalar, 1) END::DOUBLE PRECISION,
    a.pd,
    'SP_FRS9_IMP_CA_PD_STRUCTURE1',
    CURRENT_TIMESTAMP
  FROM tmp_frs9_imp_ca_pd_structure a
  LEFT JOIN tmp_pd_scalar b ON a.pd_config_id = b.pd_config_id AND a.fl_year = b.period
  JOIN vw_frs9_max_bucket c ON a.bucket_group = c.bucket_group;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_pd_structure(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_result_d(date, character, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_result_d(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id bigint DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialize
  v_currdate DATE := p_prc_date;
  v_table_resultd TEXT;
  v_qry TEXT := '';

BEGIN

  -- Step 2: Determine Target Table and Clean Existing Data
  IF p_prc = 'M' THEN
    v_table_resultd := 'frs9_imp_ca_result_d';
    EXECUTE format('DELETE FROM %I WHERE prc_date = %L', v_table_resultd, v_currdate);
  ELSE
    v_table_resultd := 'frs9_imp_ca_result_d_prv';
    EXECUTE format('DELETE FROM %I WHERE ecl_model_id = %L', v_table_resultd, p_ecl_model_id);
  END IF;

  -- Step 3: Build Config Snapshot
  DROP TABLE IF EXISTS tmp_ecl_config;

  CREATE TEMP TABLE tmp_ecl_config AS
  SELECT
      B.ecl_model_id,
      B.pf_segment_id AS segment_id,
      B.stage_rule_id,
      B.lgd_model_id AS lgd_config_id,
      B.pd_model_id AS pd_config_id,
      E.bucket_group,
      B.ead_model_id AS ead_config_id,
      C.ead_method,
      'OUTSTANDING' AS ead_balance,
      B.overlay_rate,
      CASE B.period_type
          WHEN 1 THEN fn_eomonth(v_currdate, 0)
          WHEN 2 THEN fn_eomonth(v_currdate, -1)
          WHEN 3 THEN fn_eomonth('1900-01-1', (fn_get_total_quarter('1900-01-01', v_currdate)-1) * 3)
          WHEN 4 THEN fn_eomonth(v_currdate, -12)
          WHEN 5 THEN B.period_date
      END AS period_date
  FROM frs9_imp_ca_ecl_configh A
  JOIN frs9_imp_ca_ecl_configd B ON A.pkid = B.ecl_model_id
  JOIN frs9_imp_ca_ead_config C ON B.ead_model_id = C.pkid
  JOIN frs9_imp_ca_pd_config E ON B.pd_model_id = E.pkid
  WHERE
      ((A.active_flag IS TRUE AND p_ecl_model_id::INT = 0) OR A.pkid = p_ecl_model_id::INT)
      AND A.effective_date <= v_currdate;

  SELECT ecl_model_id INTO p_ecl_model_id FROM tmp_ecl_config LIMIT 1;
  RAISE NOTICE 'ECLModelID: %', p_ecl_model_id;

/*-- debug output
DROP TABLE IF EXISTS tmp1;
CREATE TABLE tmp1 AS
  SELECT * FROM tmp_ecl_config;
RETURN;
--*/

  -- Step 4: Extract PD Results
  TRUNCATE TABLE tmp_frs9_imp_ca_result_pd;

  INSERT INTO tmp_frs9_imp_ca_result_pd (
      prc_date,
      segment_id,
      pd_config_id,
      scenario_no,
      bucket_id,
      fl_seq,
      pd,
      createddate
  )
  SELECT
      A.prc_date,
      B.segment_id,
      A.pd_config_id,
      A.scenario_no,
      A.bucket_id,
      A.fl_seq,
      A.pd,
      CURRENT_TIMESTAMP AS createddate
  FROM frs9_imp_ca_pd_structure A
  JOIN tmp_ecl_config B
      ON A.prc_date = B.period_date
     AND A.pd_config_id = B.pd_config_id;

/*-- debug output
DROP TABLE IF EXISTS tmp1;
CREATE TABLE tmp1 AS
  SELECT * FROM tmp_frs9_imp_ca_result_pd;
RETURN;
--*/

  --   Step 5: Extract LGD Results
  TRUNCATE TABLE tmp_frs9_imp_ca_result_lgd;

  INSERT INTO tmp_frs9_imp_ca_result_lgd (
      prc_date,
      segment_id,
      lgd_config_id,
      lgd,
      createddate
  )
  SELECT
      A.prc_date,
      B.segment_id,
      A.lgd_config_id,
      A.lgd,
      CURRENT_TIMESTAMP AS createddate
  FROM frs9_imp_ca_lgd_h A
  JOIN tmp_ecl_config B
      ON A.prc_date = B.period_date
     AND A.lgd_config_id = B.lgd_config_id;

/*-- debug output
DROP TABLE IF EXISTS tmp1;
CREATE TABLE tmp1 AS
  SELECT * FROM tmp_frs9_imp_ca_result_lgd;
RETURN;
--*/

  --   Step 6: Generate Payment Date List
  TRUNCATE TABLE tmp_frs9_imp_ca_result_ead;
  DROP TABLE IF EXISTS tmp_listdate;

  CREATE TEMP TABLE tmp_listdate AS
    WITH RECURSIVE ctedate AS (
      SELECT
        p_prc_date AS pmtdate,
        (SELECT MAX(fn_eomonth(p_prc_date , A.remaining_tenor))
          FROM tmp_frs9_ecl_fma A WHERE A.prc_date = v_currdate
        ) AS maxdate

      UNION ALL

      SELECT
        fn_eomonth(pmtdate, 1),
        maxdate
      FROM ctedate
      WHERE fn_eomonth(pmtdate, 1) <= maxdate
    )
    SELECT pmtdate FROM ctedate;

/*-- debug output
DROP TABLE IF EXISTS tmp1;
CREATE TABLE tmp1 AS
  SELECT * FROM tmp_listdate;
RETURN;
--*/

--   Step 7: Insert EAD Results
  INSERT INTO tmp_frs9_imp_ca_result_ead (
      prc_date,
      account_id,
      fl_seq,
      paym_avg,
      principal,
      sum_principal,
      next_interest,
      sum_next_interest,
      createddate
  )

  -- METHOD 1 & 3 — CURRENT SCHEDULE
  SELECT
    A.prc_date,
    A.account_id,
    fn_get_total_months(A.prc_date, B.pmtdate) AS fl_seq,
    0.0::DOUBLE PRECISION AS paym_avg,
    COALESCE(
      CASE 
        WHEN fn_get_total_months(A.prc_date, B.pmtdate) = 0 THEN 0 
        ELSE C.principal 
      END
    , 0) AS principal,
    SUM(COALESCE(
      CASE 
        WHEN fn_get_total_months(A.prc_date, B.pmtdate) = 0 THEN 0 
        ELSE C.principal END
        , 0)
    ) OVER (PARTITION BY A.account_id ORDER BY B.pmtdate ASC) AS sum_principal,
    COALESCE(C.next_interest, 0) AS next_interest,
    SUM(COALESCE(C.next_interest, 0)) OVER (PARTITION BY A.account_id ORDER BY B.pmtdate ASC) AS sum_next_interest,
    CURRENT_TIMESTAMP
  FROM tmp_frs9_ecl_fma A
  JOIN tmp_listdate B ON B.pmtdate BETWEEN A.prc_date AND fn_eomonth(A.prc_date, A.remaining_tenor)
  LEFT JOIN frs9_imp_ca_schd C
    ON A.account_id = C.account_id
       AND A.prc_date = C.prc_date
       AND fn_eomonth(B.pmtdate, 0) = fn_eomonth(C.payment_date, 0)
       AND fn_eomonth(A.prc_date, 0) <= fn_eomonth(C.payment_date, 0)
       AND A.ead_method::INT = 1
  WHERE A.prc_date = p_prc_date
        AND A.ead_method IN (1, 3)
        AND p_prc = 'M'

  UNION ALL

  -- METHOD 1 & 3 — PREVIOUS SCHEDULE
  SELECT
    A.prc_date,
    A.account_id,
    fn_get_total_months(A.prc_date, B.pmtdate) AS fl_seq,
    0.0::DOUBLE PRECISION AS paym_avg,
    COALESCE(
      CASE 
        WHEN fn_get_total_months(A.prc_date, B.pmtdate) = 0 THEN 0 
        ELSE C.principal END
    , 0) AS principal,
    SUM(COALESCE(
      CASE 
        WHEN fn_get_total_months(A.prc_date, B.pmtdate) = 0 THEN 0 
        ELSE C.principal END, 0)
    ) OVER (PARTITION BY A.account_id ORDER BY B.pmtdate ASC) AS sum_principal,
    COALESCE(C.next_interest, 0) AS next_interest,
    SUM(COALESCE(C.next_interest, 0)) OVER (PARTITION BY A.account_id ORDER BY B.pmtdate ASC) AS sum_next_interest,
    CURRENT_TIMESTAMP
  FROM tmp_frs9_ecl_fma A
  JOIN tmp_listdate B ON B.pmtdate BETWEEN A.prc_date AND fn_eomonth(A.prc_date, A.remaining_tenor)
  LEFT JOIN frs9_imp_ca_schd_prv C
      ON  A.account_id = C.account_id
          AND A.prc_date = C.prc_date
          AND fn_eomonth(B.pmtdate, 0) = fn_eomonth(C.payment_date, 0)
          AND fn_eomonth(A.prc_date, 0) <= fn_eomonth(C.payment_date, 0)
          AND A.ead_method::INT = 1
  WHERE A.prc_date = p_prc_date AND A.ead_method::INT IN (1, 3) AND p_prc = 'P'

  UNION ALL

  -- METHOD 2 — PAYM_AVG BASED
  SELECT
    A.prc_date,
    A.account_id,
    fn_get_total_months(A.prc_date, B.pmtdate) AS fl_seq,
    COALESCE(C.paym_avg, 0) AS paym_avg,
    A.outstanding * COALESCE(C.paym_avg, 0) AS principal,
    SUM(A.outstanding * COALESCE(C.paym_avg, 0)) OVER (PARTITION BY A.account_id ORDER BY B.pmtdate ASC) AS sum_principal,
    0,
    0,
    CURRENT_TIMESTAMP
  FROM tmp_frs9_ecl_fma A
  JOIN tmp_listdate B ON B.pmtdate BETWEEN A.prc_date AND fn_eomonth(A.prc_date, A.remaining_tenor)
  LEFT JOIN tmp_frs9_imp_ca_ead_paym_avg C
    ON A.prc_date = C.prc_date
       AND A.segment_id = C.segment_id
       AND fn_get_total_months(A.start_date, A.maturity_date) = C.tenor
       AND fn_eomonth(B.pmtdate, 0) = fn_eomonth(A.start_date , C.counter)
       AND fn_eomonth(A.prc_date, 0) < fn_eomonth(A.start_date , C.counter)
  WHERE A.prc_date = p_prc_date AND A.ead_method::INT = 2;

/*-- debug output
DROP TABLE IF EXISTS tmp1;
CREATE TABLE tmp1 AS
  SELECT * FROM tmp_frs9_imp_ca_result_ead;
RETURN;
--*/

  --   Step 8: Build and Execute Final Dynamic Insert
  v_qry := format($f$
    INSERT INTO %I (
      prc_date, account_id, facility_number, cif_number, segment_id,
      remaining_tenor, start_date, maturity_date, default_flag, dpd,
      internal_rating_code, ext_rating_code, ext_rating_id,
      ecl_model_id, pd_config_id, lgd_config_id, ead_config_id, ead_method,
      bucket_group, bucket_id, currency, stage, scenario_no,
      fl_seq, fl_year, fl_motnh, eir, exchange_rate,
      outstanding, plafond, fib_amt, accrued_interest, unamort_cost_amt, unamort_fee_amt,
      ead_balance, paym_avg, principal_amt, sum_principal_amt, next_interest, sum_next_interest,
      ead, pd, lgd, ecl_amount, probability, ecl_weighted,
      createdby, createddate
    )
    SELECT
      A.prc_date, A.account_id, A.facility_number, A.cif_number, A.segment_id,
      A.remaining_tenor, A.start_date, A.maturity_date,
      A.default_flag, A.dpd, A.internal_rating_code, A.ext_rating_code, A.ext_rating_id,
      A.ecl_model_id, A.pd_config_id, A.lgd_config_id, A.ead_config_id, A.ead_method,
      A.bucket_group, A.bucket_id, A.currency, A.stage, 0,
      B.fl_seq,
      (B.fl_seq / 12) + 1,
      (B.fl_seq %% 12) + 1,
      A.eir, A.exchange_rate, A.outstanding, A.plafond, A.fib_amt, A.accrued_interest,
      A.unamort_cost_amt, A.unamort_fee_amt,
      A.ead_balance, B.paym_avg, B.principal, B.sum_principal, B.next_interest, B.sum_next_interest,
      CASE 
          WHEN B.fl_seq = 0 AND A.ead_calc_method IN (2,3) THEN A.ead_balance - B.sum_principal + A.accrued_interest
          ELSE A.ead_balance - B.sum_principal
      END + CASE WHEN A.ead_calc_method = 3 THEN B.sum_next_interest ELSE 0 END,
      C.pd, D.lgd, 0, 1, 0,
      'SP_FRS9_IMP_CA_RESULT_D', CURRENT_TIMESTAMP
    FROM tmp_frs9_ecl_fma A
    JOIN tmp_frs9_imp_ca_result_ead B ON A.prc_date = B.prc_date AND A.account_id = B.account_id
    JOIN tmp_frs9_imp_ca_result_pd C ON A.segment_id = C.segment_id AND A.bucket_id = C.bucket_id AND B.fl_seq = C.fl_seq
    JOIN tmp_frs9_imp_ca_result_lgd D ON A.segment_id = D.segment_id
    WHERE A.prc_date = %L
      AND ((B.fl_seq < 12 AND A.stage = 1) OR A.stage IN (2,3));

      UPDATE %I
      SET
          ead = CASE WHEN ead < 0 THEN 0 ELSE ead END,
          ecl_amount = pd * lgd * fn_frs9_pv((eir / 1200), fl_seq, CASE WHEN ead < 0 THEN 0 ELSE ead END),
          ecl_weighted = pd * lgd * fn_frs9_pv((eir / 1200), fl_seq, CASE WHEN ead < 0 THEN 0 ELSE ead END) * probability
      WHERE prc_date = %L
        AND ecl_model_id = %L;
  $f$, v_table_resultd, p_prc_date, v_table_resultd, p_prc_date, p_ecl_model_id);

  EXECUTE v_qry;

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_result_d(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id bigint) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_result_h(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_result_h(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_config_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE := p_prc_date;
  v_table_resulth TEXT;
  v_table_resultd TEXT;
  v_qry TEXT;
BEGIN
  
  -- Step 2: Resolve Active ECL Model
  SELECT pkid INTO p_config_id
  FROM frs9_imp_ca_ecl_configh
  WHERE (active_flag IS TRUE AND p_config_id = 0) OR pkid = p_config_id LIMIT 1;

  -- Step 3: Determine Target Tables
  IF p_prc = 'M' THEN
    v_table_resulth := 'frs9_imp_ca_result_h';
    v_table_resultd := 'frs9_imp_ca_result_d';
  ELSE
    v_table_resulth := 'frs9_imp_ca_result_h_prv';
    v_table_resultd := 'frs9_imp_ca_result_d_prv';
  END IF;

  -- Step 4: Clean Existing Summary Data
  IF p_prc = 'M' THEN
    EXECUTE format('DELETE FROM %I WHERE prc_date = %L', v_table_resulth, v_currdate);
  ELSE
    EXECUTE format('DELETE FROM %I WHERE ecl_model_id = %L', v_table_resulth, p_config_id);
  END IF;

  -- Step 5: Aggregate Detail Results into Summary
  v_qry := format($f$
  INSERT INTO %I (
    prc_date, account_id, facility_number, cif_number, segment_id,
    remaining_tenor, start_date, maturity_date, default_flag, dpd,
    internal_rating_code, ext_rating_code, ext_rating_id, ecl_model_id,
    pd_config_id, lgd_config_id, lgd, ead_config_id, ead_method,
    bucket_group, bucket_id, currency, stage, eir, exchange_rate,
    outstanding, plafond, fib_amt, accrued_interest, unamort_cost_amt,
    unamort_fee_amt, ecl_amount, overlay_amount, ecl_final,
    createdby, createddate
  )
  SELECT
    prc_date,
    account_id,
    facility_number,
    cif_number,
    segment_id,
    remaining_tenor,
    start_date,
    maturity_date,
    default_flag,
    dpd,
    internal_rating_code,
    ext_rating_code,
    ext_rating_id,
    ecl_model_id,
    pd_config_id,
    lgd_config_id,
    MAX(lgd),
    ead_config_id,
    ead_method,
    bucket_group,
    bucket_id,
    currency,
    MAX(stage),
    MAX(eir),
    MAX(exchange_rate),
    MAX(outstanding),
    MAX(plafond),
    MAX(fib_amt),
    MAX(accrued_interest),
    MAX(unamort_cost_amt),
    MAX(unamort_fee_amt),
    SUM(ecl_amount),
    0,
    0,
    'SP_FRS9_IMP_CA_RESULT_H',
    CURRENT_TIMESTAMP
  FROM %I
  WHERE prc_date = %L AND ecl_model_id::INT = %L
  GROUP BY
    prc_date, account_id, facility_number, cif_number, segment_id,
    remaining_tenor, start_date, maturity_date, default_flag, dpd,
    internal_rating_code, ext_rating_code, ext_rating_id, ecl_model_id,
    pd_config_id, lgd_config_id, ead_config_id, ead_method,
    bucket_group, bucket_id, currency
  $f$, v_table_resulth, v_table_resultd, v_currdate, p_config_id);

  EXECUTE v_qry;

  -- Step 4: Apply Overlay Adjustment
  v_qry := format($f$
  UPDATE %I A
  SET
    overlay_amount = ecl_amount * B.overlay_rate::DOUBLE PRECISION  / 100,
    ecl_final = ecl_amount * (1 + (B.overlay_rate::DOUBLE PRECISION / 100))
  FROM frs9_imp_ca_ecl_configd B 
  WHERE 
    A.ecl_model_id = B.ecl_model_id AND A.segment_id = B.pf_segment_id
    AND A.prc_date = %L AND A.ecl_model_id::INT = %L
  $f$, v_table_resulth, v_currdate, p_config_id);

  EXECUTE v_qry;
END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_result_h(IN p_prc_date date, IN p_prc character, IN p_config_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_scenario_ead(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_scenario_ead(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  v_table_name TEXT;
  v_str_sql TEXT;
  rec RECORD;
  
BEGIN

   -- Step 3: Determine Source Table
  IF p_prc = 'M' THEN
    v_table_name := 'frs9_master_account';
  ELSE
    v_table_name := 'tmp_fma_preview';
  END IF;

  -- Step 4: Cleanup Previous Data 
  DELETE FROM frs9_imp_ca_scenario_data WHERE segment_type = 'EAD';

  FOR rec IN 
    -- Step 5: Build Segment Query Table
    WITH ecl_config AS (
      
      SELECT b.segment_id, b.ead_method 
      FROM view_imp_ca_ecl_config a 
      JOIN frs9_imp_ca_ead_config b ON a.ead_model_id = b.pkid
      WHERE 
        a.ecl_model_id = p_ecl_model_id OR (p_ecl_model_id = 0 AND a.active_flag IS TRUE)
        AND b.ead_method::INT = 2 --> debug method (default=2)
    )

    SELECT DISTINCT
        segment_id,
        segment_type,
        condition,
        segment,
        sub_segment,
        group_segment
    FROM frs9_imp_ca_segment_query a
    WHERE EXISTS 
      (SELECT 1
        FROM ecl_config x
        WHERE x.segment_id = a.segment_id)
      AND a.segment_type = 'EAD'  
  LOOP
	
    RAISE NOTICE 'Segment → segment_id: %, segment_type: %, condition: %, segment: %, sub_segment: %, group_segment: %',
    rec.segment_id,
    rec.segment_type,
    rec.condition,
    rec.segment,
    rec.sub_segment,
    rec.group_segment;
    
    -- Step 6: Loop Through Segments
    v_str_sql := format($sql$
      INSERT INTO frs9_imp_ca_scenario_data (
        prc_date,
        segment_id,
        segment_type,
        account_id,
        cif_number,
        facility_number,
        account_status,
        currency,
        dpd,
        tenor,
        payment_freq,
        collectability,
        internal_rating_code,
        ext_rating_code,
        default_flag,
        fix_principal_amt,
        remaining_tenor,
        plafond,
        outstanding,
        exchange_rate,
        createdby,
        createddate
      )
      SELECT
        prc_date AS prc_date,
        '%s' AS segment_id,
        '%s' AS segment_type,
        account_id AS account_id,
        cif_number AS cif_number,
        facility_number AS facility_number,
        account_status AS account_status,
        currency AS currency,
        COALESCE(dpd, 0) AS dpd,
        fn_get_total_months(start_date, maturity_date) AS tenor,
        payment_freq AS payment_freq,
        collectability AS collectability,
        internal_rating_code AS internal_rating_code,
        ext_rating_code AS ext_rating_code,
        npl_flag AS default_flag,
        fix_principal_amt AS fix_principal_amt,
        COALESCE(remaining_tenor, 0) AS remaining_tenor,
        COALESCE(plafond, 0) AS plafond,
        COALESCE(outstanding, 0) AS outstanding,
        COALESCE(exchange_rate, 1) AS exchange_rate,
        'SP_FRS9_IMP_CA_SCENARIO_LGD' AS createdby,
        CURRENT_TIMESTAMP AS createddate
      FROM %s
      WHERE account_status IN ('A', 'R')
            AND prc_date = '%s'
            AND (%s)
    $sql$, rec.segment_id, rec.segment_type, v_table_name, p_prc_date, rec.condition);

--     RAISE NOTICE 'SQL: %', v_str_sql;
    EXECUTE v_str_sql;
    
  END LOOP;


END
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_scenario_ead(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_scenario_lgd(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_scenario_lgd(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Local variables
  v_table_name TEXT := 'frs9_master_account';

  rules_seg RECORD;
  v_sql TEXT;

BEGIN

  -- Step 1: Clear LGD scenario data
  DELETE FROM frs9_imp_ca_scenario_data WHERE segment_type = 'LGD';
  
  -- Step 2: 
  FOR rules_seg IN
    SELECT 
      sq.segment_id,
      sq.segment_type,
      sq.condition,
      sq.segment,
      sq.sub_segment,
      sq.group_segment
    FROM
      frs9_imp_ca_segment_query sq
      JOIN frs9_imp_ca_lgd_config cfg
        ON sq.segment_id=cfg.segment_id
    WHERE
      sq.segment_type = 'LGD'
      AND (cfg.pkid = p_config_id OR p_config_id = 0)
      AND cfg.active_flag IS TRUE
      AND cfg.lgd_method <> 3
    ORDER BY sq.segment_id, sq.condition
  LOOP
    -- Debug output :
    RAISE NOTICE 'Processing rule segment: ID=% | Type=% | Condition=% | Segment=% | SubSegment=% | Group=%',
      rules_seg.segment_id,
      rules_seg.segment_type,
      rules_seg.condition,
      rules_seg.segment,
      rules_seg.sub_segment,
      rules_seg.group_segment;
    
    -- Step3: Build Dynamic Query
    v_sql := FORMAT(
      $f$
      INSERT INTO frs9_imp_ca_scenario_data (
        prc_date,
        segment_id,
        segment_type,
        account_id,
        cif_number,
        facility_number,
        account_status,
        currency,
        dpd,
        collectability,
        internal_rating_code,
        ext_rating_code,
        default_flag,
        remaining_tenor,
        plafond,
        outstanding,
        exchange_rate,
        createdby,
        createddate
      )
      SELECT 
        prc_date,
        %L,
        %L,
        account_id,
        cif_number,
        facility_number,
        account_status,
        currency,
        COALESCE(dpd, 0),
        collectability,
        internal_rating_code,
        ext_rating_code,
        npl_flag,
        COALESCE(remaining_tenor, 0),
        COALESCE(plafond, 0),
        COALESCE(outstanding, 0),
        COALESCE(exchange_rate, 1),
        'SP_FRS9_IMP_CA_SCENARIO_LGD',
        CURRENT_TIMESTAMP
      FROM %I
      WHERE account_status IN ('A', 'W', 'R')
        AND prc_date = %L
        AND (%s)
      $f$,
        rules_seg.segment_id,
        rules_seg.segment_type,
        v_table_name,
        p_prc_date,
        rules_seg.condition
    );
    
--     RAISE NOTICE 'SQL: %',v_sql;
    EXECUTE v_sql;
    
  END LOOP;

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_scenario_lgd(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_scenario_pd(date, integer, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_scenario_pd(IN p_prc_date date, IN p_config_id integer DEFAULT 0, IN p_prc character DEFAULT 'M'::bpchar)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  v_table_name TEXT := 'frs9_master_account';
  cond RECORD;
  v_str_sql TEXT;
  
BEGIN
  -- 🧹 Cleanup previous PD data
  DELETE FROM frs9_imp_ca_scenario_data WHERE segment_type = 'PD';
  
  FOR cond IN 

    WITH config AS (
      SELECT DISTINCT ON (segment_id, interval) segment_id, interval
      FROM frs9_imp_ca_pd_config
      WHERE 
        active_flag IS TRUE
        AND pd_method <> '3'
        AND (pkid = p_config_id OR p_config_id = 0)
        
    ), current_segments AS (
      SELECT
        p_prc_date as prc_date,
        a.segment_id,
        a.segment_type,
        a.condition,
        a.segment,
        a.sub_segment,
        a.group_segment
      FROM frs9_imp_ca_segment_query a
      JOIN config b ON a.segment_id = b.segment_id
      WHERE a.segment_type = 'PD'
      
    ), historical_segments AS (
        SELECT
          fn_eomonth(p_prc_date, -b.interval) as prc_date,
          a.segment_id,
          a.segment_type,
          a.condition,
          a.segment,
          a.sub_segment,
          a.group_segment
        FROM frs9_imp_ca_segment_query a
        JOIN config b ON a.segment_id = b.segment_id
        WHERE a.segment_type = 'PD'

    )
  
    SELECT DISTINCT ON (prc_date,segment_id, segment_type, condition, segment, sub_segment, group_segment) *
    FROM (
      SELECT * FROM current_segments
      UNION ALL
      SELECT * FROM historical_segments
    ) sub
    ORDER BY prc_date,segment_id, segment_type, condition, segment, sub_segment, group_segment
  LOOP
    
    RAISE NOTICE 'PD Config: [prc_date: %], [segment_id: %], [segment_type: %], [condition: %], [segment: %], [sub_segment: %], [group_segment: %]',
      cond.prc_date,
      cond.segment_id, 
      cond.segment_type, 
      cond.condition, 
      cond.segment, 
      cond.sub_segment, 
      cond.group_segment;
    
      v_str_sql := FORMAT($f$
      INSERT INTO frs9_imp_ca_scenario_data (
        prc_date,
        segment_id,
        segment_type,
        account_id,
        cif_number,
        facility_number,
        account_status,
        currency,
        dpd,
        collectability,
        internal_rating_code,
        ext_rating_code,
        ext_rating_id,
        default_flag,
        impaired_status,
        remaining_tenor,
        plafond,
        outstanding,
        exchange_rate,
        createdby,
        createddate
      ) 
      SELECT 
        prc_date AS prc_date,
        %L AS segment_id,
        %L AS segment_type,
        account_id AS account_id,
        cif_number AS cif_number,
        facility_number AS facility_number,
        account_status AS account_status,
        currency AS currency,
        dpd AS dpd,
        collectability AS collectability,
        internal_rating_code AS internal_rating_code,
        ext_rating_code AS ext_rating_code,
        ext_rating_id AS ext_rating_id,
        npl_flag AS default_flag,
        impaired_status AS impaired_status,
        COALESCE(remaining_tenor, 0) AS remaining_tenor,
        COALESCE(plafond, 0) AS plafond,
        COALESCE(outstanding, 0) AS outstanding,
        COALESCE(exchange_rate, 1) AS exchange_rate,
        'SP_FRS9_IMP_CA_SCENARIO_PD' AS createdby,
        CURRENT_TIMESTAMP AS createddate
      FROM %I 
      WHERE 
        account_status IN ('A', 'W', 'R')
        AND prc_date = %L
        AND %s
      $f$,
        cond.segment_id,
        cond.segment_type, 
        v_table_name,
        cond.prc_date,
        cond.condition
      );
      
--       RAISE NOTICE 'SQL: %', v_str_sql;

--       cond.segment_id, 
--       cond.segment, 
--       cond.sub_segment, 
--       cond.group_segment
            
    -- 🚀 Execute safely
    EXECUTE v_str_sql;

  END LOOP;

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_scenario_pd(IN p_prc_date date, IN p_config_id integer, IN p_prc character) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_config_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE;
  v_prevdate DATE;
  v_is_ead_schd_upld TEXT;
  v_seq SMALLINT := 0;
  v_counter_update_pmtdate SMALLINT := 1;
  v_table_name TEXT;
  v_qry TEXT;
BEGIN
  -- Step 2: Assign Current and Previous Dates
  v_currdate := p_prc_date;
  v_prevdate := fn_eomonth(p_prc_date, -1);

  SELECT param_usage INTO v_is_ead_schd_upld FROM frs9_param_commonh WHERE param_code = 'S1003';

  -- Step 3: Determine Target Table and Truncate
  IF p_prc = 'M' THEN
    TRUNCATE TABLE frs9_imp_ca_schd;
    v_table_name := 'frs9_imp_ca_schd';
  ELSE
    TRUNCATE TABLE frs9_imp_ca_schd_prv;
    v_table_name := 'frs9_imp_ca_schd_prv';
  END IF;

  -- Step 4: Prepare Initial Temp Table
  DROP TABLE IF EXISTS tmp_idays;
  CREATE TEMP TABLE tmp_idays (account_id BIGINT, i_days SMALLINT);

  DROP TABLE IF EXISTS tmp_paym1;
  CREATE TEMP TABLE tmp_paym1 AS
    SELECT
      a.account_id,
      a.account_number,
      a.interest_rate,
      a.payment_code,
      a.payment_term,
      a.payment_freq,
      a.int_pmt_term,
      a.int_pmt_freq,
      a.start_date,
      CASE WHEN EXTRACT(DAY FROM a.start_date) > EXTRACT(DAY FROM fn_eomonth(a.maturity_date, 0))
           THEN fn_eomonth(a.maturity_date, 0)
           ELSE make_date(EXTRACT(YEAR FROM a.maturity_date)::INT, EXTRACT(MONTH FROM a.maturity_date)::INT, EXTRACT(DAY FROM a.start_date)::INT)
      END AS maturity_date,
      CASE WHEN EXTRACT(DAY FROM a.start_date) > EXTRACT(DAY FROM fn_eomonth(a.next_payment_date,0))
           THEN fn_eomonth(a.next_payment_date)
           ELSE make_date(EXTRACT(YEAR FROM a.next_payment_date)::INT, EXTRACT(MONTH FROM a.next_payment_date)::INT, EXTRACT(DAY FROM a.start_date)::INT)
      END AS next_payment_date,
      CASE WHEN EXTRACT(DAY FROM a.start_date) > EXTRACT(DAY FROM fn_eomonth(a.next_sch_prin_date,0))
           THEN fn_eomonth(a.next_sch_prin_date,0)
           ELSE make_date(EXTRACT(YEAR FROM a.next_sch_prin_date)::INT, EXTRACT(MONTH FROM a.next_sch_prin_date)::INT, EXTRACT(DAY FROM a.start_date)::INT)
      END AS next_prin_date,
      CASE WHEN EXTRACT(DAY FROM a.start_date) > EXTRACT(DAY FROM fn_eomonth(a.next_sch_int_date,0))
           THEN fn_eomonth(a.next_sch_int_date,0)
           ELSE make_date(EXTRACT(YEAR FROM a.next_sch_int_date)::INT, EXTRACT(MONTH FROM a.next_sch_int_date)::INT, EXTRACT(DAY FROM a.start_date)::INT)
      END AS next_int_date,
      a.grace_type,
      a.grace_end_date,
      a.installment_amt,
      a.fix_principal_amt,
      a.fix_interest_amt,
      a.outstanding AS os_prev,
      a.outstanding,
      a.start_date AS pmtdate,
      a.start_date AS prev_pmtdate,
      0::FLOAT AS principal,
      0::FLOAT AS interest,
      0 AS i_days,
      0 AS counter,
      a.interest_base,
      0 AS is_process
    FROM tmp_frs9_ecl_fma a
    JOIN frs9_imp_ca_account_event b ON a.prc_date = b.prc_date AND a.account_id = b.account_id
    WHERE a.prc_date = v_currdate AND a.ead_method::INT = 1;

  -- Step 5: Forward Date Adjustment Loop
  v_counter_update_pmtdate := 1;
  
  WHILE EXISTS (
      SELECT 1
      FROM tmp_paym1
      WHERE (next_payment_date <= v_currdate AND payment_code::INT IN (0, 1))
         OR (next_prin_date <= v_currdate AND payment_code::INT = 2)
         OR (next_int_date <= v_currdate AND payment_code::INT = 2)
  )
  LOOP
    -- Adjust next_payment_date
    UPDATE tmp_paym1
    SET next_payment_date = 
      CASE
        WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_payment_date,v_counter_update_pmtdate))
        THEN fn_eomonth(next_payment_date,v_counter_update_pmtdate)
        ELSE make_date(
          EXTRACT(YEAR FROM next_payment_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(MONTH FROM next_payment_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(DAY FROM start_date)::INT)
      END
    WHERE next_payment_date <= v_currdate AND payment_code::INT IN (0, 1);

    -- Adjust next_prin_date
    UPDATE tmp_paym1
    SET next_prin_date = 
      CASE
          WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_prin_date,v_counter_update_pmtdate))
            THEN fn_eomonth(next_prin_date,v_counter_update_pmtdate)
          ELSE make_date(
            EXTRACT(YEAR FROM next_prin_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
            EXTRACT(MONTH FROM next_prin_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
            EXTRACT(DAY FROM start_date)::INT)
      END
    WHERE next_prin_date <= v_currdate AND payment_code::INT = 2;

    -- Adjust next_int_date
    UPDATE tmp_paym1
    SET next_int_date = 
      CASE
        WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_int_date,v_counter_update_pmtdate))
              THEN fn_eomonth(next_int_date,v_counter_update_pmtdate)
          ELSE make_date(
              EXTRACT(YEAR FROM next_int_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
              EXTRACT(MONTH FROM next_int_date + (v_counter_update_pmtdate || ' month')::interval)::INT,
              EXTRACT(DAY FROM start_date)::INT
          )
      END
    WHERE next_int_date <= v_currdate AND payment_code::INT = 2;

    -- Increment loop counter
    v_counter_update_pmtdate := v_counter_update_pmtdate + 1;
  END LOOP;

  -- Step 6: Backward Date Adjustment Loop
  v_counter_update_pmtdate := 1;

  WHILE EXISTS (
      SELECT 1
      FROM tmp_paym1
      WHERE (next_payment_date - INTERVAL '1 month' > v_currdate AND payment_code::INT IN (0, 1))
         OR (next_prin_date - INTERVAL '1 month' > v_currdate AND payment_code::INT = 2)
         OR (next_int_date - INTERVAL '1 month' > v_currdate AND payment_code::INT = 2)
  )
  LOOP
    -- Adjust next_payment_date backward
    UPDATE tmp_paym1
    SET next_payment_date = 
      CASE
        WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_payment_date, -v_counter_update_pmtdate))
          THEN fn_eomonth(next_payment_date, -v_counter_update_pmtdate)
        ELSE make_date(
          EXTRACT(YEAR FROM next_payment_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(MONTH FROM next_payment_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(DAY FROM start_date)::INT)
      END
    WHERE next_payment_date - INTERVAL '1 month' > v_currdate AND payment_code::INT IN (0, 1);

    -- Adjust next_prin_date backward
    UPDATE tmp_paym1
    SET next_prin_date = 
      CASE
        WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_prin_date,-v_counter_update_pmtdate))
          THEN fn_eomonth(next_prin_date,-v_counter_update_pmtdate)
        ELSE make_date(
          EXTRACT(YEAR FROM next_prin_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(MONTH FROM next_prin_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
          EXTRACT(DAY FROM start_date)::INT)
      END
    WHERE next_prin_date - INTERVAL '1 month' > v_currdate AND payment_code::INT = 2;

    -- Adjust next_int_date backward
    UPDATE tmp_paym1
    SET next_int_date = 
      CASE
        WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_int_date,-v_counter_update_pmtdate))
        THEN date_trunc('month', next_int_date - (v_counter_update_pmtdate || ' month')::interval) + INTERVAL '1 month - 1 day'
      ELSE make_date(
        EXTRACT(YEAR FROM next_int_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
        EXTRACT(MONTH FROM next_int_date - (v_counter_update_pmtdate || ' month')::interval)::INT,
        EXTRACT(DAY FROM start_date)::INT)
    END
    WHERE next_int_date - INTERVAL '1 month' > v_currdate AND payment_code::INT = 2;

    -- Increment loop counter
    v_counter_update_pmtdate := v_counter_update_pmtdate + 1;
  END LOOP;

  -- Step 7: Finalize Payment Dates

  -- For payment_code = 2, choose the earlier of next_int_date or next_prin_date
  UPDATE tmp_paym1
  SET next_payment_date = 
    CASE
      WHEN next_int_date > next_prin_date THEN next_prin_date
      ELSE next_int_date
    END
  WHERE payment_code::INT = 2;

  -- Adjust prev_pmtdate and pmtdate based on next_payment_date
  UPDATE tmp_paym1
  SET
    prev_pmtdate = 
        (next_payment_date - INTERVAL '1 month') 
        + make_interval(days := 
            CASE 
                WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1)) THEN
                    CASE 
                        WHEN EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1)) > EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month') THEN
                            EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1))::INT
                        ELSE
                            EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month')::INT
                    END
                ELSE
                    EXTRACT(DAY FROM start_date)::INT
            END 
            - EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month')::INT
        )
    , pmtdate =
      (next_payment_date - INTERVAL '1 month') 
      + make_interval(days := 
        CASE 
            WHEN EXTRACT(DAY FROM start_date) > EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1)) THEN
                CASE 
                    WHEN EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1)) > EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month') THEN
                        EXTRACT(DAY FROM fn_eomonth(next_payment_date, -1))::INT
                    ELSE
                        EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month')::INT
                END
            ELSE
                EXTRACT(DAY FROM start_date)::INT
        END 
        - EXTRACT(DAY FROM next_payment_date - INTERVAL '1 month')::INT
      );

  -- Step 8: Clone to tmp_paym2
  DROP TABLE IF EXISTS tmp_paym2;

  CREATE TEMP TABLE tmp_paym2 AS
  SELECT *
  FROM tmp_paym1;

  -- Step 9: Schedule Generation Loop
  WHILE EXISTS (SELECT 1 FROM tmp_paym1 WHERE fn_eomonth(pmtdate, 0) < fn_eomonth(maturity_date, 0))
  LOOP
    -- Advance sequence
    v_seq := v_seq + 1;

    -- Advance payment date
    UPDATE tmp_paym1
    SET
      os_prev = outstanding,
      prev_pmtdate = pmtdate,
      pmtdate =
        (pmtdate + INTERVAL '1 month') +
        make_interval(days :=
          CASE
            WHEN EXTRACT(DAY FROM start_date)::INT > EXTRACT(DAY FROM fn_eomonth(pmtdate, 1))::INT THEN
              GREATEST(EXTRACT(DAY FROM fn_eomonth(pmtdate, 1))::INT, EXTRACT(DAY FROM pmtdate + INTERVAL '1 month')::INT)
            ELSE
                EXTRACT(DAY FROM start_date)::INT
          END
          - EXTRACT(DAY FROM pmtdate + INTERVAL '1 month')::INT),
      is_process = 1
    WHERE fn_eomonth(pmtdate, 0) < fn_eomonth(maturity_date, 0);

    -- Cap payment date at maturity
    UPDATE tmp_paym1 SET pmtdate = maturity_date WHERE pmtdate > maturity_date;

    -- Recalculate interest days
    TRUNCATE TABLE tmp_idays;

    INSERT INTO tmp_idays (account_id, i_days)
    SELECT
      account_id,
        CASE
          WHEN interest_base::INT = 6 THEN fn_frs9_cnt_days_30_360(prev_pmtdate, pmtdate)
          ELSE (pmtdate - prev_pmtdate)::INT
        END
      FROM tmp_paym1
      WHERE is_process = 1;

    -- Calculate interest
    UPDATE tmp_paym1 A
    SET
      interest = 
        CASE 
          WHEN A.payment_code::INT = 2 THEN 
            CASE 
              WHEN fn_get_total_months(start_date, pmtdate) % int_pmt_freq = 0 THEN fix_interest_amt 
              ELSE 0 
              END
          ELSE 
            B.i_days * A.os_prev * A.interest_rate / 100.0 / 
              CASE 
                WHEN A.interest_base::INT = 2 THEN 365 
                ELSE 360 
              END
        END,
        i_days = B.i_days
    FROM tmp_idays B
    WHERE A.account_id = B.account_id AND A.is_process = 1;


    -- Calculate principal
    UPDATE tmp_paym1 A
    SET principal = 
      CASE 
        WHEN A.payment_code::INT = 2 THEN 
          CASE 
            WHEN fn_get_total_months(start_date, pmtdate) % payment_freq = 0 THEN A.fix_principal_amt 
            ELSE 0 
          END

        WHEN A.payment_code::INT = 1 THEN 
          CASE 
            WHEN fn_eomonth(pmtdate, 0) = fn_eomonth(maturity_date, 0) THEN A.outstanding 
            ELSE 0 
          END

        ELSE 
          CASE 
            WHEN fn_get_total_months(start_date, pmtdate) % payment_freq = 0 THEN A.installment_amt - A.interest 
            ELSE 0 
        END
      END
    WHERE A.is_process = 1;


    -- Update outstanding
    UPDATE tmp_paym1 SET outstanding = os_prev - principal WHERE is_process = 1;

    -- Append to tmp_paym2
    INSERT INTO tmp_paym2 (
      account_id,
      account_number,
      interest_rate,
      payment_code,
      payment_term,
      payment_freq,
      int_pmt_term,
      int_pmt_freq,
      start_date,
      maturity_date,
      next_payment_date,
      next_prin_date,
      next_int_date,
      grace_type,
      grace_end_date,
      installment_amt,
      fix_principal_amt,
      fix_interest_amt,
      os_prev,
      outstanding,
      pmtdate,
      prev_pmtdate,
      principal,
      interest,
      i_days,
      counter,
      interest_base,
      is_process
    )
    SELECT
          account_id,
          account_number,
          interest_rate,
          payment_code,
          payment_term,
          payment_freq,
          int_pmt_term,
          int_pmt_freq,
          start_date,
          maturity_date,
          next_payment_date,
          next_prin_date,
          next_int_date,
          grace_type,
          grace_end_date,
          installment_amt,
          fix_principal_amt,
          fix_interest_amt,
          os_prev,
          outstanding,
          pmtdate,
          prev_pmtdate,
          principal,
          interest,
          i_days,
          v_seq,
          interest_base,
          0
      FROM tmp_paym1
      WHERE is_process = 1;

    -- Reset process flag
    UPDATE tmp_paym1 SET is_process = 0 WHERE is_process = 1;
  END LOOP;

  -- Step 10: Final Insert
  EXECUTE format($f$
    INSERT INTO %I (
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment
    )
    SELECT
      %L AS prc_date,
      account_id,
      account_number,
      counter,
      i_days,
      pmtdate,
      outstanding,
      principal,
      interest,
      COALESCE(LEAD(interest) OVER (PARTITION BY account_id ORDER BY counter), 0),
      installment_amt
    FROM tmp_paym2
    $f$, v_table_name, v_currdate);

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd(IN p_prc_date date, IN p_prc character, IN p_config_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd2(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd2(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
  -- Step 1: Declare internal control variables
  DECLARE
    v_currdate DATE;
    v_prevdate DATE;
    v_counter_pay INTEGER;
    v_max_counterpay INTEGER;
    v_next_counter_pay INTEGER;

    v_table_name TEXT;
    v_qry TEXT;

BEGIN

    /*
    PAYMENT CODE :
    0 -> Payment includes interest (fixed installment)
    1 -> Interest only (bullet payment)
    2 -> Principal and interest serviced separately
    */

  -- Step 2: Initialize loop counters
  v_counter_pay := 0;
  v_next_counter_pay := 1;
  v_max_counterpay := 0;

  -- Step 3: Assign current and previous processing dates
  v_currdate := p_prc_date;
  v_prevdate := p_prc_date - INTERVAL '1 day';
  
  -- Step 4: Determine target schedule table based on mode
  IF p_prc = 'M' THEN
    v_table_name := 'frs9_imp_ca_schd';
    EXECUTE 'TRUNCATE TABLE frs9_imp_ca_schd';
  ELSE
    v_table_name := 'frs9_imp_ca_schd_prv';
    EXECUTE 'TRUNCATE TABLE frs9_imp_ca_schd_prv';
  END IF;

  -- Step 5: Clear temporary staging tables
  EXECUTE 'TRUNCATE TABLE tmp_imp_ca_ead_curr';
  EXECUTE 'TRUNCATE TABLE tmp_imp_ca_ead_prev';

  -- Step 6: Load current EAD snapshot into tmp_imp_ca_ead_curr
  INSERT INTO tmp_imp_ca_ead_curr (
    prc_date,
    account_id,
    account_number,
    start_date,
    maturity_date,
    payment_start_date,
    stage,
    remaining_tenor,
    interest_rate,
    payment_code,
    interest_base,
    next_eom_payment_date,
    next_payment_date,
    payment_term,
    payment_freq,
    next_sch_prin_date,
    int_pmt_term,
    int_pmt_freq,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    fix_principal_amt,
    fix_interest_amt,
    mob,
    idays,
    eom_payment_date,
    payment_date,
    os_balance,
    installment,
    principal,
    interest
  )
  SELECT
    fn_eomonth(a.prc_date, 0) AS prc_date,
    a.account_id,
    a.account_number,
    a.start_date,
    a.maturity_date,
    a.next_payment_date AS payment_start_date,
    a.stage,
    CASE
      WHEN a.bucket_id = 5 THEN 0
      WHEN a.remaining_tenor <= 0 THEN 1
      ELSE a.remaining_tenor
    END AS remaining_tenor,
    a.interest_rate,
    a.payment_code,
    a.interest_base,
    fn_eomonth(a.next_payment_date, 0) AS next_eom_payment_date,
    a.next_payment_date,
    a.payment_term,
    a.payment_freq,
    a.next_sch_prin_date,
    a.int_pmt_term,
    a.int_pmt_freq,
    a.next_sch_int_date,
    a.grace_type,
    a.grace_start_date,
    a.grace_end_date,
    a.fib_flag,
    a.fib_start_date,
    a.fib_tenor,
    a.fib_amt,
    a.fix_principal_amt,
    a.fix_interest_amt,
    0 AS mob,
    0 AS idays,
    fn_eomonth(a.prc_date, 0) AS eom_payment_date,
    a.prc_date AS payment_date,
    a.outstanding AS os_balance,
    a.installment_amt AS installment,
    0 AS principal,
    0 AS interest
  FROM tmp_frs9_ecl_fma a
  WHERE 
    a.prc_date = v_currdate
    AND a.ead_method IN (1, 3)
    AND EXISTS (
        SELECT 1
        FROM frs9_imp_ca_account_event x
        WHERE x.prc_date = v_currdate AND x.account_id = a.account_id
        LIMIT 1
    );

  -- Step 7: Dynamically insert snapshot into schedule table
  v_qry := '
    INSERT INTO ' || v_table_name || ' (
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      installment
    )
    SELECT
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      installment
    FROM tmp_imp_ca_ead_curr;
  ';

  EXECUTE v_qry;
  
  -- Step 8: Determine max payment horizon
  SELECT COALESCE(MAX(remaining_tenor), 0)
  INTO v_max_counterpay
  FROM tmp_imp_ca_ead_curr;

  -- Step 9: Loop through future payment projections
  WHILE v_counter_pay <= v_max_counterpay LOOP

    v_counter_pay := v_counter_pay + 1;
    v_next_counter_pay := v_next_counter_pay + 1;

    -- Step 9a: Clear previous snapshot
    EXECUTE 'TRUNCATE TABLE tmp_imp_ca_ead_prev';

    -- Step 9b: Project next payment period into tmp_imp_ca_ead_prev
    INSERT INTO tmp_imp_ca_ead_prev (
      prc_date,
      account_id,
      account_number,
      start_date,
      maturity_date,
      payment_start_date,
      stage,
      remaining_tenor,
      interest_rate,
      payment_code,
      interest_base,
      next_eom_payment_date,
      next_payment_date,
      payment_term,
      payment_freq,
      next_sch_prin_date,
      int_pmt_term,
      int_pmt_freq,
      next_sch_int_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      fib_flag,
      fib_start_date,
      fib_tenor,
      fib_amt,
      fix_principal_amt,
      fix_interest_amt,
      mob,
      idays,
      eom_payment_date,
      payment_date,
      os_balance,
      installment,
      principal,
      interest
    )
    SELECT
        prc_date,
        account_id,
        account_number,
        start_date,
        maturity_date,
        payment_start_date,
        stage,
        remaining_tenor,
        interest_rate,
        payment_code,
        interest_base,
        fn_eomonth(payment_start_date, v_counter_pay) AS next_eom_payment_date,
        (payment_start_date + (v_counter_pay || ' month')::interval)::date AS next_payment_date,  -- Next payment date by adding MOB months
        payment_term,
        payment_freq,
        next_sch_prin_date,
        int_pmt_term,
        int_pmt_freq,
        next_sch_int_date,
        grace_type,
        grace_start_date,
        grace_end_date,
        fib_flag,
        fib_start_date,
        fib_tenor,
        fib_amt,
        fix_principal_amt,
        fix_interest_amt,
        v_counter_pay AS mob,
        next_payment_date - payment_date as idays,
        next_eom_payment_date,
        next_payment_date AS payment_date,
        os_balance
        - fn_frs9_imp_ca_ead_process_principal_amt(
              next_payment_date,
              maturity_date,
              os_balance,
              grace_type,
              grace_end_date,
              payment_code,
              interest_base,
              interest_rate,
              installment,
              fix_principal_amt
          ) AS os_balance,
        installment,
        fn_frs9_imp_ca_ead_process_principal_amt(
          next_payment_date,
          maturity_date,
          os_balance,
          grace_type,
          grace_end_date,
          payment_code,
          interest_base,
          interest_rate,
          installment,
          fix_principal_amt
      ) AS principal,
      fn_frs9_imp_ca_ead_process_interest_amt(
          grace_type,
          next_payment_date,
          grace_end_date,
          payment_code,
          interest_base,
          os_balance,
          interest_rate,
          fix_interest_amt
      ) AS interest
    FROM tmp_imp_ca_ead_curr
    WHERE 
      remaining_tenor >= v_counter_pay
      AND payment_date <= maturity_date
      AND os_balance > 0;

    -- Step 9c: Refresh tmp_imp_ca_ead_curr with projected values
    EXECUTE 'TRUNCATE TABLE tmp_imp_ca_ead_curr';

    INSERT INTO tmp_imp_ca_ead_curr(
      prc_date,
      account_id,
      account_number,
      start_date,
      maturity_date,
      payment_start_date,
      stage,
      remaining_tenor,
      interest_rate,
      payment_code,
      interest_base,
      next_eom_payment_date,
      next_payment_date,
      payment_term,
      payment_freq,
      next_sch_prin_date,
      int_pmt_term,
      int_pmt_freq,
      next_sch_int_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      fib_flag,
      fib_start_date,
      fib_tenor,
      fib_amt,
      fix_principal_amt,
      fix_interest_amt,
      mob,
      idays,
      eom_payment_date,
      payment_date,
      os_balance,
      installment,
      principal,
      interest
    ) 
    SELECT 
      prc_date,
      account_id,
      account_number,
      start_date,
      maturity_date,
      payment_start_date,
      stage,
      remaining_tenor,
      interest_rate,
      payment_code,
      interest_base,
      next_eom_payment_date,
      next_payment_date,
      payment_term,
      payment_freq,
      next_sch_prin_date,
      int_pmt_term,
      int_pmt_freq,
      next_sch_int_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      fib_flag,
      fib_start_date,
      fib_tenor,
      fib_amt,
      fix_principal_amt,
      fix_interest_amt,
      mob,
      idays,
      eom_payment_date,
      payment_date,
      os_balance,
      installment,
      principal,
      interest
    FROM tmp_imp_ca_ead_prev;

    -- Step 9d: Insert projected schedule into target table
    v_qry := '
      INSERT INTO ' || v_table_name || ' (
        prc_date,
        account_id,
        account_number,
        mob,
        idays,
        payment_date,
        os_balance,
        principal,
        interest,
        next_interest,
        installment
      )
      SELECT
        prc_date,
        account_id,
        account_number,
        mob,
        idays,
        payment_date,
        os_balance,
        principal,
        interest,
        0,
        principal + interest AS installment
      FROM tmp_imp_ca_ead_curr;
    ';

    EXECUTE v_qry;
    
  END LOOP;

  -- Step 10: Final interest projection using LEAD()
  v_qry := '
    WITH interest_cte AS (
      SELECT
        account_id,
        mob,
        LEAD(interest, 1) OVER (PARTITION BY account_id ORDER BY mob) AS next_interest
      FROM ' || v_table_name || '
    )
    
    UPDATE ' || v_table_name || ' schd
    SET next_interest = cte.next_interest
    FROM interest_cte cte
    WHERE 
      schd.account_id = cte.account_id
      AND schd.mob = cte.mob;
  ';

EXECUTE v_qry;


END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd2(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd_from_stg(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd_from_stg(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN

  -- Step 3: Cleanup Target and Temp Tables
  IF p_prc = 'M' THEN
    TRUNCATE TABLE frs9_imp_ca_schd;
  ELSE
    DELETE FROM frs9_imp_ca_schd_prv WHERE prc_date = p_prc_date;  
  END IF;
  
  DROP TABLE IF EXISTS tmp_ead_schd;

  -- Step 5: Join with TMP_FRS9_ECL_FMA and Filter
  CREATE TEMP TABLE tmp_ead_schd AS 
  
      -- Step 4: Build CTE from Staging
      WITH cte AS (
        SELECT 
          prc_date,
          account_number,
          idays,
          payment_date,
          os_balance,
          principal,
          interest,
          installment,
          RANK() OVER (PARTITION BY account_number ORDER BY prc_date DESC) AS rn
        FROM stg_paym_schd
        WHERE prc_date <= p_prc_date
      )
      SELECT 
        b.prc_date AS prc_date,
        b.account_id AS account_id,
        b.account_number AS account_number,
        ROW_NUMBER() OVER (PARTITION BY b.account_id, a.rn ORDER BY a.payment_date DESC) - 1 AS mob,
        a.idays AS idays,
        a.payment_date AS payment_date,
        a.os_balance AS os_balance,
        a.principal AS principal,
        a.interest AS interest,
        COALESCE(LEAD(a.interest) OVER (PARTITION BY b.account_id, a.rn ORDER BY a.payment_date), 0) AS next_interest,
        a.installment AS installment,
        'SP_FRS9_IMP_CA_SCHD_FROM_STG' AS createdby,
        CURRENT_TIMESTAMP AS createddate
      FROM cte a
      JOIN tmp_frs9_ecl_fma b ON a.account_number = b.account_number
      WHERE b.prc_date = p_prc_date
            AND b.ead_method::INT = 1
            AND a.rn::INT = 1
            AND EXISTS (
              SELECT 1
              FROM frs9_imp_ca_account_event x
              WHERE b.account_id = x.account_id AND x.prc_date = p_prc_date
            );

  -- Step 6: Insert into Final Table
  IF p_prc = 'M' THEN
    INSERT INTO frs9_imp_ca_schd (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, next_interest, installment,
      createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment,
      createdby,
      createddate
    FROM tmp_ead_schd;
  ELSE
    INSERT INTO frs9_imp_ca_schd_prv (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, next_interest, installment,
      createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment,
      createdby,
      createddate
    FROM tmp_ead_schd;
  END IF;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd_from_stg(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd_from_upld(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd_from_upld(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Declare and Assign Dates
  v_currdate DATE := p_prc_date;
--     v_prevdate DATE := p_prc_date - INTERVAL '1 day';
BEGIN
  -- Step 2: Drop Temp Table if Exists
  DROP TABLE IF EXISTS tmp_paym_schd;

  -- Step 3: Build CTE from Uploaded Schedule
  CREATE TEMP TABLE tmp_paym_schd AS
    WITH cte AS (
        SELECT 
            b.prc_date,
            b.account_id,
            a.account_number,
            a.idays,
            a.payment_date,
            a.os_balance,
            a.principal,
            a.interest,
            COALESCE(LEAD(a.interest) OVER (PARTITION BY a.account_number ORDER BY a.prc_date), 0) AS next_interest,
            a.installment,
            RANK() OVER (PARTITION BY a.account_number ORDER BY a.prc_date DESC) AS rn,
            ROW_NUMBER() OVER (PARTITION BY a.prc_date, a.account_number ORDER BY a.payment_date ASC) AS rn1
        FROM tblu_paym_schd a
        JOIN tmp_frs9_ecl_fma b ON a.account_number = b.account_number
        WHERE a.prc_date <= v_currdate
          AND b.ead_method::INT = 1
    )
    SELECT * FROM cte WHERE rn = 1;

  -- Step 4: Conditional Logic Based on Mode
  IF p_prc = 'M' THEN
    
    -- Step 4a: Delete Existing Schedule
    DELETE FROM frs9_imp_ca_schd a
    WHERE EXISTS (SELECT 1 FROM tmp_paym_schd x WHERE x.account_id = a.account_id);

    -- Step 4b: Insert New Schedule (Main Mode)
    INSERT INTO frs9_imp_ca_schd (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, installment, createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      rn1 - 1,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      'SP_FRS9_IMP_CA_SCHD_FROM_UPLD',
      CURRENT_TIMESTAMP
    FROM tmp_paym_schd
    WHERE rn = 1;
  
  ELSE
  
    -- Step 4c: Delete Existing Preview Schedule
    DELETE FROM frs9_imp_ca_schd_prv a
    WHERE EXISTS (SELECT 1 FROM tmp_paym_schd x WHERE x.account_id = a.account_id);

    -- Step 4d: Insert New Schedule (Preview Mode)
    INSERT INTO frs9_imp_ca_schd_prv (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, installment, createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      rn1 - 1,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      'SP_FRS9_IMP_CA_SCHD_FROM_UPLD',
      CURRENT_TIMESTAMP
    FROM tmp_paym_schd
    WHERE rn = 1;
  END IF;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd_from_upld(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd_hist(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd_hist(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_config_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Declare and Assign Dates
  v_currdate DATE;
--   v_prevdate DATE;
BEGIN
  v_currdate := p_prc_date;
--   v_prevdate := p_prc_date - INTERVAL '1 day';

  -- Step 2: Main Mode Logic
  IF p_prc = 'M' THEN
    
    -- Step 2a: Update Historical Records
    UPDATE frs9_imp_ca_schd_hist a
    SET end_prc_date = v_currdate
    WHERE end_prc_date IS NULL
          AND EXISTS (
            SELECT 1
            FROM frs9_imp_ca_schd x
            WHERE x.account_id = a.account_id AND x.prc_date = v_currdate);

    -- Step 2b: Insert New History Snapshot
    INSERT INTO frs9_imp_ca_schd_hist (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, next_interest, installment,
      end_prc_date, createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment,
      NULL,
      'SP_FRS9_IMP_CA_SCHD_HIST',
      CURRENT_TIMESTAMP
    FROM frs9_imp_ca_schd a
    WHERE a.prc_date = v_currdate;

    -- Step 2c: Restore Missing Schedule from History
    INSERT INTO frs9_imp_ca_schd (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, next_interest, installment,
      createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment,
      'SP_FRS9_IMP_CA_SCHD_HIST',
      CURRENT_TIMESTAMP
    FROM frs9_imp_ca_schd_hist a
    WHERE end_prc_date IS NULL
          AND EXISTS (
            SELECT 1
            FROM tmp_frs9_ecl_fma x
            WHERE x.account_id = a.account_id AND x.prc_date = v_currdate AND x.ead_method::INT = 1)
          AND NOT EXISTS (
            SELECT 1
            FROM frs9_imp_ca_schd y
            WHERE y.account_id = a.account_id);
  ELSE
    
    -- Step 3: Preview Mode Logic
    INSERT INTO frs9_imp_ca_schd_prv (
      prc_date, account_id, account_number, mob, idays, payment_date,
      os_balance, principal, interest, next_interest, installment,
      createdby, createddate
    )
    SELECT 
      prc_date,
      account_id,
      account_number,
      mob,
      idays,
      payment_date,
      os_balance,
      principal,
      interest,
      next_interest,
      installment,
      'SP_FRS9_IMP_CA_SCHD_HIST',
      CURRENT_TIMESTAMP
    FROM frs9_imp_ca_schd_hist a
    WHERE end_prc_date IS NULL
          AND EXISTS (
            SELECT 1
            FROM tmp_frs9_ecl_fma x
            WHERE x.account_id = a.account_id AND x.prc_date = v_currdate AND x.ead_method::INT = 1)
          AND NOT EXISTS (
            SELECT 1
            FROM frs9_imp_ca_schd_prv y
            WHERE y.account_id = a.account_id);
  END IF;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd_hist(IN p_prc_date date, IN p_prc character, IN p_config_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_schd_hist_reset(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_schd_hist_reset(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN

    -- Step 4: Delete Current Records
    DELETE FROM frs9_imp_ca_schd_hist
    WHERE prc_date = p_prc_date;

    -- Step 5: Nullify Future End Dates
    UPDATE frs9_imp_ca_schd_hist
    SET end_prc_date = NULL
    WHERE end_prc_date >= p_prc_date;
    
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_schd_hist_reset(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_segment_query(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_segment_query(IN p_prc_date date DEFAULT NULL::date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  
  -- 🟨 Loop records
  seg_h RECORD;
  seg_d RECORD;
  v_script TEXT;
    
BEGIN
    -- 🔵 Step 1: Clear old results before new build
    TRUNCATE TABLE frs9_imp_ca_segment_query;

    -- 🔵 Step 2: Load all active segment definitions
    FOR seg_h IN
      WITH param_h AS (
        SELECT
          segment_type,
          group_segment,
          segment,
          sub_segment,
          segment_id,
          "table_name",
          ROW_NUMBER() OVER (PARTITION BY segment_type, group_segment, segment, sub_segment, segment_id, "table_name") AS rn
        FROM view_param_segment_rules
        WHERE active_flag IS TRUE
      ) 
      SELECT
        group_segment,
        segment,
        sub_segment,
        segment_type,
        segment_id,
        table_name
      FROM
        param_h
      WHERE
        rn = 1
      ORDER BY
        segment_id
    LOOP
    
      -- DEBUG param_h output
      RAISE NOTICE 'Segment-H -> group_segment: % , segment: %, sub_segment: %, segment_type: %, segment_id: %, table_name: %',
        seg_h.group_segment,
        seg_h.segment,
        seg_h.sub_segment,
        seg_h.segment_type,
        seg_h.segment_id,
        seg_h.table_name;
        
      -- 🟣 Reset query builder for new segment
      v_script := '';
        
      -- 🔵 Step 3: Generate query clause per rule
      FOR seg_d IN
        SELECT
          query_group = MIN(query_group) OVER () AS is_first_group,
          seq = MIN(seq) OVER (PARTITION BY query_group) AS is_first_seq,
          seq = MAX(seq) OVER (PARTITION BY query_group) AS is_last_seq,
          query_group = MAX(query_group) OVER () AS is_last_group,
          seq,
          column_name,
          data_type,
          operator,
          value1,
          value2,
          condition
        FROM frs9_param_segmentd
        WHERE segment_id = seg_h.segment_id
        ORDER BY query_group, seq
      LOOP
        
        -- 🔍 Debug seg_d OUTPUT
        RAISE NOTICE 'is_first_group=%, is_first_seq=%, is_last_seq=%, is_last_group=%, seq=%, column_name=%, data_type=%, operator=%, value1=%, value2=%, condition=%',
          seg_d.is_first_group,
          seg_d.is_first_seq,
          seg_d.is_last_seq,
          seg_d.is_last_group,
          seg_d.seq,
          seg_d.column_name,
          seg_d.data_type,
          seg_d.operator,
          seg_d.value1,
          seg_d.value2,
          seg_d.condition;
       
       -- Build WHERE Clause
       SELECT fn_build_query_group(
          v_script
          , seg_d.column_name
          , seg_d.operator
          , seg_d.value1
          , seg_d.value2
          , seg_d.data_type
          , seg_d.condition
          , seg_d.is_first_group
          , seg_d.is_first_seq
          , seg_d.is_last_seq
          , seg_d.is_last_group
        ) INTO v_script;
        

      END LOOP;
      
      RAISE NOTICE 'Where clause: %', v_script;
      
      -- 🔵 Step 4: Write result to output table
      INSERT INTO frs9_imp_ca_segment_query (
        segment_id,
        segment_type,
        group_segment,
        sub_segment,
        segment,
        table_name,
        condition
      ) VALUES (
        seg_h.segment_id,
        seg_h.segment_type,
        seg_h.group_segment,
        seg_h.sub_segment,
        seg_h.segment,
        seg_h.table_name,
        v_script
      );
        

    END LOOP;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_segment_query(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_start_ecl(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_start_ecl(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE;
BEGIN
    -- Assign input date to local variable
    v_currdate := p_prc_date;

    -- Update configuration table
    UPDATE frs9_imp_ca_ecl_configh
    SET last_run_period = v_currdate,
        last_run_status = 'START',
        last_run_date   = CURRENT_TIMESTAMP
    WHERE effective_date <= v_currdate
      AND (
          pkid = p_ecl_model_id
          OR (p_ecl_model_id = 0 AND active_flag = TRUE)
      );
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ca_start_ecl(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ca_update_ima(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ca_update_ima(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE := p_prc_date;
  v_table_name TEXT;
  v_table_resulth TEXT;
  v_qry TEXT;
BEGIN
  
  -- Step 2: Resolve Active ECL Model
  SELECT pkid INTO p_ecl_model_id
  FROM frs9_imp_ca_ecl_configh
  WHERE (active_flag IS TRUE AND p_ecl_model_id = 0) OR pkid = p_ecl_model_id
  LIMIT 1;

  -- Step 3: Determine Source and Result Tables
  IF p_prc = 'M' THEN
    v_table_name := 'frs9_master_account';
    v_table_resulth := 'frs9_imp_ca_result_h';
  ELSE
    v_table_name := 'tmp_fma_preview';
    v_table_resulth := 'frs9_imp_ca_result_h_prv';
  END IF;

  -- Step 4: Build and Execute Update Query
  v_qry := format($f$
  UPDATE %I AS A
  SET
    ecl_model_id     = %L,
    ead_config_id    = COALESCE(B.ead_config_id, 0),
    pd_config_id     = COALESCE(B.pd_config_id, 0),
    lgd_config_id    = COALESCE(B.lgd_config_id, 0),
    lgd              = COALESCE(B.lgd, 0),
    bucket_id        = COALESCE(B.bucket_id, 0),
    ecl_ca_onbs_amt  = COALESCE(B.ecl_final, 0)
  FROM 
    (SELECT
      prc_date      AS prc_date,
      account_id    AS account_id,
      ecl_model_id  AS ecl_model_id,
      ead_config_id AS ead_config_id,
      pd_config_id  AS pd_config_id,
      lgd_config_id AS lgd_config_id,
      lgd           AS lgd,
      bucket_id     AS bucket_id,
      ecl_final     AS ecl_final
    FROM %I
    WHERE ecl_model_id = %L
    ) AS B
  WHERE A.prc_date = B.prc_date
        AND A.account_id = B.account_id
        AND A.prc_date = %L
        AND A.account_status IN ('A', 'R')
  $f$, v_table_name, p_ecl_model_id, v_table_resulth, p_ecl_model_id, v_currdate);

  EXECUTE v_qry;
END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ca_update_ima(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_generate_preview(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_generate_preview(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_currdate DATE := p_prc_date;
BEGIN
  -- Step 2: Clear preview table
  TRUNCATE TABLE tmp_fma_preview;

  -- Step 3: Insert snapshot with defaulted fields
  INSERT INTO tmp_fma_preview (
    pkid,
    prc_date,
    account_id,
    account_number,
    facility_number,
    cif_type,
    cif_number,
    cif_name,
    account_status,
    data_source,
    prd_group,
    prd_type,
    prd_code,
    gl_group,
    branch_code,
    tenor_org,
    remaining_tenor,
    start_date,
    maturity_date,
    start_amort_date,
    end_amort_date,
    paid_off_date,
    write_off_date,
    first_payment_date,
    next_payment_date,
    last_payment_date,
    next_sch_prin_date,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    market_rate,
    interest_rate,
    eff_interest_rate,
    collectability,
    collectability_group,
    dpd,
    dpd_group,
    internal_rating_code,
    ext_rating_code,
    ext_rating_agency,
    payment_code,
    payment_term,
    payment_freq,
    int_pmt_term,
    int_pmt_freq,
    pmt_sch_status,
    eir_sch_status,
    revolving_flag,
    bm_flag,
    committed_flag,
    npl_flag,
    npl_date,
    restructure_flag,
    restructure_date,
    restructure_review_date,
    repo_flag,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    special_case_flag,
    impaired_flag,
    impaired_status,
    segment_id,
    group_segment,
    segment,
    sub_segment,
    sicr_flag,
    stage,
    bucket_id,
    bucket_id_obligor,
    bucket_id_ed,
    ecl_model_id,
    ead_config_id,
    pd_config_id,
    lgd_config_id,
    interest_base,
    sppi_status,
    bm_status,
    asset_class,
    currency,
    exchange_rate,
    plafond,
    full_release_amt,
    unused_amt,
    outstanding,
    outstanding_wo,
    accrued_interest,
    installment_amt,
    fix_principal_amt,
    fix_interest_amt,
    initial_fee_amt,
    unamort_fee_amt,
    amort_fee_amt,
    initial_cost_amt,
    unamort_cost_amt,
    amort_cost_amt,
    initial_bm_amt,
    unamort_bm_amt,
    amort_bm_amt,
    carrying_amt,
    ecl_ca_onbs_amt,
    ecl_ca_offbs_amt,
    ecl_ia_onbs_amt,
    ecl_final_amt,
    unwinding_ca_amt,
    unwinding_ia_amt,
    unwinding_ia_sum_amt,
    ecl_beginning_balance,
    ecl_charge,
    ecl_writeback,
    ecl_ending_balance,
    dpd_counter,
    internal_rating_code_initial,
    ext_rating_id_initial,
    ext_rating_code_initial,
    ext_rating_agency_initial,
    ext_rating_id,
    amortization_type,
    stage_original,
    stage_override,
    bucket_id_original,
    bucket_id_override,
    initial_gainloss_amt,
    unamort_gainloss_amt,
    amort_gainloss_amt,
    fair_value_amt,
    ecl_overlay_amt,
    weighted_eff_interest_rate,
    weighted_interest_rate
  )
  SELECT
    pkid,
    prc_date,
    account_id,
    account_number,
    facility_number,
    cif_type,
    cif_number,
    cif_name,
    account_status,
    data_source,
    prd_group,
    prd_type,
    prd_code,
    gl_group,
    branch_code,
    tenor_org,
    remaining_tenor,
    start_date,
    maturity_date,
    start_amort_date,
    end_amort_date,
    paid_off_date,
    write_off_date,
    first_payment_date,
    next_payment_date,
    last_payment_date,
    next_sch_prin_date,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    market_rate,
    interest_rate,
    eff_interest_rate,
    collectability,
    collectability_group,
    dpd,
    dpd_group,
    internal_rating_code,
    ext_rating_code,
    ext_rating_agency,
    payment_code,
    payment_term,
    payment_freq,
    int_pmt_term,
    int_pmt_freq,
    pmt_sch_status,
    eir_sch_status,
    revolving_flag,
    bm_flag,
    committed_flag,
    npl_flag,
    npl_date,
    restructure_flag,
    restructure_date,
    restructure_review_date,
    repo_flag,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    special_case_flag,
    FALSE AS impaired_flag,
    ''::text AS impaired_status,
    0::int AS segment_id,
    ''::text AS group_segment,
    ''::text AS segment,
    ''::text AS sub_segment,
    FALSE AS sicr_flag,
    0::int AS stage,
    0::int AS bucket_id,
    bucket_id_obligor,
    bucket_id_ed,
    0::int AS ecl_model_id,
    0::int AS ead_config_id,
    0::int AS pd_config_id,
    0::int AS lgd_config_id,
    interest_base,
    sppi_status,
    bm_status,
    ''::text AS asset_class,
    currency,
    exchange_rate,
    plafond,
    full_release_amt,
    unused_amt,
    outstanding,
    outstanding_wo,
    accrued_interest,
    installment_amt,
    fix_principal_amt,
    fix_interest_amt,
    initial_fee_amt,
    unamort_fee_amt,
    amort_fee_amt,
    initial_cost_amt,
    unamort_cost_amt,
    amort_cost_amt,
    initial_bm_amt,
    unamort_bm_amt,
    amort_bm_amt,
    carrying_amt,
    0::numeric AS ecl_ca_onbs_amt,
    0::numeric AS ecl_ca_offbs_amt,
    0::numeric AS ecl_ia_onbs_amt,
    0::numeric AS ecl_final_amt,
    0::numeric AS unwinding_ca_amt,
    0::numeric AS unwinding_ia_amt,
    0::numeric AS unwinding_ia_sum_amt,
    0::numeric AS ecl_beginning_balance,
    0::numeric AS ecl_charge,
    0::numeric AS ecl_writeback,
    0::numeric AS ecl_ending_balance,
    dpd_counter,
    internal_rating_code_initial,
    ext_rating_id_initial,
    ext_rating_code_initial,
    ext_rating_agency_initial,
    0 AS ext_rating_id,
    amortization_type,
    stage_original,
    stage_override,
    bucket_id_original,
    bucket_id_override,
    initial_gainloss_amt,
    unamort_gainloss_amt,
    amort_gainloss_amt,
    fair_value_amt,
    0::numeric AS ecl_overlay_amt,
    weighted_eff_interest_rate,
    weighted_interest_rate
  FROM frs9_master_account
  WHERE prc_date = v_currdate;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_generate_preview(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ia_result_d(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ia_result_d(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Step 1: Delete existing results for the given date
  DELETE FROM frs9_imp_ia_result_d WHERE prc_date = p_prc_date;

  -- Step 2: Insert filtered IA detail records with matching header
  INSERT INTO frs9_imp_ia_result_d (
    ia_id,
    prc_date,
    account_id,
    mob,
    periode,
    principal,
    interest,
    installment,
    collateral,
    po_rate_1,
    rr_rate_1,
    default_1,
    po_rate_2,
    rr_rate_2,
    default_2,
    po_rate_3,
    rr_rate_3,
    default_3,
    pw_amt,
    discount_factor,
    pv_amt,
    beginning_balance,
    eir_amt,
    ending_balance,
    createdby,
    createddate
  )
  SELECT
    a.ia_id,
    p_prc_date,
    a.account_id,
    a.mob,
    a.periode,
    a.principal,
    a.interest,
    a.installment,
    a.collateral,
    a.po_rate_1,
    a.rr_rate_1,
    a.default_1,
    a.po_rate_2,
    a.rr_rate_2,
    a.default_2,
    a.po_rate_3,
    a.rr_rate_3,
    a.default_3,
    a.pw_amt,
    a.discount_factor,
    a.pv_amt,
    a.beginning_balance,
    a.eir_amt,
    a.ending_balance,
    'SP_FRS9_IMP_IA_RESULT_D',
    CURRENT_TIMESTAMP
  FROM frs9_imp_ia_detail a
  WHERE EXISTS (
    SELECT 1
    FROM frs9_imp_ia_result_h x
    WHERE x.prc_date = p_prc_date AND x.ia_id = a.ia_id
    LIMIT 1
  )
  ORDER BY a.ia_id, a.mob;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ia_result_d(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ia_result_h(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ia_result_h(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Step 1: Delete existing results for the given date
  DELETE FROM frs9_imp_ia_result_h WHERE prc_date = p_prc_date;

  -- Step 2: Insert latest IA results using CTE
  WITH cte AS (
    SELECT
      ia_id,
      account_id,
      pv_dcf_amt,
      ROW_NUMBER() OVER (PARTITION BY account_number ORDER BY eff_date DESC) AS rn
    FROM frs9_imp_ia_header
    WHERE prc_date <= p_prc_date
  )
  INSERT INTO frs9_imp_ia_result_h (
    ia_id,
    prc_date,
    account_id,
    account_number,
    cif_number,
    cif_name,
    currency,
    dpd,
    collectability,
    rating_code,
    interest_rate,
    eff_interest_rate,
    outstanding,
    accrued_interest,
    carrying_amt,
    ead_amt,
    pv_dcf_amt,
    ecl_ia_amt,
    createdby,
    createddate
  )
  SELECT
    b.ia_id,
    a.prc_date,
    a.account_id,
    a.account_number,
    a.cif_number,
    a.cif_name,
    a.currency,
    a.dpd,
    a.collectability,
    a.ext_rating_code,
    a.interest_rate,
    a.eff_interest_rate,
    a.outstanding,
    a.accrued_interest,
    a.carrying_amt,
    a.outstanding + a.accrued_interest AS ead_amt,
    b.pv_dcf_amt,
    a.ecl_ia_onbs_amt,
    'SP_FRS9_IMP_IA_RESULT_H' AS createdby,
    CURRENT_TIMESTAMP AS createddate
  FROM frs9_master_account a
  JOIN cte b ON a.account_id = b.account_id
  WHERE b.rn = 1 AND a.account_status = 'A' AND a.prc_date = p_prc_date;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_ia_result_h(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_ia_update_ima(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_ia_update_ima(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_table_name TEXT;
    v_sql TEXT := '';
    v_iapzero CHAR(1);
BEGIN
  -- Step 1: Determine target table
  IF p_prc = 'M' THEN
      v_table_name := 'frs9_master_account';
  ELSE
      v_table_name := 'tmp_fma_preview';
  END IF;

  -- Step 2: Get impairment logic toggle
    -- 0 = IF IAP <=0 , IMPAIRED STATUS = C, ECL FINAL = COLLECTIVE 
    -- 1 = IF IAP <=0 , IMPAIRED STATUS = I, ECL FINAL = 0
  SELECT param_usage INTO v_iapzero FROM frs9_param_commonh WHERE param_code = 'S1006';
    
  -- Step 3: Resolve ECL model ID
  SELECT pkid INTO p_ecl_model_id
  FROM frs9_imp_ca_ecl_configh
  WHERE (active_flag IS TRUE AND p_ecl_model_id = 0) OR pkid = p_ecl_model_id 
  LIMIT 1;

  -- Step 4: Reset impairment fields
  v_sql := format('
    UPDATE %I
      SET unwinding_ia_amt = 0,
      unwinding_ia_sum_amt = 0,
      ecl_ia_onbs_amt = 0,
      ecl_model_id = %L,
      impaired_status = %L
    WHERE prc_date = %L AND account_status = %L',
    v_table_name, p_ecl_model_id, 'C', p_prc_date, 'A'
  );
    
--     RAISE NOTICE 'Reset impairment fields: %', v_sql; RETURN;
    EXECUTE v_sql;
    
    -- Step 5: Build and execute CTE update
    v_sql := format($f$
      WITH cte AS (
        SELECT 
          account_id,
          pv_dcf_amt,
          unwinding,
          sum_unwinding,
          ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY prc_date DESC) AS rn
        FROM (
          SELECT 
            a.ia_id,
            a.prc_date,
            a.account_id,
            MAX(a.pv_dcf_amt) AS pv_dcf_amt,
            SUM(CASE WHEN b.periode = %L THEN eir_amt ELSE 0 END) AS unwinding,
            SUM(CASE WHEN b.periode <= %L THEN eir_amt ELSE 0 END) AS sum_unwinding
          FROM frs9_imp_ia_header a
          JOIN frs9_imp_ia_detail b ON a.ia_id = b.ia_id
          WHERE a.prc_date <= %L
          GROUP BY a.ia_id, a.prc_date, a.account_id
        ) x
    )
    
    UPDATE %I a
    SET 
      ecl_ia_onbs_amt = 
        CASE 
          WHEN a.outstanding + a.accrued_interest - b.pv_dcf_amt <= 0 THEN 0
          ELSE a.outstanding + a.accrued_interest - b.pv_dcf_amt
        END,
      unwinding_ia_amt = b.unwinding,
      unwinding_ia_sum_amt = b.sum_unwinding,
      impaired_status = 
      CASE 
        WHEN a.outstanding + a.accrued_interest - b.pv_dcf_amt <= 0 AND %L = '0' THEN 'C'
        ELSE 'I'
      END
    FROM cte b
    WHERE 
      a.account_id = b.account_id
      AND b.rn = 1
      AND a.prc_date = %L
      AND a.account_status = 'A';
    $f$, p_prc_date, p_prc_date, p_prc_date,v_table_name, v_iapzero, p_prc_date);
--     RAISE NOTICE 'Build and execute CTE update: %', v_sql; RETURN;
    EXECUTE v_sql;

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_ia_update_ima(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_initial_update(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_initial_update(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_currdate DATE := p_prc_date;
    v_prevdate DATE := fn_eomonth(p_prc_date,-1);
    v_table_name TEXT;
    v_qry TEXT;
BEGIN
  
  -- Determine target table
  IF p_prc = 'M' THEN
    v_table_name := 'frs9_master_account';
  ELSE
    v_table_name := 'tmp_fma_preview';
  END IF;

  -------------------------------
  -- Block 1: ECL metrics update
  -------------------------------
  v_qry := format($f$
    WITH src as (
      SELECT 
        a.prc_date,
        a.account_id,
        COALESCE(b.ecl_ca_onbs_amt, 0)         AS ecl_ca_onbs_amt,
        COALESCE(b.ecl_ca_offbs_amt, 0)        AS ecl_ca_offbs_amt,
        COALESCE(b.ecl_ia_onbs_amt, 0)         AS ecl_ia_onbs_amt,
        COALESCE(b.ecl_final_amt, 0)           AS ecl_final_amt,
        COALESCE(b.unwinding_ia_amt, 0)        AS unwinding_ia_amt,
        COALESCE(b.unwinding_ia_sum_amt, 0)    AS unwinding_ia_sum_amt,
        COALESCE(b.ecl_final_amt, 0)           AS ecl_beginning_balance,
        COALESCE(b.ecl_charge, 0)              AS ecl_charge,
        COALESCE(b.ecl_writeback, 0)           AS ecl_writeback,
        COALESCE(b.impaired_status, 'C')       AS impaired_status
      FROM %I a
      LEFT JOIN tmp_frs9_master_account_prev b ON a.account_id = b.account_id
      WHERE a.prc_date = %L AND a.account_status IN ('A', 'R')
    )
    UPDATE %I a
    SET
      ecl_ca_onbs_amt = b.ecl_ca_onbs_amt,
      ecl_ca_offbs_amt = b.ecl_ca_offbs_amt,
      ecl_ia_onbs_amt = b.ecl_ia_onbs_amt,
      ecl_final_amt = b.ecl_final_amt,
      unwinding_ia_amt = b.unwinding_ia_amt,
      unwinding_ia_sum_amt = b.unwinding_ia_sum_amt,
      ecl_beginning_balance = b.ecl_beginning_balance,
      ecl_charge = b.ecl_charge,
      ecl_writeback = b.ecl_writeback,
      impaired_status = b.impaired_status
    FROM src b 
    WHERE a.prc_date=b.prc_date AND a.account_id=b.account_id;  
  $f$, v_table_name, v_currdate, v_table_name);
  
--   RAISE NOTICE 'ECL metrics update: %', v_qry; RETURN;
  EXECUTE v_qry;

    --------------------------------------------------
    -- Block 2: Product mapping and tenor calculation
    --------------------------------------------------
    v_qry := format($f$
    WITH src AS (
      SELECT 
        a.prc_date,
        a.account_id,
        a.prd_code,
        a.currency,
        b.prd_group,
        b.prd_type,
        b.impaired_flag,
        fn_get_total_months(%L, a.maturity_date) AS remaining_tenor
      FROM %I a
      JOIN frs9_param_product b ON a.prd_code = b.prd_code AND (a.currency = b.currency OR b.currency = 'ALL')
      WHERE a.prc_date = %L AND a.account_status IN ('A', 'R')
    )
    UPDATE %I a
    SET
      prd_group = b.prd_group,
      prd_type = b.prd_type,
      impaired_flag = b.impaired_flag,
      remaining_tenor = CASE WHEN b.remaining_tenor < 0  THEN 0 ELSE b.remaining_tenor END
    FROM src b
    WHERE a.prc_date = b.prc_date AND a.account_id = b.account_id;
  $f$, v_currdate, v_table_name, v_currdate, v_table_name);

--   RAISE NOTICE 'Product mapping and tenor calculation: %', v_qry; RETURN;
  EXECUTE v_qry;
    
  ------------------------------------
  -- Block 3: External rating mapping
  ------------------------------------
  v_qry := format($f$
    WITH src AS (
      SELECT 
      a.prc_date,
      a.account_id, 
      a.ext_rating_agency,
      a.ext_rating_code,
      COALESCE(b.value3, '0') AS ext_rating_id
      FROM %I a
      LEFT JOIN frs9_param_commond b ON a.ext_rating_agency = b.value1 AND a.ext_rating_code = b.value2 AND b.param_code = 'S1001'
      WHERE a.prc_date=%L
    )
    UPDATE %I a
    SET
      ext_rating_id = b.ext_rating_id::INT
    FROM src b
    WHERE a.prc_date=b.prc_date AND a.account_id=b.account_id;
  $f$, v_table_name, v_currdate, v_table_name);

--     RAISE NOTICE 'External rating mapping: %', v_qry; RETURN;
  EXECUTE v_qry;
    
  -----------------------------------
  -- Block 4: Asset class assignment
  -----------------------------------
  v_qry := format('UPDATE %I SET asset_class = %L WHERE prc_date = %L', v_table_name, 'AMORT', v_currdate);
--     RAISE NOTICE 'Asset class assignment: %', v_qry; RETURN;
  EXECUTE v_qry;

  -----------------------------------------------
  -- Block 5: Weighted interest rate calculation
  -----------------------------------------------
  v_qry := format($f$
    WITH weighted_rates AS (
      SELECT 
        prc_date,
        sub_segment,
        CASE 
          WHEN SUM(outstanding * exchange_rate) = 0 THEN 0
          ELSE SUM(COALESCE(eff_interest_rate, 0) * outstanding * exchange_rate) / SUM(outstanding * exchange_rate)
        END AS w_eir,
        CASE 
          WHEN SUM(outstanding * exchange_rate) = 0 THEN 0
          ELSE SUM(COALESCE(interest_base::FLOAT8, 0) * outstanding * exchange_rate) / SUM(outstanding * exchange_rate)
        END AS w_int
      FROM %I
      WHERE prc_date = %L AND account_status = 'A'
      GROUP BY prc_date, sub_segment

    ), acc AS (
      SELECT 
        a.prc_date,
        a.account_id,
        a.sub_segment,
        wr.w_eir AS weighted_eff_interest_rate,
        wr.w_int AS weighted_interest_rate
      FROM frs9_master_account a
      JOIN weighted_rates wr ON a.sub_segment = wr.sub_segment
      WHERE a.prc_date = wr.prc_date AND a.account_status IN ('A', 'R')
      
    )

    UPDATE %I a
    SET
      weighted_eff_interest_rate = b.weighted_eff_interest_rate,
      weighted_interest_rate = b.weighted_interest_rate
    FROM acc b
    WHERE a.prc_date = b.prc_date AND a.account_id = b.account_id;
    
  $f$, v_table_name, v_currdate, v_table_name);

--   RAISE NOTICE 'Weighted interest rate calculation: %', v_qry; RETURN;
  EXECUTE v_qry;
    
  -- Final rule execution
  CALL sp_frs9_exec_rule(v_currdate, 'GL'::TEXT, p_prc);

END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_initial_update(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_journal_data(date, character, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_journal_data(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id bigint DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE := p_prc_date;
  v_prevdate DATE := fn_eomonth(p_prc_date, -1);
  
BEGIN
  -- Step 2: Clear Existing Journals
  DELETE FROM frs9_imp_journal_data WHERE prc_date = v_currdate;

  -- Step 3: Generate Current Period Journals
  INSERT INTO frs9_imp_journal_data (
    prc_date,
    account_id,
    facility_number,
    cif_number,
    prdcode,
    currency,
    journalcode,
    journalcode2,
    reverse,
    flag_cf,
    dbcr,
    gl_number,
    n_amount,
    n_amount_idr,
    sourceprocess,
    intmid,
    branch,
    noref,
    valctr_code,
    gl_desc,
    gl_costcenter,
    createddate,
    createdby
  )
  SELECT
    a.prc_date AS prc_date,
    a.account_id AS account_id,
    a.facility_number AS facility_number,
    a.cif_number AS cif_number,
    a.prd_code AS prdcode,
    a.currency AS currency,
    b.gl_code AS journalcode,
    b.gl_code AS journalcode2,
    FALSE AS reverse,
    'I' AS flag_cf,
    b.dbcr AS dbcr,
    b.gl_number AS gl_number,
    a.ecl_final_amt AS n_amount,
    a.ecl_final_amt * a.exchange_rate AS n_amount_idr,
    'SP_JOURNAL1' AS sourceprocess,
    NULL AS intmid,
    NULL AS branch,
    NULL AS noref,
    NULL AS valctr_code,
    b.gl_desc AS gl_desc,
    NULL AS gl_costcenter,
    CURRENT_TIMESTAMP AS createddate,
    'SP_FRS9_IMP_JOURNAL_DATA' AS createdby
  FROM frs9_master_account a
  JOIN frs9_param_journal b 
    ON LOWER(a.gl_group) = LOWER(b.gl_group)
       AND (LOWER(a.currency) = LOWER(b.currency) OR LOWER(b.currency) = 'all')
  WHERE a.prc_date = v_currdate
    AND LOWER(a.account_status) IN ('a', 'r')
    AND a.ecl_final_amt > 0
    AND (
      (LOWER(a.impaired_status) = 'c' AND LOWER(b.gl_code) = 'impc') 
      OR (LOWER(a.impaired_status) = 'i' AND LOWER(b.gl_code) = 'impi')
    )
    AND b.active_flag IS TRUE;

  -- Step 4: Generate Reversal Journals from Previous Period
  INSERT INTO frs9_imp_journal_data (
    prc_date,
    account_id,
    facility_number,
    cif_number,
    prdcode,
    currency,
    journalcode,
    journalcode2,
    reverse,
    flag_cf,
    dbcr,
    gl_number,
    n_amount,
    n_amount_idr,
    sourceprocess,
    intmid,
    branch,
    noref,
    valctr_code,
    gl_desc,
    gl_costcenter,
    createddate,
    createdby
  )
  SELECT
    v_currdate AS prc_date,
    a.account_id AS account_id,
    a.facility_number AS facility_number,
    a.cif_number AS cif_number,
    a.prdcode AS prdcode,
    a.currency AS currency,
    a.journalcode AS journalcode,
    a.journalcode2 AS journalcode2,
    TRUE AS reverse,
    a.flag_cf AS flag_cf,
    CASE WHEN LOWER(a.dbcr) = 'd' THEN 'C' ELSE 'D' END AS dbcr,
    a.gl_number AS gl_number,
    a.n_amount AS n_amount,
    a.n_amount * COALESCE(b.exchange_rate, 1) AS n_amount_idr,
    'SP_JOURNAL2' AS sourceprocess,
    a.intmid AS intmid,
    a.branch AS branch,
    a.noref AS noref,
    a.valctr_code AS valctr_code,
    a.gl_desc AS gl_desc,
    a.gl_costcenter AS gl_costcenter,
    CURRENT_TIMESTAMP AS createddate,
    'SP_FRS9_IMP_JOURNAL_DATA1' AS createdby
  FROM frs9_imp_journal_data a
  LEFT JOIN frs9_master_exchange_rate b
    ON LOWER(a.currency) = LOWER(b.currency)
   AND b.prc_date = v_currdate
  WHERE a.prc_date = v_prevdate
    AND a.reverse IS TRUE;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_journal_data(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id bigint) OWNER TO postgres;

--
-- Name: sp_frs9_imp_movement_data(date, character, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_movement_data(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id bigint DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
  -- Step 1 complete: v_eom and v_begindate are now ready for use
  v_eom DATE := fn_eomonth(p_prc_date, 0);
  v_begindate DATE := fn_eomonth(p_prc_date, -1);

BEGIN

  -- Step 2: Cleanup
  DELETE FROM frs9_imp_movement_data WHERE prc_date = v_eom;

  -- Drop temp tables if they exist
  DROP TABLE IF EXISTS tmp_curr;
  DROP TABLE IF EXISTS tmp_prev;
  DROP TABLE IF EXISTS pre_cte_transfer;

  -- Step 3: Snapshot Current and Previous Balances
    -- Current period snapshot
    CREATE TEMP TABLE tmp_curr AS
    SELECT *
    FROM vw_frs9_movement_snapshot
    WHERE download_date = v_eom;

    -- Previous period snapshot
    CREATE TEMP TABLE tmp_prev AS
    SELECT *
    FROM vw_frs9_movement_snapshot
    WHERE download_date = v_begindate;

  -- Step 4: CTE Calculations
  
  CREATE TEMP TABLE pre_cte_transfer AS
  SELECT
      prev.account_id,
      prev.group_segment,

      -- Stage movement
      prev.stage::INT AS stage_from,
      curr.stage::INT AS stage_to,

      -- Impairment model movement
      prev.impaired_flag AS impaired_from,
      curr.impaired_flag AS impaired_to,

      -- POCI movement
      prev.poci_flag AS poci_from,
      curr.poci_flag AS poci_to,
      CASE 
          WHEN NOT prev.poci_flag AND curr.poci_flag THEN curr.ecl_amount
          WHEN prev.poci_flag AND NOT curr.poci_flag THEN -prev.ecl_amount
          ELSE 0 
      END AS poci,

      -- ✅ Inclusive: All accounts
      CASE WHEN prev.impaired_flag = 'c' THEN -prev.ecl_amount ELSE 0 END AS ecl_prev_c_all,
      CASE WHEN prev.impaired_flag = 'c' THEN -prev.gross_carrying_amount ELSE 0 END AS gca_prev_c_all,
      CASE WHEN curr.impaired_flag = 'c' THEN curr.ecl_amount ELSE 0 END AS ecl_curr_c_all,
      CASE WHEN curr.impaired_flag = 'c' THEN curr.gross_carrying_amount ELSE 0 END AS gca_curr_c_all,

      CASE WHEN prev.impaired_flag = 'i' THEN -prev.ecl_amount ELSE 0 END AS ecl_prev_i_all,
      CASE WHEN prev.impaired_flag = 'i' THEN -prev.gross_carrying_amount ELSE 0 END AS gca_prev_i_all,
      CASE WHEN curr.impaired_flag = 'i' THEN curr.ecl_amount ELSE 0 END AS ecl_curr_i_all,
      CASE WHEN curr.impaired_flag = 'i' THEN curr.gross_carrying_amount ELSE 0 END AS gca_curr_i_all,

      -- 🚫 Exclusive: Non-POCI in both snapshots
      CASE WHEN prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN -prev.ecl_amount ELSE 0 END AS ecl_prev_c_nopoci,
      CASE WHEN prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN -prev.gross_carrying_amount ELSE 0 END AS gca_prev_c_nopoci,
      CASE WHEN curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END AS ecl_curr_c_nopoci,
      CASE WHEN curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END AS gca_curr_c_nopoci,

      CASE WHEN prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN -prev.ecl_amount ELSE 0 END AS ecl_prev_i_nopoci,
      CASE WHEN prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN -prev.gross_carrying_amount ELSE 0 END AS gca_prev_i_nopoci,
      CASE WHEN curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END AS ecl_curr_i_nopoci,
      CASE WHEN curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END AS gca_curr_i_nopoci

  FROM tmp_prev prev
  INNER JOIN tmp_curr curr
      ON prev.account_id = curr.account_id
  WHERE prev.account_status = 'a'
    AND curr.account_status = 'a'
    AND NOT prev.restructure_flag
    AND NOT curr.restructure_flag
--     AND prev.stage IS NOT NULL
--     AND curr.stage IS NOT NULL
    ;


/*--:debug mode
  DROP TABLE IF EXISTS tmp1;  
  CREATE TABLE tmp1 AS 
-- */

  WITH cte_begin_bal AS (
      SELECT
          1 AS urut,
          group_segment,

          -- POCI total
          SUM(CASE WHEN poci_flag THEN ecl_amount ELSE 0 END) AS poci,

          -- Collective impairment ECL by stage
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 1 THEN ecl_amount ELSE 0 END) AS stage1,
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 2 THEN ecl_amount ELSE 0 END) AS stage2,
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 3 THEN ecl_amount ELSE 0 END) AS stage3,

          -- Collective impairment GCA by stage
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 1 THEN gross_carrying_amount ELSE 0 END) AS gca_stage1,
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 2 THEN gross_carrying_amount ELSE 0 END) AS gca_stage2,
          SUM(CASE WHEN impaired_flag = 'c' AND stage::INT = 3 THEN gross_carrying_amount ELSE 0 END) AS gca_stage3,

          -- Individual impairment ECL by stage
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 1 THEN ecl_amount ELSE 0 END) AS stage1_i,
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 2 THEN ecl_amount ELSE 0 END) AS stage2_i,
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 3 THEN ecl_amount ELSE 0 END) AS stage3_i,

          -- Individual impairment GCA by stage
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 1 THEN gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 2 THEN gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
          SUM(CASE WHEN impaired_flag = 'i' AND stage::INT = 3 THEN gross_carrying_amount ELSE 0 END) AS gca_stage3_i

      FROM tmp_prev
      WHERE download_date = v_begindate
        AND account_status = 'a'
      GROUP BY group_segment
      
  ), cte_transfer_12 AS (
    SELECT
        2 AS urut,
        group_segment,
        0 AS poci,

        -- Collective impairment ECL
        SUM(ecl_prev_c_all) AS stage1,
        SUM(ecl_curr_c_all) AS stage2,
        0 AS stage3,

        -- Collective impairment GCA
        SUM(gca_prev_c_all) AS gca_stage1,
        SUM(gca_curr_c_all) AS gca_stage2,
        0 AS gca_stage3,

        -- Individual impairment ECL
        SUM(ecl_prev_i_all) AS stage1_i,
        SUM(ecl_curr_i_all) AS stage2_i,
        0 AS stage3_i,

        -- Individual impairment GCA
        SUM(gca_prev_i_all) AS gca_stage1_i,
        SUM(gca_curr_i_all) AS gca_stage2_i,
        0 AS gca_stage3_i

    FROM pre_cte_transfer
    WHERE stage_from = 1 AND stage_to = 2
    GROUP BY group_segment
  
  ), cte_transfer_13 AS (
    
    SELECT
        3 AS urut,
        group_segment,

        -- POCI: new entries only (already signed in pre_cte_transfer)
        SUM(poci) AS poci,

        -- Collective impairment ECL
        SUM(ecl_prev_c_nopoci) AS stage1,
        0 AS stage2,
        SUM(ecl_curr_c_nopoci) AS stage3,

        -- Collective impairment GCA
        SUM(gca_prev_c_nopoci) AS gca_stage1,
        0 AS gca_stage2,
        SUM(gca_curr_c_nopoci) AS gca_stage3,

        -- Individual impairment ECL
        SUM(ecl_prev_i_nopoci) AS stage1_i,
        0 AS stage2_i,
        SUM(ecl_curr_i_nopoci) AS stage3_i,

        -- Individual impairment GCA
        SUM(gca_prev_i_nopoci) AS gca_stage1_i,
        0 AS gca_stage2_i,
        SUM(gca_curr_i_nopoci) AS gca_stage3_i

    FROM pre_cte_transfer
    WHERE stage_from = 1 AND stage_to = 3
    GROUP BY group_segment
    
  ), cte_transfer_21 AS (
    
    SELECT
        4 AS urut,
        group_segment,
        0 AS poci,

        -- Collective impairment ECL
        SUM(ecl_curr_c_all) AS stage1,
        SUM(ecl_prev_c_all) AS stage2,
        0 AS stage3,

        -- Collective impairment GCA
        SUM(gca_curr_c_all) AS gca_stage1,
        SUM(gca_prev_c_all) AS gca_stage2,
        0 AS gca_stage3,

        -- Individual impairment ECL
        SUM(ecl_curr_i_all) AS stage1_i,
        SUM(ecl_prev_i_all) AS stage2_i,
        0 AS stage3_i,

        -- Individual impairment GCA
        SUM(gca_curr_i_all) AS gca_stage1_i,
        SUM(gca_prev_i_all) AS gca_stage2_i,
        0 AS gca_stage3_i

    FROM pre_cte_transfer
    WHERE stage_from = 2 AND stage_to = 1
    GROUP BY group_segment
    
  ), cte_transfer_23 AS (
    
    SELECT
        5 AS urut,
        group_segment,

        -- POCI: new entries only (already signed in pre_cte_transfer)
        SUM(poci) AS poci,

        -- Collective impairment ECL
        0 AS stage1,
        SUM(ecl_prev_c_nopoci) AS stage2,
        SUM(ecl_curr_c_nopoci) AS stage3,

        -- Collective impairment GCA
        0 AS gca_stage1,
        SUM(gca_prev_c_nopoci) AS gca_stage2,
        SUM(gca_curr_c_nopoci) AS gca_stage3,

        -- Individual impairment ECL
        0 AS stage1_i,
        SUM(ecl_prev_i_nopoci) AS stage2_i,
        SUM(ecl_curr_i_nopoci) AS stage3_i,

        -- Individual impairment GCA
        0 AS gca_stage1_i,
        SUM(gca_prev_i_nopoci) AS gca_stage2_i,
        SUM(gca_curr_i_nopoci) AS gca_stage3_i

    FROM pre_cte_transfer
    WHERE stage_from = 2 AND stage_to = 3
    GROUP BY group_segment
  
  ), cte_transfer_32 AS (
  
    SELECT
        6 AS urut,
        group_segment,

        -- POCI: reversals only (already signed in pre_cte_transfer)
        SUM(poci) AS poci,

        -- Collective impairment ECL
        0 AS stage1,
        SUM(ecl_curr_c_nopoci) AS stage2,
        SUM(ecl_prev_c_nopoci) AS stage3,

        -- Collective impairment GCA
        0 AS gca_stage1,
        SUM(gca_curr_c_nopoci) AS gca_stage2,
        SUM(gca_prev_c_nopoci) AS gca_stage3,

        -- Individual impairment ECL
        0 AS stage1_i,
        SUM(ecl_curr_i_nopoci) AS stage2_i,
        SUM(ecl_prev_i_nopoci) AS stage3_i,

        -- Individual impairment GCA
        0 AS gca_stage1_i,
        SUM(gca_curr_i_nopoci) AS gca_stage2_i,
        SUM(gca_prev_i_nopoci) AS gca_stage3_i

    FROM pre_cte_transfer
    WHERE stage_from = 3 AND stage_to = 2
    GROUP BY group_segment

  ), cte_new AS (
    SELECT
        7 AS urut,
        curr.group_segment,

        -- POCI: new entries only
        SUM(CASE WHEN curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS poci,

        -- Collective impairment ECL
        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage3,

        -- Collective impairment GCA
        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        -- Individual impairment ECL
        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount ELSE 0 END) AS stage3_i,

        -- Individual impairment GCA
        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_prev prev
    RIGHT JOIN tmp_curr curr
        ON curr.account_id = prev.account_id
        AND prev.account_status = 'a'
        AND NOT prev.restructure_flag
        AND NOT curr.restructure_flag
    WHERE 
      (prev.stage IS NULL OR prev.stage = '0')
      AND curr.account_status = 'a'
    GROUP BY curr.group_segment
   
  ), cte_change_model AS (
    SELECT
        8 AS urut,
        curr.group_segment,

        -- POCI: delta only if both sides are POCI
        SUM(CASE WHEN PREV.poci_flag AND curr.poci_flag THEN (curr.ecl_amount-PREV.ecl_amount) ELSE 0 END) AS poci,
        
        -- Collective impairment ECL
        SUM(CASE WHEN curr.stage :: INT=1 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN curr.stage :: INT=2 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN curr.stage :: INT=3 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage3,
        
        -- Collective impairment GCA
        SUM(CASE WHEN curr.stage :: INT=1 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN curr.stage :: INT=2 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN curr.stage :: INT=3 AND curr.impaired_flag='c' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage3,
        
        -- Individual impairment ECL
        SUM(CASE WHEN curr.stage :: INT=1 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN curr.stage :: INT=2 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN curr.stage :: INT=3 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.ecl_amount-PREV.ecl_amount ELSE 0 END) AS stage3_i,
        
        -- Individual impairment GCA
        SUM(CASE WHEN curr.stage :: INT=1 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN curr.stage :: INT=2 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN curr.stage :: INT=3 AND curr.impaired_flag='i' AND NOT curr.poci_flag AND NOT PREV.poci_flag THEN curr.gross_carrying_amount-PREV.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_prev prev
    JOIN tmp_curr curr
        ON curr.account_id = prev.account_id
        AND prev.account_status = 'a'
        AND curr.stage::INT = prev.stage::INT
    WHERE
        curr.ecl_model_id <> prev.ecl_model_id
        AND curr.account_status = 'a'
        AND NOT curr.restructure_flag
        AND NOT prev.restructure_flag
    GROUP BY curr.group_segment

  ), cte_restru AS (
    SELECT
        9 AS urut,
        COALESCE(curr.group_segment, prev.group_segment) AS group_segment,

        SUM(CASE WHEN curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS poci,

        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 1 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 2 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 3 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage3,

        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 1 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 2 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 3 AND curr.impaired_flag = 'c' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 1 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 2 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 3 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage3_i,

        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 1 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 2 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN COALESCE(curr.stage::INT, prev.stage::INT) = 3 AND curr.impaired_flag = 'i' AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_curr curr
    LEFT JOIN tmp_prev prev
        ON prev.account_id = curr.account_id
        AND prev.restructure_flag
        AND prev.account_status = 'a'
    WHERE curr.restructure_flag
      AND curr.account_status = 'a'
    GROUP BY 
--       urut, 
      COALESCE(curr.stage, prev.stage),
      COALESCE(curr.group_segment, prev.group_segment)
      
  ), cte_clse AS (
    
    SELECT
        10 AS urut,
        prev.group_segment,

        -- POCI: full exit
        SUM(CASE WHEN prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS poci,

        -- Collective impairment ECL
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage3,

        -- Collective impairment GCA
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        -- Individual impairment ECL
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.ecl_amount ELSE 0 END) AS stage3_i,

        -- Individual impairment GCA
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag THEN 0 - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_prev prev
    LEFT JOIN tmp_curr curr
        ON curr.account_id = prev.account_id
        AND curr.account_status in ('a','w')
        AND NOT curr.restructure_flag
    WHERE 
      -- curr.account_id IS NULL
      ((curr.stage::INT=0 AND curr.account_status <> 'w') OR curr.stage IS NULL)
      AND prev.account_status = 'a'
      AND NOT prev.restructure_flag
    GROUP BY prev.group_segment

  ), cte_wo AS (
  
    SELECT
        11 AS urut,
        prev.group_segment,

        -- POCI: only if both snapshots are POCI
        SUM(CASE WHEN prev.poci_flag AND curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS poci,

        -- Collective impairment ECL
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage3,

        -- Collective impairment GCA
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        -- Individual impairment ECL
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.ecl_amount ELSE 0 END) AS stage3_i,

        -- Individual impairment GCA
        SUM(CASE WHEN prev.stage::INT = 1 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN prev.stage::INT = 2 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN prev.stage::INT = 3 AND prev.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN prev.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_prev prev
    JOIN tmp_curr curr
        ON prev.account_id = curr.account_id
        AND curr.account_status = 'w'
    WHERE 
      prev.account_status = 'a'
      AND NOT prev.restructure_flag
      AND NOT curr.restructure_flag
    GROUP BY prev.group_segment

  ), cte_oth AS (
    SELECT
        13 AS urut,
        curr.group_segment,

        SUM(CASE WHEN prev.poci_flag AND curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS poci,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage3,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.ecl_amount - prev.ecl_amount ELSE 0 END) AS stage3_i,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND NOT prev.poci_flag AND NOT curr.poci_flag THEN curr.gross_carrying_amount - prev.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_prev prev
    JOIN tmp_curr curr
        ON prev.account_id = curr.account_id
        AND prev.account_status = 'a'
    WHERE
      prev.stage::INT = curr.stage::INT
      AND prev.ecl_model_id = curr.ecl_model_id
      AND curr.account_status = 'a'
      AND NOT prev.restructure_flag
      AND NOT curr.restructure_flag
    GROUP BY curr.group_segment

  ), cte_fin AS (
  
    SELECT
        14 AS urut,
        curr.group_segment,

        SUM(CASE WHEN curr.poci_flag = TRUE THEN curr.ecl_amount ELSE 0 END) AS poci,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage3,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage1,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage2,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'c' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage3,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.ecl_amount ELSE 0 END) AS stage3_i,

        SUM(CASE WHEN curr.stage::INT = 1 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage1_i,
        SUM(CASE WHEN curr.stage::INT = 2 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage2_i,
        SUM(CASE WHEN curr.stage::INT = 3 AND curr.impaired_flag = 'i' AND curr.poci_flag = FALSE THEN curr.gross_carrying_amount ELSE 0 END) AS gca_stage3_i

    FROM tmp_curr curr
    WHERE curr.account_status = 'a'
    GROUP BY curr.group_segment
  )

/*
SELECT * FROM cte_fin ;
-- end of debug the output */

INSERT INTO frs9_imp_movement_data (
    prc_date, urut, group_segment, poci,
    stage1, stage2, stage3,
    gca_stage1, gca_stage2, gca_stage3,
    stage1_i, stage2_i, stage3_i,
    gca_stage1_i, gca_stage2_i, gca_stage3_i,
    createdby, createddate, createdhost
)
SELECT
    v_eom,
    urut,
    group_segment,
    COALESCE(poci, 0),
    COALESCE(stage1, 0),
    COALESCE(stage2, 0),
    COALESCE(stage3, 0),
    COALESCE(gca_stage1, 0),
    COALESCE(gca_stage2, 0),
    COALESCE(gca_stage3, 0),
    COALESCE(stage1_i, 0),
    COALESCE(stage2_i, 0),
    COALESCE(stage3_i, 0),
    COALESCE(gca_stage1_i, 0),
    COALESCE(gca_stage2_i, 0),
    COALESCE(gca_stage3_i, 0),
    'SP_IFRS_ECL_MOVEMENT_DATA',
    CURRENT_TIMESTAMP,
    'LOCALHOST'
FROM (
    SELECT * FROM cte_begin_bal
    UNION ALL SELECT * FROM cte_transfer_12
    UNION ALL SELECT * FROM cte_transfer_13
    UNION ALL SELECT * FROM cte_transfer_21
    UNION ALL SELECT * FROM cte_transfer_23
    UNION ALL SELECT * FROM cte_transfer_32
    UNION ALL SELECT * FROM cte_new
    UNION ALL SELECT * FROM cte_change_model
    UNION ALL SELECT * FROM cte_restru
    UNION ALL SELECT * FROM cte_clse
    UNION ALL SELECT * FROM cte_wo
    UNION ALL SELECT * FROM cte_oth
    UNION ALL SELECT * FROM cte_fin
) movement
ORDER BY urut;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_movement_data(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id bigint) OWNER TO postgres;

--
-- Name: sp_frs9_imp_nominative(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_nominative(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
  -- Step 1: Declare and Set Internal Date
  DECLARE v_currdate DATE := p_prc_date;
BEGIN

  -- Step 2: Delete Existing Snapshot
  DELETE FROM frs9_imp_nominative WHERE prc_date = v_currdate;

  -- Step 3: Insert Fresh Snapshot
  INSERT INTO frs9_imp_nominative (
        prc_date,
        account_id,
        data_source,
        account_number,
        facility_number,
        cif_number,
        cif_name,
        start_date,
        maturity_date,
        outstanding,
        currency,
        interest_rate,
        dpd,
        ext_rating,
        tenor,
        prd_code,
        group_segment,
        segment,
        sub_segment,
        rating_bucket,
        lgd,
        sicr,
        stage,
        ecl,
        ecl_coverage
  )
  SELECT
        prc_date,
        account_id,
        data_source,
        account_number,
        facility_number,
        cif_number,
        cif_name,
        start_date,
        maturity_date,
        outstanding,
        currency,
        interest_rate,
        dpd,
        ext_rating_code,
        fn_get_total_months(start_date, maturity_date) AS tenor,
        prd_code,
        group_segment,
        segment,
        sub_segment,
        bucket_id,
        lgd,
        sicr_flag,
        stage::INT,
        ecl_final_amt,
        CASE
            WHEN outstanding = 0 THEN 0
            ELSE ecl_final_amt::DOUBLE PRECISION / outstanding
        END AS ecl_coverage
  FROM frs9_master_account
  WHERE prc_date = v_currdate
      AND LOWER(account_status) IN ('a', 'r');

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_nominative(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_sequence(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_sequence()
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_currdate       DATE;
  v_param          TEXT;
  param_prc_name   TEXT:= 'IMP SEQUENCE';
  v_sessionid      UUID;
  v_counter        INTEGER;
  is_paym_fromcore BOOLEAN;
BEGIN
  ------------------------------------
  -- 1. Fetch control values
  ------------------------------------
  SELECT currdate
    INTO v_currdate
    FROM frs9_prc_date;

  SELECT param_usage::BOOLEAN
    INTO is_paym_fromcore
    FROM frs9_param_commonh
   WHERE param_code = 'S1003';
   
   RAISE NOTICE 'PRC_DATE: %', v_currdate;
    
  ------------------------------------
  -- 2. Build parameter string & session
  ------------------------------------
  v_param := quote_literal(v_currdate) || '::date, ' ||
             quote_literal('M') || '::text, ' ||
             '0::int';

  v_sessionid := gen_random_uuid();

  UPDATE frs9_prc_date SET sessionid = v_sessionid;

  ------------------------------------
  -- 3. Initialize statistic log
  ------------------------------------
  SELECT COALESCE(MAX(counter), 0) + 1
    INTO v_counter
    FROM frs9_statistic
   WHERE sp_name  = param_prc_name
     AND prc_name = param_prc_name;

  INSERT INTO frs9_statistic (
    prc_date, sp_name, start_date,
    iscomplete, counter, prc_name,
    sessionid, remark
  )
  SELECT
    currdate,
    param_prc_name,
    NOW(),
    'N',
    v_counter,
    param_prc_name,
    v_sessionid,
    'RUNNING'
  FROM frs9_prc_date;


  ------------------------------------
  -- 4. Execute child procedures
  ------------------------------------
  
  --   RAISE NOTICE 'Executing: %', v_param;
  
  CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_start_ecl', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_account_id', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_master_account', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_segment_query', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_master_account_prev', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_update_portfolio',param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_initial_update',  param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_master_account_repo', param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_master_account_wo',   param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_master_exchange_rate',param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_ia_update_ima',   param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_ia_result_h',     param_prc_name, v_currdate, v_param, 'Y');
  CALL sp_frs9_exec_and_log('sp_frs9_imp_ia_result_d',     param_prc_name, v_currdate, v_param, 'Y');

  ------------------------------------
  -- 5. Month‐end conditional block
  -----------------------------------
  IF v_currdate = (date_trunc('month', v_currdate) + INTERVAL '1 month' - INTERVAL '1 day')::DATE THEN

    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_default_rule', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_exec_rule_stage', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_imp_ca_model_sequence();

    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_generate_fma',  param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_account_event',param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_scenario_ead', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_ead_paym_avg', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_schd_hist_reset', param_prc_name, v_currdate, v_param, 'Y');

    IF is_paym_fromcore THEN
      CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_schd_from_stg', param_prc_name, v_currdate, v_param, 'Y');
    ELSE
      CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_schd', param_prc_name, v_currdate, v_param, 'Y');
    END IF;

    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_schd_hist', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_schd_from_upld', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_result_d', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_result_h', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_update_ima', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_update_ima', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_journal_data', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_movement_data', param_prc_name, v_currdate, v_param, 'Y');
    CALL sp_frs9_exec_and_log('sp_frs9_imp_nominative', param_prc_name, v_currdate, v_param, 'Y');

  END IF;


  ------------------------------------
  -- 6. Finalize & log success
  ------------------------------------
--   CALL sp_frs9_exec_and_log('sp_frs9_imp_ca_finish_ecl', param_prc_name, v_currdate, v_param, 'Y');

  UPDATE frs9_prc_date
     SET batch_status = 'FINISHED',
         remark       = 'IMP SEQUENCE';

  UPDATE frs9_statistic
     SET end_date          = NOW(),
         iscomplete        = 'Y',
         prc_process_time  = fn_frs9_getprocesstime(start_date::TIMESTAMP, NOW()::TIMESTAMP),
         remark            = 'SUCCEED'
   WHERE prc_date  = v_currdate
     AND sp_name   = param_prc_name
     AND prc_name  = param_prc_name
     AND sessionid = v_sessionid::text;

END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_sequence() OWNER TO postgres;

--
-- Name: sp_frs9_imp_update_ima(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_update_ima(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $_$
DECLARE
  -- Step 1: Initialization
  v_currdate DATE := p_prc_date;
  v_table_name TEXT;
  v_qry TEXT;
BEGIN
  
  -- Step 2: Resolve Active ECL Model
  SELECT pkid INTO p_ecl_model_id
  FROM frs9_imp_ca_ecl_configh
  WHERE (active_flag IS TRUE AND p_ecl_model_id = 0) OR pkid = p_ecl_model_id
  LIMIT 1;

  -- Step 3: Determine Target Table
  IF p_prc = 'M' THEN
    v_table_name := 'frs9_master_account';
  ELSE
    v_table_name := 'tmp_fma_preview';
  END IF;

  -- Step 4: Build and Execute Update Query
  v_qry := format($f$
  UPDATE %I AS A
  SET
    ecl_model_id = %L,
    ecl_final_amt = 
      CASE
        WHEN impaired_status = 'C' THEN COALESCE(ecl_ca_onbs_amt, 0)
        ELSE COALESCE(ecl_ia_onbs_amt, 0)
      END,
    ecl_ending_balance = 
      CASE
        WHEN impaired_status = 'C' THEN COALESCE(ecl_ca_onbs_amt, 0)
        ELSE COALESCE(ecl_ia_onbs_amt, 0)
      END,
    ecl_charge = 
      CASE
        WHEN impaired_status = 'C' THEN
          CASE
            WHEN ecl_beginning_balance < COALESCE(ecl_ca_onbs_amt, 0) THEN COALESCE(ecl_ca_onbs_amt, 0) - ecl_beginning_balance
            ELSE 0
          END
        ELSE
          CASE
            WHEN ecl_beginning_balance < COALESCE(ecl_ia_onbs_amt, 0) THEN COALESCE(ecl_ia_onbs_amt, 0) - ecl_beginning_balance
            ELSE 0
          END
        END,
      ecl_writeback = 
        CASE
          WHEN impaired_status = 'C' THEN
            CASE
              WHEN ecl_beginning_balance > COALESCE(ecl_ca_onbs_amt, 0) THEN ecl_beginning_balance - COALESCE(ecl_ca_onbs_amt, 0)
              ELSE 0
            END
        ELSE
          CASE
            WHEN ecl_beginning_balance > COALESCE(ecl_ia_onbs_amt, 0) THEN ecl_beginning_balance - COALESCE(ecl_ia_onbs_amt, 0)
            ELSE 0
          END
        END
    WHERE prc_date = %L AND account_status IN ('A', 'R')
    $f$, v_table_name, p_ecl_model_id, v_currdate);

  EXECUTE v_qry;
    
END;
$_$;


ALTER PROCEDURE public.sp_frs9_imp_update_ima(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_imp_update_portfolio(date, text, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_imp_update_portfolio(IN p_prc_date date, IN p_prc text DEFAULT 'M'::text, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_segment_id TEXT;
    v_str_sql TEXT;
    v_group_segment TEXT;
    v_segment TEXT;
    v_sub_segment TEXT;
    v_condition TEXT;
    v_currdate TEXT := TO_CHAR(p_prc_date, 'YYYY-MM-DD');
    v_str_query TEXT;
    v_tablename TEXT;
    rec RECORD;
BEGIN
    -- Step 1: Determine working table
    v_tablename := 
      CASE p_prc
        WHEN 'M' THEN 'frs9_master_account'
        ELSE 'tmp_fma_preview'
      END;
      
--     RAISE NOTICE 'Table Name: %',v_tablename; RETURN;
    
    -- Step 2: Clear segmentation fields for this PRC_DATE
    v_str_query := FORMAT(
        'UPDATE %I SET sub_segment = NULL, segment = NULL, group_segment = NULL, segment_id = NULL WHERE prc_date = %L',
        v_tablename, v_currdate
    );

    RAISE NOTICE 'Clear segmentation fields: %',v_str_query;    
    EXECUTE v_str_query;
--     RETURN;


    -- Step 3: Loop through applicable portfolio segments
    FOR rec IN
        SELECT DISTINCT
            segment_id,
            group_segment,
            segment,
            sub_segment,
            condition
        FROM frs9_imp_ca_segment_query
        WHERE segment_type = 'PF'
    LOOP
      -- Debug rec     
--       RAISE NOTICE E'
--         Segment Debug:
--        - segment_id    = %  
--        - group_segment = %  
--        - segment       = %  
--        - sub_segment   = %  
--        - condition     = %', 
--           rec.segment_id,
--           rec.group_segment,
--           rec.segment,
--           rec.sub_segment,
--           rec.condition;
                    
      -- Step 4: Build and execute update per segment
      v_str_sql := format(
        'UPDATE %I SET sub_segment = %L, segment = %L, group_segment = %L, segment_id = %L WHERE (%s) AND prc_date = %L',
        v_tablename,
        rec.sub_segment,
        rec.segment,
        rec.group_segment,
        rec.segment_id,
        rec.condition,
        v_currdate
      );

      RAISE NOTICE 'Update per segment: %',v_str_sql;
      EXECUTE v_str_sql;

    END LOOP;
END;
$$;


ALTER PROCEDURE public.sp_frs9_imp_update_portfolio(IN p_prc_date date, IN p_prc text, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_master_account(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_master_account(IN p_prc_date date DEFAULT NULL::date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$ DECLARE
v_currdate DATE;
BEGIN
  -- Resolve current processing date
  SELECT COALESCE
    (p_prc_date, currdate) INTO v_currdate
  FROM
    frs9_prc_date;
    
    -- Optional cleanup — uncomment if re-enabled
    -- UPDATE stg_master_loan
    -- SET grace_start_date = NULL,
    --     grace_end_date = NULL,
    --     grace_period_months = NULL
    -- WHERE download_date = v_currdate
    --   AND grace_period_months = 999999;
    -- Delete existing snapshot
    DELETE FROM frs9_master_account
    WHERE prc_date = v_currdate :: DATE;
    
    CALL sp_reset_sequence ('frs9_master_account', 'pkid', 'Y');
    
    
    WITH cleaned AS (
      SELECT
        a.prc_date,
        TRIM(a.account_number) AS account_number_trim,
        b.account_id,
        TRIM(a.facility_number) AS facility_number,
        TRIM(a.cif_number) AS cif_number,
        TRIM(a.cif_name) AS cif_name,
        TRIM(a.account_status) AS account_status,
        TRIM(a.data_source) AS data_source,
        TRIM(a.prd_group) AS prd_group,
        TRIM(a.prd_type) AS prd_type,
        TRIM(a.prd_code) AS prd_code,
        TRIM(a.branch_code) AS branch_code,
        a.tenor_org,
        a.start_date,
        a.maturity_date,
        a.paid_off_date,
        a.write_off_date,
        a.first_payment_date,
        a.next_payment_date,
        a.last_payment_date,
        TRIM(a.grace_type) AS grace_type,
        a.grace_start_date,
        a.grace_end_date,
        a.interest_rate,
        a.eff_interest_rate,
        a.collectability,
        a.dpd,
        TRIM(a.ext_rating_code_initial) AS ext_rating_code_initial,
        TRIM(a.ext_rating_agency_initial) AS ext_rating_agency_initial,
        TRIM(a.ext_rating_code) AS ext_rating_code,
        TRIM(a.ext_rating_agency) AS ext_rating_agency,
        TRIM(a.payment_code) AS payment_code,
        TRIM(a.payment_term) AS payment_term,
        a.payment_freq,
        TRIM(a.int_pmt_term) AS int_pmt_term,
        a.int_pmt_freq,
        a.npl_flag,
        a.npl_date,
        a.restructure_flag,
        a.restructure_date,
        a.restructure_review_date,
        TRIM(a.group_segment) AS group_segment,
        TRIM(a.segment) AS segment,
        TRIM(a.sub_segment) AS sub_segment,
        TRIM(a.interest_base) AS interest_base,
        TRIM(a.asset_class) AS asset_class,
        TRIM(a.currency) AS currency,
        a.exchange_rate,
        a.plafond,
        a.unused_amt,
        a.outstanding,
        a.outstanding_wo,
        a.accrued_interest,
        a.installment_amt,
        a.fix_principal_amt,
        a.fix_interest_amt,
        c.impaired_flag,
        CAST(TRIM(a.account_status) = 'REPO' AS BOOLEAN) AS is_repo,
        ROW_NUMBER() OVER (PARTITION BY b.account_id ORDER BY b.account_id) AS rn
      FROM stg_frs9_master_account_bpf a
      JOIN frs9_account_id b ON TRIM(a.account_number) = b.account_number
      LEFT JOIN frs9_param_product c
        ON TRIM(a.prd_group) = TRIM(c.prd_group)
       AND TRIM(a.prd_code) = TRIM(c.prd_code)
       AND (TRIM(a.currency) = TRIM(c.currency) OR c.currency = 'ALL')
      WHERE a.prc_date = v_currdate
    )
    
    INSERT INTO frs9_master_account (
      prc_date,
      account_id,
      account_number,
      facility_number,
      cif_number,
      cif_name,
      account_status,
      data_source,
      prd_group,
      prd_type,
      prd_code,
      branch_code,
      tenor_org,
      start_date,
      maturity_date,
      paid_off_date,
      write_off_date,
      first_payment_date,
      next_payment_date,
      last_payment_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      interest_rate,
      eff_interest_rate,
      collectability,
      dpd,
      ext_rating_code_initial,
      ext_rating_agency_initial,
      ext_rating_code,
      ext_rating_agency,
      payment_code,
      payment_term,
      payment_freq,
      int_pmt_term,
      int_pmt_freq,
      npl_flag,
      npl_date,
      restructure_flag,
      restructure_date,
      restructure_review_date,
      group_segment,
      segment,
      sub_segment,
      interest_base,
      asset_class,
      currency,
      exchange_rate,
      plafond,
      unused_amt,
      outstanding,
      outstanding_wo,
      accrued_interest,
      installment_amt,
      fix_principal_amt,
      fix_interest_amt,
      impaired_flag,
      repo_flag
    )
    SELECT
      v_currdate,
      account_id,
      account_number_trim AS account_number,
      facility_number,
      cif_number,
      cif_name,
      CASE account_status 
        WHEN 'REPO' THEN 'R' 
        WHEN 'WO' THEN 'W' 
        ELSE account_status 
      END AS account_status,
      data_source,
      prd_group,
      prd_type,
      prd_code,
      branch_code,
      tenor_org,
      start_date,
      maturity_date,
      paid_off_date,
      write_off_date,
      first_payment_date,
      next_payment_date,
      last_payment_date,
      grace_type,
      grace_start_date,
      grace_end_date,
      interest_rate,
      eff_interest_rate,
      collectability,
      dpd,
      ext_rating_code_initial,
      ext_rating_agency_initial,
      ext_rating_code,
      ext_rating_agency,
      payment_code,
      payment_term,
      payment_freq,
      int_pmt_term,
      int_pmt_freq,
      npl_flag,
      npl_date,
      restructure_flag,
      restructure_date,
      restructure_review_date,
      group_segment,
      segment,
      sub_segment,
      interest_base,
      asset_class,
      currency,
      exchange_rate,
      plafond,
      unused_amt,
      outstanding,
      outstanding_wo,
      accrued_interest,
      installment_amt,
      fix_principal_amt,
      fix_interest_amt,
      impaired_flag,
      is_repo
    FROM cleaned
    WHERE rn = 1
    ORDER BY account_id;
   
END;
$$;


ALTER PROCEDURE public.sp_frs9_master_account(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_master_account_prev(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_master_account_prev(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_prevdate DATE;
BEGIN
    -- Calculate previous month-end date
    v_prevdate := date_trunc('MONTH', p_prc_date) - INTERVAL '1 day';

    -- Truncate temporary table
    TRUNCATE TABLE tmp_frs9_master_account_prev;

    -- Insert selected rows from master account
    INSERT INTO tmp_frs9_master_account_prev (
        prc_date,
        account_id,
        cif_number,
        facility_number,
        branch_code,
        interest_rate,
        eff_interest_rate,
        maturity_date,
        installment_amt,
        segment_id,
        stage,
        impaired_status,
        outstanding,
        currency,
        exchange_rate,
        ecl_ca_onbs_amt,
        ecl_ca_offbs_amt,
        ecl_ia_onbs_amt,
        ecl_final_amt,
        unwinding_ca_amt,
        unwinding_ia_amt,
        unwinding_ia_sum_amt,
        ecl_beginning_balance,
        ecl_charge,
        ecl_writeback
    )
    SELECT
        a.prc_date,
        a.account_id,
        a.cif_number,
        a.facility_number,
        a.branch_code,
        a.interest_rate,
        a.eff_interest_rate,
        a.maturity_date,
        a.installment_amt,
        a.segment_id,
        a.stage,
        a.impaired_status,
        a.outstanding,
        a.currency,
        a.exchange_rate,
        a.ecl_ca_onbs_amt,
        a.ecl_ca_offbs_amt,
        a.ecl_ia_onbs_amt,
        a.ecl_final_amt,
        a.unwinding_ca_amt,
        a.unwinding_ia_amt,
        a.unwinding_ia_sum_amt,
        a.ecl_beginning_balance,
        a.ecl_charge,
        a.ecl_writeback
    FROM frs9_master_account a
    WHERE a.prc_date = v_prevdate
      AND a.account_status = 'A';
END;
$$;


ALTER PROCEDURE public.sp_frs9_master_account_prev(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_master_account_repo(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_master_account_repo(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 🔁 Step 1: Delete existing records
    DELETE FROM frs9_master_account_repo WHERE prc_date = p_prc_date;

    -- 📥 Step 2: Insert new records
    INSERT INTO frs9_master_account_repo (
        prc_date,
        repo_date,
        account_id,
        cif_number,
        facility_number,
        outstanding_repo,
        eqv_os_repo,
        createdby,
        createddate
    )
    SELECT 
        p_prc_date,
        p_prc_date AS repo_date,
        a.account_id,
        a.cif_number,
        a.facility_number,
        a.outstanding AS outstanding_repo,
        a.outstanding * a.exchange_rate AS eqv_os_repo,
        'FRS9_MASTER_ACCOUNT_REPO1' AS createdby,
        CURRENT_TIMESTAMP AS createddate
    FROM frs9_master_account a
    LEFT JOIN frs9_master_account_repo r ON r.account_id = a.account_id
    WHERE a.prc_date = p_prc_date AND a.repo_flag AND r.account_id IS NULL;
    
END;
$$;


ALTER PROCEDURE public.sp_frs9_master_account_repo(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_master_account_wo(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_master_account_wo(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_eom_date DATE := fn_eomonth(p_prc_date,0);
BEGIN
    -- Step 1: Delete existing records for the month-end of p_prc_date
    DELETE FROM frs9_master_account_wo
    WHERE prc_date = v_eom_date;

    -- Step 2: Insert new write-off records from frs9_master_account
    WITH new_wo_accounts AS (
        SELECT
            v_eom_date                         AS prc_date,
            a.prc_date                         AS wo_date,
            a.account_id,
            a.cif_number,
            a.facility_number,
            a.outstanding                      AS outstanding_wo,
            a.outstanding * a.exchange_rate    AS eqv_os_wo,
            'sp_frs9_master_account_wo'        AS createdby,
            CURRENT_TIMESTAMP                  AS createddate
        FROM frs9_master_account a
        LEFT JOIN frs9_master_account_wo x
            ON x.account_id = a.account_id
        WHERE a.prc_date = p_prc_date
          AND a.account_status = 'W'
          AND x.account_id IS NULL
    )
    INSERT INTO frs9_master_account_wo (
        prc_date,
        wo_date,
        account_id,
        cif_number,
        facility_number,
        outstanding_wo,
        eqv_os_wo,
        createdby,
        createddate
    )
    SELECT * FROM new_wo_accounts;

END;
$$;


ALTER PROCEDURE public.sp_frs9_master_account_wo(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_master_exchange_rate(date, character, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_frs9_master_exchange_rate(IN p_prc_date date, IN p_prc character DEFAULT 'M'::bpchar, IN p_ecl_model_id integer DEFAULT 0)
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Step 1: Delete existing exchange rate records for the given date
    DELETE FROM frs9_master_exchange_rate
    WHERE prc_date = p_prc_date;

    -- Step 2: Insert aggregated exchange rates from active accounts
    INSERT INTO frs9_master_exchange_rate (
        prc_date,
        currency,
        exchange_rate,
        createdby,
        createddate
    )
    SELECT 
        a.prc_date,
        a.currency,
        MAX(a.exchange_rate),
        'SP_FRS9_MASTER_EXCHANGE_RATE',
        CURRENT_TIMESTAMP
    FROM frs9_master_account a
    WHERE a.prc_date = p_prc_date
      AND a.account_status = 'A'
    GROUP BY 
        a.prc_date,
        a.currency;
END;
$$;


ALTER PROCEDURE public.sp_frs9_master_exchange_rate(IN p_prc_date date, IN p_prc character, IN p_ecl_model_id integer) OWNER TO postgres;

--
-- Name: sp_frs9_preview_sequence(character varying, jsonb, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sp_frs9_preview_sequence(p_configheader character varying, p_preview_data jsonb DEFAULT NULL::jsonb, p_calculation_date date DEFAULT CURRENT_DATE) RETURNS TABLE(sequence_no integer, field_name character varying, field_value character varying, calculated_value numeric, simulation_result jsonb, execution_time_ms integer)
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_execution_ms INTEGER;
    v_config_exists INTEGER;
    detail_record RECORD;
BEGIN
    -- Record start time
    v_start_time := clock_timestamp();
    
    -- Log simulation start
    RAISE NOTICE '[SIMULATION] Starting ECL configuration simulation for: %', p_configheader;
    RAISE NOTICE '[SIMULATION] Preview data: %', p_preview_data;
    RAISE NOTICE '[SIMULATION] Calculation date: %', p_calculation_date;
    
    -- Verify configuration exists
    SELECT COUNT(*) INTO v_config_exists 
    FROM frs9_imp_ca_ecl_configh 
    WHERE configheader = p_configheader AND active_flag = true;
    
    IF v_config_exists = 0 THEN
        RAISE EXCEPTION 'ECL Configuration not found or inactive: %', p_configheader;
    END IF;
    
    -- Process each configuration detail with simulation logic
    FOR detail_record IN 
        SELECT 
            d.sequence_no,
            d.field_name,
            d.field_value,
            d.data_type,
            d.validation_rule,
            d.min_value,
            d.max_value,
            d.default_value
        FROM frs9_imp_ca_ecl_configd d
        WHERE d.configheader = p_configheader 
          AND d.active_flag = true
        ORDER BY d.sequence_no
    LOOP
        -- Calculate execution time for each step
        v_end_time := clock_timestamp();
        v_execution_ms := EXTRACT(MILLISECONDS FROM (v_end_time - v_start_time))::INTEGER;
        
        -- Return simulation result for each detail
        RETURN QUERY SELECT
            detail_record.sequence_no,
            detail_record.field_name,
            detail_record.field_value,
            -- Simple simulation calculation (can be enhanced with complex business logic)
            CASE 
                WHEN detail_record.data_type = 'NUMBER' AND detail_record.field_value ~ '^[0-9]+\.?[0-9]*$' THEN
                    detail_record.field_value::DECIMAL(18,4) * 1.1 -- 10% adjustment simulation
                WHEN detail_record.min_value IS NOT NULL THEN
                    detail_record.min_value
                ELSE 0.0
            END,
            -- Simulation metadata
            jsonb_build_object(
                'simulated', true,
                'calculation_date', p_calculation_date,
                'data_type', detail_record.data_type,
                'validation_rule', detail_record.validation_rule,
                'preview_data_used', p_preview_data IS NOT NULL,
                'execution_sequence', detail_record.sequence_no
            ),
            v_execution_ms;
            
        -- Reset timer for next iteration
        v_start_time := clock_timestamp();
    END LOOP;
    
    RAISE NOTICE '[SIMULATION] ECL configuration simulation completed for: %', p_configheader;
    
END;
$_$;


ALTER FUNCTION public.sp_frs9_preview_sequence(p_configheader character varying, p_preview_data jsonb, p_calculation_date date) OWNER TO postgres;

--
-- Name: sp_reset_sequence(text, text, character); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_reset_sequence(IN table_name text, IN col_id text DEFAULT 'pkid'::text, IN debug_flag character DEFAULT 'N'::bpchar)
    LANGUAGE plpgsql
    AS $$
DECLARE
    seq_name TEXT;
    next_val BIGINT;
    full_query TEXT;
BEGIN
    -- Get the sequence linked to the pkid column
    SELECT pg_get_serial_sequence(table_name, col_id)
    INTO seq_name;

    IF seq_name IS NULL THEN
        RAISE NOTICE 'No serial sequence found for %.%', table_name, col_id;
        RETURN;
    END IF;

    -- Build and execute dynamic SQL to reset the sequence
    full_query := format(
        'SELECT setval(''%s'', (SELECT COALESCE(MAX(%s), 0) + 1 FROM %I), false)',
        seq_name,
        col_id,
        table_name
    );

    EXECUTE full_query INTO next_val;

    IF debug_flag = 'Y' THEN
        RAISE NOTICE 'Reset sequence % to %', seq_name, next_val;
    END IF;

    -- Optional: log_proc_step('Sequence reset', next_val); if you want auditing
END;
$$;


ALTER PROCEDURE public.sp_reset_sequence(IN table_name text, IN col_id text, IN debug_flag character) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_actions; Type: TABLE; Schema: approval; Owner: postgres
--

CREATE TABLE approval.approval_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    approver_role character varying(100),
    level integer NOT NULL,
    action character varying(20) NOT NULL,
    comment text,
    conditions text,
    delegated_to uuid,
    delegation_reason text,
    risk_assessment jsonb,
    risk_score integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE approval.approval_actions OWNER TO postgres;

--
-- Name: approval_levels; Type: TABLE; Schema: approval; Owner: postgres
--

CREATE TABLE approval.approval_levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matrix_id uuid NOT NULL,
    level integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    required_roles jsonb NOT NULL,
    required_count integer DEFAULT 1 NOT NULL,
    max_amount integer,
    conditions jsonb,
    timeout_hours integer DEFAULT 24,
    can_delegate boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE approval.approval_levels OWNER TO postgres;

--
-- Name: approval_matrices; Type: TABLE; Schema: approval; Owner: postgres
--

CREATE TABLE approval.approval_matrices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    name character varying(255) NOT NULL,
    description text,
    entity_type character varying(100) NOT NULL,
    operation_type character varying(100),
    banking_mode character varying(20),
    amount_thresholds jsonb,
    risk_thresholds jsonb,
    auto_approval_rules jsonb,
    escalation_rules jsonb,
    syariah_board_required boolean DEFAULT false,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE approval.approval_matrices OWNER TO postgres;

--
-- Name: approval_requests; Type: TABLE; Schema: approval; Owner: postgres
--

CREATE TABLE approval.approval_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matrix_id uuid,
    tenant_id uuid NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100),
    title character varying(500) NOT NULL,
    description text,
    request_data jsonb,
    requested_by uuid NOT NULL,
    impact_level character varying(20) DEFAULT 'medium'::character varying,
    current_level integer DEFAULT 1 NOT NULL,
    approvals_required integer DEFAULT 1 NOT NULL,
    approvals_received integer DEFAULT 0 NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    completed_by uuid
);


ALTER TABLE approval.approval_requests OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id integer,
    user_id uuid,
    session_id character varying(255),
    correlation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    description text,
    entity_type character varying(100),
    entity_id character varying(255),
    entity_name character varying(200),
    old_values jsonb,
    new_values jsonb,
    changed_fields jsonb,
    ip_address character varying(45),
    user_agent text,
    request_path character varying(500),
    request_method character varying(10),
    application_name character varying(100),
    module_name character varying(100),
    function_name character varying(100),
    business_date timestamp without time zone,
    calculation_date timestamp without time zone,
    risk_level character varying(20) DEFAULT 'low'::character varying NOT NULL,
    compliance_category character varying(50),
    execution_time_ms integer,
    tenant_id uuid,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE audit.audit_logs OWNER TO postgres;

--
-- Name: calculation_audit_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.calculation_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    calculation_type character varying(100) NOT NULL,
    calculation_date timestamp without time zone NOT NULL,
    parameters jsonb,
    input_summary jsonb,
    output_summary jsonb,
    status character varying(50) NOT NULL,
    error_message text,
    execution_time_ms integer,
    records_processed integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE audit.calculation_audit_logs OWNER TO postgres;

--
-- Name: data_access_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.data_access_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    access_type character varying(50) NOT NULL,
    resource_type character varying(100) NOT NULL,
    resource_id character varying(255),
    record_count integer,
    purpose text,
    ip_address character varying(45),
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE audit.data_access_logs OWNER TO postgres;

--
-- Name: user_activity_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    activity_type character varying(100) NOT NULL,
    description text,
    metadata jsonb,
    ip_address character varying(45),
    user_agent text,
    session_id character varying(255),
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE audit.user_activity_logs OWNER TO postgres;

--
-- Name: email_verification_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.email_verification_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.email_verification_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.password_reset_tokens OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid,
    access_token_id uuid NOT NULL,
    refresh_token_id uuid NOT NULL,
    user_agent text,
    ip_address character varying(45),
    device_type character varying(50),
    device_name character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    last_activity_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    refresh_expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone,
    revoke_reason character varying(100)
);


ALTER TABLE auth.sessions OWNER TO postgres;

--
-- Name: menu_access_log; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_access_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    menu_item_id uuid,
    access_action character varying(50) NOT NULL,
    ip_address character varying(50),
    user_agent text,
    session_id character varying(255),
    response_time_ms integer,
    accessed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE core.menu_access_log OWNER TO postgres;

--
-- Name: menu_categories; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_key character varying(100) NOT NULL,
    category_name character varying(255) NOT NULL,
    category_name_id character varying(255) NOT NULL,
    description text,
    icon_name character varying(100),
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE core.menu_categories OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    category_id uuid,
    menu_key character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    menu_name_id character varying(255),
    url character varying(500),
    page_path character varying(500),
    external_url character varying(500),
    menu_type character varying(20) DEFAULT 'item'::character varying NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0,
    icon character varying(100),
    badge_text character varying(50),
    badge_color character varying(20) DEFAULT 'primary'::character varying,
    module_name character varying(100),
    required_permissions text[],
    banking_types text[] DEFAULT ARRAY['conventional'::text, 'syariah'::text, 'dual'::text],
    banking_type character varying(20) DEFAULT 'all'::character varying,
    is_active boolean DEFAULT true,
    is_visible boolean DEFAULT true,
    is_protected boolean DEFAULT false,
    opens_in_new_tab boolean DEFAULT false,
    description text,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    tenant_id uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid,
    version integer DEFAULT 1,
    last_modified_by uuid
);


ALTER TABLE core.menu_items OWNER TO postgres;

--
-- Name: menu_user_customization; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_user_customization (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    is_favorite boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    custom_display_name character varying(255),
    custom_icon character varying(100),
    custom_color character varying(20),
    custom_order integer,
    access_count integer DEFAULT 0,
    last_accessed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE core.menu_user_customization OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    resource character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    module character varying(50) DEFAULT 'core'::character varying NOT NULL,
    category character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.permissions OWNER TO postgres;

--
-- Name: role_menu_access; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.role_menu_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    can_view boolean DEFAULT true,
    can_create boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    can_approve boolean DEFAULT false,
    is_favorite boolean DEFAULT false,
    custom_display_name character varying(255),
    custom_icon character varying(100),
    custom_order integer,
    granted_at timestamp with time zone DEFAULT now(),
    granted_by uuid,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid
);


ALTER TABLE core.role_menu_access OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    granted_by uuid,
    granted_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id integer,
    role_code character varying(50) NOT NULL,
    role_name character varying(100) NOT NULL,
    description text,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    banking_type_specific character varying(20),
    compliance_level character varying(50),
    hierarchy_level integer DEFAULT 1 NOT NULL,
    is_system_role boolean DEFAULT false NOT NULL,
    tenant_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE core.roles OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100),
    description text,
    type character varying(50) DEFAULT 'banking'::character varying,
    banking_mode character varying(20) DEFAULT 'conventional'::character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.tenants OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    banking_type_restriction character varying(20),
    is_temporary boolean DEFAULT false NOT NULL,
    temporary_reason text,
    tenant_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    first_name character varying(100),
    last_name character varying(100),
    phone character varying(20),
    department character varying(100),
    "position" character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    is_email_verified boolean DEFAULT false NOT NULL,
    last_login_at timestamp without time zone,
    password_changed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_platform_admin boolean DEFAULT false NOT NULL
);


ALTER TABLE core.users OWNER TO postgres;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: FRS9_IMP_CA_LGD_CONFIG; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9."FRS9_IMP_CA_LGD_CONFIG" (
    "LGD_CONFIG_ID" integer NOT NULL,
    "POPULATION_TYPE" character varying(100),
    "OBSERVATION_PERIOD" integer,
    "OBSERVATION_START_DATE" date,
    "OBSERVATION_END_DATE" date,
    "STATUS" character varying(50)
);


ALTER TABLE ifrs9."FRS9_IMP_CA_LGD_CONFIG" OWNER TO postgres;

--
-- Name: FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9."FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9."FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq" OWNER TO postgres;

--
-- Name: FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9."FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq" OWNED BY ifrs9."FRS9_IMP_CA_LGD_CONFIG"."LGD_CONFIG_ID";


--
-- Name: FRS9_IMP_CA_PD_CONFIG; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9."FRS9_IMP_CA_PD_CONFIG" (
    "PD_CONFIG_ID" integer NOT NULL,
    "POPULATION_TYPE" character varying(100),
    "OBSERVATION_PERIOD" integer,
    "OBSERVATION_START_DATE" date,
    "OBSERVATION_END_DATE" date,
    "STATUS" character varying(50)
);


ALTER TABLE ifrs9."FRS9_IMP_CA_PD_CONFIG" OWNER TO postgres;

--
-- Name: FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9."FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9."FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq" OWNER TO postgres;

--
-- Name: FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9."FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq" OWNED BY ifrs9."FRS9_IMP_CA_PD_CONFIG"."PD_CONFIG_ID";


--
-- Name: FRS9_IMP_CA_PD_ENR; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9."FRS9_IMP_CA_PD_ENR" (
    "PRC_DATE" date,
    "BUCKET_FROM" character varying(50),
    "CALC_AMOUNT" numeric(20,2)
);


ALTER TABLE ifrs9."FRS9_IMP_CA_PD_ENR" OWNER TO postgres;

--
-- Name: FRS9_IMP_CA_PD_MMULT; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9."FRS9_IMP_CA_PD_MMULT" (
    "PD_CONFIG_ID" integer,
    "MATRIX_TYPE" character varying(50),
    "MATRIX_VALUE" numeric(10,4)
);


ALTER TABLE ifrs9."FRS9_IMP_CA_PD_MMULT" OWNER TO postgres;

--
-- Name: frs9_account_id; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_account_id (
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    createdby character varying(36) DEFAULT 'SYSTEM'::character varying,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE ifrs9.frs9_account_id OWNER TO postgres;

--
-- Name: frs9_account_id_account_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_account_id_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_account_id_account_id_seq OWNER TO postgres;

--
-- Name: frs9_account_id_account_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_account_id_account_id_seq OWNED BY ifrs9.frs9_account_id.account_id;


--
-- Name: frs9_amort_journal_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_amort_journal_data (
    id bigint NOT NULL,
    prc_date date,
    account_id bigint,
    facno character varying(50),
    cifno character varying(50),
    acctno character varying(70),
    datasource character varying(20),
    prdtype character varying(20),
    prdcode character varying(20),
    trxcode character varying(20),
    ccy character varying(10),
    journalcode character varying(20),
    journalcode2 character varying(10),
    status character varying(20),
    reverse character varying(3),
    flag_cf character varying(3),
    drcr character varying(2),
    glno character varying(20),
    n_amount numeric(32,6),
    n_amount_idr numeric(32,6),
    sourceprocess character varying(20),
    intmid bigint,
    branch character varying(20),
    noref character varying(20),
    valctr_code character varying(50),
    journal_desc character varying(200),
    createddate timestamp without time zone,
    createdby character varying(30),
    gl_internal_code character varying(100),
    method character varying(10),
    reserved_varchar_1 character varying(100),
    reserved_varchar_2 character varying(100),
    reserved_varchar_3 character varying(100),
    gl_costcenter character varying(10)
);


ALTER TABLE ifrs9.frs9_amort_journal_data OWNER TO postgres;

--
-- Name: frs9_amort_journal_data_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_amort_journal_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_amort_journal_data_id_seq OWNER TO postgres;

--
-- Name: frs9_amort_journal_data_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_amort_journal_data_id_seq OWNED BY ifrs9.frs9_amort_journal_data.id;


--
-- Name: frs9_default; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_default (
    prc_date date,
    account_id bigint,
    rule_id bigint,
    os_at_default numeric(32,6),
    eqv_at_default numeric(32,6),
    eir_at_default double precision,
    createdby character varying(100),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE ifrs9.frs9_default OWNER TO postgres;

--
-- Name: frs9_ecl_model_mapping; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_ecl_model_mapping (
    pkid smallint NOT NULL,
    ecl_model_id smallint,
    eff_date date,
    pf_segment_id smallint,
    pf_segment_name character varying(36),
    pd_model_id smallint,
    lgd_model_id smallint,
    ead_model_id smallint,
    ccf_model_id smallint,
    pp_model_id smallint,
    lt_model_id smallint
);


ALTER TABLE ifrs9.frs9_ecl_model_mapping OWNER TO postgres;

--
-- Name: frs9_ecl_model_mapping_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ifrs9.frs9_ecl_model_mapping ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME ifrs9.frs9_ecl_model_mapping_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_eir_ecf; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_eir_ecf (
    id bigint NOT NULL,
    account_id bigint,
    prc_date date,
    n_loan_amt numeric(32,6),
    n_int_rate double precision,
    n_eff_int_rate double precision,
    startamortdate date,
    endamortdate date,
    gracedate date,
    disb_percentage double precision,
    disb_amount numeric(32,6),
    plafond numeric(32,6),
    paymentcode character varying(3),
    intcalccode character varying(3),
    paymentterm character varying(3),
    isgrace character varying(3),
    billing_date date,
    prev_pmt_date date,
    pmt_date date,
    i_days bigint,
    i_days2 bigint,
    counter_rest bigint,
    counter integer,
    prev_rest_balance numeric(32,6),
    rest_balance numeric(32,6),
    n_osprn_prev numeric(32,6),
    n_osprn numeric(32,6),
    n_installment numeric(32,6),
    n_prn_payment numeric(32,6),
    n_int_payment numeric(32,6),
    n_accru_int numeric(32,6),
    n_fairvalue_prev numeric(32,6),
    n_eff_int_amt numeric(32,6),
    n_fairvalue numeric(32,6),
    n_unamort_amt_prev numeric(32,6),
    n_amort_amt numeric(32,6),
    n_unamort_amt numeric(32,6),
    n_cost_unamort_amt_prev numeric(32,6),
    n_cost_amort_amt numeric(32,6),
    n_cost_unamort_amt numeric(32,6),
    n_fee_unamort_amt_prev numeric(32,6),
    n_fee_amort_amt numeric(32,6),
    n_fee_unamort_amt numeric(32,6),
    n_gain_loss_unamort_amt_prev numeric(32,6),
    n_gain_loss_amort_amt numeric(32,6),
    n_gain_loss_unamort_amt numeric(32,6),
    amortstopdate date,
    amortstopmsg character varying(50),
    n_daily_amort_cost numeric(32,6),
    n_daily_amort_fee numeric(32,6),
    n_daily_gain_loss numeric(32,6),
    n_eff_int_amt0 numeric(32,6),
    n_eff_int_rate0 double precision,
    n_daily_int_adj_amt numeric(32,6),
    n_int_adj_amt numeric(32,6),
    sw_adj_cost numeric(32,6),
    sw_adj_fee numeric(32,6),
    npv_rate numeric(14,10),
    npv_amount numeric(32,6),
    nocf_osprn numeric(32,6),
    nocf_osprn_prev numeric(32,6),
    nocf_int_rate double precision,
    nocf_prn_payment numeric(32,6),
    nocf_eff_int_amt numeric(32,6),
    nocf_unamort_amt_prev numeric(32,6),
    nocf_amort_amt numeric(32,6),
    nocf_unamort_amt numeric(32,6)
);


ALTER TABLE ifrs9.frs9_eir_ecf OWNER TO postgres;

--
-- Name: frs9_eir_ecf_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_eir_ecf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_eir_ecf_id_seq OWNER TO postgres;

--
-- Name: frs9_eir_ecf_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_eir_ecf_id_seq OWNED BY ifrs9.frs9_eir_ecf.id;


--
-- Name: frs9_event_changes; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_event_changes (
    prc_date timestamp without time zone,
    account_id bigint,
    account_number character varying(70),
    effective_date timestamp without time zone,
    before_value character varying(100),
    after_value character varying(100),
    event_id bigint,
    remarks character varying(100),
    createdby character varying(50),
    created_date timestamp without time zone
);


ALTER TABLE ifrs9.frs9_event_changes OWNER TO postgres;

--
-- Name: frs9_imp_ca_account_event; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_account_event (
    prc_date date,
    account_id bigint,
    event_id smallint,
    old_value character varying(100),
    new_value character varying(100),
    remarks character varying(100),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_account_event OWNER TO postgres;

--
-- Name: frs9_imp_ca_account_event_prv; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_account_event_prv (
    prc_date date,
    account_id bigint NOT NULL,
    event_id smallint,
    old_value character varying(100),
    new_value character varying(100),
    remarks character varying(100),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_account_event_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ead (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(32,6),
    next_interest numeric(32,6),
    ead_amt numeric(32,6)
);


ALTER TABLE ifrs9.frs9_imp_ca_ead OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ead_config (
    pkid smallint NOT NULL,
    ead_model_name character varying(250),
    segment_id smallint,
    ead_method character varying(10),
    calc_method character varying(10),
    active_flag boolean NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_ead_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_ead_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_ead_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_ead_config_pkid_seq OWNED BY ifrs9.frs9_imp_ca_ead_config.pkid;


--
-- Name: frs9_imp_ca_ead_paym_avg; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ead_paym_avg (
    prc_date date,
    segment_id bigint,
    tenor smallint,
    counter smallint,
    paym_avg double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_ead_paym_avg OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ecl_configd (
    pkid smallint NOT NULL,
    ecl_model_id smallint,
    pf_segment_id smallint,
    stage_rule_id smallint,
    pd_model_id smallint,
    lgd_model_id smallint,
    ead_model_id smallint,
    overlay_rate smallint DEFAULT 100,
    period_type smallint,
    period_date date,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_ecl_configd OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configd_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_ecl_configd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_ecl_configd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_ecl_configd_pkid_seq OWNED BY ifrs9.frs9_imp_ca_ecl_configd.pkid;


--
-- Name: frs9_imp_ca_ecl_configh; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ecl_configh (
    pkid smallint NOT NULL,
    ecl_model_name character varying(50),
    module character varying(10),
    effective_date date NOT NULL,
    active_flag boolean NOT NULL,
    last_run_period date,
    last_run_status character varying(50),
    last_run_date timestamp without time zone,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_ecl_configh OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configh_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_ecl_configh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_ecl_configh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_ecl_configh_pkid_seq OWNED BY ifrs9.frs9_imp_ca_ecl_configh.pkid;


--
-- Name: frs9_imp_ca_ecl_detail; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ecl_detail (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    start_date date,
    maturity_date date,
    branch_code character varying(50),
    prd_code character varying(20),
    remaining_tenor smallint,
    expected_life smallint,
    interest_rate double precision,
    eff_interest_rate double precision,
    outstanding numeric(32,6),
    unused_amt numeric(32,6),
    accrued_interest numeric(32,6),
    installment_amt numeric(32,6),
    impaired_flag boolean,
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    stage character varying(5),
    bucket_id smallint,
    ecl_model_id smallint NOT NULL,
    segment_id smallint,
    ecl_amt_ca_onbs numeric(38,6),
    ecl_amt_ca_offbs numeric(38,6)
);


ALTER TABLE ifrs9.frs9_imp_ca_ecl_detail OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_sum; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ecl_sum (
    prc_date date,
    ecl_model_id smallint NOT NULL,
    segment_id smallint,
    branch_code character varying(50),
    prd_code character varying(20),
    stage character varying(5),
    bucket_id smallint,
    impaired_flag boolean,
    outstanding numeric(38,6),
    unused_amt numeric(38,6),
    accrued_interest numeric(38,6),
    ecl_amt_ca_onbs numeric(38,6),
    ecl_amt_ca_offbs numeric(38,6)
);


ALTER TABLE ifrs9.frs9_imp_ca_ecl_sum OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_ts; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_ecl_ts (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    ecl_model_id smallint NOT NULL,
    segment_id smallint,
    payment_date date,
    mob smallint,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    ead_onbs numeric(32,6),
    ead_offbs numeric(32,6),
    pd_rate double precision,
    lgd_rate double precision,
    ccf_rate double precision,
    prepayment_rate double precision,
    discount_rate double precision,
    ecl_amt_ca_onbs numeric(32,6),
    ecl_amt_ca_offbs numeric(32,6)
);


ALTER TABLE ifrs9.frs9_imp_ca_ecl_ts OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalard; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_fl_scalard (
    pkid smallint NOT NULL,
    scalar_id smallint,
    period smallint,
    weighted_scalar double precision,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_fl_scalard OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalard_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_fl_scalard_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_fl_scalard_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalard_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_fl_scalard_pkid_seq OWNED BY ifrs9.frs9_imp_ca_fl_scalard.pkid;


--
-- Name: frs9_imp_ca_fl_scalarh; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_fl_scalarh (
    pkid smallint NOT NULL,
    scalar_name character varying(30),
    active_flag boolean NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_fl_scalarh OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalarh_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_fl_scalarh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_fl_scalarh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalarh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_fl_scalarh_pkid_seq OWNED BY ifrs9.frs9_imp_ca_fl_scalarh.pkid;


--
-- Name: frs9_imp_ca_lgd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd (
    pkid smallint NOT NULL,
    prc_date date,
    lgd_model_id smallint,
    lgd_model_name character varying(100),
    os_default numeric(32,6),
    eqv_os_default numeric(32,6),
    recovery_amt numeric(32,6),
    eqv_recovery_amt numeric(32,6),
    pv_recovery_amt numeric(32,6),
    pv_eqv_recovery_amt numeric(32,6),
    recovery_rate double precision,
    lgd_rate double precision
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_coll_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_coll_data (
    prc_date date,
    pv_date date,
    account_id bigint,
    sold_flag boolean,
    colla_amt numeric(32,6),
    sell_amt numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_coll_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_config; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_config (
    pkid smallint NOT NULL,
    lgd_model_name character varying(250),
    segment_id bigint,
    lgd_method bigint,
    population_type character varying(10),
    observation_period character varying(50),
    observation_start_date date,
    workout_period integer,
    fl_flag boolean NOT NULL,
    fl_scalar_id smallint,
    lgd_rate double precision,
    active_flag boolean,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_config_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_lgd_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_lgd_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_lgd_config_pkid_seq OWNED BY ifrs9.frs9_imp_ca_lgd_config.pkid;


--
-- Name: frs9_imp_ca_lgd_d; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    rec_rate double precision,
    lgd double precision,
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_d OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_data (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_at_default numeric(32,6),
    wo_date date,
    closed_date date,
    account_status character(1),
    eqv_wo numeric(32,6),
    eir_at_default double precision,
    createdby character varying(36),
    createddate timestamp without time zone,
    updatedby character varying(100),
    updateddate timestamp without time zone,
    repo_date date,
    eqv_repo numeric(32,6)
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_h; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_h (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    model_id bigint,
    eqv_os numeric(32,6),
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    rec_rate double precision,
    lgd double precision,
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_h OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ifrs9.frs9_imp_ca_lgd ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME ifrs9.frs9_imp_ca_lgd_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_imp_ca_lgd_rec_d; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_rec_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eir double precision,
    seq smallint,
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone,
    rn integer
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_rec_d OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_rec_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_lgd_rec_data (
    prc_date date,
    default_rule_id bigint,
    account_id bigint,
    rec_os numeric(32,6),
    eqv_rec_os numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_lgd_rec_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_config; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_config (
    pkid smallint NOT NULL,
    pd_model_name character varying(250),
    segment_id smallint,
    pd_method character varying(10) NOT NULL,
    "interval" smallint NOT NULL,
    population_type character varying(10),
    observation_period smallint NOT NULL,
    observation_start_date date,
    multiplication smallint,
    fl_flag boolean,
    fl_scalar_id smallint,
    ia_flag boolean NOT NULL,
    bucket_group character varying(30),
    active_flag boolean NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_config_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ca_pd_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ca_pd_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ca_pd_config_pkid_seq OWNED BY ifrs9.frs9_imp_ca_pd_config.pkid;


--
-- Name: frs9_imp_ca_pd_enr; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_enr (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    calc_amount numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_enr OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_flowrate; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_flowrate (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    flowrate double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_flowrate OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_flowrate_avg; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_flowrate_avg (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    flowrate double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_flowrate_avg OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_migration; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_migration (
    prc_date date NOT NULL,
    base_date date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_from smallint,
    bucket_to smallint,
    calc_amount numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_migration OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_mmult; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_mmult (
    prc_date date,
    pd_config_id bigint,
    fl_seq smallint,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    mmult double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_mmult OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_odr; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_odr (
    prc_date date,
    base_date date,
    pd_config_id bigint,
    tot_default bigint,
    non_default bigint,
    odr double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_odr OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_proxy; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_proxy (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(50),
    bucket_from smallint,
    bucket_to smallint,
    pd double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_proxy OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_structure; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_structure (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    scalar_id bigint,
    scenario_no integer,
    bucket_group character varying(100),
    bucket_id integer,
    fl_seq integer,
    fl_year integer,
    fl_month integer,
    pd_non_fl double precision,
    pd double precision,
    createddate timestamp without time zone NOT NULL,
    createdby character varying(50),
    weighted_scalar double precision
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_structure OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_ts; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_pd_ts (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    pd_model_id smallint NOT NULL,
    pd_model_name character varying(100),
    bucket_id smallint,
    pd_year smallint,
    pd_month smallint,
    pd_sequence smallint,
    pd_date date,
    pd_rate double precision
);


ALTER TABLE ifrs9.frs9_imp_ca_pd_ts OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_ts_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ifrs9.frs9_imp_ca_pd_ts ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME ifrs9.frs9_imp_ca_pd_ts_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_imp_ca_result_d; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_result_d (
    prc_date date,
    account_id bigint,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    scenario_no smallint,
    fl_seq smallint,
    fl_year smallint,
    fl_motnh smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ead_balance numeric(32,6),
    paym_avg double precision,
    principal_amt numeric(32,6),
    sum_principal_amt numeric(32,6),
    next_interest numeric(32,6),
    sum_next_interest numeric(32,6),
    ead numeric(32,6),
    pd double precision,
    lgd double precision,
    ecl_amount numeric(32,6),
    probability double precision,
    ecl_weighted numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_result_d OWNER TO postgres;

--
-- Name: frs9_imp_ca_result_d_prv; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_result_d_prv (
    prc_date date,
    account_id bigint,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    scenario_no smallint,
    fl_seq smallint,
    fl_year smallint,
    fl_motnh smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ead_balance numeric(32,6),
    paym_avg double precision,
    principal_amt numeric(32,6),
    sum_principal_amt numeric(32,6),
    next_interest numeric(32,6),
    sum_next_interest numeric(32,6),
    ead numeric(32,6),
    pd double precision,
    lgd double precision,
    ecl_amount numeric(32,6),
    probability double precision,
    ecl_weighted numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_result_d_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_result_h; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_result_h (
    prc_date date,
    account_id bigint,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    lgd double precision,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ecl_amount numeric(32,6),
    overlay_amount numeric(32,6),
    ecl_final numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_result_h OWNER TO postgres;

--
-- Name: frs9_imp_ca_result_h_prv; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_result_h_prv (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint NOT NULL,
    pd_config_id bigint,
    lgd_config_id bigint,
    lgd double precision,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ecl_amount numeric(32,6),
    overlay_amount numeric(32,6),
    ecl_final numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_result_h_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_scenario_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_scenario_data (
    prc_date date NOT NULL,
    segment_id integer NOT NULL,
    segment_type character varying(100),
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    account_status character varying(20),
    currency character varying(5),
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    default_flag boolean,
    impaired_status character(1),
    tenor smallint,
    remaining_tenor smallint,
    payment_freq smallint,
    fix_principal_amt numeric(32,6),
    plafond numeric(32,6),
    outstanding numeric(32,6),
    exchange_rate numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone,
    createdhost character varying(50),
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_scenario_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_schd (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_schd OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd_hist; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_schd_hist (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date NOT NULL,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(33,6),
    end_prc_date date,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_schd_hist OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd_prv; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_schd_prv (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date NOT NULL,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ca_schd_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_segment_query; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ca_segment_query (
    segment_id bigint NOT NULL,
    group_segment character varying(50),
    sub_segment character varying(50),
    segment character varying(50),
    table_name character varying(30),
    condition text,
    segment_type character varying(50)
);


ALTER TABLE ifrs9.frs9_imp_ca_segment_query OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_dcf (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    mob bigint NOT NULL,
    periode date NOT NULL,
    principal numeric(32,6) DEFAULT 0 NOT NULL,
    interest numeric(32,6) DEFAULT 0 NOT NULL,
    collateral numeric(32,6) DEFAULT 0 NOT NULL,
    status character(1) NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_ia_dcf OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_dcf_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_dcf_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_dcf_pkid_seq OWNED BY ifrs9.frs9_imp_ia_dcf.pkid;


--
-- Name: frs9_imp_ia_detail; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_detail (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    account_id bigint NOT NULL,
    eff_interest_rate double precision NOT NULL,
    mob bigint NOT NULL,
    periode date NOT NULL,
    principal numeric(32,6) DEFAULT 0 NOT NULL,
    interest numeric(32,6) DEFAULT 0 NOT NULL,
    installment numeric(32,6) DEFAULT 0 NOT NULL,
    collateral numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    rr_rate_1 double precision DEFAULT 0 NOT NULL,
    default_1 numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    rr_rate_2 double precision DEFAULT 0 NOT NULL,
    default_2 numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    rr_rate_3 double precision DEFAULT 0 NOT NULL,
    default_3 numeric(32,6) DEFAULT 0 NOT NULL,
    pw_amt numeric(32,6) DEFAULT 0 NOT NULL,
    discount_factor double precision NOT NULL,
    pv_amt numeric(32,6) DEFAULT 0 NOT NULL,
    beginning_balance numeric(32,6) DEFAULT 0 NOT NULL,
    eir_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ending_balance numeric(32,6) DEFAULT 0 NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_ia_detail OWNER TO postgres;

--
-- Name: frs9_imp_ia_detail_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_detail_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_detail_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_detail_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_detail_pkid_seq OWNED BY ifrs9.frs9_imp_ia_detail.pkid;


--
-- Name: frs9_imp_ia_header; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_header (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    prc_date date NOT NULL,
    eff_date date NOT NULL,
    cif_number character varying(50) NOT NULL,
    cif_name character varying(150) NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    currency character varying(5) NOT NULL,
    eff_interest_rate double precision NOT NULL,
    interest_rate double precision NOT NULL,
    dpd smallint,
    collectability smallint,
    rating_code character varying(5),
    impaired_flag character(1) NOT NULL,
    method character varying(20),
    plafond numeric(32,6) DEFAULT 0 NOT NULL,
    outstanding numeric(32,6) DEFAULT 0 NOT NULL,
    accrued_interest numeric(32,6) DEFAULT 0 NOT NULL,
    carrying_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ead_amt numeric(32,6) DEFAULT 0 NOT NULL,
    pv_dcf_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ecl_ia_amt numeric(32,6) DEFAULT 0 NOT NULL,
    trigger_remarks character varying(1000),
    trigger_filename character varying(100),
    scenario_id smallint,
    n_of_scenario smallint,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    sc_name_1 character varying(20),
    sc_name_2 character varying(20),
    sc_name_3 character varying(20),
    status integer NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30),
    reviewedby character varying(36),
    revieweddate timestamp without time zone,
    reviewedhost character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_ia_header OWNER TO postgres;

--
-- Name: frs9_imp_ia_header_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_header_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_header_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_header_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_header_pkid_seq OWNED BY ifrs9.frs9_imp_ia_header.pkid;


--
-- Name: frs9_imp_ia_result_d; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_result_d (
    pkid bigint NOT NULL,
    ia_id bigint,
    prc_date date,
    account_id bigint,
    mob smallint,
    periode date,
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(32,6),
    collateral numeric(32,6),
    po_rate_1 double precision,
    rr_rate_1 double precision,
    default_1 numeric(32,6),
    po_rate_2 double precision,
    rr_rate_2 double precision,
    default_2 numeric(32,6),
    po_rate_3 double precision,
    rr_rate_3 double precision,
    default_3 numeric(32,6),
    pw_amt numeric(32,6),
    discount_factor double precision,
    pv_amt numeric(32,6),
    beginning_balance numeric(32,6),
    eir_amt numeric(32,6),
    ending_balance numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ia_result_d OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_d_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_result_d_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_result_d_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_d_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_result_d_pkid_seq OWNED BY ifrs9.frs9_imp_ia_result_d.pkid;


--
-- Name: frs9_imp_ia_result_h; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_result_h (
    pkid bigint NOT NULL,
    ia_id bigint,
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    currency character varying(5),
    dpd smallint,
    collectability smallint,
    rating_code character varying(5),
    interest_rate double precision,
    eff_interest_rate double precision,
    outstanding numeric(32,6),
    accrued_interest numeric(32,6),
    carrying_amt numeric(32,6),
    ead_amt numeric(32,6),
    pv_dcf_amt numeric(32,6),
    ecl_ia_amt numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_imp_ia_result_h OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_h_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_result_h_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_result_h_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_h_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_result_h_pkid_seq OWNED BY ifrs9.frs9_imp_ia_result_h.pkid;


--
-- Name: frs9_imp_ia_rr; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_ia_rr (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    account_id bigint NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    rr_rate_1 double precision DEFAULT 0 NOT NULL,
    rr_rate_2 double precision DEFAULT 0 NOT NULL,
    rr_rate_3 double precision DEFAULT 0 NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_ia_rr OWNER TO postgres;

--
-- Name: frs9_imp_ia_rr_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_ia_rr_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_ia_rr_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_rr_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_ia_rr_pkid_seq OWNED BY ifrs9.frs9_imp_ia_rr.pkid;


--
-- Name: frs9_imp_journal_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_journal_data (
    id bigint NOT NULL,
    prc_date date,
    account_id bigint,
    facility_number character varying(50),
    cif_number character varying(50),
    prdcode character varying(50),
    currency character varying(5),
    journalcode character varying(50),
    journalcode2 character varying(50),
    reverse boolean,
    flag_cf character varying(10),
    dbcr character varying(2),
    gl_number character varying(20),
    n_amount numeric(32,6),
    n_amount_idr numeric(32,6),
    sourceprocess character varying(50),
    intmid bigint,
    branch character varying(50),
    noref character varying(20),
    valctr_code character varying(50),
    gl_desc character varying(200),
    gl_costcenter character varying(20),
    createddate timestamp without time zone,
    createdby character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_journal_data OWNER TO postgres;

--
-- Name: frs9_imp_journal_data_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_journal_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_journal_data_id_seq OWNER TO postgres;

--
-- Name: frs9_imp_journal_data_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_journal_data_id_seq OWNED BY ifrs9.frs9_imp_journal_data.id;


--
-- Name: frs9_imp_movement_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_movement_data (
    prc_date date,
    urut integer,
    group_segment character varying(100),
    stage1 numeric(32,6),
    stage2 numeric(32,6),
    stage3 numeric(32,6),
    stage1_i numeric(32,6),
    stage2_i numeric(32,6),
    stage3_i numeric(32,6),
    gca_stage1 numeric(32,6),
    gca_stage2 numeric(32,6),
    gca_stage3 numeric(32,6),
    gca_stage1_i numeric(32,6),
    gca_stage2_i numeric(32,6),
    gca_stage3_i numeric(32,6),
    poci numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone,
    createdhost character varying(30)
);


ALTER TABLE ifrs9.frs9_imp_movement_data OWNER TO postgres;

--
-- Name: frs9_imp_nominative; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_imp_nominative (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    data_source character varying(50),
    account_number character varying(50),
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    start_date date,
    maturity_date date,
    outstanding numeric(32,6),
    currency character varying(5),
    interest_rate double precision,
    dpd smallint,
    ext_rating character varying(5),
    tenor smallint,
    prd_code character varying(20),
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    rating_bucket smallint,
    lgd double precision,
    sicr boolean,
    stage smallint,
    ecl numeric(32,6),
    ecl_coverage double precision
);


ALTER TABLE ifrs9.frs9_imp_nominative OWNER TO postgres;

--
-- Name: frs9_imp_nominative_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_imp_nominative_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_imp_nominative_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_nominative_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_imp_nominative_pkid_seq OWNED BY ifrs9.frs9_imp_nominative.pkid;


--
-- Name: frs9_master_account; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_master_account (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_type character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    gl_group character varying(50),
    branch_code character varying(50),
    tenor_org smallint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    start_amort_date date,
    end_amort_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    market_rate double precision,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    collectability_group smallint,
    dpd smallint,
    dpd_group smallint,
    dpd_counter smallint,
    internal_rating_code_initial character varying(5),
    internal_rating_code character varying(5),
    ext_rating_id_initial smallint,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_id smallint,
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    amortization_type character varying(5),
    pmt_sch_status character varying(5),
    eir_sch_status character varying(5),
    repo_flag boolean,
    revolving_flag boolean,
    bm_flag boolean,
    committed_flag boolean,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    fib_amt numeric(32,6) DEFAULT 0,
    special_case_flag boolean,
    impaired_flag boolean,
    impaired_status character(1),
    segment_id smallint,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    ecl_model_id smallint,
    ead_config_id smallint,
    pd_config_id smallint,
    lgd_config_id smallint,
    sicr_flag boolean,
    stage_original character varying(5),
    stage_override character varying(5),
    stage character varying(5),
    bucket_id_original smallint,
    bucket_id_override smallint,
    bucket_id smallint,
    bucket_id_obligor smallint,
    bucket_id_ed smallint,
    interest_base character varying(2),
    sppi_status character varying(50),
    bm_status character varying(50),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate double precision,
    plafond numeric(32,6) DEFAULT 0,
    full_release_amt numeric(32,6) DEFAULT 0,
    unused_amt numeric(32,6) DEFAULT 0,
    outstanding numeric(32,6) DEFAULT 0,
    outstanding_wo numeric(32,6) DEFAULT 0,
    accrued_interest numeric(32,6) DEFAULT 0,
    installment_amt numeric(32,6) DEFAULT 0,
    fix_principal_amt numeric(32,6) DEFAULT 0,
    fix_interest_amt numeric(32,6) DEFAULT 0,
    initial_fee_amt numeric(32,6) DEFAULT 0,
    unamort_fee_amt numeric(32,6) DEFAULT 0,
    amort_fee_amt numeric(32,6) DEFAULT 0,
    initial_cost_amt numeric(32,6) DEFAULT 0,
    unamort_cost_amt numeric(32,6) DEFAULT 0,
    amort_cost_amt numeric(32,6) DEFAULT 0,
    initial_bm_amt numeric(32,6) DEFAULT 0,
    unamort_bm_amt numeric(32,6) DEFAULT 0,
    amort_bm_amt numeric(32,6) DEFAULT 0,
    initial_gainloss_amt numeric(32,6) DEFAULT 0,
    unamort_gainloss_amt numeric(32,6) DEFAULT 0,
    amort_gainloss_amt numeric(32,6) DEFAULT 0,
    carrying_amt numeric(32,6) DEFAULT 0,
    fair_value_amt numeric(32,6) DEFAULT 0,
    ecl_ca_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_ca_offbs_amt numeric(32,6) DEFAULT 0,
    ecl_ia_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_overlay_amt numeric(32,6) DEFAULT 0,
    ecl_final_amt numeric(32,6) DEFAULT 0,
    unwinding_ca_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_sum_amt numeric(32,6) DEFAULT 0,
    ecl_beginning_balance numeric(32,6) DEFAULT 0,
    ecl_charge numeric(32,6) DEFAULT 0,
    ecl_writeback numeric(32,6) DEFAULT 0,
    ecl_ending_balance numeric(32,6) DEFAULT 0,
    lgd double precision,
    weighted_eff_interest_rate double precision,
    weighted_interest_rate double precision
);


ALTER TABLE ifrs9.frs9_master_account OWNER TO postgres;

--
-- Name: frs9_master_account_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_master_account_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_master_account_pkid_seq OWNER TO postgres;

--
-- Name: frs9_master_account_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_master_account_pkid_seq OWNED BY ifrs9.frs9_master_account.pkid;


--
-- Name: frs9_master_account_repo; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_master_account_repo (
    prc_date date NOT NULL,
    repo_date date NOT NULL,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    outstanding_repo numeric(32,6),
    eqv_os_repo numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.frs9_master_account_repo OWNER TO postgres;

--
-- Name: frs9_master_account_wo; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_master_account_wo (
    prc_date date,
    wo_date date,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    outstanding_wo numeric(32,6),
    eqv_os_wo numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE ifrs9.frs9_master_account_wo OWNER TO postgres;

--
-- Name: frs9_master_exchange_rate; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_master_exchange_rate (
    prc_date date,
    currency character varying(5),
    exchange_rate numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE ifrs9.frs9_master_exchange_rate OWNER TO postgres;

--
-- Name: frs9_master_transaction_cost; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_master_transaction_cost (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    effective_date date,
    data_source character varying(20),
    prd_type character varying(20),
    prd_code character varying(20),
    branch_code character varying(20),
    debet_credit_flag character(1),
    currency_code character varying(5),
    fee_cost_id character varying(1) NOT NULL,
    trx_code character varying(20),
    org_ccy_amt numeric(32,6),
    eqv_lcy_amt numeric(32,6)
);


ALTER TABLE ifrs9.frs9_master_transaction_cost OWNER TO postgres;

--
-- Name: frs9_param_bucketd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_bucketd (
    pkid smallint NOT NULL,
    pkid_header smallint,
    bucket_id smallint,
    bucket_name character varying(100),
    range_start smallint,
    range_end smallint,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_bucketd OWNER TO postgres;

--
-- Name: frs9_param_bucketd_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_bucketd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_bucketd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_bucketd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_bucketd_pkid_seq OWNED BY ifrs9.frs9_param_bucketd.pkid;


--
-- Name: frs9_param_bucketh; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_bucketh (
    pkid smallint NOT NULL,
    bucket_group character varying(30),
    bucket_desc character varying(255),
    basis character varying(20),
    bucket_default smallint,
    closed_flag boolean NOT NULL,
    wo_flag boolean NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_bucketh OWNER TO postgres;

--
-- Name: frs9_param_bucketh_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_bucketh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_bucketh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_bucketh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_bucketh_pkid_seq OWNED BY ifrs9.frs9_param_bucketh.pkid;


--
-- Name: frs9_param_commond; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_commond (
    pkid bigint NOT NULL,
    param_code character varying(50) NOT NULL,
    param_seq integer NOT NULL,
    value1 character varying(100) NOT NULL,
    value2 character varying(100),
    value3 character varying(50),
    paramdesc character varying(1000) NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_commond OWNER TO postgres;

--
-- Name: frs9_param_commond_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_commond_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_commond_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_commond_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_commond_pkid_seq OWNED BY ifrs9.frs9_param_commond.pkid;


--
-- Name: frs9_param_commonh; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_commonh (
    pkid bigint NOT NULL,
    param_code character varying(10),
    param_name character varying(255),
    param_usage character varying(255),
    param_type character varying(10),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50),
    banking_type character varying(20) DEFAULT 'conventional'::character varying,
    is_active boolean DEFAULT true,
    requires_approval boolean DEFAULT false,
    CONSTRAINT chk_banking_type CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text])))
);


ALTER TABLE ifrs9.frs9_param_commonh OWNER TO postgres;

--
-- Name: frs9_param_commonh_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_commonh_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_commonh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_commonh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_commonh_pkid_seq OWNED BY ifrs9.frs9_param_commonh.pkid;


--
-- Name: frs9_param_journal; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_journal (
    pkid smallint NOT NULL,
    gl_group character varying(20),
    currency character(3),
    gl_type character varying(20),
    gl_code character varying(20),
    gl_number character varying(20),
    dbcr character(1),
    gl_desc character varying(255),
    active_flag boolean,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_journal OWNER TO postgres;

--
-- Name: frs9_param_journal_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_journal_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_journal_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_journal_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_journal_pkid_seq OWNED BY ifrs9.frs9_param_journal.pkid;


--
-- Name: frs9_param_product; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_product (
    pkid smallint NOT NULL,
    data_source character varying(20) NOT NULL,
    prd_group character varying(20) NOT NULL,
    prd_type character varying(20) NOT NULL,
    prd_code character varying(20) NOT NULL,
    prd_desc character varying(255) NOT NULL,
    currency character varying(5) NOT NULL,
    amortization_type character varying(10),
    al_flag character varying(1),
    impaired_flag boolean,
    bm_flag boolean,
    expected_life integer,
    borrowing_rate double precision,
    market_rate double precision,
    active_flag boolean NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_product OWNER TO postgres;

--
-- Name: frs9_param_product_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_product_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_product_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_product_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_product_pkid_seq OWNED BY ifrs9.frs9_param_product.pkid;


--
-- Name: frs9_param_scenario_rulesd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_scenario_rulesd (
    pkid smallint NOT NULL,
    rule_id smallint,
    query_group smallint,
    seq smallint,
    table_name character varying(30) NOT NULL,
    column_name character varying(30) NOT NULL,
    data_type character varying(15) NOT NULL,
    operator character varying(10),
    value1 text NOT NULL,
    value2 text,
    condition character varying(3),
    detail_type character varying(50),
    stage_from character varying(2),
    stage_to character varying(2),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_scenario_rulesd OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesd_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_scenario_rulesd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_scenario_rulesd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_scenario_rulesd_pkid_seq OWNED BY ifrs9.frs9_param_scenario_rulesd.pkid;


--
-- Name: frs9_param_scenario_rulesh; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_scenario_rulesh (
    pkid smallint NOT NULL,
    rule_name character varying(250) NOT NULL,
    rule_type character varying(50) NOT NULL,
    updated_table character varying(30),
    updated_column character varying(30),
    value character varying(250),
    seq smallint,
    active_flag boolean,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_scenario_rulesh OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesh_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_scenario_rulesh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_scenario_rulesh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_scenario_rulesh_pkid_seq OWNED BY ifrs9.frs9_param_scenario_rulesh.pkid;


--
-- Name: frs9_param_segmentd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_segmentd (
    pkid smallint NOT NULL,
    segment_id smallint,
    query_group smallint,
    seq smallint,
    table_name character varying(30),
    column_name character varying(30),
    data_type character varying(15),
    operator character varying(10),
    value1 text,
    value2 text,
    condition character varying(3),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_segmentd OWNER TO postgres;

--
-- Name: frs9_param_segmentd_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_segmentd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_segmentd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_segmentd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_segmentd_pkid_seq OWNED BY ifrs9.frs9_param_segmentd.pkid;


--
-- Name: frs9_param_segmenth; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_segmenth (
    pkid smallint NOT NULL,
    group_segment character varying(150),
    segment character varying(150),
    sub_segment character varying(150),
    segment_type character varying(50),
    seq smallint,
    active_flag boolean,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_param_segmenth OWNER TO postgres;

--
-- Name: frs9_param_segmenth_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_param_segmenth_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_param_segmenth_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_segmenth_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_param_segmenth_pkid_seq OWNED BY ifrs9.frs9_param_segmenth.pkid;


--
-- Name: frs9_prc_date; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_prc_date (
    pkid smallint NOT NULL,
    currdate date NOT NULL,
    prevdate date,
    batch_status character varying(50),
    remark character varying(250),
    last_process_date date,
    sessionid character varying(50),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.frs9_prc_date OWNER TO postgres;

--
-- Name: frs9_prc_date_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ifrs9.frs9_prc_date ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME ifrs9.frs9_prc_date_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_r_model_summary; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_r_model_summary (
    model_id integer NOT NULL,
    model_name character varying(255),
    model_status character varying(50),
    dependent_variable character varying(100),
    r_squared numeric(10,4),
    mape numeric(10,4),
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_file character varying(255)
);


ALTER TABLE ifrs9.frs9_r_model_summary OWNER TO postgres;

--
-- Name: frs9_r_model_summary_model_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.frs9_r_model_summary_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.frs9_r_model_summary_model_id_seq OWNER TO postgres;

--
-- Name: frs9_r_model_summary_model_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.frs9_r_model_summary_model_id_seq OWNED BY ifrs9.frs9_r_model_summary.model_id;


--
-- Name: frs9_statistic; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_statistic (
    pkid bigint NOT NULL,
    prc_date date,
    sp_name character varying(100),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    counter bigint,
    sessionid character varying(100),
    iscomplete character varying(2),
    prc_name character varying(100),
    prc_process_time character varying(30),
    session_process_time character varying(30),
    remark character varying(250),
    parameter character varying(255)
);


ALTER TABLE ifrs9.frs9_statistic OWNER TO postgres;

--
-- Name: frs9_statistic_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ifrs9.frs9_statistic ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME ifrs9.frs9_statistic_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stg_frs9_master_account_bpf; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.stg_frs9_master_account_bpf (
    prc_date date,
    account_number character varying(50),
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    branch_code character varying(50),
    tenor_org smallint,
    start_date date,
    maturity_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    dpd integer,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    interest_base character varying(2),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate numeric(32,6),
    plafond numeric(32,6),
    unused_amt numeric(32,6),
    outstanding numeric(32,6),
    outstanding_wo numeric(32,6),
    accrued_interest numeric(32,6),
    installment_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6)
);


ALTER TABLE ifrs9.stg_frs9_master_account_bpf OWNER TO postgres;

--
-- Name: stg_master_loan; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.stg_master_loan (
    download_date timestamp without time zone,
    account_no_core character varying(255),
    account_no character varying(255),
    segment character varying(255),
    bucket_ori double precision,
    bucket_cap double precision,
    bucket_pre_rest double precision,
    bucket_final double precision,
    stage double precision,
    start_date timestamp without time zone,
    maturity_date timestamp without time zone,
    adjusted_maturity_date timestamp without time zone,
    grace_start_date timestamp without time zone,
    grace_end_date timestamp without time zone,
    grace_flag character varying(255),
    grace_period_months double precision,
    watchlist_flag character varying(255),
    restru_flag character varying(255),
    restructure_date timestamp without time zone,
    next_restru_instalment_date timestamp without time zone,
    os_balance double precision,
    os_principal double precision,
    instalment_amount double precision,
    effective_rate_percent double precision,
    lgd_percent double precision,
    tenor double precision,
    remaining_tenor double precision,
    undrawn double precision,
    asset_type character varying(255),
    asset_condition character varying(255),
    branch character varying(255)
);


ALTER TABLE ifrs9.stg_master_loan OWNER TO postgres;

--
-- Name: stg_paym_schd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.stg_paym_schd (
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.stg_paym_schd OWNER TO postgres;

--
-- Name: tblu_master_collateral; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tblu_master_collateral (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    collateral_description character varying(100),
    collateral_value numeric(32,6) DEFAULT 0,
    selling_date date,
    selling_price numeric(32,6),
    workout_period smallint,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.tblu_master_collateral OWNER TO postgres;

--
-- Name: tblu_master_collateral_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.tblu_master_collateral_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.tblu_master_collateral_pkid_seq OWNER TO postgres;

--
-- Name: tblu_master_collateral_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.tblu_master_collateral_pkid_seq OWNED BY ifrs9.tblu_master_collateral.pkid;


--
-- Name: tblu_master_pd_proxy; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tblu_master_pd_proxy (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    rating_agency character varying(20) NOT NULL,
    rating_from character varying(10) NOT NULL,
    rating_to character varying(10) NOT NULL,
    pd_rate double precision NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE ifrs9.tblu_master_pd_proxy OWNER TO postgres;

--
-- Name: tblu_master_pd_proxy_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.tblu_master_pd_proxy_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.tblu_master_pd_proxy_pkid_seq OWNER TO postgres;

--
-- Name: tblu_master_pd_proxy_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.tblu_master_pd_proxy_pkid_seq OWNED BY ifrs9.tblu_master_pd_proxy.pkid;


--
-- Name: tblu_paym_schd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tblu_paym_schd (
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tblu_paym_schd OWNER TO postgres;

--
-- Name: tmp_fma_preview; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_fma_preview (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_type character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    gl_group character varying(50),
    branch_code character varying(50),
    tenor_org smallint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    start_amort_date date,
    end_amort_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    market_rate double precision,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    collectability_group smallint,
    dpd smallint,
    dpd_group smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    pmt_sch_status character(1),
    eir_sch_status character(1),
    revolving_flag boolean,
    bm_flag boolean,
    committed_flag boolean,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    repo_flag boolean,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    fib_amt numeric(32,6) DEFAULT 0,
    special_case_flag boolean,
    impaired_flag boolean,
    impaired_status character(1),
    segment_id smallint,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    sicr_flag boolean,
    stage character varying(5),
    bucket_id smallint,
    bucket_id_obligor smallint,
    bucket_id_ed smallint,
    ecl_model_id bigint,
    ead_config_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    lgd double precision DEFAULT 0,
    interest_base character varying(2),
    sppi_status character varying(50),
    bm_status character varying(50),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate double precision,
    plafond numeric(32,6) DEFAULT 0,
    full_release_amt numeric(32,6) DEFAULT 0,
    unused_amt numeric(32,6) DEFAULT 0,
    outstanding numeric(32,6) DEFAULT 0,
    outstanding_wo numeric(32,6) DEFAULT 0,
    accrued_interest numeric(32,6) DEFAULT 0,
    installment_amt numeric(32,6) DEFAULT 0,
    fix_principal_amt numeric(32,6) DEFAULT 0,
    fix_interest_amt numeric(32,6) DEFAULT 0,
    initial_fee_amt numeric(32,6) DEFAULT 0,
    unamort_fee_amt numeric(32,6) DEFAULT 0,
    amort_fee_amt numeric(32,6) DEFAULT 0,
    initial_cost_amt numeric(32,6) DEFAULT 0,
    unamort_cost_amt numeric(32,6) DEFAULT 0,
    amort_cost_amt numeric(32,6) DEFAULT 0,
    initial_bm_amt numeric(32,6) DEFAULT 0,
    unamort_bm_amt numeric(32,6) DEFAULT 0,
    amort_bm_amt numeric(32,6) DEFAULT 0,
    carrying_amt numeric(32,6) DEFAULT 0,
    ecl_ca_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_ca_offbs_amt numeric(32,6) DEFAULT 0,
    ecl_ia_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_final_amt numeric(32,6) DEFAULT 0,
    unwinding_ca_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_sum_amt numeric(32,6),
    ecl_beginning_balance numeric(32,6) DEFAULT 0,
    ecl_charge numeric(32,6) DEFAULT 0,
    ecl_writeback numeric(32,6) DEFAULT 0,
    ecl_ending_balance numeric(32,6) DEFAULT 0,
    dpd_counter smallint,
    internal_rating_code_initial character varying(5),
    ext_rating_id_initial smallint,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_id smallint,
    amortization_type character varying(5),
    stage_original character varying(5),
    stage_override character varying(5),
    bucket_id_original smallint,
    bucket_id_override smallint,
    initial_gainloss_amt numeric(32,6),
    unamort_gainloss_amt numeric(32,6),
    amort_gainloss_amt numeric(32,6),
    fair_value_amt numeric(32,6),
    ecl_overlay_amt numeric(32,6),
    weighted_eff_interest_rate double precision,
    weighted_interest_rate double precision
);


ALTER TABLE ifrs9.tmp_fma_preview OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_ecl_fma (
    pkid bigint NOT NULL,
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    next_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq integer,
    int_pmt_term character varying(2),
    int_pmt_freq integer,
    default_flag boolean,
    dpd integer,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    ead_config_id bigint,
    ead_method bigint,
    ead_calc_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    interest_base character varying(2),
    interest_rate double precision,
    eir double precision,
    exchange_rate numeric(32,6),
    installment_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ead_balance numeric(32,6),
    beginning_balance numeric(32,6),
    ecl_amount numeric(32,6),
    ia_unwinding_amount numeric(32,6),
    ia_unwinding_sum_amount numeric(32,6),
    writeback_amount numeric(32,6),
    charge_amount numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_ecl_fma OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma_pkid_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.tmp_frs9_ecl_fma_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.tmp_frs9_ecl_fma_pkid_seq OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma_pkid_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.tmp_frs9_ecl_fma_pkid_seq OWNED BY ifrs9.tmp_frs9_ecl_fma.pkid;


--
-- Name: tmp_frs9_imp_ca_ead_paym_avg; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_ead_paym_avg (
    prc_date date,
    segment_id bigint,
    tenor smallint,
    counter smallint,
    paym_avg double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_ead_paym_avg OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_lgd_rec_d; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_lgd_rec_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eir double precision,
    seq smallint,
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone,
    rn integer
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_lgd_rec_d OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_data; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_pd_data (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    currency character varying(5),
    bucket_default smallint,
    include_closed_flag boolean,
    include_wo_flag boolean,
    bucket_group character varying(30),
    bucket_id smallint,
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    default_flag boolean,
    wo_flag boolean,
    remaining_tenor smallint,
    plafond numeric(32,6),
    outstanding numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_pd_data OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_scn_curr; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_pd_scn_curr (
    period date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_id smallint,
    calc_amount numeric(32,6),
    wo_flag boolean,
    include_wo_flag boolean,
    include_closed_flag boolean,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_pd_scn_curr OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_scn_prev; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_pd_scn_prev (
    period date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_id smallint,
    calc_amount numeric(32,6),
    wo_flag boolean,
    include_wo_flag boolean,
    include_closed_flag boolean,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_pd_scn_prev OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_structure; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_pd_structure (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    bucket_group character varying(100),
    bucket_id integer,
    fl_seq integer,
    fl_year integer,
    fl_month integer,
    pd double precision
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_pd_structure OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_ead; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_result_ead (
    prc_date date,
    account_id bigint,
    fl_seq smallint,
    paym_avg double precision,
    principal numeric(32,6),
    sum_principal numeric(32,6),
    next_interest numeric(32,6),
    sum_next_interest numeric(32,6),
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_result_ead OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_lgd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_result_lgd (
    prc_date date,
    segment_id bigint,
    lgd_config_id bigint,
    lgd double precision,
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_result_lgd OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_pd; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_imp_ca_result_pd (
    prc_date date,
    segment_id bigint,
    pd_config_id bigint,
    scenario_no smallint,
    bucket_id smallint,
    fl_seq smallint,
    pd double precision,
    createddate timestamp without time zone
);


ALTER TABLE ifrs9.tmp_frs9_imp_ca_result_pd OWNER TO postgres;

--
-- Name: tmp_frs9_master_account_prev; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_frs9_master_account_prev (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    branch_code character varying(50),
    interest_rate double precision,
    eff_interest_rate double precision,
    maturity_date date,
    installment_amt numeric(32,6),
    segment_id smallint,
    stage character varying(5),
    impaired_status character(1),
    outstanding numeric(32,6),
    currency character varying(5),
    exchange_rate numeric(32,6),
    ecl_beginning_balance numeric(32,6),
    ecl_ca_onbs_amt numeric(32,6),
    ecl_ca_offbs_amt numeric(32,6),
    ecl_ia_onbs_amt numeric(32,6),
    ecl_final_amt numeric(32,6),
    unwinding_ca_amt numeric(32,6),
    unwinding_ia_amt numeric(32,6),
    unwinding_ia_sum_amt numeric(32,6),
    ecl_charge numeric(32,6),
    ecl_writeback numeric(32,6)
);


ALTER TABLE ifrs9.tmp_frs9_master_account_prev OWNER TO postgres;

--
-- Name: tmp_imp_ca_ead_curr; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_imp_ca_ead_curr (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(100) NOT NULL,
    start_date date,
    maturity_date date,
    payment_start_date date,
    stage character(1),
    remaining_tenor integer,
    interest_rate double precision,
    payment_code character varying(20),
    interest_base character varying(2),
    next_eom_payment_date date,
    next_payment_date date,
    payment_term character(1),
    payment_freq integer,
    next_sch_prin_date date,
    int_pmt_term character(1),
    int_pmt_freq integer,
    next_sch_int_date date,
    grace_type character varying(1),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor integer,
    fib_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    mob smallint NOT NULL,
    idays integer,
    eom_payment_date date,
    payment_date date,
    os_balance numeric(32,6),
    installment numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6)
);


ALTER TABLE ifrs9.tmp_imp_ca_ead_curr OWNER TO postgres;

--
-- Name: tmp_imp_ca_ead_prev; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.tmp_imp_ca_ead_prev (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(100) NOT NULL,
    start_date date,
    maturity_date date,
    payment_start_date date,
    stage character(1),
    remaining_tenor integer,
    interest_rate double precision,
    payment_code character varying(20),
    interest_base character varying(2),
    next_eom_payment_date date,
    next_payment_date date,
    payment_term character(1),
    payment_freq integer,
    next_sch_prin_date date,
    int_pmt_term character(1),
    int_pmt_freq integer,
    next_sch_int_date date,
    grace_type character varying(1),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor integer,
    fib_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    mob smallint NOT NULL,
    idays integer,
    eom_payment_date date,
    payment_date date,
    os_balance numeric(32,6),
    installment numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6)
);


ALTER TABLE ifrs9.tmp_imp_ca_ead_prev OWNER TO postgres;

--
-- Name: upload_history; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.upload_history (
    id integer NOT NULL,
    filename character varying(255),
    file_type character varying(50),
    purpose character varying(100),
    rows integer,
    columns integer,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data text
);


ALTER TABLE ifrs9.upload_history OWNER TO postgres;

--
-- Name: upload_history_id_seq; Type: SEQUENCE; Schema: ifrs9; Owner: postgres
--

CREATE SEQUENCE ifrs9.upload_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE ifrs9.upload_history_id_seq OWNER TO postgres;

--
-- Name: upload_history_id_seq; Type: SEQUENCE OWNED BY; Schema: ifrs9; Owner: postgres
--

ALTER SEQUENCE ifrs9.upload_history_id_seq OWNED BY ifrs9.upload_history.id;


--
-- Name: global_audit_log; Type: TABLE; Schema: platform_audit; Owner: postgres
--

CREATE TABLE platform_audit.global_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    event_type character varying(100) NOT NULL,
    action character varying(100) DEFAULT 'AUTH'::character varying,
    description text,
    ip_address inet,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE platform_audit.global_audit_log OWNER TO postgres;

--
-- Name: frs9_account_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_account_id (
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    createdby character varying(36) DEFAULT 'SYSTEM'::character varying,
    createddate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.frs9_account_id OWNER TO postgres;

--
-- Name: frs9_account_id_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_account_id_account_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_account_id_account_id_seq OWNER TO postgres;

--
-- Name: frs9_account_id_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_account_id_account_id_seq OWNED BY public.frs9_account_id.account_id;


--
-- Name: frs9_amort_journal_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_amort_journal_data (
    id bigint NOT NULL,
    prc_date date,
    account_id bigint,
    facno character varying(50),
    cifno character varying(50),
    acctno character varying(70),
    datasource character varying(20),
    prdtype character varying(20),
    prdcode character varying(20),
    trxcode character varying(20),
    ccy character varying(10),
    journalcode character varying(20),
    journalcode2 character varying(10),
    status character varying(20),
    reverse character varying(3),
    flag_cf character varying(3),
    drcr character varying(2),
    glno character varying(20),
    n_amount numeric(32,6),
    n_amount_idr numeric(32,6),
    sourceprocess character varying(20),
    intmid bigint,
    branch character varying(20),
    noref character varying(20),
    valctr_code character varying(50),
    journal_desc character varying(200),
    createddate timestamp without time zone,
    createdby character varying(30),
    gl_internal_code character varying(100),
    method character varying(10),
    reserved_varchar_1 character varying(100),
    reserved_varchar_2 character varying(100),
    reserved_varchar_3 character varying(100),
    gl_costcenter character varying(10)
);


ALTER TABLE public.frs9_amort_journal_data OWNER TO postgres;

--
-- Name: frs9_amort_journal_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_amort_journal_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_amort_journal_data_id_seq OWNER TO postgres;

--
-- Name: frs9_amort_journal_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_amort_journal_data_id_seq OWNED BY public.frs9_amort_journal_data.id;


--
-- Name: frs9_default; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_default (
    prc_date date,
    account_id bigint,
    rule_id bigint,
    os_at_default numeric(32,6),
    eqv_at_default numeric(32,6),
    eir_at_default double precision,
    createdby character varying(100),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE public.frs9_default OWNER TO postgres;

--
-- Name: frs9_ecl_model_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_ecl_model_mapping (
    pkid smallint NOT NULL,
    ecl_model_id smallint,
    eff_date date,
    pf_segment_id smallint,
    pf_segment_name character varying(36),
    pd_model_id smallint,
    lgd_model_id smallint,
    ead_model_id smallint,
    ccf_model_id smallint,
    pp_model_id smallint,
    lt_model_id smallint
);


ALTER TABLE public.frs9_ecl_model_mapping OWNER TO postgres;

--
-- Name: frs9_ecl_model_mapping_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.frs9_ecl_model_mapping ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.frs9_ecl_model_mapping_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_eir_ecf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_eir_ecf (
    id bigint NOT NULL,
    account_id bigint,
    prc_date date,
    n_loan_amt numeric(32,6),
    n_int_rate double precision,
    n_eff_int_rate double precision,
    startamortdate date,
    endamortdate date,
    gracedate date,
    disb_percentage double precision,
    disb_amount numeric(32,6),
    plafond numeric(32,6),
    paymentcode character varying(3),
    intcalccode character varying(3),
    paymentterm character varying(3),
    isgrace character varying(3),
    billing_date date,
    prev_pmt_date date,
    pmt_date date,
    i_days bigint,
    i_days2 bigint,
    counter_rest bigint,
    counter integer,
    prev_rest_balance numeric(32,6),
    rest_balance numeric(32,6),
    n_osprn_prev numeric(32,6),
    n_osprn numeric(32,6),
    n_installment numeric(32,6),
    n_prn_payment numeric(32,6),
    n_int_payment numeric(32,6),
    n_accru_int numeric(32,6),
    n_fairvalue_prev numeric(32,6),
    n_eff_int_amt numeric(32,6),
    n_fairvalue numeric(32,6),
    n_unamort_amt_prev numeric(32,6),
    n_amort_amt numeric(32,6),
    n_unamort_amt numeric(32,6),
    n_cost_unamort_amt_prev numeric(32,6),
    n_cost_amort_amt numeric(32,6),
    n_cost_unamort_amt numeric(32,6),
    n_fee_unamort_amt_prev numeric(32,6),
    n_fee_amort_amt numeric(32,6),
    n_fee_unamort_amt numeric(32,6),
    n_gain_loss_unamort_amt_prev numeric(32,6),
    n_gain_loss_amort_amt numeric(32,6),
    n_gain_loss_unamort_amt numeric(32,6),
    amortstopdate date,
    amortstopmsg character varying(50),
    n_daily_amort_cost numeric(32,6),
    n_daily_amort_fee numeric(32,6),
    n_daily_gain_loss numeric(32,6),
    n_eff_int_amt0 numeric(32,6),
    n_eff_int_rate0 double precision,
    n_daily_int_adj_amt numeric(32,6),
    n_int_adj_amt numeric(32,6),
    sw_adj_cost numeric(32,6),
    sw_adj_fee numeric(32,6),
    npv_rate numeric(14,10),
    npv_amount numeric(32,6),
    nocf_osprn numeric(32,6),
    nocf_osprn_prev numeric(32,6),
    nocf_int_rate double precision,
    nocf_prn_payment numeric(32,6),
    nocf_eff_int_amt numeric(32,6),
    nocf_unamort_amt_prev numeric(32,6),
    nocf_amort_amt numeric(32,6),
    nocf_unamort_amt numeric(32,6)
);


ALTER TABLE public.frs9_eir_ecf OWNER TO postgres;

--
-- Name: frs9_eir_ecf_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_eir_ecf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_eir_ecf_id_seq OWNER TO postgres;

--
-- Name: frs9_eir_ecf_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_eir_ecf_id_seq OWNED BY public.frs9_eir_ecf.id;


--
-- Name: frs9_event_changes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_event_changes (
    prc_date timestamp without time zone,
    account_id bigint,
    account_number character varying(70),
    effective_date timestamp without time zone,
    before_value character varying(100),
    after_value character varying(100),
    event_id bigint,
    remarks character varying(100),
    createdby character varying(50),
    created_date timestamp without time zone
);


ALTER TABLE public.frs9_event_changes OWNER TO postgres;

--
-- Name: frs9_imp_ca_account_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_account_event (
    prc_date date,
    account_id bigint,
    event_id smallint,
    old_value character varying(100),
    new_value character varying(100),
    remarks character varying(100),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_account_event OWNER TO postgres;

--
-- Name: frs9_imp_ca_account_event_prv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_account_event_prv (
    prc_date date,
    account_id bigint NOT NULL,
    event_id smallint,
    old_value character varying(100),
    new_value character varying(100),
    remarks character varying(100),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_account_event_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ead (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(32,6),
    next_interest numeric(32,6),
    ead_amt numeric(32,6)
);


ALTER TABLE public.frs9_imp_ca_ead OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_paym_avg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ead_paym_avg (
    prc_date date,
    segment_id bigint,
    tenor smallint,
    counter smallint,
    paym_avg double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_ead_paym_avg OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ecl_detail (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    start_date date,
    maturity_date date,
    branch_code character varying(50),
    prd_code character varying(20),
    remaining_tenor smallint,
    expected_life smallint,
    interest_rate double precision,
    eff_interest_rate double precision,
    outstanding numeric(32,6),
    unused_amt numeric(32,6),
    accrued_interest numeric(32,6),
    installment_amt numeric(32,6),
    impaired_flag boolean,
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    stage character varying(5),
    bucket_id smallint,
    ecl_model_id smallint NOT NULL,
    segment_id smallint,
    ecl_amt_ca_onbs numeric(38,6),
    ecl_amt_ca_offbs numeric(38,6)
);


ALTER TABLE public.frs9_imp_ca_ecl_detail OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_ts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ecl_ts (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    ecl_model_id smallint NOT NULL,
    segment_id smallint,
    payment_date date,
    mob smallint,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    ead_onbs numeric(32,6),
    ead_offbs numeric(32,6),
    pd_rate double precision,
    lgd_rate double precision,
    ccf_rate double precision,
    prepayment_rate double precision,
    discount_rate double precision,
    ecl_amt_ca_onbs numeric(32,6),
    ecl_amt_ca_offbs numeric(32,6)
);


ALTER TABLE public.frs9_imp_ca_ecl_ts OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd (
    pkid smallint NOT NULL,
    prc_date date,
    lgd_model_id smallint,
    lgd_model_name character varying(100),
    os_default numeric(32,6),
    eqv_os_default numeric(32,6),
    recovery_amt numeric(32,6),
    eqv_recovery_amt numeric(32,6),
    pv_recovery_amt numeric(32,6),
    pv_eqv_recovery_amt numeric(32,6),
    recovery_rate double precision,
    lgd_rate double precision
);


ALTER TABLE public.frs9_imp_ca_lgd OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_coll_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_coll_data (
    prc_date date,
    pv_date date,
    account_id bigint,
    sold_flag boolean,
    colla_amt numeric(32,6),
    sell_amt numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_lgd_coll_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_d; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    rec_rate double precision,
    lgd double precision,
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_lgd_d OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_data (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_at_default numeric(32,6),
    wo_date date,
    closed_date date,
    account_status character(1),
    eqv_wo numeric(32,6),
    eir_at_default double precision,
    createdby character varying(36),
    createddate timestamp without time zone,
    updatedby character varying(100),
    updateddate timestamp without time zone,
    repo_date date,
    eqv_repo numeric(32,6)
);


ALTER TABLE public.frs9_imp_ca_lgd_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_h; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_h (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    model_id bigint,
    eqv_os numeric(32,6),
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    rec_rate double precision,
    lgd double precision,
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_lgd_h OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.frs9_imp_ca_lgd ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.frs9_imp_ca_lgd_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_imp_ca_lgd_rec_d; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_rec_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eir double precision,
    seq smallint,
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone,
    rn integer
);


ALTER TABLE public.frs9_imp_ca_lgd_rec_d OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_rec_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_rec_data (
    prc_date date,
    default_rule_id bigint,
    account_id bigint,
    rec_os numeric(32,6),
    eqv_rec_os numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_lgd_rec_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_enr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_enr (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    calc_amount numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_enr OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_flowrate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_flowrate (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    flowrate double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_flowrate OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_flowrate_avg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_flowrate_avg (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    flowrate double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_flowrate_avg OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_migration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_migration (
    prc_date date NOT NULL,
    base_date date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_from smallint,
    bucket_to smallint,
    calc_amount numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_migration OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_mmult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_mmult (
    prc_date date,
    pd_config_id bigint,
    fl_seq smallint,
    bucket_group character varying(30),
    bucket_from smallint,
    bucket_to smallint,
    mmult double precision,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_mmult OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_odr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_odr (
    prc_date date,
    base_date date,
    pd_config_id bigint,
    tot_default bigint,
    non_default bigint,
    odr double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_odr OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_proxy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_proxy (
    prc_date date NOT NULL,
    base_date date,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(50),
    bucket_from smallint,
    bucket_to smallint,
    pd double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_pd_proxy OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_structure (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    scalar_id bigint,
    scenario_no integer,
    bucket_group character varying(100),
    bucket_id integer,
    fl_seq integer,
    fl_year integer,
    fl_month integer,
    pd_non_fl double precision,
    pd double precision,
    createddate timestamp without time zone NOT NULL,
    createdby character varying(50),
    weighted_scalar double precision
);


ALTER TABLE public.frs9_imp_ca_pd_structure OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_ts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_ts (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    pd_model_id smallint NOT NULL,
    pd_model_name character varying(100),
    bucket_id smallint,
    pd_year smallint,
    pd_month smallint,
    pd_sequence smallint,
    pd_date date,
    pd_rate double precision
);


ALTER TABLE public.frs9_imp_ca_pd_ts OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_ts_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.frs9_imp_ca_pd_ts ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.frs9_imp_ca_pd_ts_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_imp_ca_result_d_prv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_result_d_prv (
    prc_date date,
    account_id bigint,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    scenario_no smallint,
    fl_seq smallint,
    fl_year smallint,
    fl_motnh smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ead_balance numeric(32,6),
    paym_avg double precision,
    principal_amt numeric(32,6),
    sum_principal_amt numeric(32,6),
    next_interest numeric(32,6),
    sum_next_interest numeric(32,6),
    ead numeric(32,6),
    pd double precision,
    lgd double precision,
    ecl_amount numeric(32,6),
    probability double precision,
    ecl_weighted numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_result_d_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_result_h_prv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_result_h_prv (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    default_flag boolean,
    dpd smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint NOT NULL,
    pd_config_id bigint,
    lgd_config_id bigint,
    lgd double precision,
    ead_config_id bigint,
    ead_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    eir double precision,
    exchange_rate numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ecl_amount numeric(32,6),
    overlay_amount numeric(32,6),
    ecl_final numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_result_h_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_scenario_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_scenario_data (
    prc_date date NOT NULL,
    segment_id integer NOT NULL,
    segment_type character varying(100),
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    account_status character varying(20),
    currency character varying(5),
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    default_flag boolean,
    impaired_status character(1),
    tenor smallint,
    remaining_tenor smallint,
    payment_freq smallint,
    fix_principal_amt numeric(32,6),
    plafond numeric(32,6),
    outstanding numeric(32,6),
    exchange_rate numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone,
    createdhost character varying(50),
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.frs9_imp_ca_scenario_data OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_schd (
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_schd OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd_hist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_schd_hist (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date NOT NULL,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(33,6),
    end_prc_date date,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_schd_hist OWNER TO postgres;

--
-- Name: frs9_imp_ca_schd_prv; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_schd_prv (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50),
    mob smallint,
    idays smallint,
    payment_date date NOT NULL,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    next_interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ca_schd_prv OWNER TO postgres;

--
-- Name: frs9_imp_ca_segment_query; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_segment_query (
    segment_id bigint NOT NULL,
    group_segment character varying(50),
    sub_segment character varying(50),
    segment character varying(50),
    table_name character varying(30),
    condition text,
    segment_type character varying(50)
);


ALTER TABLE public.frs9_imp_ca_segment_query OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_dcf (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    mob bigint NOT NULL,
    periode date NOT NULL,
    principal numeric(32,6) DEFAULT 0 NOT NULL,
    interest numeric(32,6) DEFAULT 0 NOT NULL,
    collateral numeric(32,6) DEFAULT 0 NOT NULL,
    status character(1) NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE public.frs9_imp_ia_dcf OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_dcf_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_dcf_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_dcf_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_dcf_pkid_seq OWNED BY public.frs9_imp_ia_dcf.pkid;


--
-- Name: frs9_imp_ia_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_detail (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    account_id bigint NOT NULL,
    eff_interest_rate double precision NOT NULL,
    mob bigint NOT NULL,
    periode date NOT NULL,
    principal numeric(32,6) DEFAULT 0 NOT NULL,
    interest numeric(32,6) DEFAULT 0 NOT NULL,
    installment numeric(32,6) DEFAULT 0 NOT NULL,
    collateral numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    rr_rate_1 double precision DEFAULT 0 NOT NULL,
    default_1 numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    rr_rate_2 double precision DEFAULT 0 NOT NULL,
    default_2 numeric(32,6) DEFAULT 0 NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    rr_rate_3 double precision DEFAULT 0 NOT NULL,
    default_3 numeric(32,6) DEFAULT 0 NOT NULL,
    pw_amt numeric(32,6) DEFAULT 0 NOT NULL,
    discount_factor double precision NOT NULL,
    pv_amt numeric(32,6) DEFAULT 0 NOT NULL,
    beginning_balance numeric(32,6) DEFAULT 0 NOT NULL,
    eir_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ending_balance numeric(32,6) DEFAULT 0 NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE public.frs9_imp_ia_detail OWNER TO postgres;

--
-- Name: frs9_imp_ia_detail_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_detail_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_detail_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_detail_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_detail_pkid_seq OWNED BY public.frs9_imp_ia_detail.pkid;


--
-- Name: frs9_imp_ia_header; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_header (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    prc_date date NOT NULL,
    eff_date date NOT NULL,
    cif_number character varying(50) NOT NULL,
    cif_name character varying(150) NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    currency character varying(5) NOT NULL,
    eff_interest_rate double precision NOT NULL,
    interest_rate double precision NOT NULL,
    dpd smallint,
    collectability smallint,
    rating_code character varying(5),
    impaired_flag character(1) NOT NULL,
    method character varying(20),
    plafond numeric(32,6) DEFAULT 0 NOT NULL,
    outstanding numeric(32,6) DEFAULT 0 NOT NULL,
    accrued_interest numeric(32,6) DEFAULT 0 NOT NULL,
    carrying_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ead_amt numeric(32,6) DEFAULT 0 NOT NULL,
    pv_dcf_amt numeric(32,6) DEFAULT 0 NOT NULL,
    ecl_ia_amt numeric(32,6) DEFAULT 0 NOT NULL,
    trigger_remarks character varying(1000),
    trigger_filename character varying(100),
    scenario_id smallint,
    n_of_scenario smallint,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    sc_name_1 character varying(20),
    sc_name_2 character varying(20),
    sc_name_3 character varying(20),
    status integer NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30),
    reviewedby character varying(36),
    revieweddate timestamp without time zone,
    reviewedhost character varying(30)
);


ALTER TABLE public.frs9_imp_ia_header OWNER TO postgres;

--
-- Name: frs9_imp_ia_header_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_header_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_header_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_header_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_header_pkid_seq OWNED BY public.frs9_imp_ia_header.pkid;


--
-- Name: frs9_imp_ia_result_d; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_result_d (
    pkid bigint NOT NULL,
    ia_id bigint,
    prc_date date,
    account_id bigint,
    mob smallint,
    periode date,
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(32,6),
    collateral numeric(32,6),
    po_rate_1 double precision,
    rr_rate_1 double precision,
    default_1 numeric(32,6),
    po_rate_2 double precision,
    rr_rate_2 double precision,
    default_2 numeric(32,6),
    po_rate_3 double precision,
    rr_rate_3 double precision,
    default_3 numeric(32,6),
    pw_amt numeric(32,6),
    discount_factor double precision,
    pv_amt numeric(32,6),
    beginning_balance numeric(32,6),
    eir_amt numeric(32,6),
    ending_balance numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ia_result_d OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_d_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_result_d_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_result_d_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_d_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_result_d_pkid_seq OWNED BY public.frs9_imp_ia_result_d.pkid;


--
-- Name: frs9_imp_ia_result_h; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_result_h (
    pkid bigint NOT NULL,
    ia_id bigint,
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    currency character varying(5),
    dpd smallint,
    collectability smallint,
    rating_code character varying(5),
    interest_rate double precision,
    eff_interest_rate double precision,
    outstanding numeric(32,6),
    accrued_interest numeric(32,6),
    carrying_amt numeric(32,6),
    ead_amt numeric(32,6),
    pv_dcf_amt numeric(32,6),
    ecl_ia_amt numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_imp_ia_result_h OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_h_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_result_h_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_result_h_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_result_h_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_result_h_pkid_seq OWNED BY public.frs9_imp_ia_result_h.pkid;


--
-- Name: frs9_imp_ia_rr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_rr (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    account_id bigint NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    rr_rate_1 double precision DEFAULT 0 NOT NULL,
    rr_rate_2 double precision DEFAULT 0 NOT NULL,
    rr_rate_3 double precision DEFAULT 0 NOT NULL,
    createdby character varying(36) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(36) NOT NULL,
    updatedby character varying(36),
    updateddate timestamp without time zone,
    updatedhost character varying(30)
);


ALTER TABLE public.frs9_imp_ia_rr OWNER TO postgres;

--
-- Name: frs9_imp_ia_rr_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ia_rr_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ia_rr_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ia_rr_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ia_rr_pkid_seq OWNED BY public.frs9_imp_ia_rr.pkid;


--
-- Name: frs9_imp_journal_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_journal_data (
    id bigint NOT NULL,
    prc_date date,
    account_id bigint,
    facility_number character varying(50),
    cif_number character varying(50),
    prdcode character varying(50),
    currency character varying(5),
    journalcode character varying(50),
    journalcode2 character varying(50),
    reverse boolean,
    flag_cf character varying(10),
    dbcr character varying(2),
    gl_number character varying(20),
    n_amount numeric(32,6),
    n_amount_idr numeric(32,6),
    sourceprocess character varying(50),
    intmid bigint,
    branch character varying(50),
    noref character varying(20),
    valctr_code character varying(50),
    gl_desc character varying(200),
    gl_costcenter character varying(20),
    createddate timestamp without time zone,
    createdby character varying(30)
);


ALTER TABLE public.frs9_imp_journal_data OWNER TO postgres;

--
-- Name: frs9_imp_journal_data_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_journal_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_journal_data_id_seq OWNER TO postgres;

--
-- Name: frs9_imp_journal_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_journal_data_id_seq OWNED BY public.frs9_imp_journal_data.id;


--
-- Name: frs9_imp_movement_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_movement_data (
    prc_date date,
    urut integer,
    group_segment character varying(100),
    stage1 numeric(32,6),
    stage2 numeric(32,6),
    stage3 numeric(32,6),
    stage1_i numeric(32,6),
    stage2_i numeric(32,6),
    stage3_i numeric(32,6),
    gca_stage1 numeric(32,6),
    gca_stage2 numeric(32,6),
    gca_stage3 numeric(32,6),
    gca_stage1_i numeric(32,6),
    gca_stage2_i numeric(32,6),
    gca_stage3_i numeric(32,6),
    poci numeric(32,6),
    createdby character varying(36),
    createddate timestamp without time zone,
    createdhost character varying(30)
);


ALTER TABLE public.frs9_imp_movement_data OWNER TO postgres;

--
-- Name: frs9_imp_nominative; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_nominative (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    data_source character varying(50),
    account_number character varying(50),
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    start_date date,
    maturity_date date,
    outstanding numeric(32,6),
    currency character varying(5),
    interest_rate double precision,
    dpd smallint,
    ext_rating character varying(5),
    tenor smallint,
    prd_code character varying(20),
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    rating_bucket smallint,
    lgd double precision,
    sicr boolean,
    stage smallint,
    ecl numeric(32,6),
    ecl_coverage double precision
);


ALTER TABLE public.frs9_imp_nominative OWNER TO postgres;

--
-- Name: frs9_imp_nominative_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_nominative_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_nominative_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_nominative_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_nominative_pkid_seq OWNED BY public.frs9_imp_nominative.pkid;


--
-- Name: frs9_master_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_master_account (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_type character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    gl_group character varying(50),
    branch_code character varying(50),
    tenor_org smallint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    start_amort_date date,
    end_amort_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    market_rate double precision,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    collectability_group smallint,
    dpd smallint,
    dpd_group smallint,
    dpd_counter smallint,
    internal_rating_code_initial character varying(5),
    internal_rating_code character varying(5),
    ext_rating_id_initial smallint,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_id smallint,
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    amortization_type character varying(5),
    pmt_sch_status character varying(5),
    eir_sch_status character varying(5),
    repo_flag boolean,
    revolving_flag boolean,
    bm_flag boolean,
    committed_flag boolean,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    fib_amt numeric(32,6) DEFAULT 0,
    special_case_flag boolean,
    impaired_flag boolean,
    impaired_status character(1),
    segment_id smallint,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    ecl_model_id smallint,
    ead_config_id smallint,
    pd_config_id smallint,
    lgd_config_id smallint,
    sicr_flag boolean,
    stage_original character varying(5),
    stage_override character varying(5),
    stage character varying(5),
    bucket_id_original smallint,
    bucket_id_override smallint,
    bucket_id smallint,
    bucket_id_obligor smallint,
    bucket_id_ed smallint,
    interest_base character varying(2),
    sppi_status character varying(50),
    bm_status character varying(50),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate double precision,
    plafond numeric(32,6) DEFAULT 0,
    full_release_amt numeric(32,6) DEFAULT 0,
    unused_amt numeric(32,6) DEFAULT 0,
    outstanding numeric(32,6) DEFAULT 0,
    outstanding_wo numeric(32,6) DEFAULT 0,
    accrued_interest numeric(32,6) DEFAULT 0,
    installment_amt numeric(32,6) DEFAULT 0,
    fix_principal_amt numeric(32,6) DEFAULT 0,
    fix_interest_amt numeric(32,6) DEFAULT 0,
    initial_fee_amt numeric(32,6) DEFAULT 0,
    unamort_fee_amt numeric(32,6) DEFAULT 0,
    amort_fee_amt numeric(32,6) DEFAULT 0,
    initial_cost_amt numeric(32,6) DEFAULT 0,
    unamort_cost_amt numeric(32,6) DEFAULT 0,
    amort_cost_amt numeric(32,6) DEFAULT 0,
    initial_bm_amt numeric(32,6) DEFAULT 0,
    unamort_bm_amt numeric(32,6) DEFAULT 0,
    amort_bm_amt numeric(32,6) DEFAULT 0,
    initial_gainloss_amt numeric(32,6) DEFAULT 0,
    unamort_gainloss_amt numeric(32,6) DEFAULT 0,
    amort_gainloss_amt numeric(32,6) DEFAULT 0,
    carrying_amt numeric(32,6) DEFAULT 0,
    fair_value_amt numeric(32,6) DEFAULT 0,
    ecl_ca_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_ca_offbs_amt numeric(32,6) DEFAULT 0,
    ecl_ia_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_overlay_amt numeric(32,6) DEFAULT 0,
    ecl_final_amt numeric(32,6) DEFAULT 0,
    unwinding_ca_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_sum_amt numeric(32,6) DEFAULT 0,
    ecl_beginning_balance numeric(32,6) DEFAULT 0,
    ecl_charge numeric(32,6) DEFAULT 0,
    ecl_writeback numeric(32,6) DEFAULT 0,
    ecl_ending_balance numeric(32,6) DEFAULT 0,
    lgd double precision,
    weighted_eff_interest_rate double precision,
    weighted_interest_rate double precision
);


ALTER TABLE public.frs9_master_account OWNER TO postgres;

--
-- Name: frs9_master_account_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_master_account_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_master_account_pkid_seq OWNER TO postgres;

--
-- Name: frs9_master_account_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_master_account_pkid_seq OWNED BY public.frs9_master_account.pkid;


--
-- Name: frs9_master_account_repo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_master_account_repo (
    prc_date date NOT NULL,
    repo_date date NOT NULL,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    outstanding_repo numeric(32,6),
    eqv_os_repo numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.frs9_master_account_repo OWNER TO postgres;

--
-- Name: frs9_master_account_wo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_master_account_wo (
    prc_date date,
    wo_date date,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    outstanding_wo numeric(32,6),
    eqv_os_wo numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE public.frs9_master_account_wo OWNER TO postgres;

--
-- Name: frs9_master_exchange_rate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_master_exchange_rate (
    prc_date date,
    currency character varying(5),
    exchange_rate numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone DEFAULT now()
);


ALTER TABLE public.frs9_master_exchange_rate OWNER TO postgres;

--
-- Name: frs9_master_transaction_cost; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_master_transaction_cost (
    prc_date date,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    effective_date date,
    data_source character varying(20),
    prd_type character varying(20),
    prd_code character varying(20),
    branch_code character varying(20),
    debet_credit_flag character(1),
    currency_code character varying(5),
    fee_cost_id character varying(1) NOT NULL,
    trx_code character varying(20),
    org_ccy_amt numeric(32,6),
    eqv_lcy_amt numeric(32,6)
);


ALTER TABLE public.frs9_master_transaction_cost OWNER TO postgres;

--
-- Name: frs9_param_commond; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_commond (
    pkid bigint NOT NULL,
    param_code character varying(50) NOT NULL,
    param_seq integer NOT NULL,
    value1 character varying(100) NOT NULL,
    value2 character varying(100) NOT NULL,
    value3 character varying(50) NOT NULL,
    paramdesc character varying(1000) NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.frs9_param_commond OWNER TO postgres;

--
-- Name: frs9_param_commond_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_commond_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_commond_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_commond_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_commond_pkid_seq OWNED BY public.frs9_param_commond.pkid;


--
-- Name: frs9_param_commonh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_commonh (
    pkid bigint NOT NULL,
    param_code character varying(10),
    param_name character varying(255),
    param_usage character varying(255),
    param_type character varying(10),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50),
    banking_type character varying(20) DEFAULT 'conventional'::character varying,
    is_active boolean DEFAULT true,
    requires_approval boolean DEFAULT false,
    CONSTRAINT chk_banking_type CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text])))
);


ALTER TABLE public.frs9_param_commonh OWNER TO postgres;

--
-- Name: frs9_param_commonh_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_commonh_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_commonh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_commonh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_commonh_pkid_seq OWNED BY public.frs9_param_commonh.pkid;


--
-- Name: frs9_prc_date; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_prc_date (
    pkid smallint NOT NULL,
    currdate date NOT NULL,
    prevdate date,
    batch_status character varying(50),
    remark character varying(250),
    last_process_date date,
    sessionid character varying(50),
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.frs9_prc_date OWNER TO postgres;

--
-- Name: frs9_prc_date_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.frs9_prc_date ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.frs9_prc_date_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: frs9_r_model_summary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_r_model_summary (
    model_id integer NOT NULL,
    model_name character varying(255),
    model_status character varying(50),
    dependent_variable character varying(100),
    r_squared numeric(10,4),
    mape numeric(10,4),
    created_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data_file character varying(255)
);


ALTER TABLE public.frs9_r_model_summary OWNER TO postgres;

--
-- Name: frs9_r_model_summary_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_r_model_summary_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_r_model_summary_model_id_seq OWNER TO postgres;

--
-- Name: frs9_r_model_summary_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_r_model_summary_model_id_seq OWNED BY public.frs9_r_model_summary.model_id;


--
-- Name: frs9_statistic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_statistic (
    pkid bigint NOT NULL,
    prc_date date,
    sp_name character varying(100),
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    counter bigint,
    sessionid character varying(100),
    iscomplete character varying(2),
    prc_name character varying(100),
    prc_process_time character varying(30),
    session_process_time character varying(30),
    remark character varying(250),
    parameter character varying(255)
);


ALTER TABLE public.frs9_statistic OWNER TO postgres;

--
-- Name: frs9_statistic_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.frs9_statistic ALTER COLUMN pkid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.frs9_statistic_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: job_definitions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    job_type character varying(50) NOT NULL,
    cron_expression character varying(50),
    default_parameters jsonb DEFAULT '{}'::jsonb,
    is_enabled boolean DEFAULT true,
    priority character varying(20) DEFAULT 'NORMAL'::character varying,
    timeout integer DEFAULT 3600,
    max_retries integer DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    last_run_status character varying(20),
    last_run_time timestamp without time zone,
    next_run_time timestamp without time zone,
    requires_approval boolean DEFAULT false,
    approval_matrix_id uuid,
    auto_approve_conditions jsonb
);


ALTER TABLE public.job_definitions OWNER TO postgres;

--
-- Name: job_executions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_executions (
    id character varying(255) NOT NULL,
    job_definition_id uuid,
    tenant_id uuid NOT NULL,
    job_name character varying(255) NOT NULL,
    job_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    progress integer DEFAULT 0,
    start_time timestamp without time zone,
    end_time timestamp without time zone,
    duration integer,
    parameters jsonb,
    result jsonb,
    error text,
    triggered_by uuid,
    worker_id character varying(255),
    tags jsonb DEFAULT '[]'::jsonb,
    approval_request_id uuid,
    approval_status character varying(20) DEFAULT 'not_required'::character varying,
    approved_at timestamp without time zone,
    approved_by uuid
);


ALTER TABLE public.job_executions OWNER TO postgres;

--
-- Name: stg_frs9_master_account_bpf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stg_frs9_master_account_bpf (
    prc_date date,
    account_number character varying(50),
    facility_number character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    branch_code character varying(50),
    tenor_org smallint,
    start_date date,
    maturity_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    dpd integer,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    interest_base character varying(2),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate numeric(32,6),
    plafond numeric(32,6),
    unused_amt numeric(32,6),
    outstanding numeric(32,6),
    outstanding_wo numeric(32,6),
    accrued_interest numeric(32,6),
    installment_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6)
);


ALTER TABLE public.stg_frs9_master_account_bpf OWNER TO postgres;

--
-- Name: stg_master_loan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stg_master_loan (
    download_date timestamp without time zone,
    account_no_core character varying(255),
    account_no character varying(255),
    segment character varying(255),
    bucket_ori double precision,
    bucket_cap double precision,
    bucket_pre_rest double precision,
    bucket_final double precision,
    stage double precision,
    start_date timestamp without time zone,
    maturity_date timestamp without time zone,
    adjusted_maturity_date timestamp without time zone,
    grace_start_date timestamp without time zone,
    grace_end_date timestamp without time zone,
    grace_flag character varying(255),
    grace_period_months double precision,
    watchlist_flag character varying(255),
    restru_flag character varying(255),
    restructure_date timestamp without time zone,
    next_restru_instalment_date timestamp without time zone,
    os_balance double precision,
    os_principal double precision,
    instalment_amount double precision,
    effective_rate_percent double precision,
    lgd_percent double precision,
    tenor double precision,
    remaining_tenor double precision,
    undrawn double precision,
    asset_type character varying(255),
    asset_condition character varying(255),
    branch character varying(255)
);


ALTER TABLE public.stg_master_loan OWNER TO postgres;

--
-- Name: stg_paym_schd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stg_paym_schd (
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.stg_paym_schd OWNER TO postgres;

--
-- Name: tblu_master_collateral; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tblu_master_collateral (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    collateral_description character varying(100),
    collateral_value numeric(32,6) DEFAULT 0,
    selling_date date,
    selling_price numeric(32,6),
    workout_period smallint,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.tblu_master_collateral OWNER TO postgres;

--
-- Name: tblu_master_collateral_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tblu_master_collateral_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tblu_master_collateral_pkid_seq OWNER TO postgres;

--
-- Name: tblu_master_collateral_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tblu_master_collateral_pkid_seq OWNED BY public.tblu_master_collateral.pkid;


--
-- Name: tblu_master_pd_proxy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tblu_master_pd_proxy (
    pkid smallint NOT NULL,
    prc_date date NOT NULL,
    rating_agency character varying(20) NOT NULL,
    rating_from character varying(10) NOT NULL,
    rating_to character varying(10) NOT NULL,
    pd_rate double precision NOT NULL,
    createdby character varying(50) NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying(50) NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.tblu_master_pd_proxy OWNER TO postgres;

--
-- Name: tblu_master_pd_proxy_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tblu_master_pd_proxy_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tblu_master_pd_proxy_pkid_seq OWNER TO postgres;

--
-- Name: tblu_master_pd_proxy_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tblu_master_pd_proxy_pkid_seq OWNED BY public.tblu_master_pd_proxy.pkid;


--
-- Name: tblu_paym_schd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tblu_paym_schd (
    prc_date date NOT NULL,
    account_number character varying(50) NOT NULL,
    idays smallint,
    payment_date date,
    os_balance numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6),
    installment numeric(33,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.tblu_paym_schd OWNER TO postgres;

--
-- Name: tmp_fma_preview; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_fma_preview (
    pkid bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(50) NOT NULL,
    facility_number character varying(50),
    cif_type character varying(50),
    cif_number character varying(50),
    cif_name character varying(150),
    account_status character varying(20),
    data_source character varying(20),
    prd_group character varying(20),
    prd_type character varying(50),
    prd_code character varying(20),
    gl_group character varying(50),
    branch_code character varying(50),
    tenor_org smallint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    start_amort_date date,
    end_amort_date date,
    paid_off_date date,
    write_off_date date,
    first_payment_date date,
    next_payment_date date,
    last_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    market_rate double precision,
    interest_rate double precision,
    eff_interest_rate double precision,
    collectability smallint,
    collectability_group smallint,
    dpd smallint,
    dpd_group smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_agency character varying(5),
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq smallint,
    int_pmt_term character varying(2),
    int_pmt_freq smallint,
    pmt_sch_status character(1),
    eir_sch_status character(1),
    revolving_flag boolean,
    bm_flag boolean,
    committed_flag boolean,
    npl_flag boolean,
    npl_date date,
    restructure_flag boolean,
    restructure_date date,
    restructure_review_date date,
    repo_flag boolean,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    fib_amt numeric(32,6) DEFAULT 0,
    special_case_flag boolean,
    impaired_flag boolean,
    impaired_status character(1),
    segment_id smallint,
    group_segment character varying(50),
    segment character varying(50),
    sub_segment character varying(50),
    sicr_flag boolean,
    stage character varying(5),
    bucket_id smallint,
    bucket_id_obligor smallint,
    bucket_id_ed smallint,
    ecl_model_id bigint,
    ead_config_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    lgd double precision DEFAULT 0,
    interest_base character varying(2),
    sppi_status character varying(50),
    bm_status character varying(50),
    asset_class character varying(50),
    currency character varying(5),
    exchange_rate double precision,
    plafond numeric(32,6) DEFAULT 0,
    full_release_amt numeric(32,6) DEFAULT 0,
    unused_amt numeric(32,6) DEFAULT 0,
    outstanding numeric(32,6) DEFAULT 0,
    outstanding_wo numeric(32,6) DEFAULT 0,
    accrued_interest numeric(32,6) DEFAULT 0,
    installment_amt numeric(32,6) DEFAULT 0,
    fix_principal_amt numeric(32,6) DEFAULT 0,
    fix_interest_amt numeric(32,6) DEFAULT 0,
    initial_fee_amt numeric(32,6) DEFAULT 0,
    unamort_fee_amt numeric(32,6) DEFAULT 0,
    amort_fee_amt numeric(32,6) DEFAULT 0,
    initial_cost_amt numeric(32,6) DEFAULT 0,
    unamort_cost_amt numeric(32,6) DEFAULT 0,
    amort_cost_amt numeric(32,6) DEFAULT 0,
    initial_bm_amt numeric(32,6) DEFAULT 0,
    unamort_bm_amt numeric(32,6) DEFAULT 0,
    amort_bm_amt numeric(32,6) DEFAULT 0,
    carrying_amt numeric(32,6) DEFAULT 0,
    ecl_ca_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_ca_offbs_amt numeric(32,6) DEFAULT 0,
    ecl_ia_onbs_amt numeric(32,6) DEFAULT 0,
    ecl_final_amt numeric(32,6) DEFAULT 0,
    unwinding_ca_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_amt numeric(32,6) DEFAULT 0,
    unwinding_ia_sum_amt numeric(32,6),
    ecl_beginning_balance numeric(32,6) DEFAULT 0,
    ecl_charge numeric(32,6) DEFAULT 0,
    ecl_writeback numeric(32,6) DEFAULT 0,
    ecl_ending_balance numeric(32,6) DEFAULT 0,
    dpd_counter smallint,
    internal_rating_code_initial character varying(5),
    ext_rating_id_initial smallint,
    ext_rating_code_initial character varying(5),
    ext_rating_agency_initial character varying(5),
    ext_rating_id smallint,
    amortization_type character varying(5),
    stage_original character varying(5),
    stage_override character varying(5),
    bucket_id_original smallint,
    bucket_id_override smallint,
    initial_gainloss_amt numeric(32,6),
    unamort_gainloss_amt numeric(32,6),
    amort_gainloss_amt numeric(32,6),
    fair_value_amt numeric(32,6),
    ecl_overlay_amt numeric(32,6),
    weighted_eff_interest_rate double precision,
    weighted_interest_rate double precision
);


ALTER TABLE public.tmp_fma_preview OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_ecl_fma (
    pkid bigint NOT NULL,
    prc_date date,
    account_id bigint,
    account_number character varying(50),
    facility_number character varying(100),
    cif_number character varying(100),
    segment_id bigint,
    remaining_tenor smallint,
    start_date date,
    maturity_date date,
    next_payment_date date,
    next_sch_prin_date date,
    next_sch_int_date date,
    grace_type character varying(5),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor smallint,
    payment_code character varying(20),
    payment_term character varying(2),
    payment_freq integer,
    int_pmt_term character varying(2),
    int_pmt_freq integer,
    default_flag boolean,
    dpd integer,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    ecl_model_id bigint,
    pd_config_id bigint,
    lgd_config_id bigint,
    ead_config_id bigint,
    ead_method bigint,
    ead_calc_method bigint,
    bucket_group character varying(30),
    bucket_id integer,
    currency character varying(5),
    stage smallint,
    interest_base character varying(2),
    interest_rate double precision,
    eir double precision,
    exchange_rate numeric(32,6),
    installment_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    outstanding numeric(32,6),
    plafond numeric(32,6),
    fib_amt numeric(32,6),
    accrued_interest numeric(32,6),
    unamort_cost_amt numeric(32,6),
    unamort_fee_amt numeric(32,6),
    ead_balance numeric(32,6),
    beginning_balance numeric(32,6),
    ecl_amount numeric(32,6),
    ia_unwinding_amount numeric(32,6),
    ia_unwinding_sum_amount numeric(32,6),
    writeback_amount numeric(32,6),
    charge_amount numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_ecl_fma OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tmp_frs9_ecl_fma_pkid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tmp_frs9_ecl_fma_pkid_seq OWNER TO postgres;

--
-- Name: tmp_frs9_ecl_fma_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tmp_frs9_ecl_fma_pkid_seq OWNED BY public.tmp_frs9_ecl_fma.pkid;


--
-- Name: tmp_frs9_imp_ca_ead_paym_avg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_ead_paym_avg (
    prc_date date,
    segment_id bigint,
    tenor smallint,
    counter smallint,
    paym_avg double precision,
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_ead_paym_avg OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_lgd_rec_d; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_lgd_rec_d (
    prc_date date,
    lgd_config_id bigint,
    lgd_method bigint,
    account_id bigint,
    eqv_os numeric(32,6),
    eir double precision,
    seq smallint,
    eqv_rec numeric(32,6),
    npv_eqv_rec numeric(32,6),
    createdby character varying(100),
    createddate timestamp without time zone,
    rn integer
);


ALTER TABLE public.tmp_frs9_imp_ca_lgd_rec_d OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_pd_data (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    currency character varying(5),
    bucket_default smallint,
    include_closed_flag boolean,
    include_wo_flag boolean,
    bucket_group character varying(30),
    bucket_id smallint,
    dpd smallint,
    collectability smallint,
    internal_rating_code character varying(5),
    ext_rating_code character varying(5),
    ext_rating_id smallint,
    default_flag boolean,
    wo_flag boolean,
    remaining_tenor smallint,
    plafond numeric(32,6),
    outstanding numeric(32,6),
    createdby character varying(50),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_pd_data OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_scn_curr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_pd_scn_curr (
    period date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_id smallint,
    calc_amount numeric(32,6),
    wo_flag boolean,
    include_wo_flag boolean,
    include_closed_flag boolean,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_pd_scn_curr OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_scn_prev; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_pd_scn_prev (
    period date NOT NULL,
    pd_config_id bigint NOT NULL,
    bucket_group character varying(30),
    account_id bigint,
    account_status character(1),
    cif_number character varying(50),
    facility_number character varying(50),
    bucket_id smallint,
    calc_amount numeric(32,6),
    wo_flag boolean,
    include_wo_flag boolean,
    include_closed_flag boolean,
    createdby character varying(36),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_pd_scn_prev OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_pd_structure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_pd_structure (
    prc_date date,
    pd_config_id bigint,
    pd_method smallint,
    bucket_group character varying(100),
    bucket_id integer,
    fl_seq integer,
    fl_year integer,
    fl_month integer,
    pd double precision
);


ALTER TABLE public.tmp_frs9_imp_ca_pd_structure OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_ead; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_result_ead (
    prc_date date,
    account_id bigint,
    fl_seq smallint,
    paym_avg double precision,
    principal numeric(32,6),
    sum_principal numeric(32,6),
    next_interest numeric(32,6),
    sum_next_interest numeric(32,6),
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_result_ead OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_lgd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_result_lgd (
    prc_date date,
    segment_id bigint,
    lgd_config_id bigint,
    lgd double precision,
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_result_lgd OWNER TO postgres;

--
-- Name: tmp_frs9_imp_ca_result_pd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_imp_ca_result_pd (
    prc_date date,
    segment_id bigint,
    pd_config_id bigint,
    scenario_no smallint,
    bucket_id smallint,
    fl_seq smallint,
    pd double precision,
    createddate timestamp without time zone
);


ALTER TABLE public.tmp_frs9_imp_ca_result_pd OWNER TO postgres;

--
-- Name: tmp_frs9_master_account_prev; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_frs9_master_account_prev (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    cif_number character varying(50),
    facility_number character varying(50),
    branch_code character varying(50),
    interest_rate double precision,
    eff_interest_rate double precision,
    maturity_date date,
    installment_amt numeric(32,6),
    segment_id smallint,
    stage character varying(5),
    impaired_status character(1),
    outstanding numeric(32,6),
    currency character varying(5),
    exchange_rate numeric(32,6),
    ecl_beginning_balance numeric(32,6),
    ecl_ca_onbs_amt numeric(32,6),
    ecl_ca_offbs_amt numeric(32,6),
    ecl_ia_onbs_amt numeric(32,6),
    ecl_final_amt numeric(32,6),
    unwinding_ca_amt numeric(32,6),
    unwinding_ia_amt numeric(32,6),
    unwinding_ia_sum_amt numeric(32,6),
    ecl_charge numeric(32,6),
    ecl_writeback numeric(32,6)
);


ALTER TABLE public.tmp_frs9_master_account_prev OWNER TO postgres;

--
-- Name: tmp_imp_ca_ead_curr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_imp_ca_ead_curr (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(100) NOT NULL,
    start_date date,
    maturity_date date,
    payment_start_date date,
    stage character(1),
    remaining_tenor integer,
    interest_rate double precision,
    payment_code character varying(20),
    interest_base character varying(2),
    next_eom_payment_date date,
    next_payment_date date,
    payment_term character(1),
    payment_freq integer,
    next_sch_prin_date date,
    int_pmt_term character(1),
    int_pmt_freq integer,
    next_sch_int_date date,
    grace_type character varying(1),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor integer,
    fib_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    mob smallint NOT NULL,
    idays integer,
    eom_payment_date date,
    payment_date date,
    os_balance numeric(32,6),
    installment numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6)
);


ALTER TABLE public.tmp_imp_ca_ead_curr OWNER TO postgres;

--
-- Name: tmp_imp_ca_ead_prev; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tmp_imp_ca_ead_prev (
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying(100) NOT NULL,
    start_date date,
    maturity_date date,
    payment_start_date date,
    stage character(1),
    remaining_tenor integer,
    interest_rate double precision,
    payment_code character varying(20),
    interest_base character varying(2),
    next_eom_payment_date date,
    next_payment_date date,
    payment_term character(1),
    payment_freq integer,
    next_sch_prin_date date,
    int_pmt_term character(1),
    int_pmt_freq integer,
    next_sch_int_date date,
    grace_type character varying(1),
    grace_start_date date,
    grace_end_date date,
    fib_flag boolean,
    fib_start_date date,
    fib_tenor integer,
    fib_amt numeric(32,6),
    fix_principal_amt numeric(32,6),
    fix_interest_amt numeric(32,6),
    mob smallint NOT NULL,
    idays integer,
    eom_payment_date date,
    payment_date date,
    os_balance numeric(32,6),
    installment numeric(32,6),
    principal numeric(32,6),
    interest numeric(32,6)
);


ALTER TABLE public.tmp_imp_ca_ead_prev OWNER TO postgres;

--
-- Name: upload_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_history (
    id integer NOT NULL,
    filename character varying(255),
    file_type character varying(50),
    purpose character varying(100),
    rows integer,
    columns integer,
    upload_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    data text
);


ALTER TABLE public.upload_history OWNER TO postgres;

--
-- Name: upload_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.upload_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_history_id_seq OWNER TO postgres;

--
-- Name: upload_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.upload_history_id_seq OWNED BY public.upload_history.id;


--
-- Name: vw_frs9_first_default; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_frs9_first_default AS
 WITH cte_first_default AS (
         SELECT frs9_default.prc_date,
            frs9_default.account_id,
            frs9_default.rule_id,
            frs9_default.os_at_default,
            frs9_default.eqv_at_default,
            frs9_default.eir_at_default,
            row_number() OVER (PARTITION BY frs9_default.account_id, frs9_default.rule_id ORDER BY frs9_default.prc_date) AS rn
           FROM public.frs9_default
        )
 SELECT prc_date,
    account_id,
    rule_id,
    os_at_default,
    eqv_at_default,
    eir_at_default
   FROM cte_first_default
  WHERE (rn = 1);


ALTER VIEW public.vw_frs9_first_default OWNER TO postgres;

--
-- Name: vw_frs9_imp_ca_ead_process_ead_curr; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_frs9_imp_ca_ead_process_ead_curr AS
 SELECT prc_date,
    account_id,
    account_number,
    start_date,
    maturity_date,
    payment_start_date,
    stage,
    remaining_tenor,
    interest_rate,
    payment_code,
    interest_base,
    payment_term,
    payment_freq,
    next_sch_prin_date,
    int_pmt_term,
    int_pmt_freq,
    next_sch_int_date,
    grace_type,
    grace_start_date,
    grace_end_date,
    fib_flag,
    fib_start_date,
    fib_tenor,
    fib_amt,
    fix_principal_amt,
    fix_interest_amt,
    (next_payment_date - payment_date) AS idays,
    next_eom_payment_date AS eom_payment_date,
    next_payment_date AS payment_date,
    (os_balance - public.fn_frs9_imp_ca_ead_process_principal_amt(next_payment_date, maturity_date, os_balance, (grace_type)::text, grace_end_date, (payment_code)::text, (interest_base)::text, interest_rate, installment, fix_principal_amt)) AS os_balance,
    installment,
    public.fn_frs9_imp_ca_ead_process_principal_amt(next_payment_date, maturity_date, os_balance, (grace_type)::text, grace_end_date, (payment_code)::text, (interest_base)::text, interest_rate, installment, fix_principal_amt) AS principal,
    public.fn_frs9_imp_ca_ead_process_interest_amt((grace_type)::text, next_payment_date, grace_end_date, (payment_code)::text, (interest_base)::text, os_balance, interest_rate, fix_interest_amt) AS interest
   FROM public.tmp_imp_ca_ead_curr m
  WHERE ((payment_date <= maturity_date) AND (os_balance > (0)::numeric));


ALTER VIEW public.vw_frs9_imp_ca_ead_process_ead_curr OWNER TO postgres;

--
-- Name: vw_frs9_movement_snapshot; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_frs9_movement_snapshot AS
 SELECT a.prc_date AS download_date,
    a.ecl_model_id,
    a.account_id,
    lower((a.group_segment)::text) AS group_segment,
    lower(
        CASE
            WHEN (b.account_id IS NULL) THEN 'A'::text
            ELSE 'W'::text
        END) AS account_status,
    a.stage,
    lower((a.impaired_status)::text) AS impaired_flag,
    COALESCE(a.exchange_rate, (1)::double precision) AS exchange_rate,
    ((COALESCE(a.ecl_final_amt, (0)::numeric))::double precision * COALESCE(a.exchange_rate, (1)::double precision)) AS ecl_amount,
    ((COALESCE(a.carrying_amt, (0)::numeric))::double precision * COALESCE(a.exchange_rate, (1)::double precision)) AS gross_carrying_amount,
    a.restructure_flag,
    false AS poci_flag
   FROM (public.frs9_master_account a
     LEFT JOIN public.frs9_master_account_wo b ON (((b.account_id = a.account_id) AND (b.prc_date = a.prc_date))))
  WHERE ((lower((a.account_status)::text) = 'a'::text) OR (b.account_id IS NOT NULL));


ALTER VIEW public.vw_frs9_movement_snapshot OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: FRS9_IMP_CA_LGD_CONFIG LGD_CONFIG_ID; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9."FRS9_IMP_CA_LGD_CONFIG" ALTER COLUMN "LGD_CONFIG_ID" SET DEFAULT nextval('ifrs9."FRS9_IMP_CA_LGD_CONFIG_LGD_CONFIG_ID_seq"'::regclass);


--
-- Name: FRS9_IMP_CA_PD_CONFIG PD_CONFIG_ID; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9."FRS9_IMP_CA_PD_CONFIG" ALTER COLUMN "PD_CONFIG_ID" SET DEFAULT nextval('ifrs9."FRS9_IMP_CA_PD_CONFIG_PD_CONFIG_ID_seq"'::regclass);


--
-- Name: frs9_account_id account_id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_account_id ALTER COLUMN account_id SET DEFAULT nextval('ifrs9.frs9_account_id_account_id_seq'::regclass);


--
-- Name: frs9_amort_journal_data id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_amort_journal_data ALTER COLUMN id SET DEFAULT nextval('ifrs9.frs9_amort_journal_data_id_seq'::regclass);


--
-- Name: frs9_eir_ecf id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_eir_ecf ALTER COLUMN id SET DEFAULT nextval('ifrs9.frs9_eir_ecf_id_seq'::regclass);


--
-- Name: frs9_imp_ca_ead_config pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ead_config ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_ead_config_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_ecl_configd pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ecl_configd ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_ecl_configd_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_ecl_configh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ecl_configh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_ecl_configh_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_fl_scalard pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_fl_scalard ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_fl_scalard_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_fl_scalarh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_fl_scalarh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_fl_scalarh_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_lgd_config pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_lgd_config ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_lgd_config_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_pd_config pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_pd_config ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ca_pd_config_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_dcf pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_dcf ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_dcf_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_detail pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_detail ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_detail_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_header pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_header ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_header_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_result_d pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_result_d ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_result_d_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_result_h pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_result_h ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_result_h_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_rr pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_rr ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_ia_rr_pkid_seq'::regclass);


--
-- Name: frs9_imp_journal_data id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_journal_data ALTER COLUMN id SET DEFAULT nextval('ifrs9.frs9_imp_journal_data_id_seq'::regclass);


--
-- Name: frs9_imp_nominative pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_nominative ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_imp_nominative_pkid_seq'::regclass);


--
-- Name: frs9_master_account pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_master_account ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_master_account_pkid_seq'::regclass);


--
-- Name: frs9_param_bucketd pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_bucketd ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_bucketd_pkid_seq'::regclass);


--
-- Name: frs9_param_bucketh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_bucketh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_bucketh_pkid_seq'::regclass);


--
-- Name: frs9_param_commond pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commond ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_commond_pkid_seq'::regclass);


--
-- Name: frs9_param_commonh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commonh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_commonh_pkid_seq'::regclass);


--
-- Name: frs9_param_journal pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_journal ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_journal_pkid_seq'::regclass);


--
-- Name: frs9_param_product pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_product ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_product_pkid_seq'::regclass);


--
-- Name: frs9_param_scenario_rulesd pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_scenario_rulesd ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_scenario_rulesd_pkid_seq'::regclass);


--
-- Name: frs9_param_scenario_rulesh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_scenario_rulesh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_scenario_rulesh_pkid_seq'::regclass);


--
-- Name: frs9_param_segmentd pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_segmentd ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_segmentd_pkid_seq'::regclass);


--
-- Name: frs9_param_segmenth pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_segmenth ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_segmenth_pkid_seq'::regclass);


--
-- Name: frs9_r_model_summary model_id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_r_model_summary ALTER COLUMN model_id SET DEFAULT nextval('ifrs9.frs9_r_model_summary_model_id_seq'::regclass);


--
-- Name: tblu_master_collateral pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tblu_master_collateral ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.tblu_master_collateral_pkid_seq'::regclass);


--
-- Name: tblu_master_pd_proxy pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tblu_master_pd_proxy ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.tblu_master_pd_proxy_pkid_seq'::regclass);


--
-- Name: tmp_frs9_ecl_fma pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tmp_frs9_ecl_fma ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.tmp_frs9_ecl_fma_pkid_seq'::regclass);


--
-- Name: upload_history id; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.upload_history ALTER COLUMN id SET DEFAULT nextval('ifrs9.upload_history_id_seq'::regclass);


--
-- Name: frs9_account_id account_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_account_id ALTER COLUMN account_id SET DEFAULT nextval('public.frs9_account_id_account_id_seq'::regclass);


--
-- Name: frs9_amort_journal_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_amort_journal_data ALTER COLUMN id SET DEFAULT nextval('public.frs9_amort_journal_data_id_seq'::regclass);


--
-- Name: frs9_eir_ecf id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_eir_ecf ALTER COLUMN id SET DEFAULT nextval('public.frs9_eir_ecf_id_seq'::regclass);


--
-- Name: frs9_imp_ia_dcf pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_dcf ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_dcf_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_detail pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_detail ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_detail_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_header pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_header ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_header_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_result_d pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_result_d ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_result_d_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_result_h pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_result_h ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_result_h_pkid_seq'::regclass);


--
-- Name: frs9_imp_ia_rr pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_rr ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ia_rr_pkid_seq'::regclass);


--
-- Name: frs9_imp_journal_data id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_journal_data ALTER COLUMN id SET DEFAULT nextval('public.frs9_imp_journal_data_id_seq'::regclass);


--
-- Name: frs9_imp_nominative pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_nominative ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_nominative_pkid_seq'::regclass);


--
-- Name: frs9_master_account pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_master_account ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_master_account_pkid_seq'::regclass);


--
-- Name: frs9_param_commond pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commond ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_commond_pkid_seq'::regclass);


--
-- Name: frs9_param_commonh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commonh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_commonh_pkid_seq'::regclass);


--
-- Name: frs9_r_model_summary model_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_r_model_summary ALTER COLUMN model_id SET DEFAULT nextval('public.frs9_r_model_summary_model_id_seq'::regclass);


--
-- Name: tblu_master_collateral pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tblu_master_collateral ALTER COLUMN pkid SET DEFAULT nextval('public.tblu_master_collateral_pkid_seq'::regclass);


--
-- Name: tblu_master_pd_proxy pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tblu_master_pd_proxy ALTER COLUMN pkid SET DEFAULT nextval('public.tblu_master_pd_proxy_pkid_seq'::regclass);


--
-- Name: tmp_frs9_ecl_fma pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tmp_frs9_ecl_fma ALTER COLUMN pkid SET DEFAULT nextval('public.tmp_frs9_ecl_fma_pkid_seq'::regclass);


--
-- Name: upload_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_history ALTER COLUMN id SET DEFAULT nextval('public.upload_history_id_seq'::regclass);


--
-- Name: approval_actions approval_actions_pkey; Type: CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_actions
    ADD CONSTRAINT approval_actions_pkey PRIMARY KEY (id);


--
-- Name: approval_levels approval_levels_pkey; Type: CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_levels
    ADD CONSTRAINT approval_levels_pkey PRIMARY KEY (id);


--
-- Name: approval_matrices approval_matrices_pkey; Type: CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_matrices
    ADD CONSTRAINT approval_matrices_pkey PRIMARY KEY (id);


--
-- Name: approval_requests approval_requests_pkey; Type: CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_requests
    ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: calculation_audit_logs calculation_audit_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.calculation_audit_logs
    ADD CONSTRAINT calculation_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: data_access_logs data_access_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.data_access_logs
    ADD CONSTRAINT data_access_logs_pkey PRIMARY KEY (id);


--
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: menu_access_log menu_access_log_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_access_log
    ADD CONSTRAINT menu_access_log_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_user_customization menu_user_customization_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_user_customization
    ADD CONSTRAINT menu_user_customization_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_menu_access role_menu_access_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_code_unique; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.roles
    ADD CONSTRAINT roles_role_code_unique UNIQUE (role_code);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: FRS9_IMP_CA_LGD_CONFIG FRS9_IMP_CA_LGD_CONFIG_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9."FRS9_IMP_CA_LGD_CONFIG"
    ADD CONSTRAINT "FRS9_IMP_CA_LGD_CONFIG_pkey" PRIMARY KEY ("LGD_CONFIG_ID");


--
-- Name: FRS9_IMP_CA_PD_CONFIG FRS9_IMP_CA_PD_CONFIG_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9."FRS9_IMP_CA_PD_CONFIG"
    ADD CONSTRAINT "FRS9_IMP_CA_PD_CONFIG_pkey" PRIMARY KEY ("PD_CONFIG_ID");


--
-- Name: frs9_account_id frs9_account_id_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_account_id
    ADD CONSTRAINT frs9_account_id_pkey PRIMARY KEY (account_id, account_number);


--
-- Name: frs9_amort_journal_data frs9_amort_journal_data_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_amort_journal_data
    ADD CONSTRAINT frs9_amort_journal_data_pkey PRIMARY KEY (id);


--
-- Name: frs9_ecl_model_mapping frs9_ecl_model_mapping_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_ecl_model_mapping
    ADD CONSTRAINT frs9_ecl_model_mapping_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_eir_ecf frs9_eir_ecf_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_eir_ecf
    ADD CONSTRAINT frs9_eir_ecf_pkey PRIMARY KEY (id);


--
-- Name: frs9_imp_ca_account_event_prv frs9_imp_ca_account_event_prv_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_account_event_prv
    ADD CONSTRAINT frs9_imp_ca_account_event_prv_pkey PRIMARY KEY (account_id);


--
-- Name: frs9_imp_ca_ead_config frs9_imp_ca_ead_config_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ead_config
    ADD CONSTRAINT frs9_imp_ca_ead_config_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_ecl_configd frs9_imp_ca_ecl_configd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ecl_configd
    ADD CONSTRAINT frs9_imp_ca_ecl_configd_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_ecl_configh frs9_imp_ca_ecl_configh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_ecl_configh
    ADD CONSTRAINT frs9_imp_ca_ecl_configh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_fl_scalard frs9_imp_ca_fl_scalard_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_fl_scalard
    ADD CONSTRAINT frs9_imp_ca_fl_scalard_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_fl_scalarh frs9_imp_ca_fl_scalarh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_fl_scalarh
    ADD CONSTRAINT frs9_imp_ca_fl_scalarh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_lgd_config frs9_imp_ca_lgd_config_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_lgd_config
    ADD CONSTRAINT frs9_imp_ca_lgd_config_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_lgd frs9_imp_ca_lgd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_lgd
    ADD CONSTRAINT frs9_imp_ca_lgd_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_pd_config frs9_imp_ca_pd_config_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_pd_config
    ADD CONSTRAINT frs9_imp_ca_pd_config_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_pd_proxy frs9_imp_ca_pd_proxy_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_pd_proxy
    ADD CONSTRAINT frs9_imp_ca_pd_proxy_pkey PRIMARY KEY (prc_date, pd_config_id);


--
-- Name: frs9_imp_ca_pd_ts frs9_imp_ca_pd_ts_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_pd_ts
    ADD CONSTRAINT frs9_imp_ca_pd_ts_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ca_result_h_prv frs9_imp_ca_result_h_prv_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_result_h_prv
    ADD CONSTRAINT frs9_imp_ca_result_h_prv_pkey PRIMARY KEY (ecl_model_id, prc_date, account_id);


--
-- Name: frs9_imp_ia_dcf frs9_imp_ia_dcf_account_id_periode_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_dcf
    ADD CONSTRAINT frs9_imp_ia_dcf_account_id_periode_key UNIQUE (account_id, periode);


--
-- Name: frs9_imp_ia_dcf frs9_imp_ia_dcf_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_dcf
    ADD CONSTRAINT frs9_imp_ia_dcf_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_detail frs9_imp_ia_detail_account_id_periode_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_detail
    ADD CONSTRAINT frs9_imp_ia_detail_account_id_periode_key UNIQUE (account_id, periode);


--
-- Name: frs9_imp_ia_detail frs9_imp_ia_detail_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_detail
    ADD CONSTRAINT frs9_imp_ia_detail_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_header frs9_imp_ia_header_account_id_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_header
    ADD CONSTRAINT frs9_imp_ia_header_account_id_key UNIQUE (account_id);


--
-- Name: frs9_imp_ia_header frs9_imp_ia_header_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_header
    ADD CONSTRAINT frs9_imp_ia_header_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_result_d frs9_imp_ia_result_d_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_result_d
    ADD CONSTRAINT frs9_imp_ia_result_d_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_result_h frs9_imp_ia_result_h_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_result_h
    ADD CONSTRAINT frs9_imp_ia_result_h_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_rr frs9_imp_ia_rr_account_id_period_start_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_rr
    ADD CONSTRAINT frs9_imp_ia_rr_account_id_period_start_key UNIQUE (account_id, period_start);


--
-- Name: frs9_imp_ia_rr frs9_imp_ia_rr_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ia_rr
    ADD CONSTRAINT frs9_imp_ia_rr_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_journal_data frs9_imp_journal_data_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_journal_data
    ADD CONSTRAINT frs9_imp_journal_data_pkey PRIMARY KEY (id);


--
-- Name: frs9_imp_nominative frs9_imp_nominative_pk; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_nominative
    ADD CONSTRAINT frs9_imp_nominative_pk UNIQUE (prc_date, account_id);


--
-- Name: frs9_imp_nominative frs9_imp_nominative_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_nominative
    ADD CONSTRAINT frs9_imp_nominative_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_master_account frs9_master_account_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_master_account
    ADD CONSTRAINT frs9_master_account_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_bucketd frs9_param_bucketd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_bucketd
    ADD CONSTRAINT frs9_param_bucketd_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_bucketh frs9_param_bucketh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_bucketh
    ADD CONSTRAINT frs9_param_bucketh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_commond frs9_param_commond_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commond
    ADD CONSTRAINT frs9_param_commond_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_commonh frs9_param_commonh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commonh
    ADD CONSTRAINT frs9_param_commonh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_journal frs9_param_journal_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_journal
    ADD CONSTRAINT frs9_param_journal_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_product frs9_param_product_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_product
    ADD CONSTRAINT frs9_param_product_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_scenario_rulesd frs9_param_scenario_rulesd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_scenario_rulesd
    ADD CONSTRAINT frs9_param_scenario_rulesd_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_scenario_rulesh frs9_param_scenario_rulesh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_scenario_rulesh
    ADD CONSTRAINT frs9_param_scenario_rulesh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_segmentd frs9_param_segmentd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_segmentd
    ADD CONSTRAINT frs9_param_segmentd_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_segmenth frs9_param_segmenth_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_segmenth
    ADD CONSTRAINT frs9_param_segmenth_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_prc_date frs9_prc_date_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_prc_date
    ADD CONSTRAINT frs9_prc_date_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_r_model_summary frs9_r_model_summary_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_r_model_summary
    ADD CONSTRAINT frs9_r_model_summary_pkey PRIMARY KEY (model_id);


--
-- Name: frs9_statistic frs9_statistic_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_statistic
    ADD CONSTRAINT frs9_statistic_pkey PRIMARY KEY (pkid);


--
-- Name: tmp_frs9_master_account_prev pk_fma_prev; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tmp_frs9_master_account_prev
    ADD CONSTRAINT pk_fma_prev PRIMARY KEY (prc_date, account_id);


--
-- Name: frs9_imp_ca_schd_hist pk_frs9_imp_ca_schd_hist; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_schd_hist
    ADD CONSTRAINT pk_frs9_imp_ca_schd_hist PRIMARY KEY (prc_date, account_id, payment_date);


--
-- Name: frs9_imp_ca_schd_prv pk_frs9_imp_ca_schd_prv; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_schd_prv
    ADD CONSTRAINT pk_frs9_imp_ca_schd_prv PRIMARY KEY (account_id, payment_date);


--
-- Name: frs9_master_account_repo pk_frs9_prcdate_accountid; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_master_account_repo
    ADD CONSTRAINT pk_frs9_prcdate_accountid PRIMARY KEY (account_id);


--
-- Name: stg_paym_schd pk_stg_paym_schd; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.stg_paym_schd
    ADD CONSTRAINT pk_stg_paym_schd PRIMARY KEY (prc_date, account_number);


--
-- Name: tblu_master_collateral tblu_master_collateral_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tblu_master_collateral
    ADD CONSTRAINT tblu_master_collateral_pkey PRIMARY KEY (pkid);


--
-- Name: tblu_master_pd_proxy tblu_master_pd_proxy_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tblu_master_pd_proxy
    ADD CONSTRAINT tblu_master_pd_proxy_pkey PRIMARY KEY (pkid);


--
-- Name: tblu_paym_schd tblu_paym_schd_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tblu_paym_schd
    ADD CONSTRAINT tblu_paym_schd_pkey PRIMARY KEY (prc_date, account_number);


--
-- Name: tmp_fma_preview tmp_fma_preview_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tmp_fma_preview
    ADD CONSTRAINT tmp_fma_preview_pkey PRIMARY KEY (prc_date, account_id);


--
-- Name: tmp_frs9_ecl_fma tmp_frs9_ecl_fma_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.tmp_frs9_ecl_fma
    ADD CONSTRAINT tmp_frs9_ecl_fma_pkey PRIMARY KEY (pkid);


--
-- Name: upload_history upload_history_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.upload_history
    ADD CONSTRAINT upload_history_pkey PRIMARY KEY (id);


--
-- Name: frs9_imp_ca_account_event uq_account_id; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_imp_ca_account_event
    ADD CONSTRAINT uq_account_id UNIQUE (prc_date, account_id);


--
-- Name: frs9_master_account_wo uq_frs9_wo_accountid; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_master_account_wo
    ADD CONSTRAINT uq_frs9_wo_accountid PRIMARY KEY (account_id);


--
-- Name: job_definitions job_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_definitions
    ADD CONSTRAINT job_definitions_pkey PRIMARY KEY (id);


--
-- Name: job_executions job_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_executions
    ADD CONSTRAINT job_executions_pkey PRIMARY KEY (id);


--
-- Name: approval_actions_action_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_actions_action_idx ON approval.approval_actions USING btree (action);


--
-- Name: approval_actions_approver_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_actions_approver_idx ON approval.approval_actions USING btree (approver_id);


--
-- Name: approval_actions_request_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_actions_request_idx ON approval.approval_actions USING btree (request_id);


--
-- Name: approval_levels_level_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_levels_level_idx ON approval.approval_levels USING btree (level);


--
-- Name: approval_levels_matrix_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_levels_matrix_idx ON approval.approval_levels USING btree (matrix_id);


--
-- Name: approval_matrices_active_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_matrices_active_idx ON approval.approval_matrices USING btree (is_active);


--
-- Name: approval_matrices_entity_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_matrices_entity_idx ON approval.approval_matrices USING btree (entity_type);


--
-- Name: approval_matrices_tenant_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_matrices_tenant_idx ON approval.approval_matrices USING btree (tenant_id);


--
-- Name: approval_requests_entity_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_requests_entity_idx ON approval.approval_requests USING btree (entity_type, entity_id);


--
-- Name: approval_requests_expires_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_requests_expires_idx ON approval.approval_requests USING btree (expires_at);


--
-- Name: approval_requests_requester_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_requests_requester_idx ON approval.approval_requests USING btree (requested_by);


--
-- Name: approval_requests_status_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_requests_status_idx ON approval.approval_requests USING btree (status);


--
-- Name: approval_requests_tenant_idx; Type: INDEX; Schema: approval; Owner: postgres
--

CREATE INDEX approval_requests_tenant_idx ON approval.approval_requests USING btree (tenant_id);


--
-- Name: audit_action_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_action_idx ON audit.audit_logs USING btree (action);


--
-- Name: audit_business_date_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_business_date_idx ON audit.audit_logs USING btree (business_date);


--
-- Name: audit_compliance_category_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_compliance_category_idx ON audit.audit_logs USING btree (compliance_category);


--
-- Name: audit_correlation_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_correlation_idx ON audit.audit_logs USING btree (correlation_id);


--
-- Name: audit_entity_id_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_entity_id_idx ON audit.audit_logs USING btree (entity_id);


--
-- Name: audit_entity_time_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_entity_time_idx ON audit.audit_logs USING btree (entity_type, entity_id, "timestamp");


--
-- Name: audit_entity_type_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_entity_type_idx ON audit.audit_logs USING btree (entity_type);


--
-- Name: audit_event_type_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_event_type_idx ON audit.audit_logs USING btree (event_type);


--
-- Name: audit_ip_address_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_ip_address_idx ON audit.audit_logs USING btree (ip_address);


--
-- Name: audit_risk_level_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_risk_level_idx ON audit.audit_logs USING btree (risk_level);


--
-- Name: audit_session_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_session_idx ON audit.audit_logs USING btree (session_id);


--
-- Name: audit_tenant_event_time_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_tenant_event_time_idx ON audit.audit_logs USING btree (tenant_id, event_type, "timestamp");


--
-- Name: audit_tenant_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_tenant_idx ON audit.audit_logs USING btree (tenant_id);


--
-- Name: audit_timestamp_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_timestamp_idx ON audit.audit_logs USING btree ("timestamp");


--
-- Name: audit_user_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_user_idx ON audit.audit_logs USING btree (user_id);


--
-- Name: audit_user_time_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX audit_user_time_idx ON audit.audit_logs USING btree (user_id, "timestamp");


--
-- Name: calc_audit_date_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_date_idx ON audit.calculation_audit_logs USING btree (calculation_date);


--
-- Name: calc_audit_status_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_status_idx ON audit.calculation_audit_logs USING btree (status);


--
-- Name: calc_audit_tenant_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_tenant_idx ON audit.calculation_audit_logs USING btree (tenant_id);


--
-- Name: calc_audit_timestamp_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_timestamp_idx ON audit.calculation_audit_logs USING btree ("timestamp");


--
-- Name: calc_audit_type_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_type_idx ON audit.calculation_audit_logs USING btree (calculation_type);


--
-- Name: calc_audit_user_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX calc_audit_user_idx ON audit.calculation_audit_logs USING btree (user_id);


--
-- Name: data_access_resource_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX data_access_resource_idx ON audit.data_access_logs USING btree (resource_type, resource_id);


--
-- Name: data_access_tenant_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX data_access_tenant_idx ON audit.data_access_logs USING btree (tenant_id);


--
-- Name: data_access_timestamp_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX data_access_timestamp_idx ON audit.data_access_logs USING btree ("timestamp");


--
-- Name: data_access_user_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX data_access_user_idx ON audit.data_access_logs USING btree (user_id);


--
-- Name: user_activity_tenant_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX user_activity_tenant_idx ON audit.user_activity_logs USING btree (tenant_id);


--
-- Name: user_activity_timestamp_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX user_activity_timestamp_idx ON audit.user_activity_logs USING btree ("timestamp");


--
-- Name: user_activity_type_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX user_activity_type_idx ON audit.user_activity_logs USING btree (activity_type);


--
-- Name: user_activity_user_idx; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX user_activity_user_idx ON audit.user_activity_logs USING btree (user_id);


--
-- Name: email_verification_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX email_verification_token_idx ON auth.email_verification_tokens USING btree (token);


--
-- Name: email_verification_user_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX email_verification_user_idx ON auth.email_verification_tokens USING btree (user_id);


--
-- Name: password_reset_expires_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX password_reset_expires_idx ON auth.password_reset_tokens USING btree (expires_at);


--
-- Name: password_reset_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX password_reset_token_idx ON auth.password_reset_tokens USING btree (token);


--
-- Name: password_reset_user_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX password_reset_user_idx ON auth.password_reset_tokens USING btree (user_id);


--
-- Name: sessions_access_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX sessions_access_token_idx ON auth.sessions USING btree (access_token_id);


--
-- Name: sessions_active_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_active_idx ON auth.sessions USING btree (is_active);


--
-- Name: sessions_expires_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_expires_idx ON auth.sessions USING btree (expires_at);


--
-- Name: sessions_refresh_token_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE UNIQUE INDEX sessions_refresh_token_idx ON auth.sessions USING btree (refresh_token_id);


--
-- Name: sessions_tenant_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_tenant_idx ON auth.sessions USING btree (tenant_id);


--
-- Name: sessions_user_idx; Type: INDEX; Schema: auth; Owner: postgres
--

CREATE INDEX sessions_user_idx ON auth.sessions USING btree (user_id);


--
-- Name: idx_menu_access_log_accessed_at; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_access_log_accessed_at ON core.menu_access_log USING btree (accessed_at);


--
-- Name: idx_menu_access_log_menu_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_access_log_menu_id ON core.menu_access_log USING btree (menu_item_id);


--
-- Name: idx_menu_access_log_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_access_log_user_id ON core.menu_access_log USING btree (user_id);


--
-- Name: idx_menu_items_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_active ON core.menu_items USING btree (is_active);


--
-- Name: idx_menu_items_banking_type; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_banking_type ON core.menu_items USING btree (banking_type);


--
-- Name: idx_menu_items_category_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_category_id ON core.menu_items USING btree (category_id);


--
-- Name: idx_menu_items_display_order; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_display_order ON core.menu_items USING btree (category_id, sort_order);


--
-- Name: idx_menu_items_level; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_level ON core.menu_items USING btree (level);


--
-- Name: idx_menu_items_module; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_module ON core.menu_items USING btree (module_name);


--
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_parent_id ON core.menu_items USING btree (parent_id);


--
-- Name: idx_menu_items_visible; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_visible ON core.menu_items USING btree (is_visible);


--
-- Name: idx_menu_user_custom_favorite; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_user_custom_favorite ON core.menu_user_customization USING btree (is_favorite);


--
-- Name: idx_menu_user_custom_menu_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_user_custom_menu_id ON core.menu_user_customization USING btree (menu_item_id);


--
-- Name: idx_menu_user_custom_user_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_user_custom_user_id ON core.menu_user_customization USING btree (user_id);


--
-- Name: idx_role_menu_access_can_view; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_can_view ON core.role_menu_access USING btree (can_view);


--
-- Name: idx_role_menu_access_menu_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_menu_id ON core.role_menu_access USING btree (menu_item_id);


--
-- Name: idx_role_menu_access_role_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_role_id ON core.role_menu_access USING btree (role_id);


--
-- Name: menu_categories_key_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX menu_categories_key_idx ON core.menu_categories USING btree (category_key);


--
-- Name: menu_items_key_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX menu_items_key_idx ON core.menu_items USING btree (menu_key);


--
-- Name: menu_user_custom_unique_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX menu_user_custom_unique_idx ON core.menu_user_customization USING btree (user_id, menu_item_id);


--
-- Name: permissions_category_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX permissions_category_idx ON core.permissions USING btree (category);


--
-- Name: permissions_code_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX permissions_code_idx ON core.permissions USING btree (code);


--
-- Name: permissions_resource_action_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX permissions_resource_action_idx ON core.permissions USING btree (resource, action);


--
-- Name: role_menu_unique_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX role_menu_unique_idx ON core.role_menu_access USING btree (role_id, menu_item_id);


--
-- Name: role_perm_unique_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX role_perm_unique_idx ON core.role_permissions USING btree (role_id, permission_id);


--
-- Name: role_permissions_perm_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX role_permissions_perm_idx ON core.role_permissions USING btree (permission_id);


--
-- Name: role_permissions_role_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX role_permissions_role_idx ON core.role_permissions USING btree (role_id);


--
-- Name: roles_active_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX roles_active_idx ON core.roles USING btree (is_active);


--
-- Name: roles_hierarchy_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX roles_hierarchy_idx ON core.roles USING btree (hierarchy_level);


--
-- Name: roles_role_name_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX roles_role_name_idx ON core.roles USING btree (role_name);


--
-- Name: roles_system_role_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX roles_system_role_idx ON core.roles USING btree (is_system_role);


--
-- Name: roles_tenant_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX roles_tenant_idx ON core.roles USING btree (tenant_id);


--
-- Name: tenants_active_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX tenants_active_idx ON core.tenants USING btree (is_active);


--
-- Name: tenants_code_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX tenants_code_idx ON core.tenants USING btree (code);


--
-- Name: tenants_slug_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX tenants_slug_idx ON core.tenants USING btree (slug);


--
-- Name: user_role_unique_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX user_role_unique_idx ON core.user_roles USING btree (user_id, role_id);


--
-- Name: user_roles_active_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_active_idx ON core.user_roles USING btree (is_active);


--
-- Name: user_roles_role_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_role_idx ON core.user_roles USING btree (role_id);


--
-- Name: user_roles_tenant_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_tenant_idx ON core.user_roles USING btree (tenant_id);


--
-- Name: user_roles_user_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_user_idx ON core.user_roles USING btree (user_id);


--
-- Name: user_roles_valid_from_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_valid_from_idx ON core.user_roles USING btree (valid_from);


--
-- Name: user_roles_valid_until_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_valid_until_idx ON core.user_roles USING btree (valid_until);


--
-- Name: users_active_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX users_active_idx ON core.users USING btree (is_active);


--
-- Name: users_email_tenant_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX users_email_tenant_idx ON core.users USING btree (email, tenant_id);


--
-- Name: users_tenant_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX users_tenant_idx ON core.users USING btree (tenant_id);


--
-- Name: users_username_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX users_username_idx ON core.users USING btree (username);


--
-- Name: frs9_imp_ca_lgd_rec_d_config_id; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX frs9_imp_ca_lgd_rec_d_config_id ON ifrs9.frs9_imp_ca_lgd_rec_d USING btree (lgd_config_id);


--
-- Name: idx_ecl_configh_active; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_ecl_configh_active ON ifrs9.frs9_imp_ca_ecl_configh USING btree (active_flag);


--
-- Name: idx_frs9_default_partition_order; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_default_partition_order ON ifrs9.frs9_default USING btree (account_id, rule_id, prc_date);


--
-- Name: idx_frs9_default_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_default_prc_date ON ifrs9.frs9_default USING btree (prc_date);


--
-- Name: idx_frs9_exchange_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_exchange_prc_date ON ifrs9.frs9_master_exchange_rate USING btree (prc_date);


--
-- Name: idx_frs9_imp_ca_lgd_coll_data_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_lgd_coll_data_prc_date ON ifrs9.frs9_imp_ca_lgd_coll_data USING btree (prc_date);


--
-- Name: idx_frs9_imp_ca_lgd_data_config_id; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_lgd_data_config_id ON ifrs9.frs9_imp_ca_lgd_data USING btree (lgd_config_id);


--
-- Name: idx_frs9_imp_ca_lgd_data_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_lgd_data_prc_date ON ifrs9.frs9_imp_ca_lgd_data USING btree (prc_date);


--
-- Name: idx_frs9_imp_ca_lgd_rec_d_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_lgd_rec_d_prc_date ON ifrs9.frs9_imp_ca_lgd_rec_d USING btree (prc_date);


--
-- Name: idx_frs9_imp_ca_lgd_rec_data_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_lgd_rec_data_prc_date ON ifrs9.frs9_imp_ca_lgd_rec_data USING btree (prc_date);


--
-- Name: idx_frs9_imp_ca_scenario_data_segment_type; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_imp_ca_scenario_data_segment_type ON ifrs9.frs9_imp_ca_scenario_data USING btree (segment_type);


--
-- Name: idx_frs9_param_commond_code_seq; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_commond_code_seq ON ifrs9.frs9_param_commond USING btree (param_code, param_seq);


--
-- Name: idx_frs9_param_commonh_active; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_commonh_active ON ifrs9.frs9_param_commonh USING btree (is_active);


--
-- Name: idx_frs9_param_commonh_type_code; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_commonh_type_code ON ifrs9.frs9_param_commonh USING btree (param_type, param_code);


--
-- Name: idx_frs9_param_journal_active; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_journal_active ON ifrs9.frs9_param_journal USING btree (active_flag);


--
-- Name: idx_frs9_param_product_active; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_product_active ON ifrs9.frs9_param_product USING btree (active_flag);


--
-- Name: idx_frs9_param_segmentd_segment_id; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_frs9_param_segmentd_segment_id ON ifrs9.frs9_param_segmentd USING btree (segment_id);


--
-- Name: idx_master_account_active; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_master_account_active ON ifrs9.frs9_master_account USING btree (account_status, prc_date, account_id);


--
-- Name: idx_master_account_status_lower; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_master_account_status_lower ON ifrs9.frs9_master_account USING btree (lower((account_status)::text));


--
-- Name: idx_master_account_wo_join; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX idx_master_account_wo_join ON ifrs9.frs9_master_account_wo USING btree (account_id, prc_date);


--
-- Name: ix_frs9_account_id_account_number; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_account_id_account_number ON ifrs9.frs9_account_id USING btree (account_number);


--
-- Name: ix_frs9_master_account_repo_account_id; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_master_account_repo_account_id ON ifrs9.frs9_master_account_repo USING btree (account_id);


--
-- Name: ix_frs9_master_account_repo_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_master_account_repo_prc_date ON ifrs9.frs9_master_account_repo USING btree (prc_date);


--
-- Name: ix_frs9_master_account_wo_account_id; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_master_account_wo_account_id ON ifrs9.frs9_master_account_wo USING btree (account_id);


--
-- Name: ix_frs9_master_account_wo_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_master_account_wo_prc_date ON ifrs9.frs9_master_account_wo USING btree (prc_date);


--
-- Name: ix_frs9_master_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_frs9_master_prc_date ON ifrs9.frs9_master_account USING btree (prc_date);


--
-- Name: ix_stg_account_trim_prc_date; Type: INDEX; Schema: ifrs9; Owner: postgres
--

CREATE INDEX ix_stg_account_trim_prc_date ON ifrs9.stg_frs9_master_account_bpf USING btree (TRIM(BOTH FROM account_number), prc_date);


--
-- Name: approval_actions approval_actions_approver_id_users_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_actions
    ADD CONSTRAINT approval_actions_approver_id_users_id_fk FOREIGN KEY (approver_id) REFERENCES core.users(id);


--
-- Name: approval_actions approval_actions_delegated_to_users_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_actions
    ADD CONSTRAINT approval_actions_delegated_to_users_id_fk FOREIGN KEY (delegated_to) REFERENCES core.users(id);


--
-- Name: approval_actions approval_actions_request_id_approval_requests_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_actions
    ADD CONSTRAINT approval_actions_request_id_approval_requests_id_fk FOREIGN KEY (request_id) REFERENCES approval.approval_requests(id) ON DELETE CASCADE;


--
-- Name: approval_levels approval_levels_matrix_id_approval_matrices_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_levels
    ADD CONSTRAINT approval_levels_matrix_id_approval_matrices_id_fk FOREIGN KEY (matrix_id) REFERENCES approval.approval_matrices(id) ON DELETE CASCADE;


--
-- Name: approval_matrices approval_matrices_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_matrices
    ADD CONSTRAINT approval_matrices_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: approval_requests approval_requests_completed_by_users_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_requests
    ADD CONSTRAINT approval_requests_completed_by_users_id_fk FOREIGN KEY (completed_by) REFERENCES core.users(id);


--
-- Name: approval_requests approval_requests_matrix_id_approval_matrices_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_requests
    ADD CONSTRAINT approval_requests_matrix_id_approval_matrices_id_fk FOREIGN KEY (matrix_id) REFERENCES approval.approval_matrices(id);


--
-- Name: approval_requests approval_requests_requested_by_users_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_requests
    ADD CONSTRAINT approval_requests_requested_by_users_id_fk FOREIGN KEY (requested_by) REFERENCES core.users(id);


--
-- Name: approval_requests approval_requests_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: approval; Owner: postgres
--

ALTER TABLE ONLY approval.approval_requests
    ADD CONSTRAINT approval_requests_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: email_verification_tokens email_verification_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: sessions sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: menu_access_log menu_access_log_menu_item_id_menu_items_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_access_log
    ADD CONSTRAINT menu_access_log_menu_item_id_menu_items_id_fk FOREIGN KEY (menu_item_id) REFERENCES core.menu_items(id) ON DELETE SET NULL;


--
-- Name: menu_access_log menu_access_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_access_log
    ADD CONSTRAINT menu_access_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_category_id_menu_categories_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_category_id_menu_categories_id_fk FOREIGN KEY (category_id) REFERENCES core.menu_categories(id) ON DELETE SET NULL;


--
-- Name: menu_user_customization menu_user_customization_menu_item_id_menu_items_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_user_customization
    ADD CONSTRAINT menu_user_customization_menu_item_id_menu_items_id_fk FOREIGN KEY (menu_item_id) REFERENCES core.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_user_customization menu_user_customization_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_user_customization
    ADD CONSTRAINT menu_user_customization_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: role_menu_access role_menu_access_granted_by_users_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_granted_by_users_id_fk FOREIGN KEY (granted_by) REFERENCES core.users(id);


--
-- Name: role_menu_access role_menu_access_menu_item_id_menu_items_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_menu_item_id_menu_items_id_fk FOREIGN KEY (menu_item_id) REFERENCES core.menu_items(id) ON DELETE CASCADE;


--
-- Name: role_menu_access role_menu_access_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES core.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.roles
    ADD CONSTRAINT roles_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: user_roles user_roles_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: user_roles user_roles_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: users users_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: job_definitions job_definitions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_definitions
    ADD CONSTRAINT job_definitions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- Name: job_executions job_executions_job_definition_id_job_definitions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_executions
    ADD CONSTRAINT job_executions_job_definition_id_job_definitions_id_fk FOREIGN KEY (job_definition_id) REFERENCES public.job_definitions(id);


--
-- Name: job_executions job_executions_tenant_id_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_executions
    ADD CONSTRAINT job_executions_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES core.tenants(id);


--
-- PostgreSQL database dump complete
--

\unrestrict jr0JBdZNU6aRXx7D4yhft0R9NNawiRTtAfSYI9dfgrSp6hUkAWosMkGNNs2ASPv

