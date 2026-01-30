# Complete Route Structure Analysis: /setup vs /parameters vs /collective

**Generated:** 2026-01-11  
**Purpose:** Comprehensive analysis of overlapping and unique routes across three directories

---

## Executive Summary

**Three Directory Structure Found:**
1. `/setup` - Legacy-compatible full-featured implementations
2. `/parameters` - Mix of simple implementations and re-export wrappers
3. `/collective` - IFRS9 collective impairment model configurations

**Key Finding:** `/parameters` contains **two types** of pages:
- **Type A:** Simple standalone implementations (app-settings, business-settings, journal, product, risk, lgd)
- **Type B:** Re-export wrappers pointing to `/collective` (pd-configurations, lgd-configurations, ead-configurations, ecl-configurations, fl-scalar)

---

## Complete Directory Comparison

### 📁 `/setup` Directory (Legacy-Compatible)

| Page | Lines | Purpose | Features |
|------|-------|---------|----------|
| `application` | 1,342 | Application settings | Full DataTables replica, column filters, export (XLSX/CSV/PDF), master-detail |
| `business` | ~1,300 | Business settings | Full DataTables replica, similar to application |
| `bucket-parameter` | ? | Bucket parameters | Legacy implementation |
| `rule-base` | ? | Rule-based config | Legacy implementation |

**Characteristics:**
- ✅ **Full-featured** - Complete legacy ASP.NET replicas
- ✅ **DataTables-style** - Column-wise search, sorting, pagination
- ✅ **Export capabilities** - XLSX, XLS, CSV, PDF
- ✅ **Master-detail** - Expandable detail rows
- ✅ **Role-based permissions** - ViewBag-style permission checks
- ⚠️ **Large codebase** - 1,300+ lines per page

---

### 📁 `/parameters` Directory (Mixed)

#### Type A: Standalone Implementations

| Page | Lines | Purpose | Relationship |
|------|-------|---------|--------------|
| `app-settings` | 330 | Application settings | **DUPLICATE** of `/setup/application` (simpler) |
| `business-settings` | ~330 | Business settings | **DUPLICATE** of `/setup/business` (simpler) |
| `journal` | ? | Journal parameters | **UNIQUE** |
| `product` | ? | Product parameters | **UNIQUE** |
| `risk` | ? | Risk parameters | **UNIQUE** |
| `lgd` | ? | LGD parameters | **UNIQUE** (different from lgd-configurations) |

**Characteristics:**
- ✅ **Simpler** - Modern React implementation
- ✅ **Cleaner code** - ~300-400 lines
- ✅ **MUI DataGrid** - Modern component
- ❌ **Less features** - No column filters, limited export
- ❌ **Simpler UI** - Basic CRUD only

#### Type B: Re-Export Wrappers (Point to `/collective`)

| Page | Lines | Points To |
|------|-------|-----------|
| `pd-configurations` | 5 | `/collective/pd-setup` |
| `lgd-configurations` | 5 | `/collective/lgd-setup` |
| `ead-configurations` | 5 | `/collective/ead-setup` |
| `ecl-configurations` | 5 | `/collective/ecl-config` |
| `fl-scalar` | 5 | `/collective/fl-scalar` |

**Pattern:**
```typescript
'use client';
import OriginalPage from '../../collective/original/page';
export default OriginalPage;
```

---

### 📁 `/collective` Directory (IFRS9 Models)

| Page | Lines | Purpose |
|------|-------|---------|
| `pd-setup` | 468 | PD model configuration |
| `lgd-setup` | ~400 | LGD model configuration |
| `ead-setup` | ~400 | EAD model configuration |
| `ecl-config` | ~300 | ECL configuration |
| `fl-scalar` | 792 | Forward looking scalars |
| `bucket` | ? | Bucket parameters |
| `collective-parameter` | ? | Collective parameters |
| `rule-base` | ? | Rule-based configuration |
| `segmentation` | ? | Segmentation setup |

**Characteristics:**
- ✅ **IFRS9-specific** - Collective impairment models
- ✅ **Full implementations** - Complete CRUD
- ✅ **Model-focused** - PD, LGD, EAD configurations
- ✅ **No duplicates** - Original implementations

---

## Overlap Analysis

### 1. Application Settings Overlap

| Route | Lines | Type | Recommendation |
|-------|-------|------|----------------|
| `/setup/application` | 1,342 | Full-featured legacy replica | **KEEP** (if you need all features) |
| `/parameters/app-settings` | 330 | Simple modern version | **DELETE** (redundant) |

