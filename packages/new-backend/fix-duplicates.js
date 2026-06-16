"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/db");
const rbac_schema_1 = require("./src/db/schema/rbac.schema");
const drizzle_orm_1 = require("drizzle-orm");
async function main() {
    try {
        const db = (0, db_1.getDatabase)();
        console.log('Fetching all permissions...');
        const allPerms = await db.select().from(rbac_schema_1.permissions);
        console.log(`Found ${allPerms.length} total permissions.`);
        const byCode = new Map();
        for (const p of allPerms) {
            if (!byCode.has(p.code)) {
                byCode.set(p.code, []);
            }
            byCode.get(p.code).push(p);
        }
        let duplicatesFound = 0;
        for (const [code, perms] of byCode.entries()) {
            if (perms.length > 1) {
                duplicatesFound++;
                console.log(`Duplicate found for code: ${code} (${perms.length} entries)`);
                // Keep the first one, delete the rest
                const toKeep = perms[0];
                const toDeleteIds = perms.slice(1).map(p => p.id);
                console.log(`  Keeping ID: ${toKeep.id}, Deleting IDs: ${toDeleteIds.join(', ')}`);
                // Re-point role_permissions to the one we keep
                await db.update(rbac_schema_1.rolePermissions)
                    .set({ permissionId: toKeep.id })
                    .where((0, drizzle_orm_1.inArray)(rbac_schema_1.rolePermissions.permissionId, toDeleteIds));
                // Delete duplicates
                await db.delete(rbac_schema_1.permissions)
                    .where((0, drizzle_orm_1.inArray)(rbac_schema_1.permissions.id, toDeleteIds));
                console.log(`  Resolved duplicates for ${code}`);
            }
        }
        if (duplicatesFound === 0) {
            console.log('No duplicate permissions found based on code.');
        }
        else {
            console.log(`Successfully resolved ${duplicatesFound} duplicate permission codes.`);
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
main();
