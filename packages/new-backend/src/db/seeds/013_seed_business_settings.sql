-- Seeding Business Settings (frs9_param_commond)
-- Required for Segmentation Configuration (B0012, B0013, B0014, B0015)

-- Clear existing Business Settings data to prevent duplicates
DELETE FROM frs9_param_commond WHERE param_code IN ('B0001', 'B0002', 'B0003', 'B0012', 'B0013', 'B0014', 'B0015', 'B0016', 'B0028', 'B0029', 'B0030');
DELETE FROM frs9_param_commonh WHERE param_code IN ('B0001', 'B0002', 'B0003', 'B0012', 'B0013', 'B0014', 'B0015', 'B0016', 'B0028', 'B0029', 'B0030');

-- Insert Headers (frs9_param_commonh) with param_type = 'B'
INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, is_active, requires_approval, createdby, createddate, createdhost) VALUES
('B0001', 'Currency Configuration', 'List of available currencies', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0002', 'Amortization Type', 'Amortization methods', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0003', 'Instrument Class', 'Asset / Liability classification', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0012', 'Tables Configuration', 'List of tables available for segmentation', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0013', 'Columns Configuration', 'List of columns available for segmentation', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0014', 'Operators Configuration', 'List of operators available for segmentation', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0015', 'Conditions Configuration', 'List of logic conditions available for segmentation', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0016', 'Column Values Configuration', 'List of predefined values for columns', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0028', 'Data Source', 'List of allowed data sources', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0029', 'Product Group', 'List of product groups', 'B', true, false, 'SYSTEM', NOW(), 'localhost'),
('B0030', 'Product Type', 'List of product types', 'B', true, false, 'SYSTEM', NOW(), 'localhost');


-- 0. B0001, B0002, B0003: Product Parameters
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- B0001: Currency
('B0001', 1, 'IDR', 'Indonesian Rupiah', '', 'IDR Currency', 'SYSTEM', NOW(), 'localhost'),
('B0001', 2, 'USD', 'US Dollar', '', 'USD Currency', 'SYSTEM', NOW(), 'localhost'),

-- B0002: Amortization Type
('B0002', 1, 'EIR', 'Effective Interest Rate', '', 'EIR Method', 'SYSTEM', NOW(), 'localhost'),
('B0002', 2, 'SL', 'Straight Line', '', 'Straight Line Method', 'SYSTEM', NOW(), 'localhost'),

-- B0003: Instrument Class (AL_FLAG)
('B0003', 1, 'A', 'Asset', '', 'Asset', 'SYSTEM', NOW(), 'localhost'),
('B0003', 2, 'L', 'Liability', '', 'Liability', 'SYSTEM', NOW(), 'localhost');


-- 1. B0012: Tables
-- value1: Table Name
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
('B0012', 1, 'frs9_param_product', '', '', 'Products Table', 'SYSTEM', NOW(), 'localhost'),
('B0012', 2, 'frs9_param_journal', '', '', 'Journals Table', 'SYSTEM', NOW(), 'localhost');

-- 2. B0013: Columns
-- value1: Column Name, value2: Data Type, value3: Table Name
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- Product Table Columns
('B0013', 1, 'CONTRACT_ID', 'string', 'frs9_param_product', 'Contract Identifier', 'SYSTEM', NOW(), 'localhost'),
('B0013', 2, 'PRODUCT_TYPE', 'string', 'frs9_param_product', 'Product Type', 'SYSTEM', NOW(), 'localhost'),
('B0013', 3, 'CURRENCY', 'string', 'frs9_param_product', 'Currency Code', 'SYSTEM', NOW(), 'localhost'),
('B0013', 4, 'AMOUNT', 'number', 'frs9_param_product', 'Principal Amount', 'SYSTEM', NOW(), 'localhost'),
('B0013', 5, 'INTEREST_RATE', 'number', 'frs9_param_product', 'Interest Rate', 'SYSTEM', NOW(), 'localhost'),
('B0013', 6, 'START_DATE', 'date', 'frs9_param_product', 'Start Date', 'SYSTEM', NOW(), 'localhost'),
('B0013', 8, 'IS_IMPAIRED', 'boolean', 'frs9_param_product', 'Impairment Status', 'SYSTEM', NOW(), 'localhost'),

-- Journal Table Columns
('B0013', 10, 'JOURNAL_ID', 'string', 'frs9_param_journal', 'Journal Identifier', 'SYSTEM', NOW(), 'localhost'),
('B0013', 11, 'ACCOUNT_CODE', 'string', 'frs9_param_journal', 'Account Code', 'SYSTEM', NOW(), 'localhost'),
('B0013', 12, 'DEBIT_AMOUNT', 'number', 'frs9_param_journal', 'Debit Amount', 'SYSTEM', NOW(), 'localhost'),
('B0013', 13, 'CREDIT_AMOUNT', 'number', 'frs9_param_journal', 'Credit Amount', 'SYSTEM', NOW(), 'localhost'),
('B0013', 14, 'POSTING_DATE', 'date', 'frs9_param_journal', 'Posting Date', 'SYSTEM', NOW(), 'localhost');

-- 3. B0014: Operators
-- value1: Operator, value2: Data Type it applies to
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- String Operators
('B0014', 1, '=', 'string', '', 'Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 2, '!=', 'string', '', 'Not Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 3, 'LIKE', 'string', '', 'Contains', 'SYSTEM', NOW(), 'localhost'),
('B0014', 4, 'IN', 'string', '', 'In List', 'SYSTEM', NOW(), 'localhost'),

-- Number Operators
('B0014', 5, '=', 'number', '', 'Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 6, '!=', 'number', '', 'Not Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 7, '>', 'number', '', 'Greater Than', 'SYSTEM', NOW(), 'localhost'),
('B0014', 8, '<', 'number', '', 'Less Than', 'SYSTEM', NOW(), 'localhost'),
('B0014', 9, '>=', 'number', '', 'Greater Than or Equal', 'SYSTEM', NOW(), 'localhost'),
('B0014', 10, '<=', 'number', '', 'Less Than or Equal', 'SYSTEM', NOW(), 'localhost'),

-- Date Operators
('B0014', 11, '=', 'date', '', 'Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 12, '!=', 'date', '', 'Not Equals', 'SYSTEM', NOW(), 'localhost'),
('B0014', 13, '>', 'date', '', 'After', 'SYSTEM', NOW(), 'localhost'),
('B0014', 14, '<', 'date', '', 'Before', 'SYSTEM', NOW(), 'localhost'),

-- Boolean Operators
('B0014', 15, '=', 'boolean', '', 'Equals', 'SYSTEM', NOW(), 'localhost');

-- 4. B0015: Conditions
-- value1: Condition
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
('B0015', 1, 'AND', '', '', 'Logical AND', 'SYSTEM', NOW(), 'localhost'),
('B0015', 2, 'OR', '', '', 'Logical OR', 'SYSTEM', NOW(), 'localhost');

-- 5. B0016: Column Values (Predefined options for specific columns)
-- value1: Value, value2: Column Name, value3: Table Name
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
-- Currencies
('B0016', 4, 'IDR', 'CURRENCY', 'frs9_param_product', 'Indonesian Rupiah', 'SYSTEM', NOW(), 'localhost'),
('B0016', 5, 'USD', 'CURRENCY', 'frs9_param_product', 'US Dollar', 'SYSTEM', NOW(), 'localhost'),
-- Account Status for FRS9_MASTER_ACCOUNT
('B0016', 6, 'A', 'ACCOUNT_STATUS', 'FRS9_MASTER_ACCOUNT', 'Active', 'SYSTEM', NOW(), 'localhost'),
('B0016', 7, 'R', 'ACCOUNT_STATUS', 'FRS9_MASTER_ACCOUNT', 'Restructure', 'SYSTEM', NOW(), 'localhost'),
('B0016', 8, 'W', 'ACCOUNT_STATUS', 'FRS9_MASTER_ACCOUNT', 'Write-off', 'SYSTEM', NOW(), 'localhost'),
('B0016', 9, 'C', 'ACCOUNT_STATUS', 'FRS9_MASTER_ACCOUNT', 'Close', 'SYSTEM', NOW(), 'localhost'),
('B0016', 10, 'D', 'ACCOUNT_STATUS', 'FRS9_MASTER_ACCOUNT', 'Default', 'SYSTEM', NOW(), 'localhost');

-- 6. B0028: Data Source
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
('B0028', 1, 'CORE', 'Core Banking', '', 'Core Banking System', 'SYSTEM', NOW(), 'localhost'),
('B0028', 2, 'MANUAL', 'Manual Input', '', 'Manual Input', 'SYSTEM', NOW(), 'localhost'),
('B0028', 3, 'TREASURY', 'Treasury System', '', 'Treasury System', 'SYSTEM', NOW(), 'localhost');

-- 7. B0029: Product Group
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
('B0029', 1, 'RETAIL', 'Retail Banking', '', 'Retail Products', 'SYSTEM', NOW(), 'localhost'),
('B0029', 2, 'CORPORATE', 'Corporate Banking', '', 'Corporate Products', 'SYSTEM', NOW(), 'localhost'),
('B0029', 3, 'SME', 'SME Banking', '', 'Small & Medium Enterprise', 'SYSTEM', NOW(), 'localhost');

-- 8. B0030: Product Type
INSERT INTO ifrs9.frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost) VALUES
('B0030', 1, 'LOAN', 'Loan Product', '', 'Loan Product', 'SYSTEM', NOW(), 'localhost'),
('B0030', 2, 'MORTGAGE', 'Mortgage Product', '', 'Mortgage Product', 'SYSTEM', NOW(), 'localhost'),
('B0030', 3, 'CREDIT_CARD', 'Credit Card', '', 'Credit Card', 'SYSTEM', NOW(), 'localhost');
