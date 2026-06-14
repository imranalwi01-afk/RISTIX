import postgres from 'postgres'
import { getPlatformDatabaseUrl } from '../src/config/env'

const platformSql = postgres(getPlatformDatabaseUrl(), { max: 1, connect_timeout: 10 })
const retiredPath = '/banking/maintenance/menus'

try {
    const result = await platformSql.begin(async (sql) => {
        const items = await sql<{ id: string }[]>`
            select id::text
            from menu.menu_items
            where path = ${retiredPath}
        `

        if (items.length === 0) {
            return { removedItems: 0, removedAnalytics: 0 }
        }

        const itemIds = items.map((item) => item.id)
        const analytics = await sql`
            delete from menu.menu_analytics
            where menu_item_id = any(${itemIds}::uuid[])
            returning id
        `
        const removedItems = await sql`
            delete from menu.menu_items
            where id = any(${itemIds}::uuid[])
            returning id
        `

        return {
            removedItems: removedItems.length,
            removedAnalytics: analytics.length,
        }
    })

    console.log(JSON.stringify({ path: retiredPath, ...result }, null, 2))
} finally {
    await platformSql.end()
}
