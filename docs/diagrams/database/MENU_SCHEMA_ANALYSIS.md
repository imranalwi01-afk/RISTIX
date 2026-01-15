# Menu Schema Overlap Analysis & Recommendation

## Problem

There are **3 different menu_items tables** in the REMOTE platform_admin database:

| Schema | Table | Columns | Rows | Purpose |
|--------|-------|---------|------|---------|
| **core** | menu_items | 31 | 21 | Legacy/old menu system |
| **core** | menu_categories | 10 | 0 | Legacy categories (EMPTY) |
| **menu** | menu_items | 21 | 28 | Modern menu system |
| **menu** | menu_categories | 12 | 6 | Modern categories |
| **platform_admin** | menu_items | 27 | 41 | Platform-specific menus |

## Analysis

### 1. core.menu_items (31 columns, 21 rows)
**Characteristics:**
- Most comprehensive schema (31 columns)
- Has advanced features: `required_permissions`, `banking_types`, `tags`, `version`
- Multi-tenant support: `tenant_id`
- Rich metadata: `badge_text`, `badge_color`, `module_name`
- **Status**: Appears to be the NEWEST/MOST COMPLETE design

### 2. menu.menu_items (21 columns, 28 rows)
**Characteristics:**
- Simpler schema (21 columns)
- Basic menu functionality
- Has `component` field for dynamic rendering
- **Status**: Mid-level, production menu system

### 3. platform_admin.menu_items (27 columns, 41 rows)
**Characteristics:**
- Platform-specific (27 columns)
- JSONB fields: `permissions`, `user_types`, `banking_types`, `visibility_rules`, `metadata`
- Most flexible with JSONB
- **Most rows (41)** - actively used
- **Status**: Currently ACTIVE platform menu

## 📊 Data Distribution

```
platform_admin.menu_items: 41 rows ████████████████████ (MOST DATA)
menu.menu_items:           28 rows █████████████
core.menu_items:           21 rows ██████████
```

## 🎯 Recommendation

### **Keep: `menu` schema** (Modern, Production-Ready)

**Reasons:**
1. ✅ **Dedicated schema** - Clean separation of concerns
2. ✅ **Production data** - 28 active menu items + 6 categories
3. ✅ **Balanced design** - Not too simple, not over-engineered
4. ✅ **Component-based** - Supports dynamic rendering
5. ✅ **Multi-tenant ready** - Has `tenant_id`

### **Migrate from: `platform_admin.menu_items`**

**Action:**
- Migrate 41 rows from `platform_admin.menu_items` → `menu.menu_items`
- Map JSONB fields to appropriate columns
- This is the ACTIVE data that needs to be preserved

### **Deprecate: `core` schema menu tables**

**Reasons:**
1. ❌ `core.menu_categories` is EMPTY (0 rows)
2. ❌ Over-engineered (31 columns) - too complex
3. ❌ Fewer rows (21) - less actively used
4. ❌ Mixed with other core entities (users, roles) - poor separation

## 🔧 Migration Plan

### Step 1: Analyze Data Overlap
```sql
-- Check if there's overlap between the 3 tables
SELECT 
    'core' as source,
    title,
    url
FROM core.menu_items
UNION ALL
SELECT 
    'menu' as source,
    name as title,
    path as url
FROM menu.menu_items
UNION ALL
SELECT 
    'platform_admin' as source,
    title,
    url
FROM platform_admin.menu_items
ORDER BY title;
```

### Step 2: Migrate platform_admin → menu
```sql
-- Migrate platform_admin.menu_items to menu.menu_items
INSERT INTO menu.menu_items (
    id, tenant_id, category_id, parent_id,
    name, description, path, icon, component,
    external_url, sort_order, level,
    is_active, is_visible, is_external, requires_auth,
    banking_type, created_at, updated_at, created_by, updated_by
)
SELECT 
    id,
    NULL as tenant_id, -- Set appropriately
    menu_config_id as category_id,
    parent_id,
    title as name,
    description,
    url as path,
    icon,
    component,
    CASE WHEN external THEN url ELSE NULL END as external_url,
    sort_order,
    level,
    is_active,
    TRUE as is_visible,
    external as is_external,
    TRUE as requires_auth,
    banking_types->>'type' as banking_type, -- Extract from JSONB
    created_at,
    updated_at,
    created_by::uuid,
    updated_by::uuid
FROM platform_admin.menu_items
WHERE id NOT IN (SELECT id FROM menu.menu_items); -- Avoid duplicates
```

### Step 3: Drop Deprecated Tables
```sql
-- After migration is verified
DROP TABLE IF EXISTS core.menu_items CASCADE;
DROP TABLE IF EXISTS core.menu_categories CASCADE;
DROP TABLE IF EXISTS platform_admin.menu_items CASCADE;
```

### Step 4: Update Backend Code
```typescript
// Use menu schema only
import { menuDb } from '@/config/database'

// Get menu items
const menuItems = await platformDb.query.menu.menu_items.findMany()

// Get categories
const categories = await platformDb.query.menu.menu_categories.findMany()
```

## 📋 Decision Matrix

| Criteria | core | menu | platform_admin |
|----------|------|------|----------------|
| **Data Volume** | 21 rows | 28 rows | 41 rows ⭐ |
| **Schema Design** | Over-engineered | Balanced ⭐ | Flexible |
| **Separation** | Mixed | Dedicated ⭐ | Dedicated ⭐ |
| **Active Use** | Low | Medium | High ⭐ |
| **Maintainability** | Complex | Simple ⭐ | Medium |
| **Categories** | Empty ❌ | 6 rows ⭐ | N/A |

**Winner: `menu` schema** (most balanced + dedicated + has categories)

## 🎯 Final Recommendation

1. **PRIMARY**: Use `menu` schema for all menu operations
2. **MIGRATE**: Move `platform_admin.menu_items` data → `menu.menu_items`
3. **DEPRECATE**: Drop `core.menu_items` and `core.menu_categories`
4. **CLEANUP**: Remove `platform_admin.menu_items` after migration

## 📝 Implementation Steps

### For LOCAL Database
```bash
# 1. Import menu schema from remote (if not already done)
# 2. Drop core menu tables
PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d ifrspro_platform_admin << 'EOF'
DROP TABLE IF EXISTS core.menu_items CASCADE;
DROP TABLE IF EXISTS core.menu_categories CASCADE;
EOF
```

### For REMOTE Database
```bash
# 1. Migrate platform_admin.menu_items → menu.menu_items
# 2. Verify migration
# 3. Drop deprecated tables
```

## ✅ Benefits

1. ✅ **Single source of truth** - Only `menu` schema
2. ✅ **Clean architecture** - Dedicated menu schema
3. ✅ **All data preserved** - Migrate from platform_admin
4. ✅ **Simpler codebase** - One schema to maintain
5. ✅ **Better performance** - No confusion, clear queries

## 🚨 Risks

- ⚠️ Need to migrate 41 rows from platform_admin
- ⚠️ JSONB fields need proper mapping
- ⚠️ Existing code may reference core.menu_items

## 📌 Conclusion

**Use `menu` schema as the single source of truth for all menu operations.**

Migrate data from `platform_admin.menu_items` and deprecate `core` menu tables.
