# QA Automation Specification (Canvas)

Product: IFRS9 IAF  
Audience: QA Automation (Human + AI)  
Purpose: Source-of-truth QA spec for generating automated tests  
Style: Deterministic, non-tabular, atomic test cases  
Rule: **1 Test Case = 1 Executable Automation Test**

---

## Global Assumptions

- All modules require authentication
- User role affects access and approval capability
- Approval workflow is separated from CRUD actions
- UI behaviour must be validated independently from approval outcome
- Negative tests must assert **no side effects**

---

## Module: General Setup

### Feature: Application Setting
Route: `/system-setup/application-configuration`

---

### TestCase: GS_APP_001
Title: Create Application Setting (Normal)
Type: UI
Priority: High
Automation: Yes

Preconditions:
- User is logged in
- User role = Admin
- Application Configuration page is accessible

TestData:
- commonCode: TEST001
- parameterName: Testing
- usageDescription: Testing_Application_Setting

Steps:
1. Navigate to Application Configuration page
2. Click "Add Parameter"
3. Input Common Code
4. Input Parameter Name
5. Input Usage Description
6. Click "Create"

Expected:
- Success notification is displayed
- New Application Setting appears in list
- Status is set to Pending Approval (if approval is enabled)

---

### TestCase: GS_APP_002
Title: Create Application Setting without required fields
Type: UI (Negative)
Priority: High
Automation: Yes

Steps:
1. Click "Add Parameter"
2. Leave all required fields empty

Expected:
- Create action is disabled or blocked
- Validation message is displayed
- No data is submitted

---

### TestCase: GS_APP_003
Title: Cancel Create Application Setting
Type: UI
Priority: Medium
Automation: Yes

Steps:
1. Click "Add Parameter"
2. Click "Cancel"

Expected:
- Form is closed
- No data is created

---

### TestCase: GS_APP_004
Title: Edit Application Setting (With Approval)
Type: UI
Priority: High
Automation: Yes

Preconditions:
- Existing Application Setting is available

Steps:
1. Click "Edit" on existing Application Setting
2. Modify Usage Description
3. Click "Update"

Expected:
- Update request is submitted
- Status becomes Pending Approval

---

### TestCase: GS_APP_005
Title: Delete Application Setting (With Approval)
Type: UI
Priority: High
Automation: Yes

Steps:
1. Click "Delete" on existing Application Setting
2. Confirm deletion

Expected:
- Delete request is created
- Data is not removed before approval

---

## Module: Approval Workflow

---

### TestCase: WF_APP_001
Title: Approve Application Setting
Type: Workflow
Priority: High
Automation: Yes

Preconditions:
- Application Setting status = Pending Approval

Steps:
1. Navigate to Approval page
2. Locate pending Application Setting
3. Click "Approve"

Expected:
- Status becomes Active
- Application Setting is visible in Business Configuration

---

### TestCase: WF_APP_002
Title: Reject Application Setting
Type: Workflow
Priority: High
Automation: Yes

Steps:
1. Navigate to Approval page
2. Select pending Application Setting
3. Click "Reject"

Expected:
- Status becomes Rejected
- Application Setting is not activated

---

## Module: Business Setting

### Feature: Business Setting
Route: `/general-setup/business-setting`

---

### TestCase: BS_001
Title: Create Business Setting (Normal)
Type: UI
Priority: High
Automation: Yes

TestData:
- parameterCode: TESTB001
- category: Business
- value: Test Value
- active: true

Steps:
1. Click "Add Business Setting"
2. Fill required fields
3. Click "Create"

Expected:
- Business Setting creation request is submitted
- No server error occurs

---

### TestCase: BS_002
Title: Create Business Setting with missing required fields
Type: UI (Negative)
Priority: High
Automation: Yes

Steps:
1. Click "Add Business Setting"
2. Leave Parameter Code empty
3. Click "Create"

Expected:
- Validation error is displayed
- Data is not saved

---

## Module: Parameter Management

### Feature: Product Parameter
Route: `/parameter-setup/product-parameter`

---

### TestCase: PM_PROD_001
Title: Create Product Parameter (Normal)
Type: UI
Priority: High
Automation: Yes

TestData:
- productCode: TESTPP001
- productGroup: Financing
- currency: IDR
- active: true

Steps:
1. Click "Add Product"
2. Fill required product fields
3. Click "Create"

Expected:
- Product Parameter is created
- Product appears in list

---

### TestCase: PM_PROD_002
Title: Create Product Parameter with duplicate code
Type: UI (Negative)
Priority: High
Automation: Yes

Steps:
1. Attempt to create Product Parameter using existing Product Code

Expected:
- System rejects duplicate
- Error message is displayed

---

## Module: Collective Impairment

### Feature: Segmentation Configuration
Route: `/collective-impairment/segmentation`

---

### TestCase: CI_SEG_001
Title: Create Segmentation Configuration
Type: UI
Priority: High
Automation: Yes

TestData:
- groupSegment: Group Test
- segmentType: PD
- active: true

Steps:
1. Click "Add Segmentation"
2. Fill segmentation fields
3. Click "Create"

Expected:
- Segmentation request is created
- Status becomes Pending Approval

---

## Module: Rule Based Setting

---

### TestCase: CI_RULE_001
Title: Create Rule Based Setting
Type: UI
Priority: High
Automation: Yes

Steps:
1. Click "Add Rule"
2. Define Rule Name and Rule Type
3. Save Rule

Expected:
- Rule is saved
- Rule appears in rule list

---

## Module: Advanced Analytics

### Feature: R Analytics – Dependent Variable

---

### TestCase: AA_DEP_001
Title: Submit Dependent Variable Data
Type: UI
Priority: High
Automation: Yes

Steps:
1. Select Dependent Variable
2. Select Segmentation
3. Click "Submit"

Expected:
- Data preview table is rendered

---

### TestCase: AA_DEP_002
Title: Upload invalid file format
Type: UI (Negative)
Priority: Medium
Automation: Yes

Steps:
1. Upload non-CSV file
2. Click "Submit"

Expected:
- Upload is rejected
- Error message is displayed

---

## Global Automation Rules

- Do not combine CRUD and approval in one test
- Each test case must be independently executable
- Assertions must validate UI state and system behaviour
- Negative tests must assert absence of side effects
- Test data must be deterministic and isolated

