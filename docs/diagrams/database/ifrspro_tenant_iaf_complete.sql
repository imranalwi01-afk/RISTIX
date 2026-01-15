--
-- PostgreSQL database dump
--

\restrict WH4jXaJlbIDVaU7O89yeYHJqcrjhSdcIOlcu16JwqyKDCHptvcDyHdMTtN9S3A0

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
-- Name: analytics; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA analytics;


ALTER SCHEMA analytics OWNER TO postgres;

--
-- Name: audit; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA audit;


ALTER SCHEMA audit OWNER TO postgres;

--
-- Name: calculation; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA calculation;


ALTER SCHEMA calculation OWNER TO postgres;

--
-- Name: cms; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA cms;


ALTER SCHEMA cms OWNER TO postgres;

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
-- Name: ifrs9; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA ifrs9;


ALTER SCHEMA ifrs9 OWNER TO postgres;

--
-- Name: staging; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA staging;


ALTER SCHEMA staging OWNER TO postgres;

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

CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA core;


--
-- Name: EXTENSION dblink; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION dblink IS 'connect to other PostgreSQL databases from within a database';


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
-- Name: enum_menu_configurations_banking_mode; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.enum_menu_configurations_banking_mode AS ENUM (
    'conventional',
    'syariah',
    'dual'
);


ALTER TYPE core.enum_menu_configurations_banking_mode OWNER TO postgres;

--
-- Name: enum_menu_configurations_target_audience; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.enum_menu_configurations_target_audience AS ENUM (
    'banking_staff',
    'consultant',
    'regulator',
    'platform_admin'
);


ALTER TYPE core.enum_menu_configurations_target_audience OWNER TO postgres;

--
-- Name: enum_menu_items_target; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.enum_menu_items_target AS ENUM (
    '_self',
    '_blank',
    '_parent',
    '_top'
);


ALTER TYPE core.enum_menu_items_target OWNER TO postgres;

--
-- Name: enum_menu_items_type; Type: TYPE; Schema: core; Owner: postgres
--

CREATE TYPE core.enum_menu_items_type AS ENUM (
    'group',
    'item',
    'divider'
);


ALTER TYPE core.enum_menu_items_type OWNER TO postgres;

--
-- Name: connect_to(text); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.connect_to(db_name text) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF db_name LIKE 'ifrspro%' THEN
        PERFORM dblink_connect('tmp_conn', format('host=localhost user=%s password=%s dbname=%s', current_user, 'ifrspro', db_name));
        RETURN format('Connected to %s. Use dblink to query.', db_name);
    ELSE
        RAISE EXCEPTION 'Cannot connect to non-ifrspro database: %', db_name;
    END IF;
END;
$$;


ALTER FUNCTION core.connect_to(db_name text) OWNER TO postgres;

--
-- Name: show_my_databases(); Type: FUNCTION; Schema: core; Owner: postgres
--

CREATE FUNCTION core.show_my_databases() RETURNS TABLE(database_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT datname::text
    FROM pg_database
    WHERE datname LIKE 'ifrspro%'
    AND has_database_privilege(current_user, datname, 'CONNECT')
    ORDER BY datname;
END;
$$;


ALTER FUNCTION core.show_my_databases() OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tenant_id character varying(100) DEFAULT 'dana'::character varying,
    event_type character varying(50) NOT NULL,
    action character varying(100) NOT NULL,
    description text,
    entity_type character varying(50),
    entity_id uuid,
    entity_name character varying(200),
    old_values jsonb,
    new_values jsonb,
    changed_fields text[],
    metadata jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE audit.audit_logs OWNER TO postgres;

--
-- Name: data_change_history; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.data_change_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    change_type character varying(20) NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id uuid NOT NULL,
    changed_by uuid,
    changed_by_role character varying(100),
    field_name character varying(100),
    old_value text,
    new_value text,
    change_reason text,
    change_source character varying(50) DEFAULT 'MANUAL'::character varying,
    batch_id uuid,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    original_record jsonb,
    CONSTRAINT data_change_history_change_type_check CHECK (((change_type)::text = ANY (ARRAY[('INSERT'::character varying)::text, ('UPDATE'::character varying)::text, ('DELETE'::character varying)::text])))
);


