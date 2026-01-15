--
-- PostgreSQL database dump
--

\restrict 2FuWuaGXH3IHCkSZU4vJ4Frx8Ej3jG6ByOXkSHZqMcgIg2HRmr8OqpVMlPOvmtD

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
-- Data for Name: permissions; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('a0186ff9-7479-4ed7-938c-0bc6cd0f6ea2', 'VIEW_DASHBOARD', 'View Dashboard', NULL, 'dashboard', 'view', 'analytics', 'Dashboard', true, '2026-01-09 18:53:04.850196');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('50a3b89a-986c-4f19-a8b8-5b7a1048290e', 'VIEW_ANALYTICS', 'View Analytics', NULL, 'analytics', 'view', 'analytics', 'Dashboard', true, '2026-01-09 18:53:04.867297');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('84dbfabe-6457-4646-a28f-cb278cebb192', 'MANAGE_USERS', 'Manage Users', NULL, 'users', 'manage', 'admin', 'Administration', true, '2026-01-09 18:53:04.881499');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('983ac170-835c-4ede-a33c-fc594fbf4d69', 'VIEW_USERS', 'View Users', NULL, 'users', 'view', 'admin', 'Administration', true, '2026-01-09 18:53:04.889142');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('3aceb3cc-b925-4db1-a51f-aac13611c94c', 'MANAGE_ROLES', 'Manage Roles', NULL, 'roles', 'manage', 'admin', 'Administration', true, '2026-01-09 18:53:04.898612');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('71a1e46b-fdf9-4f60-9d75-0ac424991aae', 'VIEW_LOANS', 'View Loans', NULL, 'loans', 'view', 'banking', 'Banking', true, '2026-01-09 18:53:04.911147');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('28e42094-0df9-4795-8fcc-b6465e5e9900', 'MANAGE_LOANS', 'Manage Loans', NULL, 'loans', 'manage', 'banking', 'Banking', true, '2026-01-09 18:53:04.926054');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('ca783902-d80e-4fca-87f5-2e4f83f6dfcd', 'VIEW_IFRS9_REPORTS', 'View IFRS9 Reports', NULL, 'reports', 'view', 'ifrs9', 'Reporting', true, '2026-01-09 18:53:04.944929');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('de45bd2c-7013-44c2-857e-23d1d23611c8', 'MANAGE_IFRS9_CONFIG', 'Manage IFRS9 Config', NULL, 'configuration', 'manage', 'ifrs9', 'Configuration', true, '2026-01-09 18:53:04.957359');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('fbc3c314-07fb-419b-be15-5995576cd765', 'VIEW_COLLECTIVE_IMPAIRMENT', 'View Collective Impairment', NULL, 'impairment', 'view_collective', 'ifrs9', 'Impairment', true, '2026-01-09 18:53:04.966146');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('f0d736b6-7823-4a2a-8ed1-e9ae37368161', 'VIEW_INDIVIDUAL_IMPAIRMENT', 'View Individual Impairment', NULL, 'impairment', 'view_individual', 'ifrs9', 'Impairment', true, '2026-01-09 18:53:04.977425');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('4033b847-3c5f-44b4-a011-d140cc1d436d', 'VIEW_IFRS9_PROCESSING', 'View IFRS9 Processing', NULL, 'processing', 'view', 'ifrs9', 'Processing', true, '2026-01-09 18:53:04.985718');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('be5c6295-b868-42b0-8d95-da217b9ddc7c', 'VIEW_R_ANALYTICS', 'View R Analytics', NULL, 'analytics', 'view_r', 'ifrs9', 'Analytics', true, '2026-01-09 18:53:04.999228');
INSERT INTO core.permissions (id, code, name, description, resource, action, module, category, is_active, created_at) VALUES ('af9c501e-c197-4501-87ef-6be59026c3d9', 'APPROVE_REQUESTS', 'Approve Requests', NULL, 'approvals', 'approve', 'workflow', 'Workflow', true, '2026-01-09 18:53:05.012366');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555003', NULL, 'IAF_BANK_CRO', 'IAF Chief Risk Officer', 'Risk management and oversight', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555004', NULL, 'IAF_IFRS_MANAGER', 'IAF IFRS 9 Manager', 'IFRS 9 calculations and compliance', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555006', NULL, 'IAF_PORTFOLIO_MANAGER', 'IAF Portfolio Manager', 'Portfolio management and monitoring', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555007', NULL, 'IAF_DATA_ADMIN', 'IAF Data Administrator', 'Data management and validation', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555008', NULL, 'IAF_REPORT_ANALYST', 'IAF Report Analyst', 'Report generation and analysis', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555009', NULL, 'IAF_AUDITOR', 'IAF Internal Auditor', 'Internal audit and compliance', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555010', NULL, 'IAF_VIEWER', 'IAF Viewer', 'Read-only access to IAF features', '{}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('dd5af9e2-8ac5-41bb-b1c1-0c0c259e18ec', NULL, 'PLATFORM_SUPER_ADMIN', 'PLATFORM_SUPER_ADMIN', 'Super Administrator for Platform Management', '[]', true, NULL, NULL, 1, true, '0f28568a-ffe0-4960-ba18-d50dead0189e', '2026-01-09 11:51:10.243', '2026-01-09 11:51:10.243', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555001', NULL, 'IAF_TENANT_SUPERADMIN', 'IAF Tenant Super Administrator', 'Full access to all IAF features', '{"VIEW_LOANS": true, "VIEW_USERS": true, "MANAGE_LOANS": true, "MANAGE_ROLES": true, "MANAGE_USERS": true, "VIEW_ANALYTICS": true, "VIEW_DASHBOARD": true, "APPROVE_REQUESTS": true, "VIEW_R_ANALYTICS": true, "VIEW_IFRS9_REPORTS": true, "MANAGE_IFRS9_CONFIG": true, "VIEW_IFRS9_PROCESSING": true, "VIEW_COLLECTIVE_IMPAIRMENT": true, "VIEW_INDIVIDUAL_IMPAIRMENT": true}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555002', NULL, 'IAF_TENANT_ADMIN', 'IAF Tenant Administrator', 'Administrative access to IAF system', '{"VIEW_LOANS": true, "VIEW_USERS": true, "VIEW_ANALYTICS": true, "VIEW_DASHBOARD": true, "VIEW_R_ANALYTICS": true, "VIEW_IFRS9_REPORTS": true, "MANAGE_IFRS9_CONFIG": true, "VIEW_IFRS9_PROCESSING": true, "VIEW_COLLECTIVE_IMPAIRMENT": true, "VIEW_INDIVIDUAL_IMPAIRMENT": true}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);
INSERT INTO core.roles (id, legacy_id, role_code, role_name, description, permissions, is_active, banking_type_specific, compliance_level, hierarchy_level, is_system_role, tenant_id, created_at, updated_at, created_by, updated_by) VALUES ('550e8400-1111-2222-3333-444455555005', NULL, 'IAF_RISK_ANALYST', 'IAF Risk Analyst', 'Risk analysis and assessment', '{"VIEW_LOANS": true, "VIEW_ANALYTICS": true, "VIEW_DASHBOARD": true, "VIEW_R_ANALYTICS": true, "VIEW_IFRS9_REPORTS": true, "VIEW_COLLECTIVE_IMPAIRMENT": true, "VIEW_INDIVIDUAL_IMPAIRMENT": true}', true, NULL, NULL, 1, false, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', '2025-12-29 17:54:46.869451', '2025-12-29 17:54:46.869451', NULL, NULL);


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: core; Owner: postgres
--

INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('15129be4-6ae5-49e4-9393-8518df04113e', '550e8400-1111-2222-3333-444455555001', 'a0186ff9-7479-4ed7-938c-0bc6cd0f6ea2', NULL, '2026-01-09 18:53:05.086');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('93c58b4d-96be-45d2-b40d-443a9e84dcf7', '550e8400-1111-2222-3333-444455555001', '50a3b89a-986c-4f19-a8b8-5b7a1048290e', NULL, '2026-01-09 18:53:05.11');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('e5f285c4-e874-4b08-948d-7ee3851951b2', '550e8400-1111-2222-3333-444455555001', '84dbfabe-6457-4646-a28f-cb278cebb192', NULL, '2026-01-09 18:53:05.117');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('fde11761-9882-4777-8f64-3232272558e1', '550e8400-1111-2222-3333-444455555001', '983ac170-835c-4ede-a33c-fc594fbf4d69', NULL, '2026-01-09 18:53:05.124');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('03359532-841d-453e-a0ff-d1f0f6822542', '550e8400-1111-2222-3333-444455555001', '3aceb3cc-b925-4db1-a51f-aac13611c94c', NULL, '2026-01-09 18:53:05.133');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('b5ed79fa-ced5-4df6-bdaf-7195ff0e7316', '550e8400-1111-2222-3333-444455555001', '71a1e46b-fdf9-4f60-9d75-0ac424991aae', NULL, '2026-01-09 18:53:05.149');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('d0f8cb40-e1d9-4e36-abf2-52d020462860', '550e8400-1111-2222-3333-444455555001', '28e42094-0df9-4795-8fcc-b6465e5e9900', NULL, '2026-01-09 18:53:05.16');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('e277cc5e-97cd-48ff-b9f9-cc015772eb41', '550e8400-1111-2222-3333-444455555001', 'ca783902-d80e-4fca-87f5-2e4f83f6dfcd', NULL, '2026-01-09 18:53:05.167');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('ca3186ce-b41a-4ae2-8746-92e0d5dc6dce', '550e8400-1111-2222-3333-444455555001', 'de45bd2c-7013-44c2-857e-23d1d23611c8', NULL, '2026-01-09 18:53:05.18');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('75c6a386-f204-4aba-82c4-96476cea1ad9', '550e8400-1111-2222-3333-444455555001', 'fbc3c314-07fb-419b-be15-5995576cd765', NULL, '2026-01-09 18:53:05.197');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('672d7bc3-b596-42ed-b34e-f971cb41354c', '550e8400-1111-2222-3333-444455555001', 'f0d736b6-7823-4a2a-8ed1-e9ae37368161', NULL, '2026-01-09 18:53:05.203');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('7974d5e1-187e-409c-a4cd-c6927c4e643e', '550e8400-1111-2222-3333-444455555001', '4033b847-3c5f-44b4-a011-d140cc1d436d', NULL, '2026-01-09 18:53:05.216');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('0d4bf915-27e3-454d-8d90-5a0745b32fbd', '550e8400-1111-2222-3333-444455555001', 'be5c6295-b868-42b0-8d95-da217b9ddc7c', NULL, '2026-01-09 18:53:05.253');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('9f39a309-76a2-4471-85b8-d254490f8a28', '550e8400-1111-2222-3333-444455555001', 'af9c501e-c197-4501-87ef-6be59026c3d9', NULL, '2026-01-09 18:53:05.259');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('5b1a6f65-7172-4a53-8f20-85873819f738', '550e8400-1111-2222-3333-444455555002', 'a0186ff9-7479-4ed7-938c-0bc6cd0f6ea2', NULL, '2026-01-09 18:53:05.268');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('d89e98cf-f9f9-4c80-904e-590c1ccc35fe', '550e8400-1111-2222-3333-444455555002', '50a3b89a-986c-4f19-a8b8-5b7a1048290e', NULL, '2026-01-09 18:53:05.278');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('73850ea1-7250-4b66-be84-796d868bfccf', '550e8400-1111-2222-3333-444455555002', '71a1e46b-fdf9-4f60-9d75-0ac424991aae', NULL, '2026-01-09 18:53:05.298');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('a64a4b4b-9d21-4f91-b97e-5f6828f78283', '550e8400-1111-2222-3333-444455555002', '983ac170-835c-4ede-a33c-fc594fbf4d69', NULL, '2026-01-09 18:53:05.305');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('d76c9b08-9c98-44f9-9bf1-e94cd8740a3a', '550e8400-1111-2222-3333-444455555002', 'ca783902-d80e-4fca-87f5-2e4f83f6dfcd', NULL, '2026-01-09 18:53:05.317');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('acdeffa4-3134-4cf6-b91f-3e7d724cb8ba', '550e8400-1111-2222-3333-444455555002', 'de45bd2c-7013-44c2-857e-23d1d23611c8', NULL, '2026-01-09 18:53:05.323');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('df711716-2662-4ada-b078-71b1bd47ce30', '550e8400-1111-2222-3333-444455555002', 'fbc3c314-07fb-419b-be15-5995576cd765', NULL, '2026-01-09 18:53:05.331');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('396cfa82-c7cf-4fce-b10f-142ab0b777ba', '550e8400-1111-2222-3333-444455555002', 'f0d736b6-7823-4a2a-8ed1-e9ae37368161', NULL, '2026-01-09 18:53:05.338');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('dc39ca0b-7570-4998-84cb-d67298d33cde', '550e8400-1111-2222-3333-444455555002', '4033b847-3c5f-44b4-a011-d140cc1d436d', NULL, '2026-01-09 18:53:05.349');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('64e24d6c-d4ec-465d-8a76-3dc321071ea8', '550e8400-1111-2222-3333-444455555002', 'be5c6295-b868-42b0-8d95-da217b9ddc7c', NULL, '2026-01-09 18:53:05.357');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('c6b31e84-9f7d-48bd-b752-9cca63faa3c2', '550e8400-1111-2222-3333-444455555005', 'a0186ff9-7479-4ed7-938c-0bc6cd0f6ea2', NULL, '2026-01-09 18:53:05.373');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('8bb99feb-5ccd-4065-ae77-29be3410886a', '550e8400-1111-2222-3333-444455555005', '50a3b89a-986c-4f19-a8b8-5b7a1048290e', NULL, '2026-01-09 18:53:05.41');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('e047d29d-c475-4309-b9a3-fef3cbed5315', '550e8400-1111-2222-3333-444455555005', '71a1e46b-fdf9-4f60-9d75-0ac424991aae', NULL, '2026-01-09 18:53:05.423');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('4b8ff66c-384b-4224-8244-b84a194978fa', '550e8400-1111-2222-3333-444455555005', 'ca783902-d80e-4fca-87f5-2e4f83f6dfcd', NULL, '2026-01-09 18:53:05.469');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('06732207-722c-440a-a4b7-282f65398f5d', '550e8400-1111-2222-3333-444455555005', 'fbc3c314-07fb-419b-be15-5995576cd765', NULL, '2026-01-09 18:53:05.49');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('3e116c97-8af8-4280-91b7-9efe1b74877b', '550e8400-1111-2222-3333-444455555005', 'f0d736b6-7823-4a2a-8ed1-e9ae37368161', NULL, '2026-01-09 18:53:05.499');
INSERT INTO core.role_permissions (id, role_id, permission_id, granted_by, granted_at) VALUES ('23fb39f3-b1c9-47ae-9659-8c6d2af4e422', '550e8400-1111-2222-3333-444455555005', 'be5c6295-b868-42b0-8d95-da217b9ddc7c', NULL, '2026-01-09 18:53:05.51');


--
-- PostgreSQL database dump complete
--

\unrestrict 2FuWuaGXH3IHCkSZU4vJ4Frx8Ej3jG6ByOXkSHZqMcgIg2HRmr8OqpVMlPOvmtD

