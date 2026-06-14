
import postgres from 'postgres'
import { getPlatformDatabaseUrl, getTenantDatabaseUrl } from './src/config/env'

const tenantSql = postgres(getTenantDatabaseUrl(), { max: 1 })
const platformSql = postgres(getPlatformDatabaseUrl(), { max: 1 })

async function main() {
    try {
        console.log('Checking roles...');
        const roles = await tenantSql`
            SELECT *
            FROM core.roles
            WHERE role_code LIKE '%BANK_CRO%' OR role_name LIKE '%CRO%'
        `
        console.log('Roles found:', roles)

        if (roles.length > 0) {
            const roleId = roles[0].id
            console.log(`Checking canonical menu permissions for role ID: ${roleId}`)

            const access = await platformSql`
                SELECT mp.*, mi.name, mi.path
                FROM menu.menu_permissions mp
                JOIN menu.menu_items mi ON mp.menu_item_id = mi.id
                WHERE mp.role_id = ${roleId}
            `
            console.log('Menu access:', access)
        } else {
            console.log('No CRO role found!')
        }
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await Promise.all([tenantSql.end(), platformSql.end()])
    }
}

main()