ALTER TABLE audit.data_change_history OWNER TO postgres;

--
-- Name: user_activity_logs; Type: TABLE; Schema: audit; Owner: postgres
--

CREATE TABLE audit.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_type character varying(100) NOT NULL,
    activity_description text,
    page_url character varying(1000),
    page_title character varying(500),
    previous_page character varying(1000),
    endpoint character varying(500),
    method character varying(10),
    status_code integer,
    response_time_ms integer,
    session_id character varying(255),
    device_info jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_activity_logs_activity_type_check CHECK (((activity_type)::text = ANY (ARRAY[('PAGE_VIEW'::character varying)::text, ('API_CALL'::character varying)::text, ('DATA_EXPORT'::character varying)::text, ('MENU_ACCESS'::character varying)::text, ('LOGIN'::character varying)::text, ('LOGOUT'::character varying)::text]))),
    CONSTRAINT user_activity_logs_method_check CHECK (((method)::text = ANY (ARRAY[('GET'::character varying)::text, ('POST'::character varying)::text, ('PUT'::character varying)::text, ('DELETE'::character varying)::text, ('PATCH'::character varying)::text]))),
    CONSTRAINT valid_response_time CHECK ((response_time_ms >= 0)),
    CONSTRAINT valid_status_code CHECK (((status_code >= 100) AND (status_code <= 599)))
);


ALTER TABLE audit.user_activity_logs OWNER TO postgres;

--
-- Name: app_settings; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.app_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying(255) NOT NULL,
    setting_value text,
    setting_type character varying(50) DEFAULT 'string'::character varying,
    category character varying(100),
    description text,
    is_encrypted boolean DEFAULT false,
    is_readonly boolean DEFAULT false,
    required_role character varying(50),
    visible_in_ui boolean DEFAULT true,
    validation_regex character varying(500),
    min_value numeric(20,4),
    max_value numeric(20,4),
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_updated_by uuid,
    CONSTRAINT app_settings_setting_type_check CHECK (((setting_type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text, ('array'::character varying)::text])))
);


ALTER TABLE core.app_settings OWNER TO postgres;

--
-- Name: banking_products; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.banking_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_code character varying(50) NOT NULL,
    product_name character varying(200) NOT NULL,
    product_category character varying(50) NOT NULL,
    banking_type character varying(20) NOT NULL,
    syariah_contract_type character varying(50),
    syariah_compliance_level character varying(20) DEFAULT 'BASIC'::character varying,
    interest_rate_type character varying(20),
    default_interest_rate numeric(8,4),
    min_amount numeric(20,2),
    max_amount numeric(20,2),
    min_term_months integer,
    max_term_months integer,
    risk_weight numeric(5,4),
    provisioning_rate numeric(5,4),
    is_active boolean DEFAULT true,
    requires_approval boolean DEFAULT false,
    description text,
    terms_conditions text,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT banking_products_banking_type_check CHECK (((banking_type)::text = ANY (ARRAY[('conventional'::character varying)::text, ('syariah'::character varying)::text, ('dual'::character varying)::text]))),
    CONSTRAINT positive_min_amount CHECK ((min_amount >= (0)::numeric)),
    CONSTRAINT valid_product_category CHECK (((product_category)::text = ANY (ARRAY[('RETAIL'::character varying)::text, ('CORPORATE'::character varying)::text, ('SME'::character varying)::text, ('ISLAMIC'::character varying)::text]))),
    CONSTRAINT valid_term_months CHECK (((min_term_months > 0) AND (max_term_months > 0)))
);


