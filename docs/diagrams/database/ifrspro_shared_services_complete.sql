--
-- PostgreSQL database dump
--

\restrict 14x5cGpNRx9S6jc1eslD7Tcsv26jTUFmgcLk0qxh4BnzvqmfhiTQdRwPegFs5tp

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
-- Name: audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA audit;


ALTER SCHEMA audit OWNER TO postgres;

--
-- Name: calculation_engine; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA calculation_engine;


ALTER SCHEMA calculation_engine OWNER TO postgres;

--
-- Name: data_science; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA data_science;


ALTER SCHEMA data_science OWNER TO postgres;

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
-- Name: ml_models; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA ml_models;


ALTER SCHEMA ml_models OWNER TO postgres;

--
-- Name: notification; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA notification;


ALTER SCHEMA notification OWNER TO postgres;

--
-- Name: r_analytics; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA r_analytics;


ALTER SCHEMA r_analytics OWNER TO postgres;

--
-- Name: reference_data; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA reference_data;


ALTER SCHEMA reference_data OWNER TO postgres;

--
-- Name: shared_functions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA shared_functions;


ALTER SCHEMA shared_functions OWNER TO postgres;

--
-- Name: shared_services; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA shared_services;


ALTER SCHEMA shared_services OWNER TO postgres;

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

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA shared_services;


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

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


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
-- Name: calculate_ecl_basic(numeric, numeric, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_ecl_basic(outstanding_amount numeric, pd_rate numeric, lgd_rate numeric, ead_amount numeric DEFAULT NULL::numeric) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    -- Basic ECL calculation: ECL = EAD × PD × LGD
    RETURN COALESCE(ead_amount, outstanding_amount) * pd_rate * lgd_rate;
END;
$$;


ALTER FUNCTION public.calculate_ecl_basic(outstanding_amount numeric, pd_rate numeric, lgd_rate numeric, ead_amount numeric) OWNER TO postgres;

--
-- Name: determine_ifrs9_stage(integer, numeric, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.determine_ifrs9_stage(days_past_due integer, credit_rating_change numeric DEFAULT 0, lifetime_pd_increase_pct numeric DEFAULT 0) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    -- Stage 3: Credit-impaired (>90 days past due)
    IF days_past_due > 90 THEN
        RETURN 3;
    END IF;
    
    -- Stage 2: Significant increase in credit risk
    IF days_past_due > 30 OR lifetime_pd_increase_pct > 5.0 OR credit_rating_change > 2 THEN
        RETURN 2;
    END IF;
    
    -- Stage 1: Performing (default)
    RETURN 1;
END;
$$;


ALTER FUNCTION public.determine_ifrs9_stage(days_past_due integer, credit_rating_change numeric, lifetime_pd_increase_pct numeric) OWNER TO postgres;

--
-- Name: get_current_tenant_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_current_tenant_id() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN COALESCE(current_setting('app.current_tenant_id', true)::UUID, '00000000-0000-0000-0000-000000000000'::UUID);
END;
$$;


ALTER FUNCTION public.get_current_tenant_id() OWNER TO postgres;

--
-- Name: set_tenant_context(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_tenant_context(tenant_id_param uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Set tenant context for row-level security
    PERFORM set_config('app.current_tenant_id', tenant_id_param::text, true);
END;
$$;


ALTER FUNCTION public.set_tenant_context(tenant_id_param uuid) OWNER TO postgres;

--
-- Name: validate_setup(); Type: FUNCTION; Schema: shared_functions; Owner: postgres
--

CREATE FUNCTION shared_functions.validate_setup() RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN 'Shared Services Database Ready!';
END;
$$;


ALTER FUNCTION shared_functions.validate_setup() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: system_audit_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.system_audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_name character varying(100) NOT NULL,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id uuid,
    changes jsonb,
    metadata jsonb,
    severity character varying(20) DEFAULT 'info'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE audit.system_audit_logs OWNER TO postgres;

--
-- Name: ecl_models; Type: TABLE; Schema: calculation_engine; Owner: postgres
--

CREATE TABLE calculation_engine.ecl_models (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    model_name character varying(100) NOT NULL,
    model_type character varying(50) NOT NULL,
    model_version character varying(20) NOT NULL,
    model_parameters jsonb DEFAULT '{}'::jsonb,
    calculation_formula text,
    supports_conventional boolean DEFAULT true,
    supports_syariah boolean DEFAULT true,
    is_active boolean DEFAULT true,
    validation_status character varying(20) DEFAULT 'approved'::character varying,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE calculation_engine.ecl_models OWNER TO postgres;

--
-- Name: experiment_runs; Type: TABLE; Schema: data_science; Owner: postgres
--

CREATE TABLE data_science.experiment_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    experiment_name character varying(100) NOT NULL,
    experiment_type character varying(50) NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    metrics jsonb DEFAULT '{}'::jsonb,
    artifacts_path text,
    status character varying(20) DEFAULT 'running'::character varying,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_by character varying(100)
);


ALTER TABLE data_science.experiment_runs OWNER TO postgres;

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
-- Name: model_registry; Type: TABLE; Schema: ml_models; Owner: postgres
--

CREATE TABLE ml_models.model_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_name character varying(100) NOT NULL,
    model_version character varying(20) NOT NULL,
    model_type character varying(50) NOT NULL,
    model_purpose character varying(100) NOT NULL,
    model_binary bytea,
    model_metadata jsonb DEFAULT '{}'::jsonb,
    training_accuracy numeric(8,6),
    validation_accuracy numeric(8,6),
    feature_importance jsonb DEFAULT '{}'::jsonb,
    deployment_status character varying(20) DEFAULT 'development'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    deployed_at timestamp with time zone
);


ALTER TABLE ml_models.model_registry OWNER TO postgres;

--
-- Name: queue; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.queue (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tenant_id uuid,
    recipient_email character varying(255) NOT NULL,
    template_id uuid,
    template_data jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    scheduled_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE notification.queue OWNER TO postgres;

--
-- Name: templates; Type: TABLE; Schema: notification; Owner: postgres
--

CREATE TABLE notification.templates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    template_name character varying(100) NOT NULL,
    template_type character varying(50) NOT NULL,
    subject_template text,
    body_template text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE notification.templates OWNER TO postgres;

--
-- Name: economic_scenarios; Type: TABLE; Schema: r_analytics; Owner: postgres
--

CREATE TABLE r_analytics.economic_scenarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    scenario_name character varying(100) NOT NULL,
    scenario_type character varying(50) NOT NULL,
    scenario_description text,
    macroeconomic_variables jsonb DEFAULT '{}'::jsonb,
    probability_weight numeric(5,4) DEFAULT 1.0,
    effective_date date NOT NULL,
    expiry_date date,
    regulatory_framework character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE r_analytics.economic_scenarios OWNER TO postgres;

--
-- Name: statistical_models; Type: TABLE; Schema: r_analytics; Owner: postgres
--

CREATE TABLE r_analytics.statistical_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_name character varying(100) NOT NULL,
    model_type character varying(50) NOT NULL,
    model_purpose character varying(100) NOT NULL,
    r_script_path text,
    model_parameters jsonb DEFAULT '{}'::jsonb,
    training_data_requirements jsonb DEFAULT '{}'::jsonb,
    validation_metrics jsonb DEFAULT '{}'::jsonb,
    supports_conventional boolean DEFAULT true,
    supports_syariah boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE r_analytics.statistical_models OWNER TO postgres;

--
-- Name: banking_products; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data.banking_products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(200) NOT NULL,
    product_category character varying(100),
    banking_type character varying(20),
    risk_weight numeric(5,4),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT banking_products_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('both'::character varying)::text])))
);


