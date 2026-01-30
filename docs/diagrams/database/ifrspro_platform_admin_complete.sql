--
-- PostgreSQL database dump
--

\restrict 6d5wfVHeM2ls6Bb31sHey0Nw4Z5IElBVhvpvDPHJjXckQN8gxCexAGWjpvEPvDi

-- Dumped from database version 16.9
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
-- Name: approval_system; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA approval_system;


ALTER SCHEMA approval_system OWNER TO postgres;

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
-- Name: configuration; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA configuration;


ALTER SCHEMA configuration OWNER TO postgres;

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
-- Name: etl_designer; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA etl_designer;


ALTER SCHEMA etl_designer OWNER TO postgres;

--
-- Name: etl_processing; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA etl_processing;


ALTER SCHEMA etl_processing OWNER TO postgres;

--
-- Name: ifrs9; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA ifrs9;


ALTER SCHEMA ifrs9 OWNER TO postgres;

--
-- Name: individual; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA individual;


ALTER SCHEMA individual OWNER TO postgres;

--
-- Name: menu; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA menu;


ALTER SCHEMA menu OWNER TO postgres;

--
-- Name: SCHEMA menu; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA menu IS 'Database-driven menu system with role-based access and infrastructure monitoring';


--
-- Name: monitoring; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA monitoring;


ALTER SCHEMA monitoring OWNER TO postgres;

--
-- Name: platform_admin; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_admin;


ALTER SCHEMA platform_admin OWNER TO postgres;

--
-- Name: platform_analytics; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_analytics;


ALTER SCHEMA platform_analytics OWNER TO postgres;

--
-- Name: platform_audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_audit;


ALTER SCHEMA platform_audit OWNER TO postgres;

--
-- Name: platform_billing; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_billing;


ALTER SCHEMA platform_billing OWNER TO postgres;

--
-- Name: platform_integration; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_integration;


ALTER SCHEMA platform_integration OWNER TO postgres;

--
-- Name: platform_monitoring; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA platform_monitoring;


ALTER SCHEMA platform_monitoring OWNER TO postgres;

--
-- Name: workflow; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA workflow;


ALTER SCHEMA workflow OWNER TO postgres;

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: dblink; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA platform_admin;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA platform_admin;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: etl_processing; Owner: postgres
--

CREATE FUNCTION etl_processing.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION etl_processing.update_updated_at_column() OWNER TO postgres;

--
-- Name: get_user_menu_hierarchy(uuid, uuid, character varying); Type: FUNCTION; Schema: menu; Owner: postgres
--