ALTER TABLE core.banking_products OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_code character varying(50) NOT NULL,
    customer_name character varying(200) NOT NULL,
    customer_type character varying(20) DEFAULT 'INDIVIDUAL'::character varying,
    is_active boolean DEFAULT true,
    tenant_id character varying(100) DEFAULT 'dana'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    customer_number character varying(100),
    first_name character varying(100),
    last_name character varying(100),
    date_of_birth date,
    place_of_birth character varying(100),
    gender character varying(10),
    marital_status character varying(20),
    company_name character varying(255),
    company_type character varying(50),
    industry_sector character varying(100),
    registration_number character varying(100),
    tax_id character varying(50),
    email character varying(255),
    phone character varying(50),
    mobile character varying(50),
    address_line1 character varying(500),
    address_line2 character varying(500),
    city character varying(100),
    province character varying(100),
    postal_code character varying(20),
    country character varying(100) DEFAULT 'Indonesia'::character varying,
    bank_verification_status character varying(20) DEFAULT 'pending'::character varying,
    credit_score integer,
    credit_limit numeric(20,2),
    is_syariah_customer boolean DEFAULT false,
    syariah_compliance_level character varying(20) DEFAULT 'basic'::character varying,
    is_blacklisted boolean DEFAULT false,
    is_pep boolean DEFAULT false,
    risk_rating character varying(20),
    aml_risk_level character varying(20) DEFAULT 'low'::character varying,
    created_by uuid,
    updated_by uuid,
    legacy_id integer,
    legacy_system character varying(50),
    CONSTRAINT customers_customer_type_check CHECK (((customer_type)::text = ANY (ARRAY[('INDIVIDUAL'::character varying)::text, ('CORPORATE'::character varying)::text]))),
    CONSTRAINT customers_gender_check CHECK (((gender)::text = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text, ('other'::character varying)::text])))
);


ALTER TABLE core.customers OWNER TO postgres;

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
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE core.menu_categories OWNER TO postgres;

--
-- Name: menu_configurations; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_configurations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    target_audience core.enum_menu_configurations_target_audience NOT NULL,
    banking_mode core.enum_menu_configurations_banking_mode,
    tenant_specific boolean DEFAULT false NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    version character varying(50) DEFAULT '1.0.0'::character varying NOT NULL,
    created_by character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE core.menu_configurations OWNER TO postgres;

--
-- Name: menu_items; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.menu_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    menu_key character varying(100) NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    icon character varying(100),
    url character varying(500),
    menu_type character varying(20) DEFAULT 'item'::character varying NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    banking_types text[] DEFAULT ARRAY['conventional'::text, 'syariah'::text, 'dual'::text],
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid,
    CONSTRAINT menu_items_menu_type_check CHECK (((menu_type)::text = ANY (ARRAY[('item'::character varying)::text, ('group'::character varying)::text, ('divider'::character varying)::text])))
);


ALTER TABLE core.menu_items OWNER TO postgres;

--
-- Name: TABLE menu_items; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.menu_items IS 'Database-driven menu items for IAF IFRS9 platform';


--
-- Name: portfolio_accounts; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.portfolio_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    account_number character varying(50) NOT NULL,
    customer_id uuid,
    product_code character varying(20),
    balance numeric(18,2) DEFAULT 0,
    currency character varying(3) DEFAULT 'IDR'::character varying,
    stage integer DEFAULT 1,
    is_active boolean DEFAULT true,
    tenant_id character varying(100) DEFAULT 'dana'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    outstanding_amount numeric(20,2) DEFAULT 0,
    original_amount numeric(20,2),
    interest_rate numeric(8,4),
    origination_date date,
    maturity_date date,
    reporting_date date DEFAULT CURRENT_DATE,
    days_past_due integer DEFAULT 0,
    banking_type character varying(20) DEFAULT 'conventional'::character varying,
    syariah_contract_type character varying(50),
    credit_rating character varying(20),
    collateral_type character varying(50),
    collateral_value numeric(20,2),
    is_restructured boolean DEFAULT false,
    impaired boolean DEFAULT false,
    created_by uuid,
    updated_by uuid,
    legacy_id integer,
    CONSTRAINT portfolio_accounts_stage_check CHECK ((stage = ANY (ARRAY[1, 2, 3])))
);


ALTER TABLE core.portfolio_accounts OWNER TO postgres;

--
-- Name: restricted_databases; Type: VIEW; Schema: core; Owner: postgres
--

CREATE VIEW core.restricted_databases AS
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


ALTER VIEW core.restricted_databases OWNER TO postgres;

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
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tenant_id uuid DEFAULT 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'::uuid
);


ALTER TABLE core.role_menu_access OWNER TO postgres;

--
-- Name: TABLE role_menu_access; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.role_menu_access IS 'Role-based access control for menu items';


