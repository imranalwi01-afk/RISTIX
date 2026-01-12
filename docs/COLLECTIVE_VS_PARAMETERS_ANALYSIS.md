# Collective vs Parameters Overlap Analysis

**Generated:** 2026-01-11  
**Purpose:** Identify and resolve overlapping functionality between `/collective` and `/parameters` routes

---

## Executive Summary

**Pattern Found:** `/parameters` contains **re-export wrappers** that simply import and re-export pages from `/collective`

**Recommendation:** **Consolidate to `/collective`** and remove redundant `/parameters` wrappers

---

## Detailed Overlap Analysis

### 1. Direct Re-Exports (Confirmed Duplicates)

These `/parameters` pages are just 5-6 line wrappers that re-export `/collective` pages:

| Parameters Route | Collective Route | Lines | Type |
|-----------------|------------------|-------|------|
| `/parameters/fl-scalar` | `/collective/fl-scalar` | 5 vs 792 | Re-export |
| `/parameters/pd-configurations` | `/collective/pd-setup` | 5 vs 468 | Re-export |
| `/parameters/lgd-configurations` | `/collective/lgd-setup` | 5 vs ? | Re-export |
| `/parameters/ead-configurations` | `/collective/ead-setup` | 5 vs ? | Re-export |
| `/parameters/ecl-configurations` | `/collective/ecl-config` | 5 vs ? | Re-export |

**Pattern:**
```typescript
'use client';

import OriginalPage from '../../collective/original-name/page';

export default OriginalPage;
```

---

### 2. Unique Pages (No Overlap)

#### In `/collective` Only:
- ✅ `bucket` - Bucket parameter management
- ✅ `collective-parameter` - Collective parameters
- ✅ `rule-base` - Rule-based configurations
- ✅ `segmentation` - Segmentation setup

#### In `/parameters` Only:
- ✅ `app-settings` - Application settings
- ✅ `business-settings` - Business settings
- ✅ `journal` - Journal parameters
- ✅ `product` - Product parameters
- ✅ `risk` - Risk parameters
- ✅ `lgd` - LGD parameters (different from lgd-configurations)

---

## Routing Confusion

### Current Structure (Confusing):
```
/banking/collective/pd-setup          ← Real implementation
/banking/parameters/pd-configurations ← Just re-exports above

/banking/collective/fl-scalar         ← Real implementation  
/banking/parameters/fl-scalar         ← Just re-exports above
```

### Problems:
1. **Two URLs for same page** - Confusing for users
2. **Maintenance burden** - Need to update both routes
3. **Inconsistent naming** - `pd-setup` vs `pd-configurations`
4. **SEO issues** - Duplicate content
5. **Navigation confusion** - Which link to use in menus?

---

## Recommended Consolidation

### Option 1: Keep `/collective` (Recommended) ✅

**Rationale:**
- `/collective` contains the actual implementations
- More descriptive name for IFRS9 collective impairment
- Aligns with banking terminology

**Actions:**
1. Delete re-export wrappers in `/parameters`
2. Update menu links to point to `/collective`
3. Add redirects if needed for bookmarks

**Delete:**
- `/parameters/fl-scalar/`
- `/parameters/pd-configurations/`
- `/parameters/lgd-configurations/`
- `/parameters/ead-configurations/`
- `/parameters/ecl-configurations/`

---

### Option 2: Move to `/parameters` (Alternative)

**Rationale:**
- `/parameters` is more generic
- Better for non-IFRS9 parameters
- Clearer hierarchy

**Actions:**
1. Move implementations from `/collective` to `/parameters`
2. Rename for consistency
3. Update all imports and routes

**Not Recommended** - More work, less clear for IFRS9 context

---

## Detailed File Analysis

### FL Scalar
- **Collective:** 792 lines - Full CRUD implementation
- **Parameters:** 5 lines - Re-export wrapper
- **Verdict:** DELETE `/parameters/fl-scalar`

### PD Configurations
- **Collective (`pd-setup`):** 468 lines - Full implementation
- **Parameters (`pd-configurations`):** 5 lines - Re-export wrapper
- **Verdict:** DELETE `/parameters/pd-configurations`

### LGD Configurations
- **Collective (`lgd-setup`):** Full implementation
- **Parameters (`lgd-configurations`):** Re-export wrapper
- **Verdict:** DELETE `/parameters/lgd-configurations`