CREATE FUNCTION menu.get_user_menu_hierarchy(p_tenant_id uuid, p_user_id uuid, p_banking_type character varying DEFAULT 'both'::character varying) RETURNS TABLE(id uuid, name character varying, path character varying, icon character varying, level integer, parent_id uuid, sort_order integer, is_favorite boolean, is_pinned boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE menu_tree AS (
        -- Base case: root menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.parent_id IS NULL
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
        
        UNION ALL
        
        -- Recursive case: child menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        INNER JOIN menu_tree mt ON mi.parent_id = mt.id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
    )
    SELECT * FROM menu_tree ORDER BY level, sort_order, name;
END;
$$;


ALTER FUNCTION menu.get_user_menu_hierarchy(p_tenant_id uuid, p_user_id uuid, p_banking_type character varying) OWNER TO postgres;

--
-- Name: log_menu_action(uuid, uuid, uuid, character varying, uuid, integer, jsonb, inet, text); Type: FUNCTION; Schema: menu; Owner: postgres
--

CREATE FUNCTION menu.log_menu_action(p_tenant_id uuid, p_user_id uuid, p_menu_item_id uuid, p_action_type character varying, p_session_id uuid DEFAULT NULL::uuid, p_duration_ms integer DEFAULT NULL::integer, p_metadata jsonb DEFAULT '{}'::jsonb, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO menu.menu_analytics (
        tenant_id, user_id, menu_item_id, action_type,
        session_id, duration_ms, metadata, ip_address, user_agent
    ) VALUES (
        p_tenant_id, p_user_id, p_menu_item_id, p_action_type,
        p_session_id, p_duration_ms, p_metadata, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;


ALTER FUNCTION menu.log_menu_action(p_tenant_id uuid, p_user_id uuid, p_menu_item_id uuid, p_action_type character varying, p_session_id uuid, p_duration_ms integer, p_metadata jsonb, p_ip_address inet, p_user_agent text) OWNER TO postgres;

--
-- Name: update_health_status(uuid, character varying, character varying, character varying, text, integer, jsonb); Type: FUNCTION; Schema: menu; Owner: postgres
--

CREATE FUNCTION menu.update_health_status(p_tenant_id uuid, p_service_name character varying, p_check_type character varying, p_status character varying, p_message text DEFAULT NULL::text, p_response_time_ms integer DEFAULT NULL::integer, p_metadata jsonb DEFAULT '{}'::jsonb) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_check_id UUID;
BEGIN
    INSERT INTO menu.system_health_checks (
        tenant_id, service_name, check_type, status,
        message, response_time_ms, metadata
    ) VALUES (
        p_tenant_id, p_service_name, p_check_type, p_status,
        p_message, p_response_time_ms, p_metadata
    ) RETURNING id INTO v_check_id;
    
    RETURN v_check_id;
END;
$$;


ALTER FUNCTION menu.update_health_status(p_tenant_id uuid, p_service_name character varying, p_check_type character varying, p_status character varying, p_message text, p_response_time_ms integer, p_metadata jsonb) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: menu; Owner: postgres
--

CREATE FUNCTION menu.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION menu.update_updated_at_column() OWNER TO postgres;

--
-- Name: check_system_health(); Type: FUNCTION; Schema: monitoring; Owner: postgres
--

CREATE FUNCTION monitoring.check_system_health() RETURNS TABLE(check_name character varying, status character varying, response_time_ms integer, details jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    duration INTEGER;
    conn_count INTEGER;
    max_conn INTEGER;
    db_size BIGINT;
BEGIN
    -- Database connectivity check
    start_time := clock_timestamp();
    PERFORM 1;
    end_time := clock_timestamp();
    duration := EXTRACT(MILLISECONDS FROM end_time - start_time)::INTEGER;
    
    INSERT INTO monitoring.health_checks (check_name, check_type, status, response_time_ms)
    VALUES ('database_connectivity', 'infrastructure', 'healthy', duration);
    
    RETURN QUERY SELECT 
        'database_connectivity'::VARCHAR,
        'healthy'::VARCHAR,
        duration,
        jsonb_build_object('message', 'Database connection successful');
    
    -- Disk space check
    db_size := pg_database_size(current_database());
    RETURN QUERY SELECT 
        'disk_space'::VARCHAR,
        CASE 
            WHEN db_size > 50000000000 THEN 'warning'::VARCHAR
            WHEN db_size > 100000000000 THEN 'critical'::VARCHAR
            ELSE 'healthy'::VARCHAR
        END,
        0,
        jsonb_build_object(
            'database_size', pg_size_pretty(db_size),
            'database_size_bytes', db_size
        );
    
    -- Connection count check
    SELECT COUNT(*), (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections')
    INTO conn_count, max_conn
    FROM pg_stat_activity;
    
    RETURN QUERY SELECT 
        'connection_count'::VARCHAR,
        CASE 
            WHEN conn_count > max_conn * 0.8 THEN 'warning'::VARCHAR
            WHEN conn_count > max_conn * 0.9 THEN 'critical'::VARCHAR
            ELSE 'healthy'::VARCHAR
        END,
        0,
        jsonb_build_object(
            'current_connections', conn_count,
            'max_connections', max_conn,
            'utilization_pct', ROUND(conn_count::DECIMAL / max_conn * 100, 2)
        );
    
END;
$$;


ALTER FUNCTION monitoring.check_system_health() OWNER TO postgres;

--
-- Name: collect_database_metrics(); Type: FUNCTION; Schema: monitoring; Owner: postgres
--

CREATE FUNCTION monitoring.collect_database_metrics() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    db_record RECORD;
BEGIN
    -- Collect database sizes
    FOR db_record IN 
        SELECT datname as database_name,
               pg_database_size(datname) as size_bytes,
               pg_size_pretty(pg_database_size(datname)) as size_human
        FROM pg_database 
        WHERE datname LIKE 'ifrspro_%'
    LOOP
        INSERT INTO monitoring.database_sizes (
            database_name, size_bytes, size_human, table_count, index_count
        ) VALUES (
            db_record.database_name,
            db_record.size_bytes,
            db_record.size_human,
            COALESCE((SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_catalog = db_record.database_name 
                       AND table_schema NOT IN ('information_schema', 'pg_catalog')), 0),
            COALESCE((SELECT COUNT(*) FROM pg_indexes 
                     WHERE schemaname NOT IN ('information_schema', 'pg_catalog')), 0)
        );
    END LOOP;
    
    -- Collect connection statistics
    WITH connection_data AS (
        SELECT 
            COALESCE(a.datname, 'unknown') as database_name,
            COUNT(*) FILTER (WHERE a.state = 'active') as active_connections,
            COUNT(*) FILTER (WHERE a.state = 'idle') as idle_connections,
            (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as max_connections
        FROM pg_stat_activity a
        WHERE a.datname LIKE 'ifrspro_%' OR a.datname IS NULL
        GROUP BY a.datname
    )
    INSERT INTO monitoring.connection_stats (
        database_name, active_connections, idle_connections, 
        max_connections, connection_utilization
    )
    SELECT 
        database_name,
        active_connections,
        idle_connections,
        max_connections,
        ROUND((active_connections + idle_connections)::DECIMAL / max_connections * 100, 2)
    FROM connection_data;
    
    -- Collect performance metrics from pg_stat_statements (if available)
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        INSERT INTO monitoring.performance_metrics (
            metric_name, metric_value, metric_unit, database_name, metadata
        )
        SELECT 
            'avg_query_time',
            mean_exec_time,
            'ms',
            current_database(),
            jsonb_build_object(
                'total_calls', calls,
                'total_time', total_exec_time,
                'query_type', 'aggregated'
            )
        FROM pg_stat_statements
        WHERE calls > 10 AND mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 5;
    END IF;
    
END;
$$;


ALTER FUNCTION monitoring.collect_database_metrics() OWNER TO postgres;

--
-- Name: detect_slow_queries(); Type: FUNCTION; Schema: monitoring; Owner: postgres
--

CREATE FUNCTION monitoring.detect_slow_queries() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Only proceed if pg_stat_statements is available
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        RETURN;
    END IF;
    
    -- Insert or update slow queries
    INSERT INTO monitoring.slow_queries (
        query_hash, query_text, execution_time_ms, database_name,
        user_name, execution_count, avg_execution_time, max_execution_time
    )
    SELECT 
        md5(query),
        LEFT(query, 1000), -- Truncate very long queries
        mean_exec_time,
        current_database(),
        'various',
        calls,
        mean_exec_time,
        max_exec_time
    FROM pg_stat_statements
    WHERE mean_exec_time > 5000 -- Queries slower than 5 seconds
    ON CONFLICT (query_hash) DO UPDATE SET
        execution_count = monitoring.slow_queries.execution_count + EXCLUDED.execution_count,
        last_seen = NOW(),
        avg_execution_time = EXCLUDED.avg_execution_time,
        max_execution_time = GREATEST(monitoring.slow_queries.max_execution_time, EXCLUDED.max_execution_time);
        
END;
$$;


ALTER FUNCTION monitoring.detect_slow_queries() OWNER TO postgres;

--
-- Name: perform_maintenance(); Type: FUNCTION; Schema: monitoring; Owner: postgres
--

CREATE FUNCTION monitoring.perform_maintenance() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    result TEXT := '';
    table_record RECORD;
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    cleanup_count INTEGER;
BEGIN
    result := 'Database Maintenance Report - ' || NOW() || E'\n';
    result := result || '===============================================' || E'\n';
    
    -- Update table statistics
    start_time := clock_timestamp();
    
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname IN ('platform_admin', 'platform_billing', 'platform_audit', 'monitoring', 'core', 'calculation', 'configuration')
    LOOP
        BEGIN
            EXECUTE format('ANALYZE %I.%I', table_record.schemaname, table_record.tablename);
            result := result || format('ANALYZED: %s.%s' || E'\n', 
                                     table_record.schemaname, 
                                     table_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            result := result || format('ANALYZE FAILED: %s.%s - %s' || E'\n', 
                                     table_record.schemaname, 
                                     table_record.tablename,
                                     SQLERRM);
        END;
    END LOOP;
    
    end_time := clock_timestamp();
    result := result || format('Statistics update completed in %s ms' || E'\n', 
                              EXTRACT(MILLISECONDS FROM end_time - start_time)::INTEGER);
    
    -- Vacuum old monitoring data (keep last 30 days)
    start_time := clock_timestamp();
    
    DELETE FROM monitoring.performance_metrics WHERE recorded_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    result := result || format('Cleaned %s old performance metrics' || E'\n', cleanup_count);
    
    DELETE FROM monitoring.health_checks WHERE checked_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    result := result || format('Cleaned %s old health checks' || E'\n', cleanup_count);
    
    DELETE FROM monitoring.connection_stats WHERE recorded_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    result := result || format('Cleaned %s old connection stats' || E'\n', cleanup_count);
    
    DELETE FROM monitoring.database_sizes WHERE recorded_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    result := result || format('Cleaned %s old database size records' || E'\n', cleanup_count);
    
    end_time := clock_timestamp();
    result := result || format('Old monitoring data cleanup completed in %s ms' || E'\n', 
                              EXTRACT(MILLISECONDS FROM end_time - start_time)::INTEGER);
    
    -- Collect fresh metrics
    PERFORM monitoring.collect_database_metrics();
    PERFORM monitoring.detect_slow_queries();
    
    result := result || 'Fresh metrics collection completed' || E'\n';
    result := result || '===============================================' || E'\n';
    
    RETURN result;
END;
$$;


ALTER FUNCTION monitoring.perform_maintenance() OWNER TO postgres;

--
-- Name: check_tenant_database_health(uuid); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.check_tenant_database_health(tenant_id_param uuid) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    tenant_info RECORD;
    health_result JSON;
BEGIN
    SELECT INTO tenant_info
        tenant_name, database_name, status
    FROM platform_admin.tenants
    WHERE id = tenant_id_param;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Tenant not found');
    END IF;
    
    -- Basic health check
    health_result := json_build_object(
        'tenant_id', tenant_id_param,
        'tenant_name', tenant_info.tenant_name,
        'database_name', tenant_info.database_name,
        'status', tenant_info.status,
        'checked_at', NOW()
    );
    
    RETURN health_result;
END;
$$;


ALTER FUNCTION platform_admin.check_tenant_database_health(tenant_id_param uuid) OWNER TO postgres;

--
-- Name: generate_tenant_database_sql(character varying, character varying); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.generate_tenant_database_sql(p_database_name character varying, p_banking_type character varying DEFAULT 'conventional'::character varying) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    sql_script TEXT;
    syariah_fields TEXT := '';
    banking_features TEXT := '';
BEGIN
    -- Add banking-specific features
    IF p_banking_type IN ('syariah', 'dual') THEN
        syariah_fields := '
    -- Syariah-specific fields
    syariah_contract_type VARCHAR(50),
    syariah_structure VARCHAR(100),
    profit_sharing_ratio DECIMAL(8,6),
    syariah_compliance_status VARCHAR(20) DEFAULT ''compliant'',
    syariah_review_date DATE,
    syariah_notes TEXT,';
        
        banking_features := '
-- Syariah compliance tables
CREATE TABLE core.syariah_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_type VARCHAR(50) NOT NULL,
    contract_name VARCHAR(200) NOT NULL,
    description TEXT,
    compliance_rules JSONB DEFAULT ''{}''
);

CREATE TABLE core.syariah_screening (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES core.portfolio_accounts(id),
    screening_date DATE DEFAULT CURRENT_DATE,
    compliance_status VARCHAR(20) DEFAULT ''compliant'',
    screening_notes TEXT
);';
    END IF;
    
    sql_script := '
-- ============================================================================
-- COMPREHENSIVE TENANT DATABASE CREATION: ' || p_database_name || '
-- Banking Type: ' || upper(p_banking_type) || '
-- Generated: ' || NOW() || '
-- Includes ALL functionality from existing ifrspro_ifrs9 database
-- ============================================================================

-- Create the database
\c postgres;
CREATE DATABASE ' || p_database_name || '
WITH 
    OWNER = postgres
    ENCODING = ''UTF8''
    LC_COLLATE = ''en_US.UTF-8''
    LC_CTYPE = ''en_US.UTF-8''
    TEMPLATE = template0
    TABLESPACE = pg_default;

-- Connect to the new database
\c ' || p_database_name || ';

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS staging AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS calculation AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS audit AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS workflow AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS configuration AUTHORIZATION postgres;
CREATE SCHEMA IF NOT EXISTS analytics AUTHORIZATION postgres;

-- Set search path
ALTER DATABASE ' || p_database_name || ' SET search_path TO core, staging, calculation, audit, workflow, configuration, analytics, public;

-- ============================================================================
-- CORE SCHEMA TABLES (Complete RBAC from existing system)
-- ============================================================================

-- Users table (enhanced from existing system)
CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration from existing system
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Roles table (enhanced from existing system)
CREATE TABLE core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT ''{}'',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles mapping
CREATE TABLE core.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES core.users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Portfolio accounts table (comprehensive from existing system)
CREATE TABLE core.portfolio_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration
    account_id VARCHAR(100) NOT NULL UNIQUE,
    customer_id VARCHAR(100) NOT NULL,
    contract_id VARCHAR(100),
    product_type VARCHAR(100) NOT NULL,
    outstanding_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    committed_amount DECIMAL(20,2) DEFAULT 0.00,
    original_amount DECIMAL(20,2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(3) NOT NULL DEFAULT ''IDR'',
    origination_date DATE NOT NULL,
    maturity_date DATE,
    reporting_date DATE NOT NULL,
    current_stage INTEGER NOT NULL DEFAULT 1 CHECK (current_stage IN (1, 2, 3)),
    previous_stage INTEGER CHECK (previous_stage IN (1, 2, 3)),
    stage_change_date DATE,
    customer_name VARCHAR(200),
    customer_type VARCHAR(50),
    industry_sector VARCHAR(100),
    internal_rating VARCHAR(20),
    external_rating VARCHAR(20),
    pd_lifetime DECIMAL(8,6),
    pd_12m DECIMAL(8,6),
    lgd DECIMAL(8,6),
    ead DECIMAL(20,2),
    ecl_12m DECIMAL(20,2),
    ecl_lifetime DECIMAL(20,2),' || syariah_fields || '
    account_status VARCHAR(20) NOT NULL DEFAULT ''active'',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- ============================================================================
-- CALCULATION SCHEMA (Complete ECL system from existing database)
-- ============================================================================

-- ECL Jobs (exact structure from existing system)
CREATE TABLE calculation.ecl_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration
    job_name VARCHAR(200),
    job_type VARCHAR(50) DEFAULT ''regular'' CHECK (job_type IN (''regular'', ''stress_test'', ''sensitivity'', ''back_test'')),
    calculation_date DATE NOT NULL,
    pd_model_id UUID,
    lgd_model_id UUID,
    ead_model_id UUID,
    scenario_id UUID,
    calculation_scope JSONB DEFAULT ''{}'',
    calculation_parameters JSONB DEFAULT ''{}'',
    status VARCHAR(20) DEFAULT ''created'' CHECK (status IN (''created'', ''queued'', ''running'', ''completed'', ''failed'', ''cancelled'')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_accounts INTEGER DEFAULT 0,
    processed_accounts INTEGER DEFAULT 0,
    failed_accounts INTEGER DEFAULT 0,
    total_ecl_amount DECIMAL(20,2) DEFAULT 0.00,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_time_seconds INTEGER,
    memory_usage_mb DECIMAL(10,2),
    error_details JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- ECL Job Logs
CREATE TABLE calculation.ecl_job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES calculation.ecl_jobs(id) ON DELETE CASCADE,
    log_level VARCHAR(20) NOT NULL CHECK (log_level IN (''DEBUG'', ''INFO'', ''WARNING'', ''ERROR'', ''CRITICAL'')),
    log_message TEXT NOT NULL,
    log_details JSONB DEFAULT ''{}'',
    step_name VARCHAR(100),
    component VARCHAR(100),
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ECL Results - Nominative (account level from existing system)
CREATE TABLE calculation.ecl_result_nominative (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES calculation.ecl_jobs(id) ON DELETE CASCADE,
    account_id VARCHAR(100) NOT NULL,
    contract_id VARCHAR(100),
    customer_id VARCHAR(100),
    product_type VARCHAR(100),
    customer_segment VARCHAR(100),
    industry_sector VARCHAR(100),
    outstanding_amount DECIMAL(20,2),
    committed_amount DECIMAL(20,2),
    currency VARCHAR(3),
    current_stage INTEGER NOT NULL CHECK (current_stage IN (1, 2, 3)),
    previous_stage INTEGER CHECK (previous_stage IN (1, 2, 3)),
    stage_change_reason VARCHAR(100),
    pd_12m DECIMAL(10,8),
    pd_lifetime DECIMAL(10,8),
    lgd DECIMAL(8,6),
    ead DECIMAL(20,2),
    ecl_12m DECIMAL(20,2),
    ecl_lifetime DECIMAL(20,2),
    ecl_best_estimate DECIMAL(20,2),
    ecl_downside DECIMAL(20,2),
    ecl_upside DECIMAL(20,2),
    scenario_weights JSONB DEFAULT ''{}'',
    model_version VARCHAR(50),
    calculation_quality_score DECIMAL(5,2) DEFAULT 100.00,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ECL Results - Summary (aggregated from existing system)
CREATE TABLE calculation.ecl_result_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES calculation.ecl_jobs(id) ON DELETE CASCADE,
    aggregation_level VARCHAR(50) NOT NULL, -- total, stage, product, segment
    aggregation_key VARCHAR(200),
    total_accounts INTEGER NOT NULL,
    stage_1_accounts INTEGER DEFAULT 0,
    stage_2_accounts INTEGER DEFAULT 0,
    stage_3_accounts INTEGER DEFAULT 0,
    total_outstanding DECIMAL(20,2) NOT NULL,
    total_committed DECIMAL(20,2) DEFAULT 0.00,
    total_ecl DECIMAL(20,2) NOT NULL,
    ecl_stage_1 DECIMAL(20,2) DEFAULT 0.00,
    ecl_stage_2 DECIMAL(20,2) DEFAULT 0.00,
    ecl_stage_3 DECIMAL(20,2) DEFAULT 0.00,
    avg_pd_12m DECIMAL(10,8),
    avg_pd_lifetime DECIMAL(10,8),
    avg_lgd DECIMAL(8,6),
    ecl_rate_12m DECIMAL(8,6),
    ecl_rate_lifetime DECIMAL(8,6),
    coverage_ratio DECIMAL(8,6),
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stress Test Scenarios (from existing system)
CREATE TABLE calculation.stress_test_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    scenario_name VARCHAR(100) NOT NULL UNIQUE,
    scenario_code VARCHAR(20) NOT NULL UNIQUE,
    scenario_type VARCHAR(50) NOT NULL,
    description TEXT,
    parameters JSONB NOT NULL DEFAULT ''{}'',
    economic_assumptions JSONB DEFAULT ''{}'',
    severity_level VARCHAR(20),
    probability_estimate DECIMAL(5,4),
    time_horizon_years INTEGER,
    regulatory_scenario BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- Stress Test Jobs (from existing system)
CREATE TABLE calculation.stress_test_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    scenario_id UUID NOT NULL REFERENCES calculation.stress_test_scenarios(id),
    job_name VARCHAR(200),
    description TEXT,
    status VARCHAR(20) DEFAULT ''created'' CHECK (status IN (''created'', ''running'', ''completed'', ''failed'', ''cancelled'')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    total_accounts INTEGER DEFAULT 0,
    baseline_ecl DECIMAL(20,2) DEFAULT 0.00,
    stress_ecl DECIMAL(20,2) DEFAULT 0.00,
    ecl_increase DECIMAL(20,2) DEFAULT 0.00,
    ecl_increase_percentage DECIMAL(8,4) DEFAULT 0.00,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_time_seconds INTEGER,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

-- ============================================================================
-- CONFIGURATION SCHEMA (Complete settings from existing system)
-- ============================================================================

-- Application settings (from existing system)
CREATE TABLE configuration.app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_category VARCHAR(50),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    is_system_setting BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT ''{}'',
    requires_approval BOOLEAN DEFAULT false,
    approval_status VARCHAR(20) DEFAULT ''approved'',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model configurations (from existing system)
CREATE TABLE configuration.model_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    model_type VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    parameters TEXT NOT NULL, -- JSON string for legacy compatibility
    calculation_formula TEXT,
    r_script TEXT,
    description TEXT,
    methodology TEXT,
    assumptions TEXT,
    limitations TEXT,
    is_active BOOLEAN DEFAULT false,
    validation_status VARCHAR(20) DEFAULT ''draft'',
    approval_status VARCHAR(20) DEFAULT ''draft'',
    maker_id UUID REFERENCES core.users(id),
    checker_id UUID REFERENCES core.users(id),
    checked_at TIMESTAMPTZ,
    average_execution_time_ms INTEGER,
    success_rate DECIMAL(5,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_model_version UNIQUE (model_type, model_name, model_version)
);

-- Parameter configurations (from existing system)
CREATE TABLE configuration.parameter_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    category VARCHAR(100) NOT NULL,
    parameter_key VARCHAR(100) NOT NULL,
    parameter_value TEXT NOT NULL,
    scenario_identifier VARCHAR(100),
    product_type VARCHAR(100),
    customer_segment VARCHAR(100),
    description TEXT,
    data_type VARCHAR(20) DEFAULT ''string'',
    unit_of_measure VARCHAR(50),
    min_value DECIMAL(15,6),
    max_value DECIMAL(15,6),
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    approval_status VARCHAR(20) DEFAULT ''draft'',
    maker_id UUID REFERENCES core.users(id),
    checker_id UUID REFERENCES core.users(id),
    checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_parameter_key UNIQUE (category, parameter_key, scenario_identifier)
);

-- ============================================================================
-- STAGING SCHEMA (Complete upload system from existing database)
-- ============================================================================

-- Upload batches (enhanced from existing system)
CREATE TABLE staging.upload_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    upload_batch_id VARCHAR(100) UNIQUE, -- Legacy compatibility field
    batch_name VARCHAR(200) NOT NULL,
    batch_type VARCHAR(50) NOT NULL CHECK (batch_type IN (''portfolio_data'', ''customer_data'', ''collateral_data'', ''economic_data'', ''parameter_data'')),
    original_filename VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000),
    file_size BIGINT NOT NULL,
    file_hash VARCHAR(64),
    mime_type VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT ''uploaded'' CHECK (status IN (''uploaded'', ''validating'', ''processing'', ''completed'', ''failed'', ''cancelled'')),
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    valid_records INTEGER DEFAULT 0,
    invalid_records INTEGER DEFAULT 0,
    duplicate_records INTEGER DEFAULT 0,
    error_summary JSONB DEFAULT ''{}'',
    validation_report JSONB DEFAULT ''{}'',
    processing_log TEXT,
    validation_rules JSONB DEFAULT ''{}'',
    processing_options JSONB DEFAULT ''{}'',
    target_table VARCHAR(100),
    approval_task_id UUID,
    approval_status VARCHAR(20) DEFAULT ''pending'',
    approved_by UUID REFERENCES core.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES core.users(id),
    processed_by UUID REFERENCES core.users(id)
);

-- Portfolio data staging (enhanced from existing system)
CREATE TABLE staging.portfolio_data_stage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES staging.upload_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    source_row_id VARCHAR(100),
    validation_status VARCHAR(20) NOT NULL DEFAULT ''pending'' CHECK (validation_status IN (''pending'', ''valid'', ''invalid'', ''warning'')),
    validation_errors JSONB DEFAULT ''[]'',
    validation_warnings JSONB DEFAULT ''[]'',
    raw_data JSONB NOT NULL,
    processed_data JSONB DEFAULT ''{}'',
    normalized_data JSONB DEFAULT ''{}'',
    is_duplicate BOOLEAN DEFAULT false,
    is_processed BOOLEAN DEFAULT false,
    duplicate_of_id UUID REFERENCES staging.portfolio_data_stage(id),
    account_id VARCHAR(100),
    customer_id VARCHAR(100),
    contract_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    processed_by UUID REFERENCES core.users(id)
);

-- Lending data stage (from existing system)
CREATE TABLE staging.lending_data_stage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_batch_id UUID NOT NULL REFERENCES staging.upload_batches(id),
    contract_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(100),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    currency VARCHAR(3) NOT NULL,
    principal_amount DECIMAL(20,2) NOT NULL,
    interest_rate DECIMAL(8,6) NOT NULL,
    outstanding_amount DECIMAL(20,2),
    collateral_value DECIMAL(20,2),
    collateral_type VARCHAR(100),
    customer_segment VARCHAR(50),
    industry_sector VARCHAR(100),
    geographic_region VARCHAR(100),
    internal_rating VARCHAR(20),
    external_rating VARCHAR(20),
    probability_of_default DECIMAL(8,6),
    loss_given_default DECIMAL(8,6),
    exposure_at_default DECIMAL(20,2),
    staged_at TIMESTAMPTZ DEFAULT NOW(),
    staging_status VARCHAR(20) DEFAULT ''staged'',
    validation_errors JSONB DEFAULT ''[]''
);

-- ============================================================================
-- WORKFLOW SCHEMA (Complete approval system from existing database)
-- ============================================================================

-- Approval tasks (enhanced from existing system)
CREATE TABLE workflow.approval_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_number VARCHAR(50) UNIQUE,
    task_title VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    entity_reference VARCHAR(200),
    workflow_type VARCHAR(50) NOT NULL,
    approval_level INTEGER DEFAULT 1,
    required_approvals INTEGER DEFAULT 1,
    current_approvals INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT ''pending'' CHECK (status IN (''pending'', ''in_review'', ''approved'', ''rejected'', ''cancelled'', ''expired'')),
    priority VARCHAR(20) DEFAULT ''normal'' CHECK (priority IN (''low'', ''normal'', ''high'', ''urgent'')),
    requester_id UUID NOT NULL REFERENCES core.users(id),
    approver_id UUID REFERENCES core.users(id),
    assigned_role_id UUID REFERENCES core.roles(id),
    current_assignee_id UUID REFERENCES core.users(id),
    request_details JSONB DEFAULT ''{}'',
    approval_criteria JSONB DEFAULT ''{}'',
    comments TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    escalation_level INTEGER DEFAULT 0,
    escalated_at TIMESTAMPTZ,
    escalated_to UUID REFERENCES core.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES core.users(id)
);

-- Approval logs (from existing system)
CREATE TABLE audit.approval_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_key VARCHAR(100) NOT NULL,
    entity_id UUID,
    action VARCHAR(100) NOT NULL,
    action_result VARCHAR(20) NOT NULL,
    comments TEXT,
    user_id UUID NOT NULL REFERENCES core.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    session_id UUID,
    ip_address INET,
    approval_level INTEGER,
    workflow_step VARCHAR(100),
    next_approver UUID REFERENCES core.users(id)
);

-- ============================================================================
-- ANALYTICS SCHEMA (R Models from existing system)
-- ============================================================================

-- R Models (enhanced from existing system)
CREATE TABLE analytics.r_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_code VARCHAR(20) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_category VARCHAR(50),
    r_script TEXT NOT NULL,
    r_packages TEXT[], -- Required R packages
    model_parameters JSONB DEFAULT ''{}'',
    input_variables JSONB DEFAULT ''[]'',
    output_variables JSONB DEFAULT ''[]'',
    description TEXT,
    methodology TEXT,
    assumptions TEXT,
    limitations TEXT,
    validation_methodology TEXT,
    performance_metrics JSONB DEFAULT ''{}'',
    validation_metrics JSONB DEFAULT ''{}'',
    last_training_date TIMESTAMPTZ,
    last_validation_date TIMESTAMPTZ,
    validation_score DECIMAL(8,6),
    development_status VARCHAR(20) DEFAULT ''development'',
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    is_production_ready BOOLEAN DEFAULT false,
    regulatory_approval VARCHAR(100),
    model_risk_rating VARCHAR(20),
    next_review_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    approved_by UUID REFERENCES core.users(id),
    approved_at TIMESTAMPTZ
);

-- Model executions (from existing system)
CREATE TABLE analytics.model_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES analytics.r_models(id),
    execution_reference VARCHAR(100) UNIQUE,
    execution_date TIMESTAMPTZ DEFAULT NOW(),
    execution_type VARCHAR(50) NOT NULL CHECK (execution_type IN (''training'', ''prediction'', ''validation'', ''batch_scoring'', ''stress_test'')),
    execution_purpose TEXT,
    input_data JSONB NOT NULL,
    output_data JSONB NOT NULL,
    model_parameters JSONB,
    input_data_quality_score DECIMAL(5,2) DEFAULT 100.00,
    output_data_quality_score DECIMAL(5,2) DEFAULT 100.00,
    execution_time_ms INTEGER,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percentage DECIMAL(5,2),
    model_confidence DECIMAL(5,4),
    prediction_accuracy DECIMAL(5,4),
    execution_status VARCHAR(20) NOT NULL DEFAULT ''completed'' CHECK (execution_status IN (''queued'', ''running'', ''completed'', ''failed'', ''cancelled'')),
    error_message TEXT,
    error_details JSONB,
    warning_messages TEXT[],
    calculation_date DATE,
    scenario_name VARCHAR(100),
    batch_identifier VARCHAR(100),
    reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES core.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    r_version VARCHAR(20),
    execution_environment VARCHAR(100),
    executed_by UUID REFERENCES core.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT SCHEMA (Complete audit system from existing database)
-- ============================================================================

-- Enhanced audit logs (from existing system)
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration
    user_id UUID REFERENCES core.users(id),
    session_id VARCHAR(255),
    correlation_id UUID DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(200),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    application_name VARCHAR(100),
    module_name VARCHAR(100),
    function_name VARCHAR(100),
    business_date DATE,
    calculation_date DATE,
    risk_level VARCHAR(20) DEFAULT ''low'',
    compliance_category VARCHAR(50),
    execution_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity logs
CREATE TABLE audit.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id),
    activity_type VARCHAR(100) NOT NULL,
    activity_category VARCHAR(50),
    activity_description TEXT,
    entity_type VARCHAR(100),
    entity_id UUID,
    entity_reference VARCHAR(200),
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    page_url VARCHAR(1000),
    referrer_url VARCHAR(1000),
    browser_info JSONB,
    activity_duration_ms INTEGER,
    page_load_time_ms INTEGER,
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    device_type VARCHAR(50),
    operating_system VARCHAR(100),
    browser_name VARCHAR(100),
    business_function VARCHAR(100),
    data_accessed JSONB,
    calculations_performed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

' || banking_features || '

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Core schema indexes
CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_users_active ON core.users(is_active);
CREATE INDEX idx_users_legacy_id ON core.users(legacy_id);
CREATE INDEX idx_portfolio_account_id ON core.portfolio_accounts(account_id);
CREATE INDEX idx_portfolio_customer_id ON core.portfolio_accounts(customer_id);
CREATE INDEX idx_portfolio_stage ON core.portfolio_accounts(current_stage);
CREATE INDEX idx_portfolio_reporting_date ON core.portfolio_accounts(reporting_date);
CREATE INDEX idx_portfolio_legacy_id ON core.portfolio_accounts(legacy_id);

-- Calculation schema indexes
CREATE INDEX idx_ecl_jobs_status ON calculation.ecl_jobs(status);
CREATE INDEX idx_ecl_jobs_date ON calculation.ecl_jobs(calculation_date);
CREATE INDEX idx_ecl_jobs_legacy_id ON calculation.ecl_jobs(legacy_id);
CREATE INDEX idx_ecl_results_job ON calculation.ecl_result_nominative(job_id);
CREATE INDEX idx_ecl_results_account ON calculation.ecl_result_nominative(account_id);
CREATE INDEX idx_stress_scenarios_legacy_id ON calculation.stress_test_scenarios(legacy_id);

-- Configuration schema indexes
CREATE INDEX idx_app_settings_key ON configuration.app_settings(setting_key);
CREATE INDEX idx_app_settings_legacy_id ON configuration.app_settings(legacy_id);
CREATE INDEX idx_model_configs_type ON configuration.model_configurations(model_type);
CREATE INDEX idx_model_configs_legacy_id ON configuration.model_configurations(legacy_id);
CREATE INDEX idx_param_configs_category ON configuration.parameter_configurations(category);
CREATE INDEX idx_param_configs_legacy_id ON configuration.parameter_configurations(legacy_id);

-- Staging schema indexes
CREATE INDEX idx_upload_batches_status ON staging.upload_batches(status);
CREATE INDEX idx_upload_batches_legacy_id ON staging.upload_batches(legacy_id);
CREATE INDEX idx_staging_batch ON staging.portfolio_data_stage(batch_id);
CREATE INDEX idx_staging_validation ON staging.portfolio_data_stage(validation_status);

-- Workflow schema indexes
CREATE INDEX idx_approval_tasks_status ON workflow.approval_tasks(status);
CREATE INDEX idx_approval_tasks_assignee ON workflow.approval_tasks(current_assignee_id);
CREATE INDEX idx_approval_tasks_entity ON workflow.approval_tasks(entity_type, entity_id);

-- Analytics schema indexes
CREATE INDEX idx_r_models_type ON analytics.r_models(model_type);
CREATE INDEX idx_r_models_active ON analytics.r_models(is_active);
CREATE INDEX idx_r_models_legacy_id ON analytics.r_models(legacy_id);
CREATE INDEX idx_model_executions_model ON analytics.model_executions(model_id);
CREATE INDEX idx_model_executions_status ON analytics.model_executions(execution_status);

-- Audit schema indexes
CREATE INDEX idx_audit_user_time ON audit.audit_logs(user_id, timestamp);
CREATE INDEX idx_audit_entity ON audit.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_legacy_id ON audit.audit_logs(legacy_id);
CREATE INDEX idx_user_activity_user ON audit.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_time ON audit.user_activity_logs(created_at);

-- Success message
SELECT ''Comprehensive tenant database ' || p_database_name || ' structure created successfully for ' || p_banking_type || ' banking!'' as result;
SELECT ''Database includes ALL functionality from existing ifrspro_ifrs9 system plus modern enhancements!'' as note;
';

    RETURN sql_script;
END;
$$;


ALTER FUNCTION platform_admin.generate_tenant_database_sql(p_database_name character varying, p_banking_type character varying) OWNER TO postgres;

--
-- Name: get_current_tenant_id(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.get_current_tenant_id() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN COALESCE(current_setting('app.current_tenant_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID);
END;
$$;


ALTER FUNCTION platform_admin.get_current_tenant_id() OWNER TO postgres;

--
-- Name: get_tenant_stats(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.get_tenant_stats() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tenants', COUNT(*),
        'active_tenants', COUNT(*) FILTER (WHERE status = 'active'),
        'conventional_banks', COUNT(*) FILTER (WHERE banking_type = 'conventional'),
        'syariah_banks', COUNT(*) FILTER (WHERE banking_type = 'syariah'),
        'dual_banks', COUNT(*) FILTER (WHERE banking_type = 'dual'),
        'basic_subscriptions', COUNT(*) FILTER (WHERE subscription_tier = 'basic'),
        'premium_subscriptions', COUNT(*) FILTER (WHERE subscription_tier = 'premium'),
        'enterprise_subscriptions', COUNT(*) FILTER (WHERE subscription_tier = 'enterprise'),
        'provisioning_tenants', COUNT(*) FILTER (WHERE status = 'provisioning'),
        'suspended_tenants', COUNT(*) FILTER (WHERE status = 'suspended')
    ) INTO stats
    FROM platform_admin.tenants;
    
    RETURN stats;
END;
$$;


ALTER FUNCTION platform_admin.get_tenant_stats() OWNER TO postgres;

--
-- Name: list_tenants(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.list_tenants() RETURNS TABLE(tenant_id uuid, tenant_name character varying, display_name character varying, banking_type character varying, database_name character varying, status character varying, subscription_tier character varying, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.tenant_name,
        t.display_name,
        t.banking_type,
        t.database_name,
        t.status,
        t.subscription_tier,
        t.created_at
    FROM platform_admin.tenants t
    ORDER BY t.created_at DESC;
END;
$$;


ALTER FUNCTION platform_admin.list_tenants() OWNER TO postgres;

--
-- Name: provision_tenant_database(character varying, character varying, character varying); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.provision_tenant_database(p_tenant_name character varying, p_banking_type character varying, p_org_name character varying DEFAULT NULL::character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    tenant_record RECORD;
    db_name VARCHAR(100);
    tenant_id UUID;
BEGIN
    -- Generate tenant ID
    tenant_id := uuid_generate_v4();
    
    -- Generate database name
    db_name := 'ifrspro_tenant_' || lower(replace(p_tenant_name, ' ', '_')) || '_' || p_banking_type;
    
    -- Insert tenant record
    INSERT INTO platform_admin.tenants (
        id, tenant_name, tenant_slug, display_name, organization_name,
        banking_type, database_name, database_host, database_port,
        status, subscription_tier, features_enabled, created_at, created_by
    ) VALUES (
        tenant_id,
        p_tenant_name,
        lower(replace(p_tenant_name, ' ', '')),
        COALESCE(p_org_name, p_tenant_name || ' Banking'),
        COALESCE(p_org_name, p_tenant_name || ' Organization'),
        p_banking_type,
        db_name,
        'localhost',
        5432,
        'provisioning',
        'basic',
        CASE 
            WHEN p_banking_type = 'syariah' THEN 
                '{"dashboard": true, "api_access": true, "audit_trail": true, "basic_reports": true, "stress_testing": true, "islamic_banking": true, "ecl_calculations": true, "advanced_analytics": true, "syariah_compliance": true, "workflow_management": true}'::jsonb
            ELSE
                '{"dashboard": true, "basic_reports": true, "ecl_calculations": true}'::jsonb
        END,
        NOW(),
        'system'
    );
    
    -- Return tenant information
    SELECT INTO tenant_record 
        id, tenant_name, database_name, banking_type, status
    FROM platform_admin.tenants 
    WHERE id = tenant_id;
    
    RETURN json_build_object(
        'tenant_id', tenant_record.id,
        'tenant_name', tenant_record.tenant_name,
        'database_name', tenant_record.database_name,
        'banking_type', tenant_record.banking_type,
        'status', tenant_record.status
    );
END;
$$;


ALTER FUNCTION platform_admin.provision_tenant_database(p_tenant_name character varying, p_banking_type character varying, p_org_name character varying) OWNER TO postgres;

--
-- Name: register_tenant(character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.register_tenant(p_tenant_name character varying, p_display_name character varying, p_organization_name character varying, p_banking_type character varying, p_subscription_tier character varying DEFAULT 'basic'::character varying, p_database_host character varying DEFAULT 'localhost'::character varying, p_created_by character varying DEFAULT 'system'::character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    tenant_id UUID;
    database_name VARCHAR;
    tenant_slug VARCHAR;
    result JSONB;
BEGIN
    -- Generate tenant slug
    tenant_slug := lower(regexp_replace(p_tenant_name, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Generate database name
    database_name := 'ifrspro_tenant_' || tenant_slug || '_' || lower(p_banking_type);
    
    -- Validate inputs
    IF p_banking_type NOT IN ('conventional', 'syariah', 'dual') THEN
        RETURN jsonb_build_object('error', 'Invalid banking type. Must be conventional, syariah, or dual');
    END IF;
    
    IF p_subscription_tier NOT IN ('basic', 'premium', 'enterprise') THEN
        RETURN jsonb_build_object('error', 'Invalid subscription tier. Must be basic, premium, or enterprise');
    END IF;
    
    -- Check if tenant already exists
    IF EXISTS (SELECT 1 FROM platform_admin.tenants WHERE tenant_name = p_tenant_name) THEN
        RETURN jsonb_build_object('error', 'Tenant already exists');
    END IF;
    
    -- Insert tenant record
    INSERT INTO platform_admin.tenants (
        tenant_name,
        tenant_slug,
        display_name,
        organization_name,
        banking_type,
        database_name,
        database_host,
        subscription_tier,
        status,
        created_by,
        features_enabled,
        compliance_settings
    ) VALUES (
        p_tenant_name,
        tenant_slug,
        p_display_name,
        p_organization_name,
        p_banking_type,
        database_name,
        p_database_host,
        p_subscription_tier,
        'provisioning',
        p_created_by,
        CASE p_subscription_tier
            WHEN 'basic' THEN '{"dashboard": true, "basic_reports": true, "ecl_calculations": true}'::JSONB
            WHEN 'premium' THEN '{"dashboard": true, "basic_reports": true, "advanced_reports": true, "api_access": true, "ecl_calculations": true, "stress_testing": true}'::JSONB
            WHEN 'enterprise' THEN '{"dashboard": true, "basic_reports": true, "advanced_reports": true, "api_access": true, "ecl_calculations": true, "stress_testing": true, "custom_models": true, "priority_support": true, "r_analytics": true}'::JSONB
        END,
        CASE p_banking_type
            WHEN 'syariah' THEN '{"syariah_compliance": true, "syariah_screening": true, "profit_sharing": true}'::JSONB
            WHEN 'dual' THEN '{"conventional_banking": true, "syariah_compliance": true, "dual_reporting": true}'::JSONB
            ELSE '{}'::JSONB
        END
    ) RETURNING id INTO tenant_id;
    
    -- Create default subscription plan
    INSERT INTO platform_billing.tenant_subscriptions (
        tenant_id,
        plan_id,
        start_date,
        next_billing_date,
        monthly_amount
    ) VALUES (
        tenant_id,
        (SELECT id FROM platform_billing.subscription_plans WHERE plan_tier = p_subscription_tier LIMIT 1),
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        CASE p_subscription_tier
            WHEN 'basic' THEN 99.00
            WHEN 'premium' THEN 299.00
            WHEN 'enterprise' THEN 999.00
        END
    );
    
    -- Log the registration
    INSERT INTO platform_audit.global_audit_log (
        tenant_id,
        event_type,
        action,
        description,
        new_values
    ) VALUES (
        tenant_id,
        'TENANT_REGISTRATION',
        'CREATE',
        'New tenant registered: ' || p_tenant_name,
        jsonb_build_object(
            'tenant_name', p_tenant_name,
            'database_name', database_name,
            'banking_type', p_banking_type,
            'subscription_tier', p_subscription_tier
        )
    );
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'tenant_id', tenant_id,
        'tenant_name', p_tenant_name,
        'database_name', database_name,
        'message', 'Tenant registered successfully. Use generate_tenant_database_sql() to create database.'
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION platform_admin.register_tenant(p_tenant_name character varying, p_display_name character varying, p_organization_name character varying, p_banking_type character varying, p_subscription_tier character varying, p_database_host character varying, p_created_by character varying) OWNER TO postgres;

--
-- Name: set_tenant_context(uuid); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.set_tenant_context(tenant_id_param uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Set tenant context for row-level security
    PERFORM set_config('app.current_tenant_id', tenant_id_param::text, true);
END;
$$;


ALTER FUNCTION platform_admin.set_tenant_context(tenant_id_param uuid) OWNER TO postgres;

--
-- Name: update_children_menu_paths(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.update_children_menu_paths() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If parent_id or key changed, update all children
    IF OLD.parent_id IS DISTINCT FROM NEW.parent_id OR OLD.key IS DISTINCT FROM NEW.key THEN
        UPDATE platform_admin.menu_items
        SET path = NEW.path || SUBSTRING(path FROM LENGTH(OLD.path) + 1),
            level = NEW.level + (level - OLD.level)
        WHERE path LIKE OLD.path || '%' AND id != NEW.id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION platform_admin.update_children_menu_paths() OWNER TO postgres;

--
-- Name: update_menu_item_path(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.update_menu_item_path() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update level based on parent
    IF NEW.parent_id IS NULL THEN
        NEW.level = 0;
        NEW.path = '/' || NEW.key;
    ELSE
        -- Get parent level and path
        SELECT level + 1, COALESCE(path, '/') || COALESCE(key, '') || '/' || NEW.key
        INTO NEW.level, NEW.path
        FROM platform_admin.menu_items
        WHERE id = NEW.parent_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION platform_admin.update_menu_item_path() OWNER TO postgres;

--
-- Name: update_menu_items_updated_at(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.update_menu_items_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION platform_admin.update_menu_items_updated_at() OWNER TO postgres;

--
-- Name: update_tenant_status(uuid, character varying, character varying); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.update_tenant_status(p_tenant_id uuid, p_new_status character varying, p_updated_by character varying DEFAULT 'system'::character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    result JSONB;
    old_status VARCHAR;
BEGIN
    -- Get current status
    SELECT status INTO old_status FROM platform_admin.tenants WHERE id = p_tenant_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Tenant not found');
    END IF;
    
    -- Validate new status
    IF p_new_status NOT IN ('provisioning', 'active', 'suspended', 'terminated') THEN
        RETURN jsonb_build_object('error', 'Invalid status');
    END IF;
    
    -- Update status
    UPDATE platform_admin.tenants 
    SET status = p_new_status, 
        updated_at = NOW(),
        updated_by = p_updated_by
    WHERE id = p_tenant_id;
    
    -- Log the change
    INSERT INTO platform_audit.global_audit_log (
        tenant_id,
        event_type,
        action,
        description,
        old_values,
        new_values
    ) VALUES (
        p_tenant_id,
        'TENANT_STATUS_CHANGE',
        'UPDATE',
        'Tenant status changed from ' || old_status || ' to ' || p_new_status,
        jsonb_build_object('status', old_status),
        jsonb_build_object('status', p_new_status)
    );
    
    result := jsonb_build_object(
        'success', true,
        'tenant_id', p_tenant_id,
        'old_status', old_status,
        'new_status', p_new_status,
        'message', 'Tenant status updated successfully'
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION platform_admin.update_tenant_status(p_tenant_id uuid, p_new_status character varying, p_updated_by character varying) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: platform_admin; Owner: postgres
--

CREATE FUNCTION platform_admin.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION platform_admin.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: approval_actions; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    approval_request_id uuid NOT NULL,
    approver_id uuid NOT NULL,
    approver_role character varying(100) NOT NULL,
    approval_level integer NOT NULL,
    action character varying(20) NOT NULL,
    decision_reason text,
    conditions text,
    delegated_to uuid,
    delegation_reason text,
    syariah_compliance_check boolean,
    regulatory_compliance_check boolean,
    compliance_comments text,
    risk_assessment jsonb,
    risk_score integer,
    risk_comments text,
    attachments jsonb,
    supporting_evidence text,
    action_taken_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address inet,
    user_agent text,
    session_id character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT approval_actions_action_check CHECK (((action)::text = ANY (ARRAY[('approve'::character varying)::text, ('reject'::character varying)::text, ('request_info'::character varying)::text, ('delegate'::character varying)::text])))
);


ALTER TABLE approval_system.approval_actions OWNER TO postgres;

--
-- Name: approval_audit_trail; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_audit_trail (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    approval_request_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    event_description text NOT NULL,
    actor_id uuid,
    actor_role character varying(100),
    actor_type character varying(30),
    event_data jsonb,
    previous_state jsonb,
    new_state jsonb,
    ip_address inet,
    user_agent text,
    session_id character varying(100),
    regulatory_impact boolean DEFAULT false,
    compliance_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE approval_system.approval_audit_trail OWNER TO postgres;

--
-- Name: approval_definitions; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    approval_type character varying(100) NOT NULL,
    approval_name character varying(200) NOT NULL,
    description text,
    banking_type character varying(20),
    required_approvals integer DEFAULT 2 NOT NULL,
    approval_levels jsonb NOT NULL,
    escalation_rules jsonb,
    workflow_template_id uuid,
    auto_approve_conditions jsonb,
    rejection_handling jsonb,
    compliance_rules jsonb,
    audit_requirements jsonb,
    regulatory_framework character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    version character varying(10) DEFAULT '1.0'::character varying NOT NULL,
    effective_date timestamp with time zone DEFAULT now() NOT NULL,
    expiry_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid,
    CONSTRAINT approval_definitions_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text])))
);


ALTER TABLE approval_system.approval_definitions OWNER TO postgres;

--
-- Name: approval_matrix; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_matrix (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    matrix_name character varying(200) NOT NULL,
    matrix_type character varying(100) NOT NULL,
    banking_type character varying(20) NOT NULL,
    amount_thresholds jsonb,
    risk_thresholds jsonb,
    entity_type_rules jsonb,
    approval_levels jsonb NOT NULL,
    auto_approval_rules jsonb,
    escalation_rules jsonb,
    emergency_override_rules jsonb,
    syariah_board_approval_required boolean DEFAULT false,
    syariah_compliance_rules jsonb,
    is_active boolean DEFAULT true NOT NULL,
    effective_from timestamp with time zone DEFAULT now() NOT NULL,
    effective_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL
);


ALTER TABLE approval_system.approval_matrix OWNER TO postgres;

--
-- Name: approval_notifications; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    approval_request_id uuid NOT NULL,
    notification_type character varying(50) NOT NULL,
    recipient_id uuid NOT NULL,
    recipient_role character varying(100),
    subject character varying(300) NOT NULL,
    message text NOT NULL,
    priority character varying(20) DEFAULT 'normal'::character varying,
    delivery_method character varying(30) NOT NULL,
    delivery_status character varying(20) DEFAULT 'pending'::character varying,
    delivery_attempts integer DEFAULT 0,
    scheduled_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    is_escalation boolean DEFAULT false,
    escalation_level integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE approval_system.approval_notifications OWNER TO postgres;

--
-- Name: approval_requests; Type: TABLE; Schema: approval_system; Owner: postgres
--

CREATE TABLE approval_system.approval_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    approval_definition_id uuid NOT NULL,
    request_type character varying(100) NOT NULL,
    request_title character varying(300) NOT NULL,
    request_description text,
    request_data jsonb NOT NULL,
    request_metadata jsonb,
    requested_by uuid NOT NULL,
    requester_role character varying(100),
    tenant_id uuid NOT NULL,
    banking_type character varying(20) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(100),
    operation_type character varying(50),
    impact_level character varying(20) DEFAULT 'medium'::character varying,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    current_level integer DEFAULT 1 NOT NULL,
    approvals_received integer DEFAULT 0 NOT NULL,
    approvals_required integer NOT NULL,
    rejection_count integer DEFAULT 0 NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    deadline timestamp with time zone,
    completed_at timestamp with time zone,
    final_decision character varying(20),
    final_decision_by uuid,
    final_decision_at timestamp with time zone,
    final_comments text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT approval_requests_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('in_progress'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text, ('expired'::character varying)::text, ('cancelled'::character varying)::text])))
);


ALTER TABLE approval_system.approval_requests OWNER TO postgres;

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
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    refresh_expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    revoke_reason character varying(100)
);


ALTER TABLE auth.sessions OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: configuration; Owner: postgres
--

CREATE TABLE configuration.app_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'string'::character varying,
    category character varying(100) NOT NULL,
    description text,
    default_value text,
    validation_rules jsonb,
    is_encrypted boolean DEFAULT false,
    is_tenant_customizable boolean DEFAULT false,
    requires_restart boolean DEFAULT false,
    environment_scope character varying(20) DEFAULT 'all'::character varying,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT ck_environment_scope CHECK (((environment_scope)::text = ANY (ARRAY[('all'::character varying)::text, ('development'::character varying)::text, ('staging'::character varying)::text, ('production'::character varying)::text]))),
    CONSTRAINT ck_setting_type CHECK (((setting_type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text, ('encrypted'::character varying)::text])))
);


ALTER TABLE configuration.app_settings OWNER TO postgres;

--
-- Name: calculation_parameters; Type: TABLE; Schema: configuration; Owner: postgres
--

CREATE TABLE configuration.calculation_parameters (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    parameter_category character varying(100) NOT NULL,
    parameter_key character varying(100) NOT NULL,
    parameter_value text NOT NULL,
    parameter_type character varying(50) DEFAULT 'string'::character varying,
    unit_of_measure character varying(50),
    scenario_identifier character varying(100),
    product_type character varying(100),
    customer_segment character varying(100),
    geographic_region character varying(100),
    currency_code character varying(3) DEFAULT 'USD'::character varying,
    effective_date date DEFAULT CURRENT_DATE,
    expiry_date date,
    data_source character varying(200),
    update_frequency character varying(50),
    is_regulatory_required boolean DEFAULT false,
    validation_rules jsonb,
    approval_status character varying(20) DEFAULT 'draft'::character varying,
    approved_by uuid,
    approval_date timestamp with time zone,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT ck_parameter_type CHECK (((parameter_type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('percentage'::character varying)::text, ('rate'::character varying)::text, ('boolean'::character varying)::text, ('date'::character varying)::text]))),
    CONSTRAINT ck_scenario_identifier CHECK (((scenario_identifier)::text = ANY (ARRAY[('base'::character varying)::text, ('optimistic'::character varying)::text, ('pessimistic'::character varying)::text, ('stress'::character varying)::text, ('user_defined'::character varying)::text])))
);


ALTER TABLE configuration.calculation_parameters OWNER TO postgres;

--
-- Name: feature_flags; Type: TABLE; Schema: configuration; Owner: postgres
--

CREATE TABLE configuration.feature_flags (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    flag_name character varying(100) NOT NULL,
    is_enabled boolean DEFAULT false,
    conditions jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE configuration.feature_flags OWNER TO postgres;

--
-- Name: ifrs9_model_configurations; Type: TABLE; Schema: configuration; Owner: postgres
--

CREATE TABLE configuration.ifrs9_model_configurations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    model_name character varying(100) NOT NULL,
    model_type character varying(50) NOT NULL,
    model_version character varying(20) NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb NOT NULL,
    calculation_formula text,
    r_script_path character varying(500),
    methodology text,
    assumptions text,
    limitations text,
    validation_rules jsonb,
    performance_metrics jsonb,
    is_active boolean DEFAULT false,
    is_approved boolean DEFAULT false,
    approval_status character varying(20) DEFAULT 'draft'::character varying,
    approval_date timestamp with time zone,
    approved_by uuid,
    effective_from date,
    effective_until date,
    tenant_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    CONSTRAINT ck_approval_status CHECK (((approval_status)::text = ANY (ARRAY[('draft'::character varying)::text, ('pending'::character varying)::text, ('approved'::character varying)::text, ('rejected'::character varying)::text]))),
    CONSTRAINT ck_model_type CHECK (((model_type)::text = ANY (ARRAY[('pd'::character varying)::text, ('lgd'::character varying)::text, ('ead'::character varying)::text, ('staging'::character varying)::text, ('stress_test'::character varying)::text])))
);


ALTER TABLE configuration.ifrs9_model_configurations OWNER TO postgres;

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
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
    granted_at timestamp with time zone DEFAULT now() NOT NULL
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
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
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    sort_order integer DEFAULT 100
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
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    banking_type_restriction character varying(20),
    is_temporary boolean DEFAULT false NOT NULL,
    temporary_reason text,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.user_roles OWNER TO postgres;

--
-- Name: platform_users; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.platform_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    company character varying(200),
    specialization character varying(100),
    certification_level character varying(50),
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    force_password_change boolean DEFAULT false,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid,
    first_name character varying(100),
    last_name character varying(100)
);


ALTER TABLE platform_admin.platform_users OWNER TO postgres;

--
-- Name: users; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.users AS
 SELECT id,
    NULL::integer AS legacy_id,
    username,
    email,
    password_hash,
    full_name,
    first_name,
    last_name,
    NULL::character varying AS employee_id,
    company AS department,
    role AS "position",
    is_active,
    true AS is_email_verified,
    last_login_at,
    NULL::timestamp without time zone AS password_changed_at,
    0 AS failed_login_attempts,
    NULL::timestamp without time zone AS locked_until,
    false AS mfa_enabled,
    NULL::character varying AS mfa_secret,
    'PLATFORM'::text AS banking_access,
    false AS syariah_certified,
    NULL::timestamp without time zone AS syariah_certification_date,
    'not_applicable'::character varying AS syariah_certification_level,
    0 AS login_count,
    NULL::character varying AS current_session_id,
    force_password_change,
    NULL::jsonb AS password_history,
    tenant_id,
    created_at,
    updated_at,
    NULL::uuid AS created_by,
    NULL::uuid AS updated_by,
    NULL::character varying AS phone
   FROM platform_admin.platform_users;


ALTER VIEW core.users OWNER TO postgres;

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
-- Name: data_lineage; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.data_lineage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    source_entity character varying(255) NOT NULL,
    target_entity character varying(255) NOT NULL,
    transformation_type character varying(100) NOT NULL,
    lineage_metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.data_lineage OWNER TO postgres;

--
-- Name: data_sources; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.data_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    source_type character varying(50) NOT NULL,
    connection_config jsonb NOT NULL,
    schema_definition jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.data_sources OWNER TO postgres;

--
-- Name: execution_history; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.execution_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    execution_id character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    execution_log jsonb,
    error_details jsonb,
    metrics jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.execution_history OWNER TO postgres;

--
-- Name: monitoring_alerts; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.monitoring_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    alert_type character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    message text NOT NULL,
    details jsonb,
    is_resolved boolean DEFAULT false,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.monitoring_alerts OWNER TO postgres;

--
-- Name: optimization_results; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.optimization_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    optimization_timestamp timestamp without time zone NOT NULL,
    original_metrics jsonb NOT NULL,
    expected_improvements jsonb NOT NULL,
    implementation_plan jsonb NOT NULL,
    risk_assessment jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.optimization_results OWNER TO postgres;

--
-- Name: performance_metrics; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    node_id character varying(100) NOT NULL,
    execution_id character varying(100) NOT NULL,
    execution_time integer NOT NULL,
    memory_usage bigint NOT NULL,
    records_processed integer NOT NULL,
    throughput numeric(10,2) NOT NULL,
    error_count integer DEFAULT 0,
    "timestamp" timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.performance_metrics OWNER TO postgres;

--
-- Name: quality_reports; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.quality_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    node_id character varying(100),
    "timestamp" timestamp without time zone NOT NULL,
    overall_score integer NOT NULL,
    total_records integer NOT NULL,
    passed_rules integer NOT NULL,
    failed_rules integer NOT NULL,
    report_data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.quality_reports OWNER TO postgres;

--
-- Name: quality_rules; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.quality_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    rule_type character varying(50) NOT NULL,
    rule_definition jsonb NOT NULL,
    severity character varying(20) DEFAULT 'warning'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.quality_rules OWNER TO postgres;

--
-- Name: recovery_attempts; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.recovery_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    execution_id character varying(100) NOT NULL,
    node_id character varying(100) NOT NULL,
    error_pattern character varying(100) NOT NULL,
    recovery_strategy jsonb NOT NULL,
    success boolean NOT NULL,
    attempts integer NOT NULL,
    error_details jsonb,
    attempt_timestamp timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.recovery_attempts OWNER TO postgres;

--
-- Name: recovery_checkpoints; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.recovery_checkpoints (
    id character varying(255) NOT NULL,
    execution_id character varying(100) NOT NULL,
    node_id character varying(100) NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    state jsonb NOT NULL,
    processed_records integer NOT NULL,
    last_processed_id character varying(255),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.recovery_checkpoints OWNER TO postgres;

--
-- Name: schema_evolution; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.schema_evolution (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    data_source_id uuid NOT NULL,
    previous_schema jsonb,
    current_schema_data jsonb NOT NULL,
    changes jsonb NOT NULL,
    impact_analysis jsonb,
    migration_strategy jsonb,
    applied_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.schema_evolution OWNER TO postgres;

--
-- Name: transformations; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.transformations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    node_id character varying(100) NOT NULL,
    node_type character varying(50) NOT NULL,
    node_config jsonb NOT NULL,
    "position" jsonb NOT NULL,
    connections jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.transformations OWNER TO postgres;

--
-- Name: workflow_templates; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.workflow_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    template_definition jsonb NOT NULL,
    parameters jsonb DEFAULT '[]'::jsonb,
    tags text[] DEFAULT '{}'::text[],
    is_public boolean DEFAULT false,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.workflow_templates OWNER TO postgres;

--
-- Name: workflows; Type: TABLE; Schema: etl_designer; Owner: postgres
--

CREATE TABLE etl_designer.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    workflow_definition jsonb NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    version integer DEFAULT 1,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE etl_designer.workflows OWNER TO postgres;

--
-- Name: data_lineage; Type: TABLE; Schema: etl_processing; Owner: postgres
--

CREATE TABLE etl_processing.data_lineage (
    id integer NOT NULL,
    batch_id character varying(255) NOT NULL,
    source_file character varying(500),
    source_format character varying(50),
    source_schema jsonb,
    target_table character varying(200),
    target_schema character varying(100),
    target_fields jsonb,
    transformation_type character varying(100),
    transformation_rules jsonb,
    field_mappings jsonb,
    affected_systems text[],
    dependent_processes text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE etl_processing.data_lineage OWNER TO postgres;

--
-- Name: TABLE data_lineage; Type: COMMENT; Schema: etl_processing; Owner: postgres
--

COMMENT ON TABLE etl_processing.data_lineage IS 'Tracks data transformation lineage and system dependencies';


--
-- Name: data_lineage_id_seq; Type: SEQUENCE; Schema: etl_processing; Owner: postgres
--

CREATE SEQUENCE etl_processing.data_lineage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE etl_processing.data_lineage_id_seq OWNER TO postgres;

--
-- Name: data_lineage_id_seq; Type: SEQUENCE OWNED BY; Schema: etl_processing; Owner: postgres
--

ALTER SEQUENCE etl_processing.data_lineage_id_seq OWNED BY etl_processing.data_lineage.id;


--
-- Name: file_templates; Type: TABLE; Schema: etl_processing; Owner: postgres
--

CREATE TABLE etl_processing.file_templates (
    id integer NOT NULL,
    tenant_id character varying(100) NOT NULL,
    template_name character varying(200) NOT NULL,
    template_description text,
    template_type character varying(100) NOT NULL,
    file_format character varying(50) NOT NULL,
    required_fields jsonb NOT NULL,
    optional_fields jsonb,
    validation_rules jsonb,
    delimiter character varying(10) DEFAULT ','::character varying,
    header_row boolean DEFAULT true,
    date_format character varying(50) DEFAULT 'YYYY-MM-DD'::character varying,
    encoding character varying(20) DEFAULT 'UTF-8'::character varying,
    version integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100),
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE etl_processing.file_templates OWNER TO postgres;

--
-- Name: TABLE file_templates; Type: COMMENT; Schema: etl_processing; Owner: postgres
--

COMMENT ON TABLE etl_processing.file_templates IS 'Predefined file templates with validation rules for different data types';


--
-- Name: file_templates_id_seq; Type: SEQUENCE; Schema: etl_processing; Owner: postgres
--

CREATE SEQUENCE etl_processing.file_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE etl_processing.file_templates_id_seq OWNER TO postgres;

--
-- Name: file_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: etl_processing; Owner: postgres
--

ALTER SEQUENCE etl_processing.file_templates_id_seq OWNED BY etl_processing.file_templates.id;


--
-- Name: processing_history; Type: TABLE; Schema: etl_processing; Owner: postgres
--

CREATE TABLE etl_processing.processing_history (
    id integer NOT NULL,
    batch_id character varying(255) NOT NULL,
    records_processed integer DEFAULT 0 NOT NULL,
    records_inserted integer DEFAULT 0 NOT NULL,
    records_updated integer DEFAULT 0 NOT NULL,
    records_skipped integer DEFAULT 0 NOT NULL,
    records_failed integer DEFAULT 0 NOT NULL,
    processing_options jsonb,
    transformation_applied jsonb,
    target_tables text[],
    processing_started_at timestamp with time zone,
    processing_completed_at timestamp with time zone,
    processing_duration integer,
    error_count integer DEFAULT 0 NOT NULL,
    error_details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE etl_processing.processing_history OWNER TO postgres;

--
-- Name: TABLE processing_history; Type: COMMENT; Schema: etl_processing; Owner: postgres
--

COMMENT ON TABLE etl_processing.processing_history IS 'Historical record of data processing executions and results';


--
-- Name: processing_history_id_seq; Type: SEQUENCE; Schema: etl_processing; Owner: postgres
--

CREATE SEQUENCE etl_processing.processing_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE etl_processing.processing_history_id_seq OWNER TO postgres;

--
-- Name: processing_history_id_seq; Type: SEQUENCE OWNED BY; Schema: etl_processing; Owner: postgres
--

ALTER SEQUENCE etl_processing.processing_history_id_seq OWNED BY etl_processing.processing_history.id;


--
-- Name: upload_batches; Type: TABLE; Schema: etl_processing; Owner: postgres
--

CREATE TABLE etl_processing.upload_batches (
    id character varying(255) NOT NULL,
    tenant_id character varying(100) NOT NULL,
    filename character varying(500) NOT NULL,
    original_name character varying(500) NOT NULL,
    file_size bigint DEFAULT 0 NOT NULL,
    file_type character varying(100),
    file_path character varying(1000),
    status character varying(50) DEFAULT 'uploaded'::character varying NOT NULL,
    uploaded_by character varying(100) NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    validation_results jsonb,
    processing_results jsonb,
    error_details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT upload_batches_status_check CHECK (((status)::text = ANY (ARRAY[('uploaded'::character varying)::text, ('validating'::character varying)::text, ('valid'::character varying)::text, ('invalid'::character varying)::text, ('processing'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text])))
);


ALTER TABLE etl_processing.upload_batches OWNER TO postgres;

--
-- Name: TABLE upload_batches; Type: COMMENT; Schema: etl_processing; Owner: postgres
--

COMMENT ON TABLE etl_processing.upload_batches IS 'Tracks file uploads and processing status through ETL pipeline';


--
-- Name: validation_results; Type: TABLE; Schema: etl_processing; Owner: postgres
--

CREATE TABLE etl_processing.validation_results (
    id integer NOT NULL,
    batch_id character varying(255) NOT NULL,
    record_count integer DEFAULT 0 NOT NULL,
    valid_records integer DEFAULT 0 NOT NULL,
    invalid_records integer DEFAULT 0 NOT NULL,
    warning_records integer DEFAULT 0 NOT NULL,
    validation_rules jsonb,
    issues jsonb,
    field_analysis jsonb,
    validation_started_at timestamp with time zone,
    validation_completed_at timestamp with time zone,
    validation_duration integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE etl_processing.validation_results OWNER TO postgres;

--
-- Name: TABLE validation_results; Type: COMMENT; Schema: etl_processing; Owner: postgres
--

COMMENT ON TABLE etl_processing.validation_results IS 'Detailed validation results and analysis for upload batches';


--
-- Name: validation_results_id_seq; Type: SEQUENCE; Schema: etl_processing; Owner: postgres
--

CREATE SEQUENCE etl_processing.validation_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE etl_processing.validation_results_id_seq OWNER TO postgres;

--
-- Name: validation_results_id_seq; Type: SEQUENCE OWNED BY; Schema: etl_processing; Owner: postgres
--

ALTER SEQUENCE etl_processing.validation_results_id_seq OWNED BY etl_processing.validation_results.id;


--
-- Name: frs9_param_commond; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.frs9_param_commond (
    pkid bigint NOT NULL,
    param_code character varying(50) NOT NULL,
    param_seq integer NOT NULL,
    value1 character varying(100) NOT NULL,
    value2 character varying(100) NOT NULL,
    value3 character varying(50) NOT NULL,
    paramdesc character varying(1000) NOT NULL,
    createdby character varying(50) DEFAULT 'SYSTEM'::character varying,
    createddate timestamp without time zone DEFAULT now(),
    createdhost character varying(50) DEFAULT 'localhost'::character varying,
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
    createdby character varying(50) DEFAULT 'SYSTEM'::character varying,
    createddate timestamp without time zone DEFAULT now(),
    createdhost character varying(50) DEFAULT 'localhost'::character varying,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50),
    banking_type character varying(20) DEFAULT 'conventional'::character varying,
    is_active boolean DEFAULT true,
    requires_approval boolean DEFAULT false
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
-- Name: product_segments; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.product_segments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    group_segment character varying(100) NOT NULL,
    segment character varying(100) NOT NULL,
    sub_segment character varying(100) NOT NULL,
    segment_type character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ifrs9.product_segments OWNER TO postgres;

--
-- Name: rule_base_setting_details; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.rule_base_setting_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rule_id uuid NOT NULL,
    query_group integer DEFAULT 1 NOT NULL,
    seq integer DEFAULT 1 NOT NULL,
    table_name character varying(100) NOT NULL,
    column_name character varying(100) NOT NULL,
    data_type character varying(50) NOT NULL,
    operator character varying(20) NOT NULL,
    value1 character varying(255),
    value2 character varying(255),
    condition character varying(10) DEFAULT 'AND'::character varying NOT NULL,
    detail_type integer,
    stage_from integer,
    stage_to integer,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ifrs9.rule_base_setting_details OWNER TO postgres;

--
-- Name: rule_base_setting_headers; Type: TABLE; Schema: ifrs9; Owner: postgres
--

CREATE TABLE ifrs9.rule_base_setting_headers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    rule_name character varying(100) NOT NULL,
    rule_type character varying(50) NOT NULL,
    updated_table character varying(100) NOT NULL,
    updated_column character varying(100) NOT NULL,
    value character varying(255) NOT NULL,
    seq integer DEFAULT 1,
    active_flag boolean DEFAULT true NOT NULL,
    description text,
    detail_count integer DEFAULT 0,
    created_by uuid,
    updated_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE ifrs9.rule_base_setting_headers OWNER TO postgres;

--
-- Name: dcf_cashflows; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.dcf_cashflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    upload_id uuid,
    scenario_id uuid,
    account_id character varying(50) NOT NULL,
    period_date timestamp without time zone NOT NULL,
    cashflow_amount double precision DEFAULT 0 NOT NULL,
    discount_rate double precision DEFAULT 0,
    discount_factor double precision DEFAULT 1,
    present_value double precision DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.dcf_cashflows OWNER TO postgres;

--
-- Name: dcf_uploads; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.dcf_uploads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    batch_id character varying(50),
    file_name character varying(255) NOT NULL,
    uploaded_by uuid,
    validation_status character varying(20) DEFAULT 'VALIDATING'::character varying,
    error_log text,
    record_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.dcf_uploads OWNER TO postgres;

--
-- Name: individual_audit_trails; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.individual_audit_trails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(100) NOT NULL,
    action character varying(50) NOT NULL,
    field_changed character varying(100),
    old_value text,
    new_value text,
    performed_by uuid,
    reason text,
    performed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.individual_audit_trails OWNER TO postgres;

--
-- Name: individual_overrides; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.individual_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_name character varying(255) NOT NULL,
    account_number character varying(50) NOT NULL,
    original_stage character varying(10) NOT NULL,
    override_stage character varying(10) NOT NULL,
    justification text,
    status character varying(50) DEFAULT 'PENDING'::character varying,
    requested_by uuid,
    approved_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.individual_overrides OWNER TO postgres;

--
-- Name: individual_reports; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.individual_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    report_period character varying(20) NOT NULL,
    report_type character varying(50) NOT NULL,
    generated_by uuid,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    file_path text,
    total_records integer DEFAULT 0,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.individual_reports OWNER TO postgres;

--
-- Name: individual_scenarios; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.individual_scenarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    scenario_code character varying(50) NOT NULL,
    scenario_name character varying(255) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'DRAFT'::character varying,
    created_by uuid,
    approved_by uuid,
    approved_at timestamp without time zone,
    active_flag boolean DEFAULT true,
    configuration jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.individual_scenarios OWNER TO postgres;

--
-- Name: individual_watchlist; Type: TABLE; Schema: individual; Owner: postgres
--

CREATE TABLE individual.individual_watchlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_name character varying(255) NOT NULL,
    account_number character varying(50) NOT NULL,
    segment character varying(100),
    impairment_status character varying(50) DEFAULT 'WATCHLIST'::character varying,
    trigger_date timestamp without time zone DEFAULT now(),
    outstanding_amount double precision DEFAULT 0,
    remarks text,
    added_by uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE individual.individual_watchlist OWNER TO postgres;

--
-- Name: api_gateway_logs; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.api_gateway_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    request_id uuid NOT NULL,
    method character varying(10) NOT NULL,
    path character varying(500) NOT NULL,
    status_code integer NOT NULL,
    response_time_ms integer NOT NULL,
    request_size bigint,
    response_size bigint,
    user_id uuid,
    ip_address inet,
    user_agent text,
    "timestamp" timestamp with time zone DEFAULT now(),
    metadata jsonb
);


ALTER TABLE menu.api_gateway_logs OWNER TO postgres;

--
-- Name: load_balancer_status; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.load_balancer_status (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    instance_id character varying(100) NOT NULL,
    instance_name character varying(100),
    status character varying(20) DEFAULT 'active'::character varying,
    health_score numeric(5,2) DEFAULT 100.00,
    current_connections integer DEFAULT 0,
    max_connections integer DEFAULT 1000,
    cpu_usage numeric(5,2),
    memory_usage numeric(5,2),
    last_check timestamp with time zone DEFAULT now(),
    metadata jsonb,
    CONSTRAINT load_balancer_status_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('maintenance'::character varying)::text, ('failed'::character varying)::text])))
);


ALTER TABLE menu.load_balancer_status OWNER TO postgres;

--
-- Name: menu_analytics; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_analytics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    session_id uuid,
    action_type character varying(50) NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    duration_ms integer,
    metadata jsonb,
    ip_address inet,
    user_agent text
);


ALTER TABLE menu.menu_analytics OWNER TO postgres;

--
-- Name: menu_categories; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(20),
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid
);


ALTER TABLE menu.menu_categories OWNER TO postgres;

--
-- Name: menu_configurations; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_configurations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    configuration jsonb NOT NULL,
    is_active boolean DEFAULT true,
    environment character varying(20) DEFAULT 'production'::character varying,
    version character varying(20) DEFAULT '1.0.0'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid
);


ALTER TABLE menu.menu_configurations OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    category_id uuid,
    parent_id uuid,
    name character varying(100) NOT NULL,
    description text,
    path character varying(255),
    icon character varying(50),
    component character varying(100),
    external_url character varying(500),
    sort_order integer DEFAULT 0,
    level integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_visible boolean DEFAULT true,
    is_external boolean DEFAULT false,
    requires_auth boolean DEFAULT true,
    banking_type character varying(20) DEFAULT 'both'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid,
    CONSTRAINT menu_items_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('both'::character varying)::text])))
);


