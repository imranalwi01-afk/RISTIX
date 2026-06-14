import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import postgres from 'postgres'
import { getPlatformDatabaseUrl, getTenantDatabaseUrl } from '../src/config/env'

type MenuRow = {
    id: string
    name: string
    path: string | null
    isActive: boolean | null
}

const tenantSql = postgres(getTenantDatabaseUrl(), { max: 1, connect_timeout: 10 })
const platformSql = postgres(getPlatformDatabaseUrl(), { max: 1, connect_timeout: 10 })

const normalizePath = (value: string | null): string => value?.trim().replace(/\/+$/, '') || ''

async function main() {
    const outputDirectory = resolve(process.cwd(), 'artifacts/menu-legacy-retirement')
    await mkdir(outputDirectory, { recursive: true })

    const [legacyCategories, legacyItems, legacyRoleAccess, canonicalCategories, canonicalItems] = await Promise.all([
        tenantSql`select * from core.menu_categories order by display_order, category_name`,
        tenantSql<MenuRow[]>`
            select id::text, title as name, url as path, is_active as "isActive"
            from core.menu_items
            order by sort_order, title
        `,
        tenantSql`select * from core.role_menu_access order by role_id, menu_item_id`,
        platformSql`select * from menu.menu_categories order by sort_order, name`,
        platformSql<MenuRow[]>`
            select id::text, name, path, is_active as "isActive"
            from menu.menu_items
            order by sort_order, name
        `,
    ])

    const canonicalByPath = new Map(canonicalItems.map((item) => [normalizePath(item.path), item]))
    const legacyByPath = new Map(legacyItems.map((item) => [normalizePath(item.path), item]))

    const legacyOnly = legacyItems.filter((item) => !canonicalByPath.has(normalizePath(item.path)))
    const canonicalOnly = canonicalItems.filter((item) => !legacyByPath.has(normalizePath(item.path)))
    const changed = legacyItems.flatMap((legacyItem) => {
        const canonicalItem = canonicalByPath.get(normalizePath(legacyItem.path))
        if (!canonicalItem) return []
        if (legacyItem.name === canonicalItem.name && legacyItem.isActive === canonicalItem.isActive) return []
        return [{ path: normalizePath(legacyItem.path), legacy: legacyItem, canonical: canonicalItem }]
    })

    const generatedAt = new Date().toISOString()
    const report = {
        generatedAt,
        counts: {
            legacyCategories: legacyCategories.length,
            legacyItems: legacyItems.length,
            legacyRoleAccess: legacyRoleAccess.length,
            canonicalCategories: canonicalCategories.length,
            canonicalItems: canonicalItems.length,
        },
        differences: { legacyOnly, canonicalOnly, changed },
    }

    await Promise.all([
        writeFile(resolve(outputDirectory, 'comparison.json'), JSON.stringify(report, null, 2)),
        writeFile(resolve(outputDirectory, 'legacy-menu-categories.json'), JSON.stringify(legacyCategories, null, 2)),
        writeFile(resolve(outputDirectory, 'legacy-menu-items.json'), JSON.stringify(legacyItems, null, 2)),
        writeFile(resolve(outputDirectory, 'legacy-role-menu-access.json'), JSON.stringify(legacyRoleAccess, null, 2)),
    ])

    console.log(JSON.stringify(report, null, 2))
    console.log(`Artifacts written to ${outputDirectory}`)
}

try {
    await main()
} finally {
    await Promise.all([tenantSql.end(), platformSql.end()])
}