ALTER TABLE reference_data.banking_products OWNER TO postgres;

--
-- Name: countries; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data.countries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    country_code character varying(3) NOT NULL,
    country_name character varying(100) NOT NULL,
    currency_code character varying(3) NOT NULL,
    currency_name character varying(100) NOT NULL,
    region character varying(50),
    regulatory_framework character varying(100),
    ifrs9_adoption_date date,
    created_at timestamp with time zone DEFAULT now(),
    timezone character varying(50)
);


ALTER TABLE reference_data.countries OWNER TO postgres;

--
-- Name: currencies; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data.currencies (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    currency_code character varying(3) NOT NULL,
    currency_name character varying(100) NOT NULL,
    symbol character varying(10),
    decimal_places integer DEFAULT 2,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE reference_data.currencies OWNER TO postgres;

--
-- Name: ifrs9_staging_criteria; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data.ifrs9_staging_criteria (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    criteria_name character varying(100) NOT NULL,
    criteria_type character varying(50) NOT NULL,
    criteria_rules jsonb NOT NULL,
    banking_type character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ifrs9_staging_criteria_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('both'::character varying)::text])))
);


ALTER TABLE reference_data.ifrs9_staging_criteria OWNER TO postgres;

--
-- Name: product_types; Type: TABLE; Schema: reference_data; Owner: postgres
--