ALTER TABLE menu.menu_items OWNER TO postgres;

--
-- Name: menu_permissions; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    role_id uuid NOT NULL,
    permission_type character varying(20) DEFAULT 'view'::character varying,
    is_allowed boolean DEFAULT true,
    conditions jsonb,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    CONSTRAINT menu_permissions_permission_type_check CHECK (((permission_type)::text = ANY (ARRAY[('view'::character varying)::text, ('edit'::character varying)::text, ('delete'::character varying)::text, ('admin'::character varying)::text])))
);


ALTER TABLE menu.menu_permissions OWNER TO postgres;

--
-- Name: menu_user_preferences; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.menu_user_preferences (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    is_favorite boolean DEFAULT false,
    is_pinned boolean DEFAULT false,
    is_hidden boolean DEFAULT false,
    custom_name character varying(100),
    custom_icon character varying(50),
    sort_order integer DEFAULT 0,
    settings jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE menu.menu_user_preferences OWNER TO postgres;

--
-- Name: performance_metrics; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.performance_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_type character varying(50) NOT NULL,
    value numeric(15,4) NOT NULL,
    unit character varying(20),
    tags jsonb,
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE menu.performance_metrics OWNER TO postgres;

--
-- Name: system_health_checks; Type: TABLE; Schema: menu; Owner: postgres
--

CREATE TABLE menu.system_health_checks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    service_name character varying(100) NOT NULL,
    check_type character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'unknown'::character varying,
    message text,
    response_time_ms integer,
    metadata jsonb,
    checked_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_health_checks_status_check CHECK (((status)::text = ANY (ARRAY[('healthy'::character varying)::text, ('warning'::character varying)::text, ('critical'::character varying)::text, ('unknown'::character varying)::text])))
);


