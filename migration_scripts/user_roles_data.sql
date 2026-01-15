--
-- PostgreSQL database dump
--

\restrict YMQPNoMIrqiymjjMCGydibTVOZQXrA6tvWvWmGyKU2hFqd2Rxg9TInxHcXPhdym

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
-- Data for Name: user_roles; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.user_roles (id, user_id, role_id, assigned_by, assigned_at, is_active, valid_from, valid_until, banking_type_restriction, is_temporary, temporary_reason, tenant_id, created_at, updated_at) VALUES ('e8594492-5ea2-479d-958e-9db02bd5bd57', '550e8400-1111-2222-3333-444455555201', '550e8400-1111-2222-3333-444455555001', '550e8400-1111-2222-3333-444455555201', '2025-12-29 17:55:43.543439', true, NULL, NULL, NULL, false, NULL, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:55:43.543439', '2025-12-29 17:55:43.543439');
INSERT INTO core.user_roles (id, user_id, role_id, assigned_by, assigned_at, is_active, valid_from, valid_until, banking_type_restriction, is_temporary, temporary_reason, tenant_id, created_at, updated_at) VALUES ('d35f3ffc-aa17-4090-b87c-40721cfa6a23', '550e8400-1111-2222-3333-444455555202', '550e8400-1111-2222-3333-444455555004', '550e8400-1111-2222-3333-444455555202', '2025-12-29 17:55:43.543439', true, NULL, NULL, NULL, false, NULL, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:55:43.543439', '2025-12-29 17:55:43.543439');
INSERT INTO core.user_roles (id, user_id, role_id, assigned_by, assigned_at, is_active, valid_from, valid_until, banking_type_restriction, is_temporary, temporary_reason, tenant_id, created_at, updated_at) VALUES ('7457a5d9-6aea-40a4-bdc7-bd63f3bfa46c', '550e8400-1111-2222-3333-444455555203', '550e8400-1111-2222-3333-444455555003', '550e8400-1111-2222-3333-444455555203', '2025-12-29 17:55:43.543439', true, NULL, NULL, NULL, false, NULL, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:55:43.543439', '2025-12-29 17:55:43.543439');
INSERT INTO core.user_roles (id, user_id, role_id, assigned_by, assigned_at, is_active, valid_from, valid_until, banking_type_restriction, is_temporary, temporary_reason, tenant_id, created_at, updated_at) VALUES ('c88b106d-c8a2-40a0-8e8a-a4e568e27902', '550e8400-1111-2222-3333-444455555204', '550e8400-1111-2222-3333-444455555005', '550e8400-1111-2222-3333-444455555204', '2025-12-29 17:55:43.543439', true, NULL, NULL, NULL, false, NULL, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:55:43.543439', '2025-12-29 17:55:43.543439');
INSERT INTO core.user_roles (id, user_id, role_id, assigned_by, assigned_at, is_active, valid_from, valid_until, banking_type_restriction, is_temporary, temporary_reason, tenant_id, created_at, updated_at) VALUES ('0c981602-1ffe-4264-9a59-243e7717cc33', '64a841ba-ef39-4644-a119-fa262a210e4f', 'dd5af9e2-8ac5-41bb-b1c1-0c0c259e18ec', '64a841ba-ef39-4644-a119-fa262a210e4f', '2026-01-09 11:51:37.394', true, NULL, NULL, NULL, false, NULL, '0f28568a-ffe0-4960-ba18-d50dead0189e', '2026-01-09 11:51:37.390025', '2026-01-09 11:51:37.390025');


--
-- PostgreSQL database dump complete
--

\unrestrict YMQPNoMIrqiymjjMCGydibTVOZQXrA6tvWvWmGyKU2hFqd2Rxg9TInxHcXPhdym

