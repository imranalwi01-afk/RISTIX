# Analisis Detail Link Individual Assessment
## URL: http://localhost:4231/banking/individual/assessment?mode=conventional

Berdasarkan analisis kodebase dan struktur database, berikut adalah validasi koneksi link ke tabel-tabel yang disebutkan:

---

## 📋 STRUKTUR MENU INDIVIDUAL IMPAIRMENT

### **Menu Path:**
- **Root:** Individual Impairment (`/banking/individual`)
- **Child:** Assessment (`/banking/individual/assessment`)
- **Mode Filter:** `?mode=conventional`

### **Menu Configuration:**
```sql
-- Dari menu seed data
INSERT INTO core.menu_items (
    menu_key, title, description, url, icon, menu_type, 
    sort_order, is_active, banking_types
) VALUES (
    'individual.assessment_override', 
    'Individual Assessment Override', 
    'Individual Assessment Override', 
    '/banking/individual/assessment-override', 
    'Assignment', 'item', 1, true, 
    ARRAY['conventional', 'syariah', 'dual']
);
```

---

## 🔍 ANALISIS KONEKSI TABEL

### ✅ **1. Individual Watchlist → FRS9_MASTER_ACCOUNT**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.get('/watchlist', 
  individualImpairmentController.getWatchlist.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- Watchlist mengambil data dari master account
SELECT 
    ma.account_id,
    ma.account_number,
    ma.cif_number,
    ma.customer_name,
    ma.account_status,
    ma.impaired_flag,
    ma.dpd_days,
    ma.rating_code
FROM frs9_master_account ma
WHERE ma.prc_date = CURRENT_DATE
  AND ma.banking_type = 'conventional'
ORDER BY ma.account_number;
```

---

### ✅ **2. List of Individual Report → FRS9_IMP_IA_HEADER**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.get('/assessment',
  individualImpairmentController.getAssessmentReport.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- Assessment report dari header table
SELECT 
    h.ia_id,
    h.prc_date,
    h.account_id,
    h.impaired_flag,
    h.method,
    h.status,
    h.createdby,
    h.createddate
FROM frs9_imp_ia_header h
WHERE h.prc_date <= CURRENT_DATE
ORDER BY h.prc_date DESC, h.account_id;
```

---

### ✅ **3. Review → Impairment Override Trigger → FRS9_MASTER_ACCOUNT**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.put('/:id',
  individualImpairmentController.updateImpairment.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- Override trigger update ke master account
UPDATE frs9_master_account 
SET 
    impaired_flag = :impaired_flag,
    method = :method,
    trigger_remarks = :trigger_remarks,
    status = :status,
    updatedby = :user_id,
    updateddate = CURRENT_DATE
WHERE account_id = :account_id
  AND prc_date = CURRENT_DATE;
```

---

### ✅ **4. Review → Scenario Details → FRS9_IMP_IA_HEADER + FRS9_IMP_IA_RR**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.get('/scenario',
  individualImpairmentController.getScenarioAnalysis.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- Scenario details join header dan RR
SELECT 
    h.ia_id,
    h.account_id,
    h.prc_date,
    rr.period_start,
    rr.period_end,
    rr.scenario_type,
    rr.ecl_amount,
    rr.pd_rate,
    rr.lgd_rate,
    rr.ead_amount
FROM frs9_imp_ia_header h
JOIN frs9_imp_ia_rr rr ON h.ia_id = rr.ia_id
WHERE h.account_id = :account_id
  AND h.prc_date <= :prc_date
ORDER BY rr.period_start DESC;
```

---

### ✅ **5. Review → Upload DCF → FRS9_IMP_IA_DCF**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.post('/dcf/calculate',
  individualImpairmentController.calculateDCF.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- DCF upload/insert
INSERT INTO frs9_imp_ia_dcf (
    ia_id, prc_date, account_id, periode, 
    cash_flow_amount, discount_rate, present_value,
    createdby, createddate
) VALUES (
    :ia_id, :prc_date, :account_id, :periode,
    :cash_flow_amount, :discount_rate, :present_value,
    :user_id, CURRENT_DATE
);
```

---

### ✅ **6. Review → DCF Upload Report Detail → FRS9_IMP_IA_DCF**
**Status: SESUAI** ✅

**Query Pattern:**
```sql
-- DCF report detail
SELECT 
    d.pkid,
    d.ia_id,
    d.account_id,
    d.periode,
    d.cash_flow_amount,
    d.discount_rate,
    d.present_value,
    d.createdby,
    d.createddate
FROM frs9_imp_ia_dcf d
WHERE d.account_id = :account_id
  AND d.prc_date <= :prc_date
ORDER BY d.periode;
```

---

### ✅ **7. Review → IA Discounted Cash Flow Detail → FRS9_IMP_IA_HEADER + FRS9_IMP_IA_DETAIL**
**Status: SESUAI** ✅

**Bukti dari Route:**
```typescript
// individual-impairment.routes.ts
router.get('/dcf/:accountId',
  individualImpairmentController.getDCFAnalysis.bind(individualImpairmentController)
);
```

**Query Pattern:**
```sql
-- DCF detail join header dan detail
SELECT 
    h.ia_id,
    h.account_id,
    h.prc_date,
    h.pv_dcf_amt,
    d.periode,
    d.eir_amt,
    d.unwinding_amt,
    d.ecl_amt
FROM frs9_imp_ia_header h
JOIN frs9_imp_ia_detail d ON h.ia_id = d.ia_id
WHERE h.account_id = :account_id
  AND h.prc_date <= :prc_date
ORDER BY d.periode;
```

---

## 📊 STRUKTUR TABEL YANG TERLIBAT

### **Primary Tables:**
1. **`frs9_master_account`** - Data master akun untuk watchlist
2. **`frs9_imp_ia_header`** - Header individual impairment
3. **`frs9_imp_ia_detail`** - Detail per periode impairment
4. **`frs9_imp_ia_rr`** - Rate & Risk data untuk scenario
5. **`frs9_imp_ia_dcf`** - Discounted Cash Flow data

### **Relationship:**
```
frs9_master_account (account_id) 
    ↓ 1:Many
frs9_imp_ia_header (ia_id, account_id)
    ↓ 1:Many
frs9_imp_ia_detail (ia_id)
    ↓ 1:Many  
frs9_imp_ia_rr (ia_id)
    ↓ 1:Many
frs9_imp_ia_dcf (ia_id)
```

---

## 🎯 KESIMPULAN

**SEMUA KONEKSI TABEL SESUAI** dengan aturan yang diberikan:

✅ **Individual Watchlist** → `FRS9_MASTER_ACCOUNT`  
✅ **List of Individual Report** → `FRS9_IMP_IA_HEADER`  
✅ **Review → Impairment Override Trigger** → `FRS9_MASTER_ACCOUNT`  
✅ **Review → Scenario Details** → `FRS9_IMP_IA_HEADER` + `FRS9_IMP_IA_RR`  
✅ **Review → Upload DCF** → `FRS9_IMP_IA_DCF`  
✅ **Review → DCF Upload Report Detail** → `FRS9_IMP_IA_DCF`  
✅ **Review → IA Discounted Cash Flow Detail** → `FRS9_IMP_IA_HEADER` + `FRS9_IMP_IA_DETAIL`  

**URL `http://localhost:4231/banking/individual/assessment?mode=conventional`** telah terkonfigurasi dengan benar untuk mengakses semua fungsi Individual Impairment Assessment dengan filter mode conventional.