ALTER TABLE menu.system_health_checks OWNER TO postgres;

--
-- Name: connection_stats; Type: TABLE; Schema: monitoring; Owner: postgres
--

CREATE TABLE monitoring.connection_stats (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    database_name character varying(100) NOT NULL,
    active_connections integer NOT NULL,
    idle_connections integer NOT NULL,
    max_connections integer NOT NULL,
    connection_utilization numeric(5,2) NOT NULL,
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE monitoring.connection_stats OWNER TO postgres;

--
-- Name: database_sizes; Type: TABLE; Schema: monitoring; Owner: postgres
--

CREATE TABLE monitoring.database_sizes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    database_name character varying(100) NOT NULL,
    size_bytes bigint NOT NULL,
    size_human character varying(20) NOT NULL,
    table_count integer,
    index_count integer,
    recorded_at timestamp with time zone DEFAULT now()
);


ALTER TABLE monitoring.database_sizes OWNER TO postgres;

--
-- Name: health_checks; Type: TABLE; Schema: monitoring; Owner: postgres
--

CREATE TABLE monitoring.health_checks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    check_name character varying(100) NOT NULL,
    check_type character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    response_time_ms integer,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb,
    checked_at timestamp with time zone DEFAULT now()
);


ALTER TABLE monitoring.health_checks OWNER TO postgres;

--
-- Name: performance_metrics; Type: TABLE; Schema: monitoring; Owner: postgres
--

CREATE TABLE monitoring.performance_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value numeric(15,4) NOT NULL,
    metric_unit character varying(20) NOT NULL,
    database_name character varying(100),
    table_name character varying(100),
    recorded_at timestamp with time zone DEFAULT now(),
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE monitoring.performance_metrics OWNER TO postgres;

--
-- Name: performance_summary; Type: VIEW; Schema: monitoring; Owner: postgres
--

