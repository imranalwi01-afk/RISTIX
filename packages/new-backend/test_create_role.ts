import { Effect, pipe } from 'effect';
import { rolesRepository } from './src/repositories/rbac.repository';
import { getDatabase } from './src/config/database';

async function test() {
    try {
        const tenantId = 'ccb5f002-c94f-4eb0-a5fb-3ecfb9121a2c'; // use any uuid to pass schema
        const db = getDatabase(tenantId); // Wait! getting the database by UUID?
        
        // Wait, how does getDatabase resolve the tenantId?
        
        const payload = {
            roleName: "MODELER_MAKER",
            roleCode: "MODELER_MAKER",
            description: "Role creation requested for MODELER_MAKER.",
            complianceLevel: "medium",
            hierarchyLevel: 1,
            tenantId: tenantId
        };
        
        console.log("Trying to insert...");
        const result = await Effect.runPromise(rolesRepository.create(db, payload));
        console.log("Inserted:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