**Differences:**
- `/setup/application`: Column filters, export (4 formats), DataTables-style, permissions
- `/parameters/app-settings`: Basic CRUD, simple DataGrid, no export

**Decision Needed:** Which features do you actually use?

---

### 2. Business Settings Overlap

| Route | Lines | Type | Recommendation |
|-------|-------|------|----------------|
| `/setup/business` | ~1,300 | Full-featured legacy replica | **KEEP** (if you need all features) |
| `/parameters/business-settings` | ~330 | Simple modern version | **DELETE** (redundant) |

**Same pattern as Application Settings**

---

### 3. IFRS9 Model Configurations (Already Analyzed)

| Parameters Route | Collective Route | Recommendation |
|-----------------|------------------|----------------|
| `/parameters/pd-configurations` | `/collective/pd-setup` | **DELETE** wrapper |
| `/parameters/lgd-configurations` | `/collective/lgd-setup` | **DELETE** wrapper |
| `/parameters/ead-configurations` | `/collective/ead-setup` | **DELETE** wrapper |
| `/parameters/ecl-configurations` | `/collective/ecl-config` | **DELETE** wrapper |
| `/parameters/fl-scalar` | `/collective/fl-scalar` | **DELETE** wrapper |

---

## Recommended Consolidation Strategy

### Phase 1: Delete Re-Export Wrappers (Low Risk) ✅

**Delete from `/parameters`:**
```bash
rm -rf packages/frontend/src/app/banking/parameters/pd-configurations
rm -rf packages/frontend/src/app/banking/parameters/lgd-configurations
rm -rf packages/frontend/src/app/banking/parameters/ead-configurations
rm -rf packages/frontend/src/app/banking/parameters/ecl-configurations
rm -rf packages/frontend/src/app/banking/parameters/fl-scalar
```

**Impact:** Zero - just removes 5-line wrappers

---

### Phase 2: Decide on Application/Business Settings (Needs Decision) ⚠️

**Option A: Keep `/setup` (Full-Featured)** ✅ RECOMMENDED

**Pros:**
- Complete legacy feature parity
- All export formats (XLSX, XLS, CSV, PDF)
- Column-wise filtering
- DataTables-style interface (familiar to users)
- Role-based permissions

**Cons:**
- Larger codebase (1,300+ lines)
- More complex to maintain

**Action:**
```bash
# Delete simpler versions
rm -rf packages/frontend/src/app/banking/parameters/app-settings
rm -rf packages/frontend/src/app/banking/parameters/business-settings
```

---

**Option B: Keep `/parameters` (Modern & Simple)**

**Pros:**
- Cleaner, modern code (~330 lines)
- Easier to maintain
- Modern MUI DataGrid
- Simpler UI

**Cons:**
- Missing features (column filters, export formats)
- Less feature parity with legacy
- May need to add features later

**Action:**
```bash
# Delete legacy versions
rm -rf packages/frontend/src/app/banking/setup/application
rm -rf packages/frontend/src/app/banking/setup/business
```

---

**Option C: Hybrid Approach** (NOT RECOMMENDED)

Keep both and use different routes for different purposes. This creates confusion.

---

### Phase 3: Final Directory Structure

#### After Consolidation (Recommended):

```
/banking/setup/
  ├── application/         ← Full-featured app settings
  ├── business/            ← Full-featured business settings
  ├── bucket-parameter/    ← Bucket parameters
  └── rule-base/           ← Rule-based config

/banking/parameters/
  ├── journal/             ← Journal parameters (unique)
  ├── product/             ← Product parameters (unique)
  ├── risk/                ← Risk parameters (unique)
  └── lgd/                 ← LGD parameters (unique, different from model config)

/banking/collective/
  ├── pd-setup/            ← PD model configuration
  ├── lgd-setup/           ← LGD model configuration
  ├── ead-setup/           ← EAD model configuration
  ├── ecl-config/          ← ECL configuration
  ├── fl-scalar/           ← Forward looking scalars
  ├── bucket/              ← Bucket parameters
  ├── collective-parameter/ ← Collective parameters
  ├── rule-base/           ← Rule-based configuration
  └── segmentation/        ← Segmentation setup
```

**Clear Separation:**
- `/setup` = Full-featured legacy-compatible settings
- `/parameters` = Unique parameter configurations
- `/collective` = IFRS9 collective impairment models

---

## Summary of Overlaps

