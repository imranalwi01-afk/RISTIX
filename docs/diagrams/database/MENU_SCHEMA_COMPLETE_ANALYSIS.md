# Menu Schema - FINAL ANALYSIS (Old + New Backend)

## 🔍 Complete Backend Analysis

### Old Backend (packages/backend)
**Uses**: `platform_admin.menu_items`

**Evidence**:
```typescript
// packages/backend/src/api/routes/menu.routes.ts (Line 623-624)
const query = includeInactive
  ? 'SELECT * FROM platform_admin.menu_items ORDER BY sort_order'
  : 'SELECT * FROM platform_admin.menu_items WHERE is_active = true ORDER BY sort_order';
```

**Also uses**:
```typescript
// Line 68: INSERT INTO platform_admin.menu_items
// Line 150: UPDATE platform_admin.menu_items  
// Line 217: SELECT COUNT(*) FROM platform_admin.menu_items
// Line 285: SELECT * FROM platform_admin.menu_items
```

### New Backend (packages/new-backend)
**Uses**: `core.menu_items`

**Evidence**:
```typescript
// packages/new-backend/src/db/schema/menu.schema.ts
export const coreSchema = pgSchema('core')
export const menuItems = coreSchema.table('menu_items', { ... })

// packages/new-backend/src/services/menu.service.ts
const items = await db.query.menuItems.findMany({ ... })
```

## 📊 Current Database State

### REMOTE (10.8.0.2:5433)
| Schema | Table | Columns | Rows | Old Backend | New Backend |
|--------|-------|---------|------|-------------|-------------|
| **platform_admin** | menu_items | 27 | 41 | ✅ **ACTIVE** | ❌ |
| **menu** | menu_items | 21 | 28 | ❌ | ❌ |
| **core** | menu_items | 31 | 21 | ❌ | ✅ **ACTIVE** |

### LOCAL (localhost:5432)
| Schema | Table | Columns | Rows | Old Backend | New Backend |
|--------|-------|---------|------|-------------|-------------|
| **core** | menu_items | 31 | ? | ❌ | ✅ **ACTIVE** |

## 🎯 THE PROBLEM

**You have TWO active backends using DIFFERENT schemas:**

1. **Old Backend** → `platform_admin.menu_items` (41 rows, most data)
2. **New Backend** → `core.menu_items` (21 rows, less data)

## ✅ SOLUTION: Migrate to Single Schema

### Option A: Use `platform_admin` (Recommended for Old Backend)
**Pros:**
- ✅ Old backend already uses it
- ✅ Most data (41 rows)
- ✅ No changes needed to old backend
- ❌ Need to update new backend

**Cons:**
- ❌ New backend needs schema changes
- ❌ Less comprehensive (27 columns vs 31)

### Option B: Use `core` (Recommended for New Backend)
**Pros:**
- ✅ New backend already uses it
- ✅ Most comprehensive (31 columns)
- ✅ Better schema design
- ✅ Drizzle schemas already defined
- ❌ Need to update old backend

**Cons:**
- ❌ Old backend needs query changes
- ❌ Less data currently (21 rows vs 41)

### Option C: Keep Both (NOT RECOMMENDED)
**Pros:**
- ✅ No immediate changes needed

**Cons:**
- ❌ Data duplication
- ❌ Sync issues
- ❌ Maintenance nightmare
- ❌ Confusion for developers

## 🎯 RECOMMENDED SOLUTION

### **Use `core` schema as single source of truth**

**Why:**
1. ✅ New backend is the future
2. ✅ Most comprehensive schema (31 columns)
3. ✅ Better design (dedicated schema)
4. ✅ Drizzle ORM support
5. ✅ Old backend can be updated easily

### Migration Steps:

#### Step 1: Migrate Data
```sql
-- Migrate from platform_admin.menu_items → core.menu_items
INSERT INTO core.menu_items (
    id, parent_id, category_id, menu_key, title, menu_name_id,
    url, page_path, external_url, menu_type, level, sort_order,
    icon, badge_text, badge_color, module_name, required_permissions,
    banking_types, banking_type, is_active, is_visible, is_protected,
    opens_in_new_tab, description, tags, created_at, updated_at,
    created_by, tenant_id, version, last_modified_by
)
SELECT 
    id,
    parent_id,
    menu_config_id as category_id,
    key as menu_key,
    title,
    title as menu_name_id,
    url,
    url as page_path,
    CASE WHEN external THEN url ELSE NULL END as external_url,
    type as menu_type,
    level,
    sort_order,
    icon,
    NULL as badge_text,
    NULL as badge_color,
    NULL as module_name,
    CASE 
        WHEN permissions IS NOT NULL THEN 
            ARRAY(SELECT jsonb_array_elements_text(permissions))
        ELSE NULL
    END as required_permissions,
    CASE 
        WHEN banking_types IS NOT NULL THEN 
            ARRAY(SELECT jsonb_array_elements_text(banking_types))
        ELSE ARRAY['conventional', 'syariah']::text[]
    END as banking_types,
    'all' as banking_type,
    is_active,
    TRUE as is_visible,
    FALSE as is_protected,
    external as opens_in_new_tab,
    description,
    NULL as tags,
    created_at,
    updated_at,
    created_by::uuid,
    NULL as tenant_id,
    1 as version,
    updated_by::uuid as last_modified_by
FROM platform_admin.menu_items
WHERE id NOT IN (SELECT id FROM core.menu_items);

-- Also migrate from menu.menu_items if needed
INSERT INTO core.menu_items (
    id, parent_id, category_id, menu_key, title, menu_name_id,
    url, page_path, menu_type, level, sort_order, icon,
    banking_types, is_active, is_visible, created_at, updated_at,
    created_by, tenant_id
)
SELECT 
    id,
    parent_id,
    category_id,
    name as menu_key,
    name as title,
    name as menu_name_id,
    path as url,
    path as page_path,
    CASE WHEN parent_id IS NULL THEN 'group' ELSE 'item' END as menu_type,
    level,
    sort_order,
    icon,
    ARRAY[banking_type]::text[] as banking_types,
    is_active,
    is_visible,
    created_at,
    updated_at,
    created_by,
    tenant_id
FROM menu.menu_items
WHERE id NOT IN (SELECT id FROM core.menu_items);
```

#### Step 2: Update Old Backend
```typescript
// packages/backend/src/api/routes/menu.routes.ts

// BEFORE:
const query = 'SELECT * FROM platform_admin.menu_items ORDER BY sort_order';

// AFTER:
const query = 'SELECT * FROM core.menu_items ORDER BY sort_order';
```

Update all references:
- Line 623-624: Query
- Line 68: INSERT
- Line 150: UPDATE
- Line 217: COUNT
- Line 285: SELECT

#### Step 3: Drop Unused Tables
```sql
-- After migration and verification
DROP TABLE IF EXISTS platform_admin.menu_items CASCADE;
DROP SCHEMA IF EXISTS menu CASCADE;
```

#### Step 4: Verify
```sql
-- Check data
SELECT 'core.menu_items' as source, COUNT(*) FROM core.menu_items;

-- Should have all data (41 + 28 + 21 = ~90 rows after deduplication)
```

## 📋 Migration Checklist

- [ ] Backup all databases
- [ ] Run migration SQL to copy data to core.menu_items
- [ ] Verify data integrity
- [ ] Update old backend queries (5-10 files)
- [ ] Test old backend with core schema
- [ ] Test new backend (should work unchanged)
- [ ] Drop platform_admin.menu_items
- [ ] Drop menu schema
- [ ] Update documentation

## 🚨 Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss | HIGH | Full backup before migration |
| Old backend breaks | HIGH | Test thoroughly, rollback plan |
| Duplicate data | MEDIUM | Use WHERE NOT EXISTS in migration |
| Missing columns | LOW | Map JSONB to arrays carefully |

## ✅ Benefits

1. ✅ Single source of truth
2. ✅ No data duplication
3. ✅ Both backends use same schema
4. ✅ Future-proof (new backend is the future)
5. ✅ Better schema design (31 columns)
6. ✅ Easier maintenance

## 📝 Final Recommendation

**Migrate everything to `core.menu_items`**

1. Migrate data from `platform_admin.menu_items` (41 rows)
2. Migrate data from `menu.menu_items` (28 rows)
3. Update old backend to use `core.menu_items`
4. Drop unused schemas
5. Result: Single `core.menu_items` with ~90 rows (after deduplication)

**Timeline**: 2-4 hours
**Risk**: Medium (with proper backup and testing)
**Benefit**: High (eliminates confusion and duplication)