### EAD Configurations
- **Collective (`ead-setup`):** Full implementation
- **Parameters (`ead-configurations`):** Re-export wrapper
- **Verdict:** DELETE `/parameters/ead-configurations`

### ECL Configurations
- **Collective (`ecl-config`):** Full implementation
- **Parameters (`ecl-configurations`):** Re-export wrapper
- **Verdict:** DELETE `/parameters/ecl-configurations`

---

## Proposed Directory Structure

### After Cleanup:

```
/banking/collective/
  ├── bucket/              ← Bucket parameters
  ├── collective-parameter/ ← Collective params
  ├── ead-setup/           ← EAD model setup
  ├── ecl-config/          ← ECL configuration
  ├── fl-scalar/           ← Forward looking scalars
  ├── lgd-setup/           ← LGD model setup
  ├── pd-setup/            ← PD model setup
  ├── rule-base/           ← Rule-based config
  └── segmentation/        ← Segmentation setup

/banking/parameters/
  ├── app-settings/        ← Application settings
  ├── business-settings/   ← Business settings
  ├── journal/             ← Journal parameters
  ├── lgd/                 ← LGD parameters (different)
  ├── product/             ← Product parameters
  └── risk/                ← Risk parameters
```

**Clear Separation:**
- `/collective` = IFRS9 Collective Impairment Models & Configurations
- `/parameters` = General Application & Business Parameters

---

## Implementation Steps

### Step 1: Identify All Re-Exports
```bash
find packages/frontend/src/app/banking/parameters -name "page.tsx" -exec grep -l "from.*collective" {} \;
```

### Step 2: Delete Re-Export Wrappers
```bash
rm -rf packages/frontend/src/app/banking/parameters/fl-scalar
rm -rf packages/frontend/src/app/banking/parameters/pd-configurations
rm -rf packages/frontend/src/app/banking/parameters/lgd-configurations
rm -rf packages/frontend/src/app/banking/parameters/ead-configurations
rm -rf packages/frontend/src/app/banking/parameters/ecl-configurations
```

### Step 3: Update Menu Links
Update menu configuration to point to `/collective` routes:
- `/banking/collective/pd-setup` (not `/parameters/pd-configurations`)
- `/banking/collective/lgd-setup` (not `/parameters/lgd-configurations`)
- `/banking/collective/ead-setup` (not `/parameters/ead-configurations`)
- `/banking/collective/ecl-config` (not `/parameters/ecl-configurations`)
- `/banking/collective/fl-scalar` (not `/parameters/fl-scalar`)

### Step 4: Add Redirects (Optional)
If users have bookmarks, add Next.js redirects in `next.config.js`:
```javascript
redirects: [
  {
    source: '/banking/parameters/pd-configurations',
    destination: '/banking/collective/pd-setup',
    permanent: true
  },
  // ... other redirects
]
```

---

## Impact Assessment

### Files to Delete: 5 directories
- Total lines removed: ~25 lines (all re-exports)
- Risk level: ✅ **ZERO** - Just wrappers

### Benefits:
1. ✅ **Clearer routing** - One URL per page
2. ✅ **Easier maintenance** - Single source of truth
3. ✅ **Better UX** - No confusion about which URL to use
4. ✅ **Cleaner codebase** - Remove unnecessary wrappers
5. ✅ **Better SEO** - No duplicate content

### Risks:
1. ⚠️ **Broken bookmarks** - Users with saved `/parameters` URLs
2. ⚠️ **Menu links** - Need to update menu configuration
3. ⚠️ **Documentation** - Update any docs referencing old URLs

**Mitigation:** Add redirects for backward compatibility

---

## Conclusion

**Recommendation:** **DELETE all re-export wrappers in `/parameters`**

The `/parameters` directory should only contain:
- Application settings
- Business settings  
- Journal parameters
- Product parameters
- Risk parameters
- General LGD parameters (not model configurations)

The `/collective` directory should contain:
- All IFRS9 collective impairment model configurations
- PD, LGD, EAD model setups
- ECL configurations
- FL scalars
- Bucket parameters
- Segmentation

This creates a clear, logical separation and eliminates confusion.

---

**Report prepared by:** Antigravity AI  
**Date:** 2026-01-11  
**Branch:** cleanup/unused-code-documentation