--
-- Name: roles; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_name character varying(100) NOT NULL,
    role_code character varying(50) NOT NULL,
    description text,
    permissions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    is_system_role boolean DEFAULT false,
    tenant_id character varying(100) DEFAULT 'dana'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    level integer DEFAULT 1 NOT NULL,
    supports_conventional boolean DEFAULT true,
    supports_syariah boolean DEFAULT false
);


ALTER TABLE core.roles OWNER TO postgres;

--
-- Name: tenant_info; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.tenant_info (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_name character varying(100) NOT NULL,
    tenant_slug character varying(50) NOT NULL,
    banking_type character varying(20) NOT NULL,
    database_name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE core.tenant_info OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    valid_from timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true,
    is_temporary boolean DEFAULT false,
    tenant_id character varying(100) DEFAULT 'dana'::character varying
);


ALTER TABLE core.user_roles OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token character varying(255) NOT NULL,
    refresh_token character varying(255),
    device_info jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    mfa_verified boolean DEFAULT false,
    login_method character varying(50),
    logout_reason character varying(50),
    session_data jsonb
);


ALTER TABLE core.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: core; Owner: postgres
--

CREATE TABLE core.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(200) NOT NULL,
    department character varying(100),
    "position" character varying(100),
    banking_access character varying(20) DEFAULT 'CONVENTIONAL'::character varying,
    syariah_certified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    mfa_enabled boolean DEFAULT false,
    force_password_change boolean DEFAULT false,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    employee_id character varying(50),
    login_count integer DEFAULT 0,
    failed_login_attempts integer DEFAULT 0,
    tenant_id character varying(100) DEFAULT 'dana'::character varying,
    phone character varying(50),
    bank_id character varying(50),
    syariah_certification boolean DEFAULT false,
    syariah_certification_date date,
    mfa_secret character varying(255),
    backup_codes text[],
    is_verified boolean DEFAULT false,
    email_verified_at timestamp without time zone,
    password_changed_at timestamp without time zone
);


ALTER TABLE core.users OWNER TO postgres;

--
-- Name: definitions; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_code character varying(50) NOT NULL,
    workflow_name character varying(200) NOT NULL,
    description text,
    workflow_type character varying(50) NOT NULL,
    category character varying(50),
    is_active boolean DEFAULT true,
    requires_evidence boolean DEFAULT false,
    auto_approve_threshold numeric(5,2),
    timeout_hours integer DEFAULT 72,
    initiator_roles text[] DEFAULT '{}'::text[],
    approver_roles text[] DEFAULT '{}'::text[],
    viewer_roles text[] DEFAULT '{}'::text[],
    version character varying(20) DEFAULT '1.0'::character varying,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE workflow.definitions OWNER TO postgres;

--
-- Name: instances; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.instances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    definition_id uuid,
    instance_name character varying(200),
    initiator_id uuid,
    business_reference character varying(100),
    business_reference_type character varying(50),
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'NORMAL'::character varying,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    final_decision character varying(50),
    final_comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE workflow.instances OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: workflow; Owner: postgres
--

CREATE TABLE workflow.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    instance_id uuid,
    definition_id uuid,
    step_name character varying(200),
    step_number integer NOT NULL,
    step_type character varying(50) NOT NULL,
    assigned_to uuid,
    assigned_to_role character varying(50),
    status character varying(50) DEFAULT 'PENDING'::character varying,
    decision character varying(50),
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    due_date timestamp without time zone,
    comments text,
    evidence_files text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE workflow.tasks OWNER TO postgres;

--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: data_change_history data_change_history_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.data_change_history
    ADD CONSTRAINT data_change_history_pkey PRIMARY KEY (id);


--
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_setting_key_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.app_settings
    ADD CONSTRAINT app_settings_setting_key_key UNIQUE (setting_key);


--
-- Name: banking_products banking_products_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.banking_products
    ADD CONSTRAINT banking_products_pkey PRIMARY KEY (id);


--
-- Name: banking_products banking_products_product_code_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.banking_products
    ADD CONSTRAINT banking_products_product_code_key UNIQUE (product_code);


--
-- Name: customers customers_customer_code_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.customers
    ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


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
-- Name: menu_configurations menu_configurations_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_configurations
    ADD CONSTRAINT menu_configurations_pkey PRIMARY KEY (id);


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
-- Name: portfolio_accounts portfolio_accounts_account_number_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.portfolio_accounts
    ADD CONSTRAINT portfolio_accounts_account_number_key UNIQUE (account_number);


