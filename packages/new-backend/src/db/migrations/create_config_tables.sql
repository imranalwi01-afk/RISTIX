
-- Create PD Config Table
CREATE TABLE IF NOT EXISTS "FRS9_IMP_CA_PD_CONFIG" (
    "PKID" SERIAL PRIMARY KEY,
    "PD_MODEL_NAME" VARCHAR(255) NOT NULL,
    "DESCRIPTION" TEXT,
    "CREATED_DATE" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy PD Data
INSERT INTO "FRS9_IMP_CA_PD_CONFIG" ("PD_MODEL_NAME", "DESCRIPTION")
VALUES 
('PD Model Segment 1 (Corporate)', 'Corporate Banking Segment'),
('PD Model Segment 2 (Retail)', 'Retail Banking Segment'),
('PD Model Segment 3 (SME)', 'Small Medium Enterprise Segment');

-- Create LGD Config Table
CREATE TABLE IF NOT EXISTS "FRS9_IMP_CA_LGD_CONFIG" (
    "PKID" SERIAL PRIMARY KEY,
    "LGD_MODEL_NAME" VARCHAR(255) NOT NULL,
    "DESCRIPTION" TEXT,
    "CREATED_DATE" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Dummy LGD Data
INSERT INTO "FRS9_IMP_CA_LGD_CONFIG" ("LGD_MODEL_NAME", "DESCRIPTION")
VALUES 
('LGD Model Segment 1 (Secured)', 'Secured Loans'),
('LGD Model Segment 2 (Unsecured)', 'Unsecured Loans');