CREATE VIEW monitoring.performance_summary AS
 SELECT metric_name,
    round(avg(metric_value), 2) AS avg_value,
    round(min(metric_value), 2) AS min_value,
    round(max(metric_value), 2) AS max_value,
    count(*) AS sample_count,
    max(recorded_at) AS last_recorded
   FROM monitoring.performance_metrics
  WHERE (recorded_at > (now() - '24:00:00'::interval))
  GROUP BY metric_name
  ORDER BY metric_name;


ALTER VIEW monitoring.performance_summary OWNER TO postgres;

--
-- Name: slow_queries; Type: TABLE; Schema: monitoring; Owner: postgres
--

CREATE TABLE monitoring.slow_queries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    query_hash character varying(64) NOT NULL,
    query_text text NOT NULL,
    execution_time_ms numeric(10,2) NOT NULL,
    database_name character varying(100) NOT NULL,
    user_name character varying(100),
    execution_count integer DEFAULT 1,
    first_seen timestamp with time zone DEFAULT now(),
    last_seen timestamp with time zone DEFAULT now(),
    avg_execution_time numeric(10,2),
    max_execution_time numeric(10,2)
);


ALTER TABLE monitoring.slow_queries OWNER TO postgres;

--
-- Name: system_status; Type: VIEW; Schema: monitoring; Owner: postgres
--

CREATE VIEW monitoring.system_status AS
 SELECT 'database_connections'::text AS metric,
    count(*) AS current_value,
    (( SELECT (pg_settings.setting)::integer AS setting
           FROM pg_settings
          WHERE (pg_settings.name = 'max_connections'::text)))::bigint AS max_value,
    round((((count(*))::numeric / (( SELECT (pg_settings.setting)::integer AS setting
           FROM pg_settings
          WHERE (pg_settings.name = 'max_connections'::text)))::numeric) * (100)::numeric), 2) AS utilization_pct
   FROM pg_stat_activity
UNION ALL
 SELECT 'database_size'::text AS metric,
    pg_database_size(current_database()) AS current_value,
    '100000000000'::bigint AS max_value,
    round((((pg_database_size(current_database()))::numeric / ('100000000000'::bigint)::numeric) * (100)::numeric), 2) AS utilization_pct;


ALTER VIEW monitoring.system_status OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.tenants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_name character varying(100) NOT NULL,
    tenant_slug character varying(50) NOT NULL,
    display_name character varying(200) NOT NULL,
    organization_name character varying(200) NOT NULL,
    banking_type character varying(20) NOT NULL,
    database_name character varying(100) NOT NULL,
    database_host character varying(255) DEFAULT 'localhost'::character varying NOT NULL,
    database_port integer DEFAULT 5432 NOT NULL,
    status character varying(20) DEFAULT 'provisioning'::character varying NOT NULL,
    subscription_tier character varying(20) DEFAULT 'basic'::character varying NOT NULL,
    tenant_settings jsonb DEFAULT '{}'::jsonb,
    features_enabled jsonb DEFAULT '{}'::jsonb,
    compliance_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by character varying(100),
    updated_by character varying(100),
    is_active boolean DEFAULT true,
    name character varying(255),
    CONSTRAINT tenants_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text]))),
    CONSTRAINT tenants_status_check CHECK (((status)::text = ANY (ARRAY[('provisioning'::character varying)::text, ('active'::character varying)::text, ('suspended'::character varying)::text, ('terminated'::character varying)::text]))),
    CONSTRAINT tenants_subscription_tier_check CHECK (((subscription_tier)::text = ANY (ARRAY[('basic'::character varying)::text, ('premium'::character varying)::text, ('enterprise'::character varying)::text])))
);


ALTER TABLE platform_admin.tenants OWNER TO postgres;

--
-- Name: tenant_database_health; Type: VIEW; Schema: monitoring; Owner: postgres
--

CREATE VIEW monitoring.tenant_database_health AS
 SELECT id AS tenant_id,
    tenant_name,
    database_name,
    status,
    pg_size_pretty(pg_database_size((database_name)::name)) AS database_size,
    ( SELECT count(*) AS count
           FROM pg_stat_activity
          WHERE (pg_stat_activity.datname = (t.database_name)::text)) AS active_connections,
    created_at,
    updated_at
   FROM platform_admin.tenants t
  WHERE ((status)::text = 'active'::text);


ALTER VIEW monitoring.tenant_database_health OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    user_id uuid NOT NULL,
    session_id character varying(100) NOT NULL,
    ip_address inet NOT NULL,
    user_agent text,
    action character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(100) NOT NULL,
    changes jsonb,
    metadata jsonb,
    severity character varying(20) DEFAULT 'low'::character varying NOT NULL,
    category character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_logs_category_check CHECK (((category)::text = ANY (ARRAY[('access'::character varying)::text, ('data'::character varying)::text, ('calculation'::character varying)::text, ('configuration'::character varying)::text, ('workflow'::character varying)::text, ('security'::character varying)::text]))),
    CONSTRAINT audit_logs_severity_check CHECK (((severity)::text = ANY (ARRAY[('low'::character varying)::text, ('medium'::character varying)::text, ('high'::character varying)::text, ('critical'::character varying)::text])))
);


ALTER TABLE platform_admin.audit_logs OWNER TO postgres;

--
-- Name: configuration; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.configuration (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    category character varying(50) DEFAULT 'general'::character varying NOT NULL,
    tenant_id uuid,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT configuration_type_check CHECK (((type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text])))
);


ALTER TABLE platform_admin.configuration OWNER TO postgres;

--
-- Name: menu_configurations; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.menu_configurations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    target_audience character varying(50) NOT NULL,
    banking_mode character varying(20),
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    configuration jsonb NOT NULL,
    version character varying(20) DEFAULT '1.0.0'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid,
    CONSTRAINT menu_configurations_banking_mode_check CHECK (((banking_mode)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text]))),
    CONSTRAINT menu_configurations_target_audience_check CHECK (((target_audience)::text = ANY (ARRAY[('banking_staff'::character varying)::text, ('consultant'::character varying)::text, ('regulator'::character varying)::text, ('platform_admin'::character varying)::text])))
);


ALTER TABLE platform_admin.menu_configurations OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    menu_config_id uuid NOT NULL,
    key character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    icon character varying(100),
    url character varying(500),
    component character varying(200),
    type character varying(20) NOT NULL,
    parent_id uuid,
    sort_order integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 0 NOT NULL,
    path text,
    is_active boolean DEFAULT true NOT NULL,
    breadcrumb boolean DEFAULT true NOT NULL,
    external boolean DEFAULT false NOT NULL,
    target character varying(20) DEFAULT '_self'::character varying NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    user_types jsonb DEFAULT '[]'::jsonb,
    banking_types jsonb DEFAULT '[]'::jsonb,
    tenant_types jsonb DEFAULT '[]'::jsonb,
    visibility_rules jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by character varying(100) DEFAULT 'system'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by character varying(100),
    updated_at timestamp with time zone,
    CONSTRAINT menu_items_target_check CHECK (((target)::text = ANY (ARRAY[('_self'::character varying)::text, ('_blank'::character varying)::text, ('_parent'::character varying)::text, ('_top'::character varying)::text]))),
    CONSTRAINT menu_items_type_check CHECK (((type)::text = ANY (ARRAY[('group'::character varying)::text, ('item'::character varying)::text, ('divider'::character varying)::text])))
);


ALTER TABLE platform_admin.menu_items OWNER TO postgres;

--
-- Name: TABLE menu_items; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON TABLE platform_admin.menu_items IS 'Hierarchical menu items for database-driven menu system with role-based access control';


--
-- Name: COLUMN menu_items.id; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.id IS 'Primary key - UUID for uniqueness';


--
-- Name: COLUMN menu_items.menu_config_id; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.menu_config_id IS 'Foreign key to menu_configurations table';


--
-- Name: COLUMN menu_items.key; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.key IS 'Menu item key for programmatic access';


--
-- Name: COLUMN menu_items.title; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.title IS 'Display title for menu item';


--
-- Name: COLUMN menu_items.parent_id; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.parent_id IS 'Parent menu item for hierarchical structure';


--
-- Name: COLUMN menu_items.sort_order; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.sort_order IS 'Order within same level and parent';


--
-- Name: COLUMN menu_items.level; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.level IS 'Depth level in menu hierarchy (0 = root)';


--
-- Name: COLUMN menu_items.path; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.path IS 'Full path for breadcrumb navigation';


--
-- Name: COLUMN menu_items.permissions; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.permissions IS 'JSON array of required permissions';


--
-- Name: COLUMN menu_items.user_types; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.user_types IS 'JSON array of allowed user types';


--
-- Name: COLUMN menu_items.banking_types; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.banking_types IS 'JSON array of allowed banking modes';


--
-- Name: COLUMN menu_items.tenant_types; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.tenant_types IS 'JSON array of allowed tenant types';


--
-- Name: COLUMN menu_items.visibility_rules; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.visibility_rules IS 'JSON object for custom visibility rules';


--
-- Name: COLUMN menu_items.metadata; Type: COMMENT; Schema: platform_admin; Owner: postgres
--

COMMENT ON COLUMN platform_admin.menu_items.metadata IS 'JSON object for additional menu item data';


--
-- Name: restricted_databases; Type: VIEW; Schema: platform_admin; Owner: postgres
--

CREATE VIEW platform_admin.restricted_databases AS
 SELECT datname,
    (datdba)::regrole AS owner,
    encoding,
    datcollate,
    datctype,
    datistemplate,
    datallowconn,
    datconnlimit,
    datfrozenxid,
    datminmxid,
    dattablespace
   FROM pg_database
  WHERE ((datname ~~ 'ifrspro%'::text) AND has_database_privilege(CURRENT_USER, (datname)::text, 'CONNECT'::text));


ALTER VIEW platform_admin.restricted_databases OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    level integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    permissions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE platform_admin.roles OWNER TO postgres;

--
-- Name: system_metrics; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.system_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cpu_usage numeric(5,2) NOT NULL,
    memory_usage numeric(5,2) NOT NULL,
    disk_usage numeric(5,2) DEFAULT 0 NOT NULL,
    database_connections integer NOT NULL,
    cache_hit_rate numeric(5,2) NOT NULL,
    request_count integer NOT NULL,
    error_rate numeric(5,2) NOT NULL,
    response_time integer NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE platform_admin.system_metrics OWNER TO postgres;

--
-- Name: user_dashboard_settings; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.user_dashboard_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    dashboard_layout jsonb DEFAULT '{}'::jsonb,
    widget_config jsonb DEFAULT '{}'::jsonb,
    theme_preferences jsonb DEFAULT '{}'::jsonb,
    notification_settings jsonb DEFAULT '{}'::jsonb,
    default_view character varying(50) DEFAULT 'overview'::character varying,
    custom_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE platform_admin.user_dashboard_settings OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_email character varying(255) NOT NULL,
    user_type character varying(50) NOT NULL,
    tenant_id uuid,
    role_id uuid,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_by uuid,
    is_active boolean DEFAULT true
);


ALTER TABLE platform_admin.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: platform_admin; Owner: postgres
--

CREATE TABLE platform_admin.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200) NOT NULL,
    employee_id character varying(50),
    role character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    failed_login_attempts integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_role character varying(100),
    tenant_id uuid,
    tenant_name character varying(255)
);


ALTER TABLE platform_admin.users OWNER TO postgres;

--
-- Name: tenant_usage_summary; Type: TABLE; Schema: platform_analytics; Owner: postgres
--

CREATE TABLE platform_analytics.tenant_usage_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    reporting_period date NOT NULL,
    active_users integer DEFAULT 0,
    total_calculations integer DEFAULT 0,
    data_volume_mb numeric(15,2) DEFAULT 0,
    api_calls integer DEFAULT 0,
    storage_used_gb numeric(10,2) DEFAULT 0,
    performance_score numeric(5,2) DEFAULT 0,
    compliance_score numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE platform_analytics.tenant_usage_summary OWNER TO postgres;

--
-- Name: global_audit_log; Type: TABLE; Schema: platform_audit; Owner: postgres
--

CREATE TABLE platform_audit.global_audit_log (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    user_id uuid,
    event_type character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(255),
    description text,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE platform_audit.global_audit_log OWNER TO postgres;

--
-- Name: subscription_plans; Type: TABLE; Schema: platform_billing; Owner: postgres
--

CREATE TABLE platform_billing.subscription_plans (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    plan_name character varying(100) NOT NULL,
    plan_tier character varying(20) NOT NULL,
    monthly_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    annual_price numeric(12,2) DEFAULT 0.00 NOT NULL,
    max_users integer DEFAULT 10,
    max_accounts integer DEFAULT 10000,
    max_calculations_per_month integer DEFAULT 1000,
    max_storage_gb integer DEFAULT 10,
    features jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subscription_plans_plan_tier_check CHECK (((plan_tier)::text = ANY (ARRAY[('basic'::character varying)::text, ('premium'::character varying)::text, ('enterprise'::character varying)::text])))
);


ALTER TABLE platform_billing.subscription_plans OWNER TO postgres;

--
-- Name: tenant_subscriptions; Type: TABLE; Schema: platform_billing; Owner: postgres
--

CREATE TABLE platform_billing.tenant_subscriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    subscription_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    start_date date NOT NULL,
    end_date date,
    next_billing_date date NOT NULL,
    monthly_amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tenant_subscriptions_subscription_status_check CHECK (((subscription_status)::text = ANY (ARRAY[('trial'::character varying)::text, ('active'::character varying)::text, ('suspended'::character varying)::text, ('cancelled'::character varying)::text, ('expired'::character varying)::text])))
);


ALTER TABLE platform_billing.tenant_subscriptions OWNER TO postgres;

--
-- Name: external_connections; Type: TABLE; Schema: platform_integration; Owner: postgres
--

CREATE TABLE platform_integration.external_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    connection_name character varying(100) NOT NULL,
    connection_type character varying(50) NOT NULL,
    host_address character varying(255),
    port integer,
    database_name character varying(100),
    connection_string text,
    is_active boolean DEFAULT true,
    last_connection_test timestamp with time zone,
    connection_status character varying(20) DEFAULT 'unknown'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE platform_integration.external_connections OWNER TO postgres;

--
-- Name: tenant_health; Type: TABLE; Schema: platform_monitoring; Owner: postgres
--

CREATE TABLE platform_monitoring.tenant_health (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid NOT NULL,
    health_status character varying(20) DEFAULT 'healthy'::character varying NOT NULL,
    response_time_avg numeric(8,2),
    error_rate numeric(7,4),
    last_check_at timestamp with time zone DEFAULT now(),
    recorded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tenant_health_health_status_check CHECK (((health_status)::text = ANY (ARRAY[('healthy'::character varying)::text, ('degraded'::character varying)::text, ('warning'::character varying)::text, ('critical'::character varying)::text, ('unknown'::character varying)::text])))
);


ALTER TABLE platform_monitoring.tenant_health OWNER TO postgres;

--
-- Name: tenant_performance_metrics; Type: TABLE; Schema: platform_monitoring; Owner: postgres
--