--
-- Name: portfolio_accounts portfolio_accounts_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.portfolio_accounts
    ADD CONSTRAINT portfolio_accounts_pkey PRIMARY KEY (id);


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
-- Name: tenant_info tenant_info_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.tenant_info
    ADD CONSTRAINT tenant_info_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_id_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_refresh_token_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_sessions
    ADD CONSTRAINT user_sessions_refresh_token_key UNIQUE (refresh_token);


--
-- Name: user_sessions user_sessions_session_token_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_sessions
    ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: definitions definitions_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.definitions
    ADD CONSTRAINT definitions_pkey PRIMARY KEY (id);


--
-- Name: definitions definitions_workflow_code_key; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.definitions
    ADD CONSTRAINT definitions_workflow_code_key UNIQUE (workflow_code);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_endpoint; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_activity_endpoint ON audit.user_activity_logs USING btree (endpoint, created_at);


--
-- Name: idx_activity_performance; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_activity_performance ON audit.user_activity_logs USING btree (activity_type, response_time_ms);


--
-- Name: idx_activity_type; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_activity_type ON audit.user_activity_logs USING btree (activity_type);


--
-- Name: idx_activity_user_time; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_activity_user_time ON audit.user_activity_logs USING btree (user_id, created_at DESC);


--
-- Name: idx_change_table_record; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_change_table_record ON audit.data_change_history USING btree (table_name, record_id, changed_at DESC);


--
-- Name: idx_change_type; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_change_type ON audit.data_change_history USING btree (change_type, changed_at DESC);


--
-- Name: idx_change_user_time; Type: INDEX; Schema: audit; Owner: postgres
--

CREATE INDEX idx_change_user_time ON audit.data_change_history USING btree (changed_by, changed_at DESC);


--
-- Name: idx_app_settings_category; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_app_settings_category ON core.app_settings USING btree (category);


--
-- Name: idx_app_settings_key; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_app_settings_key ON core.app_settings USING btree (setting_key);


--
-- Name: idx_app_settings_type; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_app_settings_type ON core.app_settings USING btree (setting_type);


--
-- Name: idx_dana_users_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_active ON core.users USING btree (is_active);


--
-- Name: idx_dana_users_email; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_email ON core.users USING btree (email);


--
-- Name: idx_dana_users_employee_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_employee_id ON core.users USING btree (employee_id);


--
-- Name: idx_dana_users_failed_attempts; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_failed_attempts ON core.users USING btree (failed_login_attempts);


--
-- Name: idx_dana_users_login_count; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_login_count ON core.users USING btree (login_count);


--
-- Name: idx_dana_users_tenant_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_tenant_id ON core.users USING btree (tenant_id);


--
-- Name: idx_dana_users_username; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_dana_users_username ON core.users USING btree (username);


--
-- Name: idx_menu_items_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_active ON core.menu_items USING btree (is_active);


--
-- Name: idx_menu_items_is_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_is_active ON core.menu_items USING btree (is_active);


--
-- Name: idx_menu_items_menu_key; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_menu_key ON core.menu_items USING btree (menu_key);


--
-- Name: idx_menu_items_parent_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_parent_id ON core.menu_items USING btree (parent_id);


--
-- Name: idx_menu_items_sort_order; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_sort_order ON core.menu_items USING btree (sort_order);


--
-- Name: idx_menu_items_tenant_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_menu_items_tenant_id ON core.menu_items USING btree (tenant_id);


--
-- Name: idx_products_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_products_active ON core.banking_products USING btree (is_active, product_code);


--
-- Name: idx_products_contract_type; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_products_contract_type ON core.banking_products USING btree (syariah_contract_type) WHERE (syariah_contract_type IS NOT NULL);


--
-- Name: idx_products_type_category; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_products_type_category ON core.banking_products USING btree (banking_type, product_category);


--
-- Name: idx_role_menu_access_can_view; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_can_view ON core.role_menu_access USING btree (can_view);


--
-- Name: idx_role_menu_access_menu_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_menu_id ON core.role_menu_access USING btree (menu_item_id);


