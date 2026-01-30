--
-- PostgreSQL database dump
--

\restrict 9FxYm0FlN9nyykAkNncU4pbTrHn53vJDSyemcwwFhKSun8YpiblPFi0sDO4lNpV

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

--
-- Data for Name: tenants; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.tenants (id, code, name, slug, description, type, banking_mode, settings, is_active, created_at, updated_at) VALUES ('a24af6d2-3032-4d53-ae82-9cfa84f97a20', 'IAF', 'Indonesia Airawata Finance', 'iaf', 'Implementation Tenant for IAF', 'banking', 'dual', '{}', true, '2025-12-29 17:54:46.736757', '2025-12-29 17:54:46.736757');
INSERT INTO core.tenants (id, code, name, slug, description, type, banking_mode, settings, is_active, created_at, updated_at) VALUES ('0f28568a-ffe0-4960-ba18-d50dead0189e', 'system', 'IAF System', 'system', 'Platform Administration Tenant', 'system', 'conventional', '{}', true, '2026-01-09 10:46:24.475904', '2026-01-09 10:46:24.475904');


--
-- PostgreSQL database dump complete
--

\unrestrict 9FxYm0FlN9nyykAkNncU4pbTrHn53vJDSyemcwwFhKSun8YpiblPFi0sDO4lNpV

