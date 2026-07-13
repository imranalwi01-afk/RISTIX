# Menu Schema - Final Decision

## 🎯 CONFIRMED: Use `core` Schema

### Evidence from Backend Code

**The new-backend ALREADY uses `core` schema for menu tables:**

```typescript
// packages/new-backend/src/db/schema/menu.schema.ts
export const coreSchema = pgSchema('core')

export const menuCategories = coreSchema.table('menu_categories', { ... })
export const menuItems = coreSchema.table('menu_items', { ... })
```

**Active Usage:**

```typescript
// packages/new-backend/src/services/menu.service.ts
import { menuItems, roleMenuAccess } from '@/db/schema/menu.schema'

// Line 62: Queries core.menu_items
const items = await db.query.menuItems.findMany({ ... })
```

## 📊 Current State

### LOCAL (localhost:5432)

| Schema   | Table           | Columns | Status                   |
| -------- | --------------- | ------- | ------------------------ |
| **core** | menu_items      | 31      | ✅ **ACTIVE IN BACKEND** |
| **core** | menu_categories | 10      | ✅ **ACTIVE IN BACKEND** |

### REMOTE (172.25.0.25:5432)

| Schema             | Table           | Columns | Rows | Status                 |
| ------------------ | --------------- | ------- | ---- | ---------------------- |
| **core**           | menu_items      | 31      | 21   | ✅ Backend uses this   |
| **core**           | menu_categories | 10      | 0    | ⚠️ Empty               |
| **menu**           | menu_items      | 21      | 28   | ❌ Not used by backend |
| **menu**           | menu_categories | 12      | 6    | ❌ Not used by backend |
| **platform_admin** | menu_items      | 27      | 41   | ❌ Not used by backend |

## ✅ Decision: Keep `core` Schema

### Reasons:

1. ✅ **Backend already uses it** - `coreSchema.table('menu_items')`
2. ✅ **Most comprehensive** - 31 columns with all features
3. ✅ **Drizzle schemas defined** - Full type safety
4. ✅ **Services implemented** - `menu.service.ts` uses it
5. ✅ **Routes active** - `/menu/hierarchy` endpoint works

### What to Do:

#### 1. **Keep `core` schema tables** ✅

- `core.menu_items` (31 columns)
- `core.menu_categories` (10 columns)
- `core.role_menu_access`
- `core.menu_user_customization`
- `core.menu_access_log`

#### 2. **Migrate data TO `core` schema**

Since `core.menu_categories` is empty and `menu.menu_categories` has 6 rows:

```sql
-- Migrate categories from menu → core
INSERT INTO core.menu_categories (
    id, category_key, category_name, category_name_id,
    description, icon_name, display_order, is_active,
    created_at, updated_at
)
SELECT
    id,
    'cat_' || id::text as category_key,
    name as category_name,
    name as category_name_id,
    description,
    icon as icon_name,
    sort_order as display_order,
    is_active,
    created_at,
    updated_at
FROM menu.menu_categories
WHERE id NOT IN (SELECT id FROM core.menu_categories);

-- Migrate menu items if needed (check for missing data)
-- Compare core.menu_items (21 rows) vs menu.menu_items (28 rows)
-- vs platform_admin.menu_items (41 rows)
```

#### 3. **Drop unused schemas** ❌

After migration:

```sql
-- Drop menu schema (not used by backend)
DROP SCHEMA IF EXISTS menu CASCADE;

-- Drop platform_admin.menu_items (not used by backend)
DROP TABLE IF EXISTS platform_admin.menu_items CASCADE;
```

## 🔧 Action Plan

### Step 1: Verify Backend Usage ✅ CONFIRMED

- ✅ Backend uses `core.menu_items`
- ✅ Drizzle schema defined in `menu.schema.ts`
- ✅ Service layer uses it
- ✅ Routes active

### Step 2: Migrate Missing Data

```sql
-- Check what's in each table
SELECT 'core.menu_items' as source, COUNT(*) FROM core.menu_items;          -- 21
SELECT 'menu.menu_items' as source, COUNT(*) FROM menu.menu_items;          -- 28
SELECT 'platform_admin.menu_items' as source, COUNT(*) FROM platform_admin.menu_items; -- 41

-- Find unique items in menu schema
SELECT m.*
FROM menu.menu_items m
LEFT JOIN core.menu_items c ON c.title = m.name
WHERE c.id IS NULL;

-- Find unique items in platform_admin schema
SELECT p.*
FROM platform_admin.menu_items p
LEFT JOIN core.menu_items c ON c.title = p.title
WHERE c.id IS NULL;
```

### Step 3: Migrate Data

```sql
-- Migrate from menu.menu_items → core.menu_items
-- Migrate from platform_admin.menu_items → core.menu_items
-- (Detailed migration script needed based on data analysis)
```

### Step 4: Clean Up

```sql
-- Drop unused schemas
DROP SCHEMA IF EXISTS menu CASCADE;
DROP TABLE IF EXISTS platform_admin.menu_items CASCADE;
```

## 📝 Summary

**KEEP:** `core` schema (backend uses it)
**MIGRATE:** Data from `menu` and `platform_admin` schemas
**DROP:** `menu` schema and `platform_admin.menu_items` after migration

## ✅ Why This is Correct

1. **Backend Evidence**: Code explicitly uses `coreSchema.table('menu_items')`
2. **Type Safety**: Drizzle schemas already defined for `core` tables
3. **Active Routes**: `/menu/hierarchy` endpoint uses `core.menu_items`
4. **Comprehensive**: 31 columns vs 21 (menu) vs 27 (platform_admin)
5. **Future-Proof**: All features needed for menu system

## 🚨 Important

**DO NOT delete `core.menu_items`** - it's actively used by the backend!

The `menu` schema and `platform_admin.menu_items` are legacy/unused tables that should be migrated and removed.