--
-- Name: idx_role_menu_access_menu_item_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_menu_item_id ON core.role_menu_access USING btree (menu_item_id);


--
-- Name: idx_role_menu_access_role_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_role_id ON core.role_menu_access USING btree (role_id);


--
-- Name: idx_role_menu_access_tenant_id; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_role_menu_access_tenant_id ON core.role_menu_access USING btree (tenant_id);


--
-- Name: idx_sessions_expires; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_sessions_expires ON core.user_sessions USING btree (expires_at);


--
-- Name: idx_sessions_refresh; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_sessions_refresh ON core.user_sessions USING btree (refresh_token);


--
-- Name: idx_sessions_token; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_sessions_token ON core.user_sessions USING btree (session_token);


--
-- Name: idx_sessions_user_active; Type: INDEX; Schema: core; Owner: postgres
--

CREATE INDEX idx_sessions_user_active ON core.user_sessions USING btree (user_id, is_active);


--
-- Name: idx_workflow_def_type; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_def_type ON workflow.definitions USING btree (workflow_type, is_active);


--
-- Name: idx_workflow_instance_initiator; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_instance_initiator ON workflow.instances USING btree (initiator_id, submitted_at DESC);


--
-- Name: idx_workflow_instance_status; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_instance_status ON workflow.instances USING btree (status, submitted_at DESC);


--
-- Name: idx_workflow_task_assignee; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_task_assignee ON workflow.tasks USING btree (assigned_to, status);


--
-- Name: idx_workflow_task_instance; Type: INDEX; Schema: workflow; Owner: postgres
--

CREATE INDEX idx_workflow_task_instance ON workflow.tasks USING btree (instance_id, step_number);


--
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON core.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: role_menu_access update_role_menu_access_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER update_role_menu_access_updated_at BEFORE UPDATE ON core.role_menu_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: data_change_history data_change_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.data_change_history
    ADD CONSTRAINT data_change_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES core.users(id);


--
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: audit; Owner: postgres
--

ALTER TABLE ONLY audit.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(id);


--
-- Name: app_settings app_settings_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.app_settings
    ADD CONSTRAINT app_settings_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id);


--
-- Name: app_settings app_settings_last_updated_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.app_settings
    ADD CONSTRAINT app_settings_last_updated_by_fkey FOREIGN KEY (last_updated_by) REFERENCES core.users(id);


--
-- Name: banking_products banking_products_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.banking_products
    ADD CONSTRAINT banking_products_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id);


--
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id);


--
-- Name: customers customers_updated_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.customers
    ADD CONSTRAINT customers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES core.users(id);


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES core.menu_items(id) ON DELETE CASCADE;


--
-- Name: portfolio_accounts portfolio_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.portfolio_accounts
    ADD CONSTRAINT portfolio_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id);


--
-- Name: portfolio_accounts portfolio_accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.portfolio_accounts
    ADD CONSTRAINT portfolio_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES core.customers(id);


--
-- Name: portfolio_accounts portfolio_accounts_updated_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.portfolio_accounts
    ADD CONSTRAINT portfolio_accounts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES core.users(id);


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
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE;


--
-- Name: definitions definitions_created_by_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.definitions
    ADD CONSTRAINT definitions_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id);


--
-- Name: instances instances_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.instances
    ADD CONSTRAINT instances_definition_id_fkey FOREIGN KEY (definition_id) REFERENCES workflow.definitions(id);


--
-- Name: instances instances_initiator_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.instances
    ADD CONSTRAINT instances_initiator_id_fkey FOREIGN KEY (initiator_id) REFERENCES core.users(id);


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES core.users(id);


--
-- Name: tasks tasks_definition_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_definition_id_fkey FOREIGN KEY (definition_id) REFERENCES workflow.definitions(id);


--
-- Name: tasks tasks_instance_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: postgres
--

ALTER TABLE ONLY workflow.tasks
    ADD CONSTRAINT tasks_instance_id_fkey FOREIGN KEY (instance_id) REFERENCES workflow.instances(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict WH4jXaJlbIDVaU7O89yeYHJqcrjhSdcIOlcu16JwqyKDCHptvcDyHdMTtN9S3A0