CREATE TABLE platform_monitoring.tenant_performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    metric_name character varying(100) NOT NULL,
    metric_value numeric(15,4) NOT NULL,
    metric_unit character varying(20),
    threshold_warning numeric(15,4),
    threshold_critical numeric(15,4),
    status character varying(20) DEFAULT 'normal'::character varying,
    recorded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE platform_monitoring.tenant_performance_metrics OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ead_config (
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


ALTER TABLE public.frs9_imp_ca_ead_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_ead_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_ead_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ead_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_ead_config_pkid_seq OWNED BY public.frs9_imp_ca_ead_config.pkid;


--
-- Name: frs9_imp_ca_ecl_configd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ecl_configd (
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


ALTER TABLE public.frs9_imp_ca_ecl_configd OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configd_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_ecl_configd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_ecl_configd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_ecl_configd_pkid_seq OWNED BY public.frs9_imp_ca_ecl_configd.pkid;


--
-- Name: frs9_imp_ca_ecl_configh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_ecl_configh (
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


ALTER TABLE public.frs9_imp_ca_ecl_configh OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configh_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_ecl_configh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_ecl_configh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_ecl_configh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_ecl_configh_pkid_seq OWNED BY public.frs9_imp_ca_ecl_configh.pkid;


--
-- Name: frs9_imp_ca_fl_scalard; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_fl_scalard (
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


ALTER TABLE public.frs9_imp_ca_fl_scalard OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalard_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_fl_scalard_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_fl_scalard_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalard_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_fl_scalard_pkid_seq OWNED BY public.frs9_imp_ca_fl_scalard.pkid;


--
-- Name: frs9_imp_ca_fl_scalarh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_fl_scalarh (
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


ALTER TABLE public.frs9_imp_ca_fl_scalarh OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalarh_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_fl_scalarh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_fl_scalarh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_fl_scalarh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_fl_scalarh_pkid_seq OWNED BY public.frs9_imp_ca_fl_scalarh.pkid;


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
-- Name: frs9_imp_ca_lgd_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_lgd_config (
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


ALTER TABLE public.frs9_imp_ca_lgd_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_config_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_lgd_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_lgd_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_lgd_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_lgd_config_pkid_seq OWNED BY public.frs9_imp_ca_lgd_config.pkid;


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
-- Name: frs9_imp_ca_pd_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ca_pd_config (
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


ALTER TABLE public.frs9_imp_ca_pd_config OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_config_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_imp_ca_pd_config_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_imp_ca_pd_config_pkid_seq OWNER TO postgres;

--
-- Name: frs9_imp_ca_pd_config_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_imp_ca_pd_config_pkid_seq OWNED BY public.frs9_imp_ca_pd_config.pkid;


--
-- Name: frs9_imp_ia_dcf; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_imp_ia_dcf (
    pkid bigint NOT NULL,
    ia_id bigint NOT NULL,
    prc_date date NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying NOT NULL,
    mob bigint NOT NULL,
    periode date NOT NULL,
    principal numeric DEFAULT '0'::numeric NOT NULL,
    interest numeric DEFAULT '0'::numeric NOT NULL,
    collateral numeric DEFAULT '0'::numeric NOT NULL,
    status character varying(1) NOT NULL,
    createdby character varying NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying NOT NULL,
    updatedby character varying,
    updateddate timestamp without time zone,
    updatedhost character varying
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
    principal numeric DEFAULT '0'::numeric NOT NULL,
    interest numeric DEFAULT '0'::numeric NOT NULL,
    installment numeric DEFAULT '0'::numeric NOT NULL,
    collateral numeric DEFAULT '0'::numeric NOT NULL,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    rr_rate_1 double precision DEFAULT 0 NOT NULL,
    default_1 numeric DEFAULT '0'::numeric NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    rr_rate_2 double precision DEFAULT 0 NOT NULL,
    default_2 numeric DEFAULT '0'::numeric NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    rr_rate_3 double precision DEFAULT 0 NOT NULL,
    default_3 numeric DEFAULT '0'::numeric NOT NULL,
    pw_amt numeric DEFAULT '0'::numeric NOT NULL,
    discount_factor double precision NOT NULL,
    pv_amt numeric DEFAULT '0'::numeric NOT NULL,
    beginning_balance numeric DEFAULT '0'::numeric NOT NULL,
    eir_amt numeric DEFAULT '0'::numeric NOT NULL,
    ending_balance numeric DEFAULT '0'::numeric NOT NULL,
    createdby character varying NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying NOT NULL,
    updatedby character varying,
    updateddate timestamp without time zone,
    updatedhost character varying
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
    cif_number character varying NOT NULL,
    cif_name character varying NOT NULL,
    account_id bigint NOT NULL,
    account_number character varying NOT NULL,
    currency character varying NOT NULL,
    eff_interest_rate double precision NOT NULL,
    interest_rate double precision NOT NULL,
    dpd smallint,
    collectability smallint,
    rating_code character varying,
    impaired_flag character varying(1) NOT NULL,
    method character varying,
    plafond numeric DEFAULT '0'::numeric NOT NULL,
    outstanding numeric DEFAULT '0'::numeric NOT NULL,
    accrued_interest numeric DEFAULT '0'::numeric NOT NULL,
    carrying_amt numeric DEFAULT '0'::numeric NOT NULL,
    ead_amt numeric DEFAULT '0'::numeric NOT NULL,
    pv_dcf_amt numeric DEFAULT '0'::numeric NOT NULL,
    ecl_ia_amt numeric DEFAULT '0'::numeric NOT NULL,
    trigger_remarks character varying,
    trigger_filename character varying,
    scenario_id smallint,
    n_of_scenario smallint,
    po_rate_1 double precision DEFAULT 0 NOT NULL,
    po_rate_2 double precision DEFAULT 0 NOT NULL,
    po_rate_3 double precision DEFAULT 0 NOT NULL,
    sc_name_1 character varying,
    sc_name_2 character varying,
    sc_name_3 character varying,
    status integer NOT NULL,
    createdby character varying NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying NOT NULL,
    updatedby character varying,
    updateddate timestamp without time zone,
    updatedhost character varying,
    reviewedby character varying,
    revieweddate timestamp without time zone,
    reviewedhost character varying
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
    principal numeric,
    interest numeric,
    installment numeric,
    collateral numeric,
    po_rate_1 double precision,
    rr_rate_1 double precision,
    default_1 numeric,
    po_rate_2 double precision,
    rr_rate_2 double precision,
    default_2 numeric,
    po_rate_3 double precision,
    rr_rate_3 double precision,
    default_3 numeric,
    pw_amt numeric,
    discount_factor double precision,
    pv_amt numeric,
    beginning_balance numeric,
    eir_amt numeric,
    ending_balance numeric
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
    account_number character varying,
    cif_number character varying,
    cif_name character varying,
    currency character varying,
    dpd smallint,
    collectability smallint,
    rating_code character varying,
    interest_rate double precision,
    eff_interest_rate double precision,
    outstanding numeric,
    accrued_interest numeric,
    carrying_amt numeric,
    ead_amt numeric,
    pv_dcf_amt numeric,
    ecl_ia_amt numeric,
    createdby character varying,
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
    createdby character varying NOT NULL,
    createddate timestamp without time zone NOT NULL,
    createdhost character varying NOT NULL,
    updatedby character varying,
    updateddate timestamp without time zone,
    updatedhost character varying
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
-- Name: frs9_param_bucketh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_bucketh (
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


ALTER TABLE public.frs9_param_bucketh OWNER TO postgres;

--
-- Name: frs9_param_bucketh_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_bucketh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_bucketh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_bucketh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_bucketh_pkid_seq OWNED BY public.frs9_param_bucketh.pkid;


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
    createdby character varying(50) DEFAULT 'SYSTEM'::character varying NOT NULL,
    createddate timestamp without time zone DEFAULT now() NOT NULL,
    createdhost character varying(50) DEFAULT 'localhost'::character varying NOT NULL,
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
    createdby character varying(50) DEFAULT 'SYSTEM'::character varying NOT NULL,
    createddate timestamp without time zone DEFAULT now() NOT NULL,
    createdhost character varying(50) DEFAULT 'localhost'::character varying NOT NULL,
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
-- Name: frs9_param_journal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_journal (
    pkid smallint NOT NULL,
    gl_group character varying(20),
    currency character varying(3),
    gl_type character varying(20),
    gl_code character varying(20),
    gl_number character varying(20),
    dbcr character varying(1),
    gl_desc character varying(255),
    active_flag boolean DEFAULT true,
    createdby character varying(50) DEFAULT 'SYSTEM'::character varying NOT NULL,
    createddate timestamp without time zone DEFAULT now() NOT NULL,
    createdhost character varying(50) DEFAULT 'localhost'::character varying NOT NULL,
    updatedby character varying(50),
    updateddate timestamp without time zone,
    updatedhost character varying(50)
);


ALTER TABLE public.frs9_param_journal OWNER TO postgres;

--
-- Name: frs9_param_journal_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_journal_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_journal_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_journal_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_journal_pkid_seq OWNED BY public.frs9_param_journal.pkid;


--
-- Name: frs9_param_product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_product (
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


ALTER TABLE public.frs9_param_product OWNER TO postgres;

--
-- Name: frs9_param_product_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_product_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_product_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_product_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_product_pkid_seq OWNED BY public.frs9_param_product.pkid;


--
-- Name: frs9_param_scenario_rulesd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_scenario_rulesd (
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


ALTER TABLE public.frs9_param_scenario_rulesd OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesd_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_scenario_rulesd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_scenario_rulesd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_scenario_rulesd_pkid_seq OWNED BY public.frs9_param_scenario_rulesd.pkid;


--
-- Name: frs9_param_scenario_rulesh; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_scenario_rulesh (
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


ALTER TABLE public.frs9_param_scenario_rulesh OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesh_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_scenario_rulesh_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_scenario_rulesh_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_scenario_rulesh_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_scenario_rulesh_pkid_seq OWNED BY public.frs9_param_scenario_rulesh.pkid;


--
-- Name: frs9_param_segmentd; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_segmentd (
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


ALTER TABLE public.frs9_param_segmentd OWNER TO postgres;

--
-- Name: frs9_param_segmentd_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_segmentd_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_segmentd_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_segmentd_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_segmentd_pkid_seq OWNED BY public.frs9_param_segmentd.pkid;


--
-- Name: frs9_param_segmenth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frs9_param_segmenth (
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


ALTER TABLE public.frs9_param_segmenth OWNER TO postgres;

--
-- Name: frs9_param_segmenth_pkid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frs9_param_segmenth_pkid_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frs9_param_segmenth_pkid_seq OWNER TO postgres;

--
-- Name: frs9_param_segmenth_pkid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frs9_param_segmenth_pkid_seq OWNED BY public.frs9_param_segmenth.pkid;


--
-- Name: business_processes; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.business_processes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    process_name character varying(255) NOT NULL,
    process_type character varying(100) NOT NULL,
    automation_level character varying(50) DEFAULT 'semi'::character varying,
    trigger_conditions jsonb DEFAULT '{}'::jsonb,
    business_rules jsonb DEFAULT '{}'::jsonb,
    sla_config jsonb DEFAULT '{}'::jsonb,
    performance_metrics jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT business_processes_automation_level_check CHECK (((automation_level)::text = ANY (ARRAY[('manual'::character varying)::text, ('semi'::character varying)::text, ('full'::character varying)::text])))
);


ALTER TABLE workflow.business_processes OWNER TO postgres;

--
-- Name: definitions; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    version integer DEFAULT 1,
    status character varying(50) DEFAULT 'active'::character varying,
    initial_state character varying(100) NOT NULL,
    final_states text[] NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid NOT NULL,
    updated_by uuid,
    CONSTRAINT definitions_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('deprecated'::character varying)::text])))
);


ALTER TABLE workflow.definitions OWNER TO postgres;

--
-- Name: execution_history; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.execution_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_instance_id uuid NOT NULL,
    step_key character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    from_state character varying(100),
    to_state character varying(100),
    executed_by uuid,
    executed_at timestamp with time zone DEFAULT now(),
    execution_time_ms integer,
    input_data jsonb DEFAULT '{}'::jsonb,
    output_data jsonb DEFAULT '{}'::jsonb,
    error_message text,
    metadata jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE workflow.execution_history OWNER TO postgres;

--
-- Name: instances; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_definition_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    current_state character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'running'::character varying,
    priority character varying(20) DEFAULT 'normal'::character varying,
    context jsonb DEFAULT '{}'::jsonb,
    variables jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    started_by uuid NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now(),
    error_message text,
    retry_count integer DEFAULT 0,
    CONSTRAINT instances_priority_check CHECK (((priority)::text = ANY (ARRAY[('low'::character varying)::text, ('normal'::character varying)::text, ('high'::character varying)::text, ('critical'::character varying)::text]))),
    CONSTRAINT instances_status_check CHECK (((status)::text = ANY (ARRAY[('running'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text, ('suspended'::character varying)::text, ('terminated'::character varying)::text])))
);


ALTER TABLE workflow.instances OWNER TO postgres;

--
-- Name: performance_metrics; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.performance_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_definition_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    metric_date date DEFAULT CURRENT_DATE,
    total_instances integer DEFAULT 0,
    completed_instances integer DEFAULT 0,
    failed_instances integer DEFAULT 0,
    avg_completion_time_ms bigint DEFAULT 0,
    min_completion_time_ms bigint DEFAULT 0,
    max_completion_time_ms bigint DEFAULT 0,
    sla_violations integer DEFAULT 0,
    throughput_per_hour numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE workflow.performance_metrics OWNER TO postgres;

--
-- Name: steps; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_definition_id uuid NOT NULL,
    step_key character varying(100) NOT NULL,
    step_name character varying(255) NOT NULL,
    step_type character varying(50) NOT NULL,
    handler_type character varying(50),
    handler_config jsonb DEFAULT '{}'::jsonb,
    timeout_seconds integer DEFAULT 300,
    retry_attempts integer DEFAULT 0,
    conditions jsonb DEFAULT '{}'::jsonb,
    position_x integer DEFAULT 0,
    position_y integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT steps_handler_type_check CHECK (((handler_type)::text = ANY (ARRAY[('service'::character varying)::text, ('user'::character varying)::text, ('system'::character varying)::text, ('external'::character varying)::text]))),
    CONSTRAINT steps_step_type_check CHECK (((step_type)::text = ANY (ARRAY[('manual'::character varying)::text, ('automated'::character varying)::text, ('decision'::character varying)::text, ('parallel'::character varying)::text, ('gateway'::character varying)::text])))
);


ALTER TABLE workflow.steps OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_instance_id uuid NOT NULL,
    step_key character varying(100) NOT NULL,
    task_name character varying(255) NOT NULL,
    task_type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    assigned_to uuid,
    assigned_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    due_date timestamp with time zone,
    priority character varying(20) DEFAULT 'normal'::character varying,
    input_data jsonb DEFAULT '{}'::jsonb,
    output_data jsonb DEFAULT '{}'::jsonb,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('assigned'::character varying)::text, ('in_progress'::character varying)::text, ('completed'::character varying)::text, ('failed'::character varying)::text, ('skipped'::character varying)::text])))
);


ALTER TABLE workflow.tasks OWNER TO postgres;

--
-- Name: transitions; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.transitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_definition_id uuid NOT NULL,
    from_step character varying(100) NOT NULL,
    to_step character varying(100) NOT NULL,
    condition_expression text,
    guard_conditions jsonb DEFAULT '{}'::jsonb,
    action_config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE workflow.transitions OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: data_lineage id; Type: DEFAULT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.data_lineage ALTER COLUMN id SET DEFAULT nextval('etl_processing.data_lineage_id_seq'::regclass);


--
-- Name: file_templates id; Type: DEFAULT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.file_templates ALTER COLUMN id SET DEFAULT nextval('etl_processing.file_templates_id_seq'::regclass);


--
-- Name: processing_history id; Type: DEFAULT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.processing_history ALTER COLUMN id SET DEFAULT nextval('etl_processing.processing_history_id_seq'::regclass);


--
-- Name: validation_results id; Type: DEFAULT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.validation_results ALTER COLUMN id SET DEFAULT nextval('etl_processing.validation_results_id_seq'::regclass);


--
-- Name: frs9_param_commond pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commond ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_commond_pkid_seq'::regclass);


--
-- Name: frs9_param_commonh pkid; Type: DEFAULT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commonh ALTER COLUMN pkid SET DEFAULT nextval('ifrs9.frs9_param_commonh_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_ead_config pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_ead_config ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_ead_config_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_ecl_configd pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_ecl_configd ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_ecl_configd_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_ecl_configh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_ecl_configh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_ecl_configh_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_fl_scalard pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_fl_scalard ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_fl_scalard_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_fl_scalarh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_fl_scalarh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_fl_scalarh_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_lgd_config pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_lgd_config ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_lgd_config_pkid_seq'::regclass);


--
-- Name: frs9_imp_ca_pd_config pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ca_pd_config ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_imp_ca_pd_config_pkid_seq'::regclass);


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
-- Name: frs9_param_bucketh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_bucketh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_bucketh_pkid_seq'::regclass);


--
-- Name: frs9_param_commond pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commond ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_commond_pkid_seq'::regclass);


--
-- Name: frs9_param_commonh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commonh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_commonh_pkid_seq'::regclass);


--
-- Name: frs9_param_journal pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_journal ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_journal_pkid_seq'::regclass);


--
-- Name: frs9_param_product pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_product ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_product_pkid_seq'::regclass);


--
-- Name: frs9_param_scenario_rulesd pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_scenario_rulesd ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_scenario_rulesd_pkid_seq'::regclass);


--
-- Name: frs9_param_scenario_rulesh pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_scenario_rulesh ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_scenario_rulesh_pkid_seq'::regclass);


--
-- Name: frs9_param_segmentd pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_segmentd ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_segmentd_pkid_seq'::regclass);


--
-- Name: frs9_param_segmenth pkid; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_segmenth ALTER COLUMN pkid SET DEFAULT nextval('public.frs9_param_segmenth_pkid_seq'::regclass);


--
-- Name: approval_actions approval_actions_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_actions
    ADD CONSTRAINT approval_actions_pkey PRIMARY KEY (id);


--
-- Name: approval_audit_trail approval_audit_trail_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_audit_trail
    ADD CONSTRAINT approval_audit_trail_pkey PRIMARY KEY (id);


--
-- Name: approval_definitions approval_definitions_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_definitions
    ADD CONSTRAINT approval_definitions_pkey PRIMARY KEY (id);


--
-- Name: approval_matrix approval_matrix_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_matrix
    ADD CONSTRAINT approval_matrix_pkey PRIMARY KEY (id);


--
-- Name: approval_notifications approval_notifications_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_notifications
    ADD CONSTRAINT approval_notifications_pkey PRIMARY KEY (id);


--
-- Name: approval_requests approval_requests_pkey; Type: CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_requests
    ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: calculation_parameters calculation_parameters_pkey; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.calculation_parameters
    ADD CONSTRAINT calculation_parameters_pkey PRIMARY KEY (id);


--
-- Name: feature_flags feature_flags_pkey; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.feature_flags
    ADD CONSTRAINT feature_flags_pkey PRIMARY KEY (id);


--
-- Name: ifrs9_model_configurations ifrs9_model_configurations_pkey; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.ifrs9_model_configurations
    ADD CONSTRAINT ifrs9_model_configurations_pkey PRIMARY KEY (id);


--
-- Name: feature_flags unique_flag_per_tenant; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.feature_flags
    ADD CONSTRAINT unique_flag_per_tenant UNIQUE (tenant_id, flag_name);


--
-- Name: ifrs9_model_configurations unique_model_version; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.ifrs9_model_configurations
    ADD CONSTRAINT unique_model_version UNIQUE (model_name, model_version, tenant_id);


--
-- Name: calculation_parameters unique_parameter_key; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.calculation_parameters
    ADD CONSTRAINT unique_parameter_key UNIQUE (parameter_category, parameter_key, scenario_identifier, tenant_id);


--
-- Name: app_settings unique_setting_key; Type: CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.app_settings
    ADD CONSTRAINT unique_setting_key UNIQUE (setting_key, tenant_id);


--
-- Name: menu_categories menu_categories_category_key_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_categories
    ADD CONSTRAINT menu_categories_category_key_key UNIQUE (category_key);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_menu_key_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_menu_key_key UNIQUE (menu_key);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


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
-- Name: role_menu_access role_menu_access_role_id_menu_item_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_role_id_menu_item_id_key UNIQUE (role_id, menu_item_id);


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
-- Name: roles roles_role_code_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.roles
    ADD CONSTRAINT roles_role_code_key UNIQUE (role_code);


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
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: data_lineage data_lineage_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.data_lineage
    ADD CONSTRAINT data_lineage_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_tenant_id_name_key; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.data_sources
    ADD CONSTRAINT data_sources_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: execution_history execution_history_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.execution_history
    ADD CONSTRAINT execution_history_pkey PRIMARY KEY (id);


--
-- Name: monitoring_alerts monitoring_alerts_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.monitoring_alerts
    ADD CONSTRAINT monitoring_alerts_pkey PRIMARY KEY (id);


--
-- Name: optimization_results optimization_results_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.optimization_results
    ADD CONSTRAINT optimization_results_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: quality_reports quality_reports_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.quality_reports
    ADD CONSTRAINT quality_reports_pkey PRIMARY KEY (id);


--
-- Name: quality_rules quality_rules_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.quality_rules
    ADD CONSTRAINT quality_rules_pkey PRIMARY KEY (id);


--
-- Name: recovery_attempts recovery_attempts_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.recovery_attempts
    ADD CONSTRAINT recovery_attempts_pkey PRIMARY KEY (id);


--
-- Name: recovery_checkpoints recovery_checkpoints_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.recovery_checkpoints
    ADD CONSTRAINT recovery_checkpoints_pkey PRIMARY KEY (id);


--
-- Name: schema_evolution schema_evolution_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.schema_evolution
    ADD CONSTRAINT schema_evolution_pkey PRIMARY KEY (id);


--
-- Name: transformations transformations_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.transformations
    ADD CONSTRAINT transformations_pkey PRIMARY KEY (id);


--
-- Name: transformations transformations_workflow_id_node_id_key; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.transformations
    ADD CONSTRAINT transformations_workflow_id_node_id_key UNIQUE (workflow_id, node_id);


--
-- Name: workflow_templates workflow_templates_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.workflow_templates
    ADD CONSTRAINT workflow_templates_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_tenant_id_name_version_key; Type: CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.workflows
    ADD CONSTRAINT workflows_tenant_id_name_version_key UNIQUE (tenant_id, name, version);


--
-- Name: data_lineage data_lineage_pkey; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.data_lineage
    ADD CONSTRAINT data_lineage_pkey PRIMARY KEY (id);


--
-- Name: file_templates file_templates_pkey; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.file_templates
    ADD CONSTRAINT file_templates_pkey PRIMARY KEY (id);


--
-- Name: processing_history processing_history_pkey; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.processing_history
    ADD CONSTRAINT processing_history_pkey PRIMARY KEY (id);


--
-- Name: file_templates uk_file_templates_tenant_name; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.file_templates
    ADD CONSTRAINT uk_file_templates_tenant_name UNIQUE (tenant_id, template_name, version);


--
-- Name: upload_batches upload_batches_pkey; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.upload_batches
    ADD CONSTRAINT upload_batches_pkey PRIMARY KEY (id);


--
-- Name: validation_results validation_results_pkey; Type: CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.validation_results
    ADD CONSTRAINT validation_results_pkey PRIMARY KEY (id);


--
-- Name: frs9_param_commond frs9_param_commond_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commond
    ADD CONSTRAINT frs9_param_commond_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_commonh frs9_param_commonh_param_code_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commonh
    ADD CONSTRAINT frs9_param_commonh_param_code_key UNIQUE (param_code);


--
-- Name: frs9_param_commonh frs9_param_commonh_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.frs9_param_commonh
    ADD CONSTRAINT frs9_param_commonh_pkey PRIMARY KEY (pkid);


--
-- Name: product_segments product_segments_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.product_segments
    ADD CONSTRAINT product_segments_pkey PRIMARY KEY (id);


--
-- Name: product_segments product_segments_tenant_id_group_segment_segment_sub_segmen_key; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.product_segments
    ADD CONSTRAINT product_segments_tenant_id_group_segment_segment_sub_segmen_key UNIQUE (tenant_id, group_segment, segment, sub_segment);


--
-- Name: rule_base_setting_details rule_base_setting_details_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.rule_base_setting_details
    ADD CONSTRAINT rule_base_setting_details_pkey PRIMARY KEY (id);


--
-- Name: rule_base_setting_headers rule_base_setting_headers_pkey; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.rule_base_setting_headers
    ADD CONSTRAINT rule_base_setting_headers_pkey PRIMARY KEY (id);


--
-- Name: rule_base_setting_headers unique_rule_name_per_tenant; Type: CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.rule_base_setting_headers
    ADD CONSTRAINT unique_rule_name_per_tenant UNIQUE (tenant_id, rule_name);


--
-- Name: dcf_cashflows dcf_cashflows_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_cashflows
    ADD CONSTRAINT dcf_cashflows_pkey PRIMARY KEY (id);


--
-- Name: dcf_uploads dcf_uploads_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_uploads
    ADD CONSTRAINT dcf_uploads_pkey PRIMARY KEY (id);


--
-- Name: individual_audit_trails individual_audit_trails_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_audit_trails
    ADD CONSTRAINT individual_audit_trails_pkey PRIMARY KEY (id);


--
-- Name: individual_overrides individual_overrides_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_overrides
    ADD CONSTRAINT individual_overrides_pkey PRIMARY KEY (id);


--
-- Name: individual_reports individual_reports_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_reports
    ADD CONSTRAINT individual_reports_pkey PRIMARY KEY (id);


--
-- Name: individual_scenarios individual_scenarios_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_scenarios
    ADD CONSTRAINT individual_scenarios_pkey PRIMARY KEY (id);


--
-- Name: individual_watchlist individual_watchlist_pkey; Type: CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_watchlist
    ADD CONSTRAINT individual_watchlist_pkey PRIMARY KEY (id);


--
-- Name: api_gateway_logs api_gateway_logs_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.api_gateway_logs
    ADD CONSTRAINT api_gateway_logs_pkey PRIMARY KEY (id);


--
-- Name: load_balancer_status load_balancer_status_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.load_balancer_status
    ADD CONSTRAINT load_balancer_status_pkey PRIMARY KEY (id);


--
-- Name: menu_analytics menu_analytics_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_analytics
    ADD CONSTRAINT menu_analytics_pkey PRIMARY KEY (id);


--
-- Name: menu_categories menu_categories_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_categories
    ADD CONSTRAINT menu_categories_pkey PRIMARY KEY (id);


--
-- Name: menu_configurations menu_configurations_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_configurations
    ADD CONSTRAINT menu_configurations_pkey PRIMARY KEY (id);


--
-- Name: menu_configurations menu_configurations_tenant_id_name_environment_key; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_configurations
    ADD CONSTRAINT menu_configurations_tenant_id_name_environment_key UNIQUE (tenant_id, name, environment);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: menu_permissions menu_permissions_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_permissions
    ADD CONSTRAINT menu_permissions_pkey PRIMARY KEY (id);


--
-- Name: menu_permissions menu_permissions_tenant_id_menu_item_id_role_id_permission__key; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_permissions
    ADD CONSTRAINT menu_permissions_tenant_id_menu_item_id_role_id_permission__key UNIQUE (tenant_id, menu_item_id, role_id, permission_type);


--
-- Name: menu_user_preferences menu_user_preferences_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_user_preferences
    ADD CONSTRAINT menu_user_preferences_pkey PRIMARY KEY (id);


--
-- Name: menu_user_preferences menu_user_preferences_tenant_id_user_id_menu_item_id_key; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_user_preferences
    ADD CONSTRAINT menu_user_preferences_tenant_id_user_id_menu_item_id_key UNIQUE (tenant_id, user_id, menu_item_id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: system_health_checks system_health_checks_pkey; Type: CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.system_health_checks
    ADD CONSTRAINT system_health_checks_pkey PRIMARY KEY (id);


--
-- Name: connection_stats connection_stats_pkey; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.connection_stats
    ADD CONSTRAINT connection_stats_pkey PRIMARY KEY (id);


--
-- Name: database_sizes database_sizes_pkey; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.database_sizes
    ADD CONSTRAINT database_sizes_pkey PRIMARY KEY (id);


--
-- Name: health_checks health_checks_pkey; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.health_checks
    ADD CONSTRAINT health_checks_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: slow_queries slow_queries_pkey; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.slow_queries
    ADD CONSTRAINT slow_queries_pkey PRIMARY KEY (id);


--
-- Name: slow_queries slow_queries_query_hash_key; Type: CONSTRAINT; Schema: monitoring; Owner: postgres
--

ALTER TABLE ONLY monitoring.slow_queries
    ADD CONSTRAINT slow_queries_query_hash_key UNIQUE (query_hash);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: configuration configuration_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.configuration
    ADD CONSTRAINT configuration_pkey PRIMARY KEY (id);


--
-- Name: configuration configuration_tenant_id_key_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.configuration
    ADD CONSTRAINT configuration_tenant_id_key_key UNIQUE (tenant_id, key);


--
-- Name: menu_configurations menu_configurations_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.menu_configurations
    ADD CONSTRAINT menu_configurations_pkey PRIMARY KEY (id);


--
-- Name: menu_items menu_items_menu_config_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.menu_items
    ADD CONSTRAINT menu_items_menu_config_key UNIQUE (menu_config_id, key);


--
-- Name: menu_items menu_items_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);


--
-- Name: platform_users platform_users_email_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.platform_users
    ADD CONSTRAINT platform_users_email_key UNIQUE (email);


--
-- Name: platform_users platform_users_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.platform_users
    ADD CONSTRAINT platform_users_pkey PRIMARY KEY (id);


--
-- Name: platform_users platform_users_username_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.platform_users
    ADD CONSTRAINT platform_users_username_key UNIQUE (username);


--
-- Name: roles roles_code_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.roles
    ADD CONSTRAINT roles_code_key UNIQUE (code);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: system_metrics system_metrics_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.system_metrics
    ADD CONSTRAINT system_metrics_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_database_name_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.tenants
    ADD CONSTRAINT tenants_database_name_key UNIQUE (database_name);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_tenant_name_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.tenants
    ADD CONSTRAINT tenants_tenant_name_key UNIQUE (tenant_name);


--
-- Name: tenants tenants_tenant_slug_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.tenants
    ADD CONSTRAINT tenants_tenant_slug_key UNIQUE (tenant_slug);


--
-- Name: user_dashboard_settings user_dashboard_settings_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_id_tenant_id_key; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_tenant_id_key UNIQUE (user_id, role_id, tenant_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: tenant_usage_summary tenant_usage_summary_pkey; Type: CONSTRAINT; Schema: platform_analytics; Owner: postgres
--

ALTER TABLE ONLY platform_analytics.tenant_usage_summary
    ADD CONSTRAINT tenant_usage_summary_pkey PRIMARY KEY (id);


--
-- Name: global_audit_log global_audit_log_pkey; Type: CONSTRAINT; Schema: platform_audit; Owner: postgres
--

ALTER TABLE ONLY platform_audit.global_audit_log
    ADD CONSTRAINT global_audit_log_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: platform_billing; Owner: postgres
--

ALTER TABLE ONLY platform_billing.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_plan_name_key; Type: CONSTRAINT; Schema: platform_billing; Owner: postgres
--

ALTER TABLE ONLY platform_billing.subscription_plans
    ADD CONSTRAINT subscription_plans_plan_name_key UNIQUE (plan_name);


--
-- Name: tenant_subscriptions tenant_subscriptions_pkey; Type: CONSTRAINT; Schema: platform_billing; Owner: postgres
--

ALTER TABLE ONLY platform_billing.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: external_connections external_connections_pkey; Type: CONSTRAINT; Schema: platform_integration; Owner: postgres
--

ALTER TABLE ONLY platform_integration.external_connections
    ADD CONSTRAINT external_connections_pkey PRIMARY KEY (id);


--
-- Name: tenant_health tenant_health_pkey; Type: CONSTRAINT; Schema: platform_monitoring; Owner: postgres
--

ALTER TABLE ONLY platform_monitoring.tenant_health
    ADD CONSTRAINT tenant_health_pkey PRIMARY KEY (id);


--
-- Name: tenant_performance_metrics tenant_performance_metrics_pkey; Type: CONSTRAINT; Schema: platform_monitoring; Owner: postgres
--

ALTER TABLE ONLY platform_monitoring.tenant_performance_metrics
    ADD CONSTRAINT tenant_performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: frs9_imp_ia_dcf frs9_imp_ia_dcf_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_dcf
    ADD CONSTRAINT frs9_imp_ia_dcf_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_detail frs9_imp_ia_detail_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_detail
    ADD CONSTRAINT frs9_imp_ia_detail_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_header frs9_imp_ia_header_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_header
    ADD CONSTRAINT frs9_imp_ia_header_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_result_d frs9_imp_ia_result_d_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_result_d
    ADD CONSTRAINT frs9_imp_ia_result_d_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_result_h frs9_imp_ia_result_h_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_result_h
    ADD CONSTRAINT frs9_imp_ia_result_h_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_imp_ia_rr frs9_imp_ia_rr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_imp_ia_rr
    ADD CONSTRAINT frs9_imp_ia_rr_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_commond frs9_param_commond_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commond
    ADD CONSTRAINT frs9_param_commond_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_commonh frs9_param_commonh_param_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commonh
    ADD CONSTRAINT frs9_param_commonh_param_code_unique UNIQUE (param_code);


--
-- Name: frs9_param_commonh frs9_param_commonh_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_commonh
    ADD CONSTRAINT frs9_param_commonh_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_journal frs9_param_journal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_journal
    ADD CONSTRAINT frs9_param_journal_pkey PRIMARY KEY (pkid);


--
-- Name: frs9_param_product frs9_param_product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frs9_param_product
    ADD CONSTRAINT frs9_param_product_pkey PRIMARY KEY (pkid);


--
-- Name: business_processes business_processes_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.business_processes
    ADD CONSTRAINT business_processes_pkey PRIMARY KEY (id);


--
-- Name: definitions definitions_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.definitions
    ADD CONSTRAINT definitions_pkey PRIMARY KEY (id);


--
-- Name: execution_history execution_history_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.execution_history
    ADD CONSTRAINT execution_history_pkey PRIMARY KEY (id);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: performance_metrics performance_metrics_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.performance_metrics
    ADD CONSTRAINT performance_metrics_pkey PRIMARY KEY (id);


--
-- Name: steps steps_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.steps
    ADD CONSTRAINT steps_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: transitions transitions_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.transitions
    ADD CONSTRAINT transitions_pkey PRIMARY KEY (id);


--
-- Name: idx_approval_actions_approver; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_actions_approver ON approval_system.approval_actions USING btree (approver_id);


--
-- Name: idx_approval_actions_request; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_actions_request ON approval_system.approval_actions USING btree (approval_request_id);


--
-- Name: idx_approval_audit_request; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_audit_request ON approval_system.approval_audit_trail USING btree (approval_request_id);


--
-- Name: idx_approval_matrix_tenant_type; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_matrix_tenant_type ON approval_system.approval_matrix USING btree (tenant_id, matrix_type);


--
-- Name: idx_approval_notifications_recipient; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_notifications_recipient ON approval_system.approval_notifications USING btree (recipient_id, delivery_status);


--
-- Name: idx_approval_requests_deadline; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_requests_deadline ON approval_system.approval_requests USING btree (deadline) WHERE (deadline IS NOT NULL);


--
-- Name: idx_approval_requests_requester; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_requests_requester ON approval_system.approval_requests USING btree (requested_by);


--
-- Name: idx_approval_requests_status; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_requests_status ON approval_system.approval_requests USING btree (status);


--
-- Name: idx_approval_requests_tenant_status; Type: INDEX; Schema: approval_system; Owner: postgres
--

CREATE INDEX idx_approval_requests_tenant_status ON approval_system.approval_requests USING btree (tenant_id, status);


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
-- Name: idx_app_settings_category; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_category ON configuration.app_settings USING btree (category);


--
-- Name: idx_app_settings_customizable; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_customizable ON configuration.app_settings USING btree (is_tenant_customizable);


--
-- Name: idx_app_settings_key; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_key ON configuration.app_settings USING btree (setting_key);


--
-- Name: idx_app_settings_tenant; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_tenant ON configuration.app_settings USING btree (tenant_id);


--
-- Name: idx_app_settings_tenant_id; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_tenant_id ON configuration.app_settings USING btree (tenant_id);


--
-- Name: idx_app_settings_type; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_app_settings_type ON configuration.app_settings USING btree (setting_type);


--
-- Name: idx_feature_flags_tenant_id; Type: INDEX; Schema: configuration; Owner: postgres
--

CREATE INDEX idx_feature_flags_tenant_id ON configuration.feature_flags USING btree (tenant_id);


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
-- Name: user_role_unique_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE UNIQUE INDEX user_role_unique_idx ON core.user_roles USING btree (user_id, role_id);


--
-- Name: user_roles_role_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_role_idx ON core.user_roles USING btree (role_id);


--
-- Name: user_roles_user_idx; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX user_roles_user_idx ON core.user_roles USING btree (user_id);


--
-- Name: idx_data_lineage_workflow_id; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_data_lineage_workflow_id ON etl_designer.data_lineage USING btree (workflow_id);


--
-- Name: idx_execution_history_status; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_execution_history_status ON etl_designer.execution_history USING btree (status);


--
-- Name: idx_execution_history_workflow_id; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_execution_history_workflow_id ON etl_designer.execution_history USING btree (workflow_id);


--
-- Name: idx_monitoring_alerts_workflow_unresolved; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_monitoring_alerts_workflow_unresolved ON etl_designer.monitoring_alerts USING btree (workflow_id, is_resolved);


--
-- Name: idx_optimization_results_workflow; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_optimization_results_workflow ON etl_designer.optimization_results USING btree (workflow_id);


--
-- Name: idx_performance_metrics_workflow_node; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_performance_metrics_workflow_node ON etl_designer.performance_metrics USING btree (workflow_id, node_id);


--
-- Name: idx_quality_reports_workflow_timestamp; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_quality_reports_workflow_timestamp ON etl_designer.quality_reports USING btree (workflow_id, "timestamp");


--
-- Name: idx_recovery_attempts_node_pattern; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_recovery_attempts_node_pattern ON etl_designer.recovery_attempts USING btree (node_id, error_pattern);


--
-- Name: idx_recovery_checkpoints_execution_node; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_recovery_checkpoints_execution_node ON etl_designer.recovery_checkpoints USING btree (execution_id, node_id);


--
-- Name: idx_schema_evolution_data_source_id; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_schema_evolution_data_source_id ON etl_designer.schema_evolution USING btree (data_source_id);


--
-- Name: idx_transformations_workflow_id; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_transformations_workflow_id ON etl_designer.transformations USING btree (workflow_id);


--
-- Name: idx_workflow_templates_category; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_workflow_templates_category ON etl_designer.workflow_templates USING btree (category);


--
-- Name: idx_workflows_status; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_workflows_status ON etl_designer.workflows USING btree (status);


--
-- Name: idx_workflows_tenant_id; Type: INDEX; Schema: etl_designer; Owner: postgres
--

CREATE INDEX idx_workflows_tenant_id ON etl_designer.workflows USING btree (tenant_id);


--
-- Name: idx_data_lineage_batch_id; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_data_lineage_batch_id ON etl_processing.data_lineage USING btree (batch_id);


--
-- Name: idx_data_lineage_target_table; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_data_lineage_target_table ON etl_processing.data_lineage USING btree (target_table);


--
-- Name: idx_file_templates_active; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_file_templates_active ON etl_processing.file_templates USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_file_templates_template_type; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_file_templates_template_type ON etl_processing.file_templates USING btree (template_type);


--
-- Name: idx_file_templates_tenant_id; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_file_templates_tenant_id ON etl_processing.file_templates USING btree (tenant_id);


--
-- Name: idx_processing_history_batch_id; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_processing_history_batch_id ON etl_processing.processing_history USING btree (batch_id);


--
-- Name: idx_processing_history_started_at; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_processing_history_started_at ON etl_processing.processing_history USING btree (processing_started_at DESC);


--
-- Name: idx_upload_batches_status; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_upload_batches_status ON etl_processing.upload_batches USING btree (status);


--
-- Name: idx_upload_batches_tenant_id; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_upload_batches_tenant_id ON etl_processing.upload_batches USING btree (tenant_id);


--
-- Name: idx_upload_batches_tenant_status; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_upload_batches_tenant_status ON etl_processing.upload_batches USING btree (tenant_id, status);


--
-- Name: idx_upload_batches_uploaded_at; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_upload_batches_uploaded_at ON etl_processing.upload_batches USING btree (uploaded_at DESC);


--
-- Name: idx_validation_results_batch_id; Type: INDEX; Schema: etl_processing; Owner: postgres
--

CREATE INDEX idx_validation_results_batch_id ON etl_processing.validation_results USING btree (batch_id);


--
-- Name: idx_gateway_logs_path; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_gateway_logs_path ON menu.api_gateway_logs USING btree (path);


--
-- Name: idx_gateway_logs_status; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_gateway_logs_status ON menu.api_gateway_logs USING btree (status_code);


--
-- Name: idx_gateway_logs_tenant; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_gateway_logs_tenant ON menu.api_gateway_logs USING btree (tenant_id);


--
-- Name: idx_gateway_logs_timestamp; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_gateway_logs_timestamp ON menu.api_gateway_logs USING btree ("timestamp");


--
-- Name: idx_health_checks_status; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_health_checks_status ON menu.system_health_checks USING btree (status);


--
-- Name: idx_health_checks_tenant_service; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_health_checks_tenant_service ON menu.system_health_checks USING btree (tenant_id, service_name);


--
-- Name: idx_health_checks_timestamp; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_health_checks_timestamp ON menu.system_health_checks USING btree (checked_at);


--
-- Name: idx_load_balancer_instance; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_load_balancer_instance ON menu.load_balancer_status USING btree (instance_id);


--
-- Name: idx_load_balancer_status; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_load_balancer_status ON menu.load_balancer_status USING btree (status);


--
-- Name: idx_load_balancer_tenant; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_load_balancer_tenant ON menu.load_balancer_status USING btree (tenant_id);


--
-- Name: idx_menu_analytics_action_type; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_analytics_action_type ON menu.menu_analytics USING btree (action_type);


--
-- Name: idx_menu_analytics_menu_item; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_analytics_menu_item ON menu.menu_analytics USING btree (menu_item_id);


--
-- Name: idx_menu_analytics_tenant_id; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_analytics_tenant_id ON menu.menu_analytics USING btree (tenant_id);


--
-- Name: idx_menu_analytics_timestamp; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_analytics_timestamp ON menu.menu_analytics USING btree ("timestamp");


--
-- Name: idx_menu_analytics_user_id; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_analytics_user_id ON menu.menu_analytics USING btree (user_id);


--
-- Name: idx_menu_items_active; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_active ON menu.menu_items USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_menu_items_banking_type; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_banking_type ON menu.menu_items USING btree (banking_type);


--
-- Name: idx_menu_items_category_id; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_category_id ON menu.menu_items USING btree (category_id);


--
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_parent_id ON menu.menu_items USING btree (parent_id);


--
-- Name: idx_menu_items_path; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_path ON menu.menu_items USING btree (path);


--
-- Name: idx_menu_items_tenant_id; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_id ON menu.menu_items USING btree (tenant_id);


--
-- Name: idx_menu_items_visible; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_items_visible ON menu.menu_items USING btree (is_visible) WHERE (is_visible = true);


--
-- Name: idx_menu_permissions_allowed; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_permissions_allowed ON menu.menu_permissions USING btree (is_allowed) WHERE (is_allowed = true);


--
-- Name: idx_menu_permissions_menu_item; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_permissions_menu_item ON menu.menu_permissions USING btree (menu_item_id);


--
-- Name: idx_menu_permissions_tenant_role; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_permissions_tenant_role ON menu.menu_permissions USING btree (tenant_id, role_id);


--
-- Name: idx_menu_user_prefs_favorites; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_user_prefs_favorites ON menu.menu_user_preferences USING btree (is_favorite) WHERE (is_favorite = true);


--
-- Name: idx_menu_user_prefs_pinned; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_user_prefs_pinned ON menu.menu_user_preferences USING btree (is_pinned) WHERE (is_pinned = true);


--
-- Name: idx_menu_user_prefs_tenant_user; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_menu_user_prefs_tenant_user ON menu.menu_user_preferences USING btree (tenant_id, user_id);


--
-- Name: idx_performance_metrics_name; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_performance_metrics_name ON menu.performance_metrics USING btree (metric_name);


--
-- Name: idx_performance_metrics_tenant; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_performance_metrics_tenant ON menu.performance_metrics USING btree (tenant_id);


--
-- Name: idx_performance_metrics_timestamp; Type: INDEX; Schema: menu; Owner: postgres
--

CREATE INDEX idx_performance_metrics_timestamp ON menu.performance_metrics USING btree (recorded_at);


--
-- Name: idx_connection_stats_recorded_at; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_connection_stats_recorded_at ON monitoring.connection_stats USING btree (recorded_at);


--
-- Name: idx_health_checks_checked_at; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_health_checks_checked_at ON monitoring.health_checks USING btree (checked_at);


--
-- Name: idx_health_checks_status; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_health_checks_status ON monitoring.health_checks USING btree (status);


--
-- Name: idx_performance_metrics_name; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_performance_metrics_name ON monitoring.performance_metrics USING btree (metric_name);


--
-- Name: idx_performance_metrics_recorded_at; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_performance_metrics_recorded_at ON monitoring.performance_metrics USING btree (recorded_at);


--
-- Name: idx_slow_queries_execution_time; Type: INDEX; Schema: monitoring; Owner: postgres
--

CREATE INDEX idx_slow_queries_execution_time ON monitoring.slow_queries USING btree (execution_time_ms);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON platform_admin.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON platform_admin.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity ON platform_admin.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_logs_entity_type; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity_type ON platform_admin.audit_logs USING btree (entity_type);


--
-- Name: idx_audit_logs_tenant_created; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_tenant_created ON platform_admin.audit_logs USING btree (tenant_id, created_at DESC);


--
-- Name: idx_audit_logs_tenant_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_tenant_id ON platform_admin.audit_logs USING btree (tenant_id);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON platform_admin.audit_logs USING btree (user_id);


--
-- Name: idx_configuration_tenant_category; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_configuration_tenant_category ON platform_admin.configuration USING btree (tenant_id, category);


--
-- Name: idx_menu_items_banking_types; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_banking_types ON platform_admin.menu_items USING gin (banking_types);


--
-- Name: idx_menu_items_is_active; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_is_active ON platform_admin.menu_items USING btree (is_active);


--
-- Name: idx_menu_items_key; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_key ON platform_admin.menu_items USING btree (key);


--
-- Name: idx_menu_items_menu_config_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_menu_config_id ON platform_admin.menu_items USING btree (menu_config_id);


--
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_parent_id ON platform_admin.menu_items USING btree (parent_id);


--
-- Name: idx_menu_items_sort_order; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_sort_order ON platform_admin.menu_items USING btree (menu_config_id, sort_order);


--
-- Name: idx_menu_items_type; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_type ON platform_admin.menu_items USING btree (type);


--
-- Name: idx_menu_items_user_types; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_menu_items_user_types ON platform_admin.menu_items USING gin (user_types);


--
-- Name: idx_platform_users_email; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_platform_users_email ON platform_admin.platform_users USING btree (email);


--
-- Name: idx_platform_users_username; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_platform_users_username ON platform_admin.platform_users USING btree (username);


--
-- Name: idx_system_metrics_timestamp; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_system_metrics_timestamp ON platform_admin.system_metrics USING btree ("timestamp" DESC);


--
-- Name: idx_tenants_banking_type; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_tenants_banking_type ON platform_admin.tenants USING btree (banking_type);


--
-- Name: idx_tenants_created_at; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_tenants_created_at ON platform_admin.tenants USING btree (created_at);


--
-- Name: idx_tenants_is_active; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_tenants_is_active ON platform_admin.tenants USING btree (is_active);


--
-- Name: idx_tenants_slug; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_tenants_slug ON platform_admin.tenants USING btree (tenant_slug);


--
-- Name: idx_tenants_status; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_tenants_status ON platform_admin.tenants USING btree (status);


--
-- Name: idx_user_dashboard_settings_default_view; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_user_dashboard_settings_default_view ON platform_admin.user_dashboard_settings USING btree (default_view);


--
-- Name: idx_user_dashboard_settings_user_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_user_dashboard_settings_user_id ON platform_admin.user_dashboard_settings USING btree (user_id);


--
-- Name: idx_user_roles_role_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_user_roles_role_id ON platform_admin.user_roles USING btree (role_id);


--
-- Name: idx_user_roles_user_email; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_user_roles_user_email ON platform_admin.user_roles USING btree (user_email);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_user_roles_user_id ON platform_admin.user_roles USING btree (user_id);


--
-- Name: idx_users_is_active; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_users_is_active ON platform_admin.users USING btree (is_active);


--
-- Name: idx_users_last_login; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_users_last_login ON platform_admin.users USING btree (last_login_at);


--
-- Name: idx_users_role; Type: INDEX; Schema: platform_admin; Owner: postgres
--

CREATE INDEX idx_users_role ON platform_admin.users USING btree (role);


--
-- Name: idx_usage_summary_tenant_period; Type: INDEX; Schema: platform_analytics; Owner: postgres
--

CREATE INDEX idx_usage_summary_tenant_period ON platform_analytics.tenant_usage_summary USING btree (tenant_id, reporting_period DESC);


--
-- Name: idx_external_connections_tenant_type; Type: INDEX; Schema: platform_integration; Owner: postgres
--

CREATE INDEX idx_external_connections_tenant_type ON platform_integration.external_connections USING btree (tenant_id, connection_type);


--
-- Name: idx_tenant_performance_tenant_metric; Type: INDEX; Schema: platform_monitoring; Owner: postgres
--

CREATE INDEX idx_tenant_performance_tenant_metric ON platform_monitoring.tenant_performance_metrics USING btree (tenant_id, metric_name, recorded_at DESC);


--
-- Name: idx_workflow_business_processes_tenant; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_business_processes_tenant ON workflow.business_processes USING btree (tenant_id);


--
-- Name: idx_workflow_definitions_status; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_definitions_status ON workflow.definitions USING btree (status);


--
-- Name: idx_workflow_definitions_tenant; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_definitions_tenant ON workflow.definitions USING btree (tenant_id);


--
-- Name: idx_workflow_history_instance; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_history_instance ON workflow.execution_history USING btree (workflow_instance_id);


--
-- Name: idx_workflow_instances_definition; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_instances_definition ON workflow.instances USING btree (workflow_definition_id);


--
-- Name: idx_workflow_instances_status; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_instances_status ON workflow.instances USING btree (status);


--
-- Name: idx_workflow_instances_tenant; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_instances_tenant ON workflow.instances USING btree (tenant_id);


--
-- Name: idx_workflow_performance_tenant_date; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_performance_tenant_date ON workflow.performance_metrics USING btree (tenant_id, metric_date);


--
-- Name: idx_workflow_steps_definition; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_steps_definition ON workflow.steps USING btree (workflow_definition_id);


--
-- Name: idx_workflow_tasks_assigned; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_tasks_assigned ON workflow.tasks USING btree (assigned_to);


--
-- Name: idx_workflow_tasks_instance; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_tasks_instance ON workflow.tasks USING btree (workflow_instance_id);


--
-- Name: idx_workflow_tasks_status; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_tasks_status ON workflow.tasks USING btree (status);


--
-- Name: idx_workflow_transitions_definition; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_transitions_definition ON workflow.transitions USING btree (workflow_definition_id);


--
-- Name: approval_definitions update_approval_definitions_updated_at; Type: TRIGGER; Schema: approval_system; Owner: postgres
--

CREATE TRIGGER update_approval_definitions_updated_at BEFORE UPDATE ON approval_system.approval_definitions FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();


--
-- Name: approval_matrix update_approval_matrix_updated_at; Type: TRIGGER; Schema: approval_system; Owner: postgres
--

CREATE TRIGGER update_approval_matrix_updated_at BEFORE UPDATE ON approval_system.approval_matrix FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();


--
-- Name: approval_requests update_approval_requests_updated_at; Type: TRIGGER; Schema: approval_system; Owner: postgres
--

CREATE TRIGGER update_approval_requests_updated_at BEFORE UPDATE ON approval_system.approval_requests FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();


--
-- Name: file_templates trg_file_templates_updated_at; Type: TRIGGER; Schema: etl_processing; Owner: postgres
--

CREATE TRIGGER trg_file_templates_updated_at BEFORE UPDATE ON etl_processing.file_templates FOR EACH ROW EXECUTE FUNCTION etl_processing.update_updated_at_column();


--
-- Name: processing_history trg_processing_history_updated_at; Type: TRIGGER; Schema: etl_processing; Owner: postgres
--

CREATE TRIGGER trg_processing_history_updated_at BEFORE UPDATE ON etl_processing.processing_history FOR EACH ROW EXECUTE FUNCTION etl_processing.update_updated_at_column();


--
-- Name: upload_batches trg_upload_batches_updated_at; Type: TRIGGER; Schema: etl_processing; Owner: postgres
--

CREATE TRIGGER trg_upload_batches_updated_at BEFORE UPDATE ON etl_processing.upload_batches FOR EACH ROW EXECUTE FUNCTION etl_processing.update_updated_at_column();


--
-- Name: validation_results trg_validation_results_updated_at; Type: TRIGGER; Schema: etl_processing; Owner: postgres
--

CREATE TRIGGER trg_validation_results_updated_at BEFORE UPDATE ON etl_processing.validation_results FOR EACH ROW EXECUTE FUNCTION etl_processing.update_updated_at_column();


--
-- Name: menu_categories trigger_menu_categories_updated_at; Type: TRIGGER; Schema: menu; Owner: postgres
--

CREATE TRIGGER trigger_menu_categories_updated_at BEFORE UPDATE ON menu.menu_categories FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();


--
-- Name: menu_configurations trigger_menu_configurations_updated_at; Type: TRIGGER; Schema: menu; Owner: postgres
--

CREATE TRIGGER trigger_menu_configurations_updated_at BEFORE UPDATE ON menu.menu_configurations FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();


--
-- Name: menu_items trigger_menu_items_updated_at; Type: TRIGGER; Schema: menu; Owner: postgres
--

CREATE TRIGGER trigger_menu_items_updated_at BEFORE UPDATE ON menu.menu_items FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();


--
-- Name: menu_user_preferences trigger_menu_user_preferences_updated_at; Type: TRIGGER; Schema: menu; Owner: postgres
--

CREATE TRIGGER trigger_menu_user_preferences_updated_at BEFORE UPDATE ON menu.menu_user_preferences FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();


--
-- Name: menu_items menu_items_updated_at; Type: TRIGGER; Schema: platform_admin; Owner: postgres
--

CREATE TRIGGER menu_items_updated_at BEFORE UPDATE ON platform_admin.menu_items FOR EACH ROW EXECUTE FUNCTION platform_admin.update_menu_items_updated_at();


--
-- Name: configuration update_configuration_updated_at; Type: TRIGGER; Schema: platform_admin; Owner: postgres
--

CREATE TRIGGER update_configuration_updated_at BEFORE UPDATE ON platform_admin.configuration FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();


--
-- Name: approval_actions approval_actions_approval_request_id_fkey; Type: FK CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_actions
    ADD CONSTRAINT approval_actions_approval_request_id_fkey FOREIGN KEY (approval_request_id) REFERENCES approval_system.approval_requests(id);


--
-- Name: approval_audit_trail approval_audit_trail_approval_request_id_fkey; Type: FK CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_audit_trail
    ADD CONSTRAINT approval_audit_trail_approval_request_id_fkey FOREIGN KEY (approval_request_id) REFERENCES approval_system.approval_requests(id);


--
-- Name: approval_notifications approval_notifications_approval_request_id_fkey; Type: FK CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_notifications
    ADD CONSTRAINT approval_notifications_approval_request_id_fkey FOREIGN KEY (approval_request_id) REFERENCES approval_system.approval_requests(id);


--
-- Name: approval_requests approval_requests_approval_definition_id_fkey; Type: FK CONSTRAINT; Schema: approval_system; Owner: postgres
--

ALTER TABLE ONLY approval_system.approval_requests
    ADD CONSTRAINT approval_requests_approval_definition_id_fkey FOREIGN KEY (approval_definition_id) REFERENCES approval_system.approval_definitions(id);


--
-- Name: feature_flags feature_flags_tenant_id_fkey; Type: FK CONSTRAINT; Schema: configuration; Owner: postgres
--

ALTER TABLE ONLY configuration.feature_flags
    ADD CONSTRAINT feature_flags_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES core.menu_categories(id) ON DELETE SET NULL;


--
-- Name: role_menu_access role_menu_access_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES core.menu_items(id) ON DELETE CASCADE;


--
-- Name: role_menu_access role_menu_access_role_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_menu_access
    ADD CONSTRAINT role_menu_access_role_id_fkey FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES core.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: data_lineage data_lineage_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.data_lineage
    ADD CONSTRAINT data_lineage_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: data_sources data_sources_tenant_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.data_sources
    ADD CONSTRAINT data_sources_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: execution_history execution_history_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.execution_history
    ADD CONSTRAINT execution_history_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: monitoring_alerts monitoring_alerts_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.monitoring_alerts
    ADD CONSTRAINT monitoring_alerts_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: optimization_results optimization_results_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.optimization_results
    ADD CONSTRAINT optimization_results_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: performance_metrics performance_metrics_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.performance_metrics
    ADD CONSTRAINT performance_metrics_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: quality_reports quality_reports_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.quality_reports
    ADD CONSTRAINT quality_reports_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: quality_rules quality_rules_tenant_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.quality_rules
    ADD CONSTRAINT quality_rules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: schema_evolution schema_evolution_data_source_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.schema_evolution
    ADD CONSTRAINT schema_evolution_data_source_id_fkey FOREIGN KEY (data_source_id) REFERENCES etl_designer.data_sources(id) ON DELETE CASCADE;


--
-- Name: transformations transformations_workflow_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.transformations
    ADD CONSTRAINT transformations_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES etl_designer.workflows(id) ON DELETE CASCADE;


--
-- Name: workflows workflows_tenant_id_fkey; Type: FK CONSTRAINT; Schema: etl_designer; Owner: postgres
--

ALTER TABLE ONLY etl_designer.workflows
    ADD CONSTRAINT workflows_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: data_lineage data_lineage_batch_id_fkey; Type: FK CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.data_lineage
    ADD CONSTRAINT data_lineage_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE;


--
-- Name: processing_history processing_history_batch_id_fkey; Type: FK CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.processing_history
    ADD CONSTRAINT processing_history_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE;


--
-- Name: validation_results validation_results_batch_id_fkey; Type: FK CONSTRAINT; Schema: etl_processing; Owner: postgres
--

ALTER TABLE ONLY etl_processing.validation_results
    ADD CONSTRAINT validation_results_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES etl_processing.upload_batches(id) ON DELETE CASCADE;


--
-- Name: rule_base_setting_details rule_base_setting_details_rule_id_fkey; Type: FK CONSTRAINT; Schema: ifrs9; Owner: postgres
--

ALTER TABLE ONLY ifrs9.rule_base_setting_details
    ADD CONSTRAINT rule_base_setting_details_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES ifrs9.rule_base_setting_headers(id) ON DELETE CASCADE;


--
-- Name: dcf_cashflows dcf_cashflows_scenario_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_cashflows
    ADD CONSTRAINT dcf_cashflows_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES individual.individual_scenarios(id);


--
-- Name: dcf_cashflows dcf_cashflows_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_cashflows
    ADD CONSTRAINT dcf_cashflows_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: dcf_cashflows dcf_cashflows_upload_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_cashflows
    ADD CONSTRAINT dcf_cashflows_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES individual.dcf_uploads(id) ON DELETE CASCADE;


--
-- Name: dcf_uploads dcf_uploads_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_uploads
    ADD CONSTRAINT dcf_uploads_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: dcf_uploads dcf_uploads_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.dcf_uploads
    ADD CONSTRAINT dcf_uploads_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_audit_trails individual_audit_trails_performed_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_audit_trails
    ADD CONSTRAINT individual_audit_trails_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_audit_trails individual_audit_trails_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_audit_trails
    ADD CONSTRAINT individual_audit_trails_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: individual_overrides individual_overrides_approved_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_overrides
    ADD CONSTRAINT individual_overrides_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_overrides individual_overrides_requested_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_overrides
    ADD CONSTRAINT individual_overrides_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_overrides individual_overrides_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_overrides
    ADD CONSTRAINT individual_overrides_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: individual_reports individual_reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_reports
    ADD CONSTRAINT individual_reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_reports individual_reports_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_reports
    ADD CONSTRAINT individual_reports_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: individual_scenarios individual_scenarios_approved_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_scenarios
    ADD CONSTRAINT individual_scenarios_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_scenarios individual_scenarios_created_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_scenarios
    ADD CONSTRAINT individual_scenarios_created_by_fkey FOREIGN KEY (created_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_scenarios individual_scenarios_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_scenarios
    ADD CONSTRAINT individual_scenarios_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: individual_watchlist individual_watchlist_added_by_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_watchlist
    ADD CONSTRAINT individual_watchlist_added_by_fkey FOREIGN KEY (added_by) REFERENCES platform_admin.users(id);


--
-- Name: individual_watchlist individual_watchlist_tenant_id_fkey; Type: FK CONSTRAINT; Schema: individual; Owner: postgres
--

ALTER TABLE ONLY individual.individual_watchlist
    ADD CONSTRAINT individual_watchlist_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES core.tenants(id) ON DELETE CASCADE;


--
-- Name: menu_analytics menu_analytics_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_analytics
    ADD CONSTRAINT menu_analytics_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES menu.menu_items(id);


--
-- Name: menu_items menu_items_category_id_fkey; Type: FK CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES menu.menu_categories(id);


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES menu.menu_items(id);


--
-- Name: menu_permissions menu_permissions_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_permissions
    ADD CONSTRAINT menu_permissions_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES menu.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_user_preferences menu_user_preferences_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: menu; Owner: postgres
--

ALTER TABLE ONLY menu.menu_user_preferences
    ADD CONSTRAINT menu_user_preferences_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES menu.menu_items(id) ON DELETE CASCADE;


--
-- Name: menu_items menu_items_menu_config_id_fkey; Type: FK CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.menu_items
    ADD CONSTRAINT menu_items_menu_config_id_fkey FOREIGN KEY (menu_config_id) REFERENCES platform_admin.menu_configurations(id) ON DELETE CASCADE;


--
-- Name: user_dashboard_settings user_dashboard_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.user_dashboard_settings
    ADD CONSTRAINT user_dashboard_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES platform_admin.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: platform_admin; Owner: postgres
--

ALTER TABLE ONLY platform_admin.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES platform_admin.roles(id);


--
-- Name: tenant_usage_summary tenant_usage_summary_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_analytics; Owner: postgres
--

ALTER TABLE ONLY platform_analytics.tenant_usage_summary
    ADD CONSTRAINT tenant_usage_summary_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id);


--
-- Name: global_audit_log global_audit_log_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_audit; Owner: postgres
--

ALTER TABLE ONLY platform_audit.global_audit_log
    ADD CONSTRAINT global_audit_log_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id);


--
-- Name: tenant_subscriptions tenant_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: platform_billing; Owner: postgres
--

ALTER TABLE ONLY platform_billing.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES platform_billing.subscription_plans(id);


--
-- Name: tenant_subscriptions tenant_subscriptions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_billing; Owner: postgres
--

ALTER TABLE ONLY platform_billing.tenant_subscriptions
    ADD CONSTRAINT tenant_subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: external_connections external_connections_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_integration; Owner: postgres
--

ALTER TABLE ONLY platform_integration.external_connections
    ADD CONSTRAINT external_connections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id);


--
-- Name: tenant_health tenant_health_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_monitoring; Owner: postgres
--

ALTER TABLE ONLY platform_monitoring.tenant_health
    ADD CONSTRAINT tenant_health_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id) ON DELETE CASCADE;


