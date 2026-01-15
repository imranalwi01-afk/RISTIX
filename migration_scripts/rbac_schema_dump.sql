--
-- PostgreSQL database dump
--

\restrict gaNDeSkaXeKWzAsRwxmhvE0Bvji2moNMvC4kT0Wvs3AfCUrsTyQE4c0uhiostrX

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
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


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
-- PostgreSQL database dump complete
--

\unrestrict gaNDeSkaXeKWzAsRwxmhvE0Bvji2moNMvC4kT0Wvs3AfCUrsTyQE4c0uhiostrX

