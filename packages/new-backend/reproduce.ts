require('dotenv').config();
const { Effect, pipe } = require('effect');
const { getDatabase } = require('./src/config/database');
const { createRole } = require('./src/services/rbac.service');

async function reproduce() {
    const tenantId = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'; // real tenant id from our DB check
    const data = {
        roleName: "MODELER_MAKER",
        roleCode: "MODELER_MAKER",
        description: "Role creation requested for MODELER_MAKER.",
        complianceLevel: "medium",
        hierarchyLevel: 1,
        tenantId: "iaf", // wait! is tenantId in payload the slug??
        permissions: []
    };
    
    try {
        const { permissions: permCodes, ...roleData } = data;
        const result = await Effect.runPromise(createRole({ ...roleData, tenantId }));
        console.log("Success:", result);
    } catch(err) {
        console.error("Error creating role:", err);
    }
}
reproduce();