CREATE TABLE reference_data.product_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_code character varying(20) NOT NULL,
    product_name character varying(200) NOT NULL,
    product_category character varying(100) NOT NULL,
    conventional_compatible boolean DEFAULT true,
    syariah_compatible boolean DEFAULT true,
    ecl_calculation_method character varying(50),
    risk_category character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE reference_data.product_types OWNER TO postgres;

--
-- Name: restricted_databases; Type: VIEW; Schema: shared_services; Owner: postgres
--

CREATE VIEW shared_services.restricted_databases AS
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


ALTER VIEW shared_services.restricted_databases OWNER TO postgres;

--
-- Name: system_audit_logs system_audit_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.system_audit_logs
    ADD CONSTRAINT system_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: ecl_models ecl_models_model_name_key; Type: CONSTRAINT; Schema: calculation_engine; Owner: postgres
--

ALTER TABLE ONLY calculation_engine.ecl_models
    ADD CONSTRAINT ecl_models_model_name_key UNIQUE (model_name);


--
-- Name: ecl_models ecl_models_pkey; Type: CONSTRAINT; Schema: calculation_engine; Owner: postgres
--

ALTER TABLE ONLY calculation_engine.ecl_models
    ADD CONSTRAINT ecl_models_pkey PRIMARY KEY (id);


--
-- Name: experiment_runs experiment_runs_pkey; Type: CONSTRAINT; Schema: data_science; Owner: postgres
--

ALTER TABLE ONLY data_science.experiment_runs
    ADD CONSTRAINT experiment_runs_pkey PRIMARY KEY (id);


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
-- Name: model_registry model_registry_pkey; Type: CONSTRAINT; Schema: ml_models; Owner: postgres
--

ALTER TABLE ONLY ml_models.model_registry
    ADD CONSTRAINT model_registry_pkey PRIMARY KEY (id);


--
-- Name: queue queue_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.queue
    ADD CONSTRAINT queue_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: templates templates_template_name_key; Type: CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.templates
    ADD CONSTRAINT templates_template_name_key UNIQUE (template_name);


--
-- Name: economic_scenarios economic_scenarios_pkey; Type: CONSTRAINT; Schema: r_analytics; Owner: postgres
--

ALTER TABLE ONLY r_analytics.economic_scenarios
    ADD CONSTRAINT economic_scenarios_pkey PRIMARY KEY (id);


--
-- Name: statistical_models statistical_models_model_name_key; Type: CONSTRAINT; Schema: r_analytics; Owner: postgres
--

ALTER TABLE ONLY r_analytics.statistical_models
    ADD CONSTRAINT statistical_models_model_name_key UNIQUE (model_name);


--
-- Name: statistical_models statistical_models_pkey; Type: CONSTRAINT; Schema: r_analytics; Owner: postgres
--

ALTER TABLE ONLY r_analytics.statistical_models
    ADD CONSTRAINT statistical_models_pkey PRIMARY KEY (id);


--
-- Name: banking_products banking_products_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.banking_products
    ADD CONSTRAINT banking_products_pkey PRIMARY KEY (id);