--
-- Name: tenant_performance_metrics tenant_performance_metrics_tenant_id_fkey; Type: FK CONSTRAINT; Schema: platform_monitoring; Owner: postgres
--

ALTER TABLE ONLY platform_monitoring.tenant_performance_metrics
    ADD CONSTRAINT tenant_performance_metrics_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES platform_admin.tenants(id);


--
-- Name: execution_history execution_history_workflow_instance_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.execution_history
    ADD CONSTRAINT execution_history_workflow_instance_id_fkey FOREIGN KEY (workflow_instance_id) REFERENCES workflow.instances(id) ON DELETE CASCADE;


--
-- Name: instances instances_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.instances
    ADD CONSTRAINT instances_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES workflow.definitions(id);


--
-- Name: performance_metrics performance_metrics_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.performance_metrics
    ADD CONSTRAINT performance_metrics_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES workflow.definitions(id);


--
-- Name: steps steps_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.steps
    ADD CONSTRAINT steps_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES workflow.definitions(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_workflow_instance_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_workflow_instance_id_fkey FOREIGN KEY (workflow_instance_id) REFERENCES workflow.instances(id) ON DELETE CASCADE;


--
-- Name: transitions transitions_workflow_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.transitions
    ADD CONSTRAINT transitions_workflow_definition_id_fkey FOREIGN KEY (workflow_definition_id) REFERENCES workflow.definitions(id) ON DELETE CASCADE;


--
-- Name: api_gateway_logs; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.api_gateway_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: api_gateway_logs api_gateway_logs_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY api_gateway_logs_tenant_isolation ON menu.api_gateway_logs USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: load_balancer_status; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.load_balancer_status ENABLE ROW LEVEL SECURITY;

--
-- Name: load_balancer_status load_balancer_status_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY load_balancer_status_tenant_isolation ON menu.load_balancer_status USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_analytics; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_analytics menu_analytics_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_analytics_tenant_isolation ON menu.menu_analytics USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_categories; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_categories menu_categories_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_categories_tenant_isolation ON menu.menu_categories USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_configurations; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_configurations menu_configurations_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_configurations_tenant_isolation ON menu.menu_configurations USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_items; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_items ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_items menu_items_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_items_tenant_isolation ON menu.menu_items USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_permissions; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_permissions menu_permissions_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_permissions_tenant_isolation ON menu.menu_permissions USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: menu_user_preferences; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.menu_user_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: menu_user_preferences menu_user_preferences_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY menu_user_preferences_tenant_isolation ON menu.menu_user_preferences USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: performance_metrics; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.performance_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: performance_metrics performance_metrics_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY performance_metrics_tenant_isolation ON menu.performance_metrics USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- Name: system_health_checks; Type: ROW SECURITY; Schema: menu; Owner: postgres
--

ALTER TABLE menu.system_health_checks ENABLE ROW LEVEL SECURITY;

--
-- Name: system_health_checks system_health_checks_tenant_isolation; Type: POLICY; Schema: menu; Owner: postgres
--

CREATE POLICY system_health_checks_tenant_isolation ON menu.system_health_checks USING ((tenant_id = (current_setting('app.current_tenant_id'::text))::uuid));


--
-- PostgreSQL database dump complete
--

\unrestrict 6d5wfVHeM2ls6Bb31sHey0Nw4Z5IElBVhvpvDPHJjXckQN8gxCexAGWjpvEPvDi