| Overlap Type | Count | Action |
|--------------|-------|--------|
| Re-export wrappers | 5 | **DELETE** (pd, lgd, ead, ecl, fl-scalar configs) |
| Duplicate implementations | 2 | **DECIDE** (app-settings, business-settings) |
| Unique pages | 10+ | **KEEP** all |

---

## Questions for Decision

### 1. Application & Business Settings

**Which version do you actually use in production?**
- [ ] `/setup/application` (1,342 lines, full-featured)
- [ ] `/parameters/app-settings` (330 lines, simple)
- [ ] Both (need to consolidate)

**Which features do you need?**
- [ ] Column-wise filtering
- [ ] Export to XLSX/XLS/CSV/PDF
- [ ] DataTables-style pagination
- [ ] Role-based permissions
- [ ] Master-detail expandable rows

**If you need all features:** Keep `/setup`, delete `/parameters` versions  
**If you only need basic CRUD:** Keep `/parameters`, delete `/setup` versions

---

### 2. Menu Configuration

**Which URLs should appear in your menu?**
- For Application Settings: `/setup/application` OR `/parameters/app-settings`?
- For Business Settings: `/setup/business` OR `/parameters/business-settings`?
- For PD Configuration: `/collective/pd-setup` (NOT `/parameters/pd-configurations`)
- For LGD Configuration: `/collective/lgd-setup` (NOT `/parameters/lgd-configurations`)

---

## Immediate Actions (Safe to Execute)

### 1. Delete Re-Export Wrappers (Zero Risk)

```bash
cd /Users/antoniusjoshua/PARA/Project/personal/ifrs9-iaf

# Delete IFRS9 model configuration wrappers
rm -rf packages/frontend/src/app/banking/parameters/pd-configurations
rm -rf packages/frontend/src/app/banking/parameters/lgd-configurations
rm -rf packages/frontend/src/app/banking/parameters/ead-configurations
rm -rf packages/frontend/src/app/banking/parameters/ecl-configurations
rm -rf packages/frontend/src/app/banking/parameters/fl-scalar

git add -A
git commit -m "chore: remove IFRS9 model configuration re-export wrappers

- Deleted 5 wrapper pages that just re-exported /collective pages
- Use /collective routes directly for PD, LGD, EAD, ECL, FL Scalar
- Reduces confusion and maintenance burden"
```

**Impact:** Removes 5 unnecessary wrapper files (~25 lines total)

---

### 2. Update Menu Links (After Deletion)

Update your menu configuration to use `/collective` routes:
- ❌ `/banking/parameters/pd-configurations`
- ✅ `/banking/collective/pd-setup`

- ❌ `/banking/parameters/lgd-configurations`
- ✅ `/banking/collective/lgd-setup`

- ❌ `/banking/parameters/ead-configurations`
- ✅ `/banking/collective/ead-setup`

- ❌ `/banking/parameters/ecl-configurations`
- ✅ `/banking/collective/ecl-config`

- ❌ `/banking/parameters/fl-scalar`
- ✅ `/banking/collective/fl-scalar`

---

## Deferred Actions (Need Decision)

### 1. Application Settings Consolidation

**After you decide which version to keep:**

**If keeping `/setup/application`:**
```bash
rm -rf packages/frontend/src/app/banking/parameters/app-settings
```

**If keeping `/parameters/app-settings`:**
```bash
rm -rf packages/frontend/src/app/banking/setup/application
```

---

### 2. Business Settings Consolidation

**After you decide which version to keep:**

**If keeping `/setup/business`:**
```bash
rm -rf packages/frontend/src/app/banking/parameters/business-settings
```

**If keeping `/parameters/business-settings`:**
```bash
rm -rf packages/frontend/src/app/banking/setup/business
```

---

## Conclusion

**Immediate Actions:**
1. ✅ **DELETE** 5 re-export wrappers in `/parameters` (safe, zero risk)
2. ✅ **UPDATE** menu links to point to `/collective` for IFRS9 models

**Pending Decisions:**
1. ⚠️ **DECIDE** which version of Application Settings to keep
2. ⚠️ **DECIDE** which version of Business Settings to keep

**Recommendation:**
- **Keep `/setup`** versions if you need full legacy feature parity
- **Keep `/parameters`** versions if you prefer simpler modern implementation
- **Don't keep both** - creates confusion and maintenance burden

---

**Report prepared by:** Antigravity AI  
**Date:** 2026-01-11  
**Branch:** cleanup/unused-code-documentation
