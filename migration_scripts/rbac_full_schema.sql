--
-- PostgreSQL database dump
--

\restrict NJjOEIQKS2ZoQdtp2uYS0s9u7V5tbjY6Gq4HKPKDksk9hb8QDWroabGo7U8Ho8l

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- PostgreSQL database dump complete
--

\unrestrict NJjOEIQKS2ZoQdtp2uYS0s9u7V5tbjY6Gq4HKPKDksk9hb8QDWroabGo7U8Ho8l