--
-- Name: banking_products banking_products_product_code_key; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.banking_products
    ADD CONSTRAINT banking_products_product_code_key UNIQUE (product_code);


--
-- Name: countries countries_country_code_key; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.countries
    ADD CONSTRAINT countries_country_code_key UNIQUE (country_code);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (id);


--
-- Name: currencies currencies_currency_code_key; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.currencies
    ADD CONSTRAINT currencies_currency_code_key UNIQUE (currency_code);


--
-- Name: currencies currencies_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.currencies
    ADD CONSTRAINT currencies_pkey PRIMARY KEY (id);


--
-- Name: ifrs9_staging_criteria ifrs9_staging_criteria_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.ifrs9_staging_criteria
    ADD CONSTRAINT ifrs9_staging_criteria_pkey PRIMARY KEY (id);


--
-- Name: product_types product_types_pkey; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.product_types
    ADD CONSTRAINT product_types_pkey PRIMARY KEY (id);


--
-- Name: product_types product_types_product_code_key; Type: CONSTRAINT; Schema: reference_data; Owner: postgres
--

ALTER TABLE ONLY reference_data.product_types
    ADD CONSTRAINT product_types_product_code_key UNIQUE (product_code);


--
-- Name: idx_system_audit_action; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_system_audit_action ON audit.system_audit_logs USING btree (action);


--
-- Name: idx_system_audit_created_at; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_system_audit_created_at ON audit.system_audit_logs USING btree (created_at);


--
-- Name: idx_system_audit_service; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_system_audit_service ON audit.system_audit_logs USING btree (service_name);


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
-- Name: idx_model_registry_purpose_status; Type: INDEX; Schema: ml_models; Owner: postgres
--

CREATE INDEX idx_model_registry_purpose_status ON ml_models.model_registry USING btree (model_purpose, deployment_status);


--
-- Name: idx_notification_queue_scheduled; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX idx_notification_queue_scheduled ON notification.queue USING btree (scheduled_at);


--
-- Name: idx_notification_queue_status; Type: INDEX; Schema: notification; Owner: postgres
--

CREATE INDEX idx_notification_queue_status ON notification.queue USING btree (status);


--
-- Name: idx_economic_scenarios_type_date; Type: INDEX; Schema: r_analytics; Owner: postgres
--

CREATE INDEX idx_economic_scenarios_type_date ON r_analytics.economic_scenarios USING btree (scenario_type, effective_date);


--
-- Name: idx_statistical_models_type_purpose; Type: INDEX; Schema: r_analytics; Owner: postgres
--

CREATE INDEX idx_statistical_models_type_purpose ON r_analytics.statistical_models USING btree (model_type, model_purpose);


--
-- Name: idx_banking_products_type; Type: INDEX; Schema: reference_data; Owner: postgres
--

CREATE INDEX idx_banking_products_type ON reference_data.banking_products USING btree (banking_type);


--
-- Name: idx_countries_code; Type: INDEX; Schema: reference_data; Owner: postgres
--

CREATE INDEX idx_countries_code ON reference_data.countries USING btree (country_code);


--
-- Name: idx_currencies_code; Type: INDEX; Schema: reference_data; Owner: postgres
--

CREATE INDEX idx_currencies_code ON reference_data.currencies USING btree (currency_code);


--
-- Name: idx_ifrs9_staging_type; Type: INDEX; Schema: reference_data; Owner: postgres
--

CREATE INDEX idx_ifrs9_staging_type ON reference_data.ifrs9_staging_criteria USING btree (banking_type);


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
-- Name: queue queue_template_id_fkey; Type: FK CONSTRAINT; Schema: notification; Owner: postgres
--

ALTER TABLE ONLY notification.queue
    ADD CONSTRAINT queue_template_id_fkey FOREIGN KEY (template_id) REFERENCES notification.templates(id);


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

\unrestrict 14x5cGpNRx9S6jc1eslD7Tcsv26jTUFmgcLk0qxh4BnzvqmfhiTQdRwPegFs5tp

