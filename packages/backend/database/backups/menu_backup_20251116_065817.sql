--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Ubuntu 14.18-1.pgdg22.04+1)
-- Dumped by pg_dump version 17.5 (Ubuntu 17.5-1.pgdg22.04+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
    CONSTRAINT menu_items_menu_type_check CHECK (((menu_type)::text = ANY ((ARRAY['item'::character varying, 'group'::character varying, 'divider'::character varying])::text[])))
);


ALTER TABLE core.menu_items OWNER TO postgres;

--
-- Name: TABLE menu_items; Type: COMMENT; Schema: core; Owner: postgres
--

COMMENT ON TABLE core.menu_items IS 'Database-driven menu items for IAF IFRS9 platform';


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
-- Data for Name: menu_items; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.menu_items (id, parent_id, menu_key, title, description, icon, url, menu_type, sort_order, is_active, banking_types, created_by, created_at, updated_at, tenant_id) FROM stdin;
1de5a328-6606-4c15-acef-a7916ad43206	\N	landing	Landing Page	IAF main landing page	home	/	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d780bd8e-c2a3-4162-a110-480550889635	\N	auth	Authentication	User authentication and login	login	/auth	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
6dc7bef6-2046-4f04-b9a4-6727d36fd452	\N	banking	Banking Platform	Main banking platform dashboard	account_balance	/banking	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
758651b8-6994-47aa-97ec-321ab7e68e65	\N	platform	Platform Administration	Platform admin interface	admin_panel_settings	/platform	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
47fc13a2-3d72-427e-bdb3-22849749a733	\N	consultant	Consultant Portal	Consulting dashboard and tools	engineering	/consultant	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
bd5f362f-4b01-43e7-a6cc-1341033d3786	\N	regulator	Regulator Portal	Regulatory oversight portal	gavel	/regulator	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
51948eb0-5d76-409c-8131-ef531cb61b44	\N	admin	System Administration	System admin tools	settings	/admin	item	7	t	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ceb80ebe-eca2-4c4a-b5e2-9fd583953d63	\N	test	Testing	Testing environment	science	/test	item	8	f	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
05f6749a-7472-4859-afd2-0d409043ec35	\N	simple	Simple Mode	Simplified interface	apps	/simple	item	9	f	{conventional,syariah}	\N	2025-11-16 02:17:04.968122+07	2025-11-16 02:17:04.968122+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
534b4f13-d095-4983-9e5a-6367856bf5fb	6dc7bef6-2046-4f04-b9a4-6727d36fd452	banking_dashboard	Dashboard	Main KPI overview and real-time portfolio status	dashboard	/banking/dashboard	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ff6a8943-0903-49be-9262-269dda1cbab3	6dc7bef6-2046-4f04-b9a4-6727d36fd452	general_setup	General Setup	Application and business configuration	settings	/banking/setup	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
44222271-131e-44c1-b16a-d95a2d52e3f8	ff6a8943-0903-49be-9262-269dda1cbab3	application_setting	Application Setting	System configuration and security settings	app_settings	/banking/setup/application	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
58dfdbfe-3866-4db4-a7e8-7c25a039970e	ff6a8943-0903-49be-9262-269dda1cbab3	business_setting	Business Setting	Business rules and banking parameters	business	/banking/setup/business	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	6dc7bef6-2046-4f04-b9a4-6727d36fd452	parameter_setup	Parameter Setup	Banking parameter configuration	tune	/banking/parameters	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
707edb00-42ae-47ae-ba5a-855b87b2fe72	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	product_parameter	Product Parameter	Product configuration and risk parameters	inventory_2	/banking/parameters/product	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
15472db0-64a2-4299-8694-3fc3b0b26259	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	product_parameter_admin	Product Parameter Admin	Advanced product management and validation	admin_panel_settings	/banking/parameters/product/admin	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
81491fdb-b324-43f2-be6b-f4b3b83a2e59	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	journal_parameter	Journal Parameter	GL configuration and accounting rules	account_balance_wallet	/banking/parameters/journal	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
78adc16d-c6d1-415e-81fb-bfe1527d8936	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	journal_parameter_admin	Journal Parameter Admin	Advanced journal management and audit config	security	/banking/parameters/journal/admin	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
20c03a9a-7d24-4863-8573-0369701e387e	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	risk_parameter	Risk Parameter	Risk models and assessment rules	gpp_good	/banking/parameters/risk	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
89531071-2a0f-41ec-9017-bff8a245c7a9	6dc7bef6-2046-4f04-b9a4-6727d36fd452	portfolio_management	Portfolio Management	Portfolio and customer management	account_balance	/banking/portfolio	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
98c377f4-7983-4428-b349-e16b507e8b2b	89531071-2a0f-41ec-9017-bff8a245c7a9	portfolio_accounts	Portfolio Accounts	Account overview and classification	account_balance	/banking/portfolio/accounts	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
bd57bfd9-26e1-4bc9-9054-60e8ace3da52	89531071-2a0f-41ec-9017-bff8a245c7a9	customer_management	Customer Management	Customer database and relationship management	people	/banking/portfolio/customers	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d852318e-f7f4-4504-821b-cb3da9ddb52b	89531071-2a0f-41ec-9017-bff8a245c7a9	banking_products	Banking Products	Product catalog and configuration	category	/banking/portfolio/products	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
392203ab-e9a2-4eff-9638-018e824e03a2	89531071-2a0f-41ec-9017-bff8a245c7a9	portfolio_overview	Portfolio Overview	Real-time dashboard and performance metrics	insights	/banking/portfolio/overview	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
621eb466-9706-4678-b3ed-bad7196952d0	89531071-2a0f-41ec-9017-bff8a245c7a9	portfolio_monitoring	Portfolio Monitoring	Advanced monitoring tools and risk tracking	monitoring	/banking/portfolio/monitoring	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
974cfbea-6e52-47b5-8be1-5490ce4b25de	6dc7bef6-2046-4f04-b9a4-6727d36fd452	collective_impairment	Collective Impairment	Collective impairment calculation and configuration	calculate	/banking/collective	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
6e2d828c-d8c5-4818-a6e7-c9e2f230285b	974cfbea-6e52-47b5-8be1-5490ce4b25de	segmentation	Segmentation	Customer and portfolio segmentation analysis	segment	/banking/collective/segmentation	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2799feaf-cf44-46b0-9a63-da8ec4b99a57	974cfbea-6e52-47b5-8be1-5490ce4b25de	segmentation_admin	Segmentation Admin	Advanced segmentation tools and automation	tune	/banking/collective/segmentation/admin	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
96d05fec-1ac3-4d63-aed9-f5224d64d576	974cfbea-6e52-47b5-8be1-5490ce4b25de	rule_base	Rule Base	Impairment rules and business configuration	rule	/banking/collective/rule-base	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
36e8d3b7-4b37-41b3-971d-4a8469c6d310	974cfbea-6e52-47b5-8be1-5490ce4b25de	bucket_parameter	Bucket Parameter	Bucket configuration and risk setup	bucket	/banking/collective/bucket-parameter	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
08073829-9a9e-4abd-a7ac-17a8d44a2744	974cfbea-6e52-47b5-8be1-5490ce4b25de	bucket_management	Bucket Management	Bucket overview and performance tracking	analytics	/banking/collective/bucket	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d821b92f-22aa-4cce-8a9c-44fc8dc05632	974cfbea-6e52-47b5-8be1-5490ce4b25de	collective_parameter	Collective Parameter	Collective configuration and group settings	groups	/banking/collective/collective-parameter	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2b7ec21b-ec2c-4427-9036-15050de1310e	974cfbea-6e52-47b5-8be1-5490ce4b25de	pd_setup	PD Setup	Probability of Default configuration	trending_up	/banking/collective/pd-setup	item	7	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5bf34db8-1b1b-4f24-bdc6-607a4fe62a8c	974cfbea-6e52-47b5-8be1-5490ce4b25de	pd_setup_management	PD Setup Management	Advanced PD management and validation	model_training	/banking/collective/pd-setup/management	item	8	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
6e2517d8-3df1-464d-88c7-5266d694ec15	974cfbea-6e52-47b5-8be1-5490ce4b25de	lgd_setup	LGD Setup	Loss Given Default configuration	show_chart	/banking/collective/lgd-setup	item	9	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
aea18cd9-89e8-4510-987b-db5761a9857a	974cfbea-6e52-47b5-8be1-5490ce4b25de	ead_setup	EAD Setup	Exposure at Default configuration	assessment	/banking/collective/ead-setup	item	10	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
445fc85b-a6b3-4eb2-9944-876a2a6a770f	974cfbea-6e52-47b5-8be1-5490ce4b25de	ecl_config	ECL Configuration	Expected Credit Loss setup and calculation rules	functions	/banking/collective/ecl-config	item	11	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
a337fc8c-de97-4db9-8138-5534171ac5cf	974cfbea-6e52-47b5-8be1-5490ce4b25de	fl_scalar	FL Scalar	Funding Level scalar configuration	calculate	/banking/collective/fl-scalar	item	12	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	6dc7bef6-2046-4f04-b9a4-6727d36fd452	individual_impairment	Individual Impairment	Individual impairment assessment and management	person	/banking/individual	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
cf734d8b-3a74-452c-9d80-dae70053fcfc	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	assessment_override	Assessment Override	Individual assessment tools and override management	assessment	/banking/individual/assessment	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
29669acf-31d1-4df1-a3f1-4365f7c431a2	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	override_trigger	Override Trigger	Trigger configuration and automated thresholds	notifications	/banking/individual/override-trigger	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2e18ff94-7713-4981-b6e5-59776b42f247	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	dcf_scenario	DCF Scenario	Discounted Cash Flow analysis and modeling	account_tree	/banking/individual/dcf	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c5adf834-b501-4eda-b213-09f3e8c63d44	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	ia_provision	IA Provision	Individual allowance configuration and reserve management	account_balance_wallet	/banking/individual/provision	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
428f3562-4986-4943-964f-15d79c7a399d	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	override_history	Override History	Change tracking and audit trail	history	/banking/individual/history	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
6e4cf1e2-f344-45d8-95d4-22774994eb1e	6dc7bef6-2046-4f04-b9a4-6727d36fd452	ifrs9_processing	IFRS 9 Processing	IFRS 9 calculation engine and processing	functions	/banking/ifrs9	item	7	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
73d72ea3-96d5-439c-abc7-ed004d39400f	6e4cf1e2-f344-45d8-95d4-22774994eb1e	impairment_module	Impairment Module	Impairment processing engine and calculations	warning	/banking/ifrs9/impairment-module	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ec71650f-1e20-4d1f-987c-7c97e82ca1bf	6e4cf1e2-f344-45d8-95d4-22774994eb1e	impairment_alternative	Impairment Alternative	Manual impairment processing and batch operations	calculate	/banking/ifrs9/impairment	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
54542f35-ab3b-481f-aec3-6eb98a7fdd9b	6e4cf1e2-f344-45d8-95d4-22774994eb1e	amortization_module	Amortization Module	Lease contract management and amortization calculations	date_range	/banking/ifrs9/amortization-module	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
614c73b7-7ff2-4ef9-a5f0-675399ed78dc	6e4cf1e2-f344-45d8-95d4-22774994eb1e	amortization_alternative	Amortization Alternative	Amortization processing and payment management	schedule	/banking/ifrs9/amortization	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5c7c6347-a041-4390-90fc-37d5bcf9ae93	6e4cf1e2-f344-45d8-95d4-22774994eb1e	ecl_calculations	ECL Calculations	Expected Credit Loss engine and stage-based calculations	functions	/banking/ifrs9/calculations	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
10ea8fce-f25d-43a2-bb3a-c76546f303ce	6e4cf1e2-f344-45d8-95d4-22774994eb1e	ifrs9_staging	IFRS9 Staging	Stage classification analysis and migration	layers	/banking/ifrs9/staging	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
277be890-555f-4524-aabf-e6c327fa2751	6e4cf1e2-f344-45d8-95d4-22774994eb1e	model_management	Model Management	PD/LGD/EAD models and configuration	model_training	/banking/ifrs9/models	item	7	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e778c094-b615-46f6-a8d3-67b1b84c950c	6e4cf1e2-f344-45d8-95d4-22774994eb1e	stress_testing	Stress Testing	Economic scenarios and stress test models	trending_up	/banking/ifrs9/scenarios	item	8	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2f1a053e-055d-482f-9295-94288c3460c1	6dc7bef6-2046-4f04-b9a4-6727d36fd452	ifrs9_reports	IFRS 9 Reports	IFRS 9 specific reporting and analytics	assessment	/banking/ifrs9-reports	item	8	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
19eae6ff-e3b9-48c6-9b2d-ecf3cd06005a	2f1a053e-055d-482f-9295-94288c3460c1	nominative_report	Nominative Report	Account-level reports and individual asset analysis	description	/banking/ifrs9-reports/nominative	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
82acacd8-f9e7-4152-a7e2-a08656e62665	2f1a053e-055d-482f-9295-94288c3460c1	lifetime_pd	Lifetime PD	Lifetime probability analysis and PD trend reports	trending_up	/banking/ifrs9-reports/lifetime-pd	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
43efe26c-657a-4635-a9f0-358e40256525	2f1a053e-055d-482f-9295-94288c3460c1	lifetime_lgd	Lifetime LGD	Lifetime loss analysis and recovery rate reports	show_chart	/banking/ifrs9-reports/lifetime-lgd	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
24d67a08-3865-4dbc-91b0-6d1689c3b4e3	2f1a053e-055d-482f-9295-94288c3460c1	ead_model	EAD Model	Exposure analysis and EAD calculations	analytics	/banking/ifrs9-reports/ead-model	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3c22a1ac-8289-452f-9d6a-8b15018e44c1	2f1a053e-055d-482f-9295-94288c3460c1	ecl_result	ECL Result	Expected Credit Loss reports and calculation results	functions	/banking/ifrs9-reports/ecl-result	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ca59b4a2-05c8-4ff1-be1e-665cc44dc537	2f1a053e-055d-482f-9295-94288c3460c1	ecl_movement	ECL Movement	ECL change analysis and movement tracking	swap_horiz	/banking/ifrs9-reports/ecl-movement	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
586a9f79-dea0-4e58-8b1c-c1061dc8e741	2f1a053e-055d-482f-9295-94288c3460c1	gca_movement	GCA Movement	Gross Carrying Amount analysis and balance sheet impact	account_balance	/banking/ifrs9-reports/gca-movement	item	7	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
749277e3-6aba-4c52-bbec-f4c613704d6b	6dc7bef6-2046-4f04-b9a4-6727d36fd452	reporting	Reporting	Regulatory and business reports	bar_chart	/banking/reporting	item	9	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
fae0ac56-50c3-4006-801b-d6ea545d550b	749277e3-6aba-4c52-bbec-f4c613704d6b	nominative_reports	Nominative Reports	Account-level reporting and customer statements	description	/banking/reporting/nominative	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
7aa03eb7-ad51-45fd-80af-5d2efa503f8e	749277e3-6aba-4c52-bbec-f4c613704d6b	ecl_reports	ECL Reports	Expected Credit Loss analysis and provision reporting	calculate	/banking/reporting/ecl	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
1abd8ba1-bd1b-4fba-8ae5-bc807bfcb84b	749277e3-6aba-4c52-bbec-f4c613704d6b	ifrs9_reports_banking	IFRS9 Reports	IFRS9 compliance reports and management analytics	functions	/banking/reporting/ifrs9	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
35140670-3b42-491e-94f9-2e938ef5a456	749277e3-6aba-4c52-bbec-f4c613704d6b	custom_reports	Custom Reports	User-defined custom reports and analytics	note_alt	/banking/reporting/custom	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
54fe6d74-cba1-4d5b-b618-fefa25525ef8	6dc7bef6-2046-4f04-b9a4-6727d36fd452	tools	Tools	Data management and utility tools	build	/banking/tools	item	10	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8b6c3495-a97f-4c18-8c2a-25b1edb2c149	54fe6d74-cba1-4d5b-b618-fefa25525ef8	manual_upload	Manual Upload	File upload interface and data import tools	cloud_upload	/banking/tools/upload	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e70a7e09-367b-40c2-83d7-991270df3ecb	54fe6d74-cba1-4d5b-b618-fefa25525ef8	data_export	Data Export	Export configuration and multi-format data export	download	/banking/tools/export	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2a7f575d-a1f2-4639-b123-bef886d14c6e	54fe6d74-cba1-4d5b-b618-fefa25525ef8	etl_tools	ETL Tools	Data transformation and ETL workflow management	transform	/banking/tools/etl	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3490bf50-6b98-48e8-9106-5016a9ae7c32	54fe6d74-cba1-4d5b-b618-fefa25525ef8	database_tools	Database Tools	Direct DB connection and query interface	storage	/banking/tools/database	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
64385b53-eccf-4be0-9ec2-2338b728ddf1	54fe6d74-cba1-4d5b-b618-fefa25525ef8	data_scheduler	Data Scheduler	Automated processing and job scheduling	schedule	/banking/tools/scheduler	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	6dc7bef6-2046-4f04-b9a4-6727d36fd452	workflow_management	Workflow Management	Business process and approval workflows	account_tree	/banking/workflow	item	11	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d449c8a8-5459-4da5-ba1f-9807f02ae2e7	b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	approval_system	Approval System	Multi-level approvals and authorization management	verified_user	/banking/workflow/approval	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e2196ef1-2d68-4c8e-b970-e4eb4c69e605	b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	workflow_configuration	Workflow Configuration	Process design and workflow templates	settings_applications	/banking/workflow/configuration	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
476b9e47-591b-4d87-8fee-f8d02254e2d9	b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	process_monitoring	Process Monitoring	Real-time monitoring and performance tracking	monitoring	/banking/workflow/monitoring	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c0ba1c31-a23b-47bf-8c48-e84f73a631b2	b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	business_process	Business Process	ECL workflows and business rules engine	account_tree	/banking/workflow/business	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
29bd7011-fc95-45d2-951b-362b861ca800	6dc7bef6-2046-4f04-b9a4-6727d36fd452	maintenance	Maintenance	System administration and user management	build_circle	/banking/maintenance	item	12	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3f5f8dae-7278-45cb-82e3-c3b2f34b215a	29bd7011-fc95-45d2-951b-362b861ca800	approval_management	Approval Management	Approval queue and pending request management	fact_check	/banking/maintenance/approval	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ee77f752-7e3e-43ea-8c64-08f3c82a75f3	29bd7011-fc95-45d2-951b-362b861ca800	user_activity	User Activity	Activity monitoring and user logs	history	/banking/maintenance/user-activity	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
48fb3508-c5ca-46b4-b98e-dbe5319cd951	29bd7011-fc95-45d2-951b-362b861ca800	job_monitoring	Job Monitoring	Job status tracking and process monitoring	monitoring	/banking/maintenance/job-monitoring	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
cc770de0-dcbb-4ac3-b189-7a62f4928386	29bd7011-fc95-45d2-951b-362b861ca800	user_management_maintenance	User Management	User administration and role management	manage_accounts	/banking/maintenance/users	item	4	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
918087be-5730-41ac-86cb-4fc09d888622	29bd7011-fc95-45d2-951b-362b861ca800	role_management	Role Management	Role configuration and permission management	security	/banking/maintenance/roles	item	5	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c99670fa-a5f0-47f7-a4cd-78faf2ef8aac	29bd7011-fc95-45d2-951b-362b861ca800	menu_management_maintenance	Menu Management	Menu configuration and navigation management	menu	/banking/maintenance/menus	item	6	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
9082fe44-13f1-4f4e-833b-eec61ecbcea6	6dc7bef6-2046-4f04-b9a4-6727d36fd452	data_management	Data Management	Data upload, validation, and processing	database	/banking/data	item	13	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2202c4d1-85e7-474c-844c-a5726e044962	9082fe44-13f1-4f4e-833b-eec61ecbcea6	data_upload	Data Upload	File upload interface and bulk data import	cloud_upload	/banking/data/upload	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
650f0d1b-82e7-494e-bbae-63ea91df2359	9082fe44-13f1-4f4e-833b-eec61ecbcea6	data_validation	Data Validation	Data quality checks and validation rules	verified	/banking/data/validation	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
a239ad8c-cdf3-4cf2-b259-562c22a090ef	6dc7bef6-2046-4f04-b9a4-6727d36fd452	analytics	Analytics	Advanced analytics and reporting	insights	/banking/analytics	item	14	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
59bd087a-d0d1-414d-a714-0d929db9edff	a239ad8c-cdf3-4cf2-b259-562c22a090ef	main_analytics	Main Analytics	Dashboard analytics and performance metrics	bar_chart	/banking/analytics	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ee6b5c46-653c-43dc-9bc5-23754f02bb46	a239ad8c-cdf3-4cf2-b259-562c22a090ef	r_analytics	R Analytics	Statistical analysis and R model integration	psychology	/banking/analytics/r-analytics	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8967652f-12d1-4989-8959-61c71a8e15dd	6dc7bef6-2046-4f04-b9a4-6727d36fd452	banking_mode	Banking Mode	Conventional and Syariah banking modes	account_balance	/banking/mode	item	15	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
685b5ab1-5835-4943-9467-ff00942c7cbf	8967652f-12d1-4989-8959-61c71a8e15dd	conventional_banking	Conventional Banking	Conventional banking products and operations	account_balance	/banking/mode/conventional	item	1	t	{conventional}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
a1496e94-4d82-42d3-a77c-bfae0fe1c8f1	8967652f-12d1-4989-8959-61c71a8e15dd	syariah_banking	Syariah Banking	Islamic banking products and Shariah compliance	mosque	/banking/mode/syariah	item	2	t	{syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8dd98a39-735f-4aa5-a069-6d4446fa4726	8967652f-12d1-4989-8959-61c71a8e15dd	banking_compliance	Banking Compliance	Regulatory compliance and audit reports	gavel	/banking/mode/compliance	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2efa09a0-6ed7-4ce4-8e00-b83d387e6b61	6dc7bef6-2046-4f04-b9a4-6727d36fd452	settings_banking	Settings	User profile and system preferences	settings	/banking/settings	item	16	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
28196483-e7a2-4a40-85c3-a6f7924051da	2efa09a0-6ed7-4ce4-8e00-b83d387e6b61	user_profile	User Profile	Personal information and account settings	person	/banking/settings/profile	item	1	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
db9486f3-cada-469f-bf2a-2b9dd316fc36	2efa09a0-6ed7-4ce4-8e00-b83d387e6b61	theme_settings	Theme Settings	UI customization and theme selection	palette	/banking/settings/theme	item	2	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
53815fa9-b469-4980-b5a2-76dd45cf0083	2efa09a0-6ed7-4ce4-8e00-b83d387e6b61	user_preferences	User Preferences	System preferences and user configuration	tune	/banking/settings/preferences	item	3	t	{conventional,syariah}	\N	2025-11-16 02:17:04.977867+07	2025-11-16 02:17:04.977867+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
\.


--
-- Data for Name: role_menu_access; Type: TABLE DATA; Schema: core; Owner: postgres
--

COPY core.role_menu_access (id, role_id, menu_item_id, can_view, can_create, can_edit, can_delete, can_approve, created_by, created_at, updated_at, tenant_id) FROM stdin;
9c7dd9e7-5ac6-429c-a006-ee81d06831b7	71a4ce81-368a-4d31-a615-47baf4e5221f	1de5a328-6606-4c15-acef-a7916ad43206	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
826bfdff-7fd9-45d3-8cd8-d8d95fdea4c4	71a4ce81-368a-4d31-a615-47baf4e5221f	d780bd8e-c2a3-4162-a110-480550889635	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5e8be836-77e2-4570-9c54-2fa1b04717b7	71a4ce81-368a-4d31-a615-47baf4e5221f	6dc7bef6-2046-4f04-b9a4-6727d36fd452	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
82874761-7a40-4c52-8953-87173bfe8ab8	71a4ce81-368a-4d31-a615-47baf4e5221f	758651b8-6994-47aa-97ec-321ab7e68e65	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
79645b54-f8e0-4453-8976-b089e24be514	71a4ce81-368a-4d31-a615-47baf4e5221f	47fc13a2-3d72-427e-bdb3-22849749a733	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8c279f92-f51a-4dc3-a8b7-2fb2d8e74e17	71a4ce81-368a-4d31-a615-47baf4e5221f	bd5f362f-4b01-43e7-a6cc-1341033d3786	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
f13bda5c-0d02-476c-a4c1-48081453c566	71a4ce81-368a-4d31-a615-47baf4e5221f	51948eb0-5d76-409c-8131-ef531cb61b44	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
591cc3c0-5dbb-4517-a58c-7fb8f3c932b6	71a4ce81-368a-4d31-a615-47baf4e5221f	ceb80ebe-eca2-4c4a-b5e2-9fd583953d63	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
0722ba97-17d4-4e5b-9ccd-e1cd765de8bc	71a4ce81-368a-4d31-a615-47baf4e5221f	05f6749a-7472-4859-afd2-0d409043ec35	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
de6de6ce-6b01-47f1-8b25-fbd7c8b2718a	71a4ce81-368a-4d31-a615-47baf4e5221f	534b4f13-d095-4983-9e5a-6367856bf5fb	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8cb92a5a-2d59-4ffb-9630-4d076ea010fa	71a4ce81-368a-4d31-a615-47baf4e5221f	ff6a8943-0903-49be-9262-269dda1cbab3	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d24f6ce3-4a04-498e-80db-a18712c208e9	71a4ce81-368a-4d31-a615-47baf4e5221f	44222271-131e-44c1-b16a-d95a2d52e3f8	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
86e2d15b-d29c-4fec-8ffb-f72cc6b68608	71a4ce81-368a-4d31-a615-47baf4e5221f	58dfdbfe-3866-4db4-a7e8-7c25a039970e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
7cb22c61-c512-4fc4-8166-cc79c6d42680	71a4ce81-368a-4d31-a615-47baf4e5221f	e6e4aad2-5f4a-45f6-9a2f-a00fccbeb908	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e440dbb4-83c5-4ae0-98a7-002ed7399219	71a4ce81-368a-4d31-a615-47baf4e5221f	707edb00-42ae-47ae-ba5a-855b87b2fe72	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
73103e73-0923-4eb6-9c73-eba272de7762	71a4ce81-368a-4d31-a615-47baf4e5221f	15472db0-64a2-4299-8694-3fc3b0b26259	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
0b921258-f92c-4240-b8c1-5a04e3cecc4f	71a4ce81-368a-4d31-a615-47baf4e5221f	81491fdb-b324-43f2-be6b-f4b3b83a2e59	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2c7f5c9d-1dac-4a93-a596-05084756480c	71a4ce81-368a-4d31-a615-47baf4e5221f	78adc16d-c6d1-415e-81fb-bfe1527d8936	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
476fc698-4ffb-412f-a939-3108dc194d06	71a4ce81-368a-4d31-a615-47baf4e5221f	20c03a9a-7d24-4863-8573-0369701e387e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
7a7262d0-7018-42bf-be6c-6780de3ae830	71a4ce81-368a-4d31-a615-47baf4e5221f	89531071-2a0f-41ec-9017-bff8a245c7a9	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c451ded2-b8fc-46ab-95ce-ef53ba488020	71a4ce81-368a-4d31-a615-47baf4e5221f	98c377f4-7983-4428-b349-e16b507e8b2b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e1e7c57a-dfca-4f57-88b5-9a8cd2d9b47b	71a4ce81-368a-4d31-a615-47baf4e5221f	bd57bfd9-26e1-4bc9-9054-60e8ace3da52	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8e35ac32-08c8-4ac2-8eca-527e2764a668	71a4ce81-368a-4d31-a615-47baf4e5221f	d852318e-f7f4-4504-821b-cb3da9ddb52b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e5d43f88-13f7-4eeb-9dd8-e87a5ef4f47b	71a4ce81-368a-4d31-a615-47baf4e5221f	392203ab-e9a2-4eff-9638-018e824e03a2	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
50a57448-941b-4b43-8977-efd0e100b369	71a4ce81-368a-4d31-a615-47baf4e5221f	621eb466-9706-4678-b3ed-bad7196952d0	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8ba719b3-c7f6-421b-b967-3ee0c7ed010e	71a4ce81-368a-4d31-a615-47baf4e5221f	974cfbea-6e52-47b5-8be1-5490ce4b25de	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2b340243-d91f-40d9-8faf-b27b097af4d9	71a4ce81-368a-4d31-a615-47baf4e5221f	6e2d828c-d8c5-4818-a6e7-c9e2f230285b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5f2234c1-127a-4069-ae2b-fc45d405f4c0	71a4ce81-368a-4d31-a615-47baf4e5221f	2799feaf-cf44-46b0-9a63-da8ec4b99a57	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
4381a04f-08f1-4ff1-b2d3-7a7888c9038a	71a4ce81-368a-4d31-a615-47baf4e5221f	96d05fec-1ac3-4d63-aed9-f5224d64d576	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
ecf5a0fd-8f13-4cf6-aa91-f95484ea1a6d	71a4ce81-368a-4d31-a615-47baf4e5221f	36e8d3b7-4b37-41b3-971d-4a8469c6d310	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c3fe5a80-14dc-41e9-b4ea-22d3c3d97ea0	71a4ce81-368a-4d31-a615-47baf4e5221f	08073829-9a9e-4abd-a7ac-17a8d44a2744	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
bfb8202f-3a42-4fe7-a404-b7e72482f354	71a4ce81-368a-4d31-a615-47baf4e5221f	d821b92f-22aa-4cce-8a9c-44fc8dc05632	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
19780157-e567-447c-b16f-41a8db04dc2d	71a4ce81-368a-4d31-a615-47baf4e5221f	2b7ec21b-ec2c-4427-9036-15050de1310e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
da1ddc9e-014f-4177-9953-b240ad6234fc	71a4ce81-368a-4d31-a615-47baf4e5221f	5bf34db8-1b1b-4f24-bdc6-607a4fe62a8c	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e6efeae6-d7b4-41b5-8bb0-5b5cbaf52acf	71a4ce81-368a-4d31-a615-47baf4e5221f	6e2517d8-3df1-464d-88c7-5266d694ec15	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5519a8ff-78de-47bd-b562-c4b33b638d32	71a4ce81-368a-4d31-a615-47baf4e5221f	aea18cd9-89e8-4510-987b-db5761a9857a	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e5ab8003-c479-4993-8036-8b6557695684	71a4ce81-368a-4d31-a615-47baf4e5221f	445fc85b-a6b3-4eb2-9944-876a2a6a770f	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
51cdb5e8-7456-43fa-96ee-85ff6a36c156	71a4ce81-368a-4d31-a615-47baf4e5221f	a337fc8c-de97-4db9-8138-5534171ac5cf	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
f430f137-39a2-4def-a87e-920680173be5	71a4ce81-368a-4d31-a615-47baf4e5221f	66ee0ea4-c89f-4ff0-90d8-38e5a4b77c4c	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2b76185a-7f4c-406a-b14a-a94392983e6c	71a4ce81-368a-4d31-a615-47baf4e5221f	cf734d8b-3a74-452c-9d80-dae70053fcfc	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
fd1baf37-56ac-48a5-b332-4c6d4cde59db	71a4ce81-368a-4d31-a615-47baf4e5221f	29669acf-31d1-4df1-a3f1-4365f7c431a2	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
9511afad-d138-43b5-9dc9-ff683b77b495	71a4ce81-368a-4d31-a615-47baf4e5221f	2e18ff94-7713-4981-b6e5-59776b42f247	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
29be865d-fd81-4a8d-8bf2-98d9da9c38c1	71a4ce81-368a-4d31-a615-47baf4e5221f	c5adf834-b501-4eda-b213-09f3e8c63d44	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
28da74be-abe1-4fa8-ac78-15195af06b3a	71a4ce81-368a-4d31-a615-47baf4e5221f	428f3562-4986-4943-964f-15d79c7a399d	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
584d6d09-0820-4dda-b09b-779b3a4e323f	71a4ce81-368a-4d31-a615-47baf4e5221f	6e4cf1e2-f344-45d8-95d4-22774994eb1e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
069dba24-dfe0-445d-a53c-62b9b2e16d8e	71a4ce81-368a-4d31-a615-47baf4e5221f	73d72ea3-96d5-439c-abc7-ed004d39400f	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
efff9fd7-bfad-48bc-9248-876865f2c58c	71a4ce81-368a-4d31-a615-47baf4e5221f	ec71650f-1e20-4d1f-987c-7c97e82ca1bf	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
928a8cfa-7138-43a5-892a-942b26005601	71a4ce81-368a-4d31-a615-47baf4e5221f	54542f35-ab3b-481f-aec3-6eb98a7fdd9b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3d568b23-961d-4ebc-992f-19333df4d180	71a4ce81-368a-4d31-a615-47baf4e5221f	614c73b7-7ff2-4ef9-a5f0-675399ed78dc	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
fdd9d502-8f06-4a8f-af39-38fdfe9eda65	71a4ce81-368a-4d31-a615-47baf4e5221f	5c7c6347-a041-4390-90fc-37d5bcf9ae93	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
773d2127-518e-4b96-9598-356be81725f9	71a4ce81-368a-4d31-a615-47baf4e5221f	10ea8fce-f25d-43a2-bb3a-c76546f303ce	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
98b4d583-9e6d-455a-b08b-a279d91644f4	71a4ce81-368a-4d31-a615-47baf4e5221f	277be890-555f-4524-aabf-e6c327fa2751	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
8a85b330-595d-4095-b409-aa98de6f6e31	71a4ce81-368a-4d31-a615-47baf4e5221f	e778c094-b615-46f6-a8d3-67b1b84c950c	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3050fa49-f67e-43f3-962f-e25f19c6e5f9	71a4ce81-368a-4d31-a615-47baf4e5221f	2f1a053e-055d-482f-9295-94288c3460c1	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
328fabe6-832a-4d7c-a90e-2c0bb9447a90	71a4ce81-368a-4d31-a615-47baf4e5221f	19eae6ff-e3b9-48c6-9b2d-ecf3cd06005a	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
614b5c2a-4d2a-492e-8cd6-2c3d4b834a56	71a4ce81-368a-4d31-a615-47baf4e5221f	82acacd8-f9e7-4152-a7e2-a08656e62665	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3e5f618d-2518-4f41-9c96-7f9d61985324	71a4ce81-368a-4d31-a615-47baf4e5221f	43efe26c-657a-4635-a9f0-358e40256525	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
5ecd254d-121a-498b-9eb7-c1d19a04cca3	71a4ce81-368a-4d31-a615-47baf4e5221f	24d67a08-3865-4dbc-91b0-6d1689c3b4e3	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d1994f99-7b37-4b94-99ce-5eae3596ac58	71a4ce81-368a-4d31-a615-47baf4e5221f	3c22a1ac-8289-452f-9d6a-8b15018e44c1	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
dd910dfe-9ef2-420c-91f6-7a615c5bb20d	71a4ce81-368a-4d31-a615-47baf4e5221f	ca59b4a2-05c8-4ff1-be1e-665cc44dc537	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
de851c1b-5218-40da-b9b1-13cb22244adc	71a4ce81-368a-4d31-a615-47baf4e5221f	586a9f79-dea0-4e58-8b1c-c1061dc8e741	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
615a028b-210c-429b-8268-9dd7775f9342	71a4ce81-368a-4d31-a615-47baf4e5221f	749277e3-6aba-4c52-bbec-f4c613704d6b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e6fe7774-d6d8-4cdc-9fed-5514366204b7	71a4ce81-368a-4d31-a615-47baf4e5221f	fae0ac56-50c3-4006-801b-d6ea545d550b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
bebff744-185a-4a92-8ddb-5851fcf322d2	71a4ce81-368a-4d31-a615-47baf4e5221f	7aa03eb7-ad51-45fd-80af-5d2efa503f8e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d7e06e21-75b9-4218-8cb4-ff3ffa003c94	71a4ce81-368a-4d31-a615-47baf4e5221f	1abd8ba1-bd1b-4fba-8ae5-bc807bfcb84b	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
27ab1e05-d6c6-49a6-8762-ecf0812e3045	71a4ce81-368a-4d31-a615-47baf4e5221f	35140670-3b42-491e-94f9-2e938ef5a456	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
971f11ac-0e93-4fee-b858-b94ce14acbe7	71a4ce81-368a-4d31-a615-47baf4e5221f	54fe6d74-cba1-4d5b-b618-fefa25525ef8	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
17353d07-db70-4c17-b279-6ea1b5ca63dd	71a4ce81-368a-4d31-a615-47baf4e5221f	8b6c3495-a97f-4c18-8c2a-25b1edb2c149	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d3dcc14a-996c-4886-b562-293ed53f17e4	71a4ce81-368a-4d31-a615-47baf4e5221f	e70a7e09-367b-40c2-83d7-991270df3ecb	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
4b69b1a6-80fc-40b1-a59f-4aae39dca8ef	71a4ce81-368a-4d31-a615-47baf4e5221f	2a7f575d-a1f2-4639-b123-bef886d14c6e	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
7bf551a7-1b47-4aa0-aa07-bdf205ad261a	71a4ce81-368a-4d31-a615-47baf4e5221f	3490bf50-6b98-48e8-9106-5016a9ae7c32	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d6248038-555f-43ca-a22d-68ef6983fa2a	71a4ce81-368a-4d31-a615-47baf4e5221f	64385b53-eccf-4be0-9ec2-2338b728ddf1	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2b1e3440-beb3-4320-81cc-059087014b82	71a4ce81-368a-4d31-a615-47baf4e5221f	b567d31a-416d-4a2d-a03c-7c4aefc7e1e6	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
7f06bfed-985d-4a3c-a6bc-a17c759c9079	71a4ce81-368a-4d31-a615-47baf4e5221f	d449c8a8-5459-4da5-ba1f-9807f02ae2e7	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
84832489-667c-499d-ba38-29c496b21763	71a4ce81-368a-4d31-a615-47baf4e5221f	e2196ef1-2d68-4c8e-b970-e4eb4c69e605	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
3a2869a7-bca6-4502-85f3-781b5fd957dd	71a4ce81-368a-4d31-a615-47baf4e5221f	476b9e47-591b-4d87-8fee-f8d02254e2d9	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e318bacb-7f20-4743-a892-924f65b078fe	71a4ce81-368a-4d31-a615-47baf4e5221f	c0ba1c31-a23b-47bf-8c48-e84f73a631b2	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
66e99747-6097-4725-9ace-4036eff09f02	71a4ce81-368a-4d31-a615-47baf4e5221f	29bd7011-fc95-45d2-951b-362b861ca800	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
83bd43a3-c78a-467b-be85-cd2aa722e01d	71a4ce81-368a-4d31-a615-47baf4e5221f	3f5f8dae-7278-45cb-82e3-c3b2f34b215a	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
01567517-e19b-4fa9-9409-befd3b8f4d9e	71a4ce81-368a-4d31-a615-47baf4e5221f	ee77f752-7e3e-43ea-8c64-08f3c82a75f3	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
d0dd9ef9-088e-49eb-b63d-6ccec505bf21	71a4ce81-368a-4d31-a615-47baf4e5221f	48fb3508-c5ca-46b4-b98e-dbe5319cd951	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
12ab8be6-082c-40ae-aced-112b70d740da	71a4ce81-368a-4d31-a615-47baf4e5221f	cc770de0-dcbb-4ac3-b189-7a62f4928386	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2aa9ee82-9023-400d-b81e-44a661d027c5	71a4ce81-368a-4d31-a615-47baf4e5221f	918087be-5730-41ac-86cb-4fc09d888622	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
28e05f14-7ba1-4aaf-a8c0-f34feb17239f	71a4ce81-368a-4d31-a615-47baf4e5221f	c99670fa-a5f0-47f7-a4cd-78faf2ef8aac	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
04b6950e-29b2-44a1-b864-ffdd18fb053a	71a4ce81-368a-4d31-a615-47baf4e5221f	9082fe44-13f1-4f4e-833b-eec61ecbcea6	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
1e0a1388-4ec9-414b-80b1-c66b84b89315	71a4ce81-368a-4d31-a615-47baf4e5221f	2202c4d1-85e7-474c-844c-a5726e044962	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
c497f37e-4bbd-4240-9abb-1606d6a0680a	71a4ce81-368a-4d31-a615-47baf4e5221f	650f0d1b-82e7-494e-bbae-63ea91df2359	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
2274e106-b1c6-4712-ad52-7e5557a341ed	71a4ce81-368a-4d31-a615-47baf4e5221f	a239ad8c-cdf3-4cf2-b259-562c22a090ef	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
1e41d100-6cb5-4f1e-9aa5-dd947d04018f	71a4ce81-368a-4d31-a615-47baf4e5221f	59bd087a-d0d1-414d-a714-0d929db9edff	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
a165045e-d0fe-4f95-8a2a-d0b9fe87ae62	71a4ce81-368a-4d31-a615-47baf4e5221f	ee6b5c46-653c-43dc-9bc5-23754f02bb46	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
0e2f1aab-8ba4-4f72-a6e2-4f06427b587c	71a4ce81-368a-4d31-a615-47baf4e5221f	8967652f-12d1-4989-8959-61c71a8e15dd	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
6c458ac0-cfb7-4adf-b06f-3a33aa085728	71a4ce81-368a-4d31-a615-47baf4e5221f	685b5ab1-5835-4943-9467-ff00942c7cbf	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
01ec2fa4-6d43-4df2-a26a-203bbffc8e6e	71a4ce81-368a-4d31-a615-47baf4e5221f	a1496e94-4d82-42d3-a77c-bfae0fe1c8f1	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
e72f730e-fa33-4c53-a1af-8f5ce1e6a440	71a4ce81-368a-4d31-a615-47baf4e5221f	8dd98a39-735f-4aa5-a069-6d4446fa4726	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
a0382c3f-535e-4424-bf2e-4bc09ad978f2	71a4ce81-368a-4d31-a615-47baf4e5221f	2efa09a0-6ed7-4ce4-8e00-b83d387e6b61	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
30ed5003-d0d8-4e6e-91c7-3594f22a9199	71a4ce81-368a-4d31-a615-47baf4e5221f	28196483-e7a2-4a40-85c3-a6f7924051da	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
4d4a7a7c-e20f-454d-b19a-31ae91e02602	71a4ce81-368a-4d31-a615-47baf4e5221f	db9486f3-cada-469f-bf2a-2b9dd316fc36	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
66959369-d508-4330-9110-24605a838472	71a4ce81-368a-4d31-a615-47baf4e5221f	53815fa9-b469-4980-b5a2-76dd45cf0083	t	t	t	t	t	\N	2025-11-16 02:21:15.52401+07	2025-11-16 02:21:15.52401+07	a24af6d2-3032-4d53-ae82-9cfa84f97a20
\.


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
-- Name: menu_items update_menu_items_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON core.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: role_menu_access update_role_menu_access_updated_at; Type: TRIGGER; Schema: core; Owner: postgres
--

CREATE TRIGGER update_role_menu_access_updated_at BEFORE UPDATE ON core.role_menu_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: menu_items menu_items_parent_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: postgres
--

ALTER TABLE ONLY core.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES core.menu_items(id) ON DELETE CASCADE;


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
-- PostgreSQL database dump complete
--

