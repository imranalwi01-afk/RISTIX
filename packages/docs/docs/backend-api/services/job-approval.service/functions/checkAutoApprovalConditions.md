[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: checkAutoApprovalConditions()

> **checkAutoApprovalConditions**(`jobDefinitionId`, `tenantId`, `triggeredBy`, `parameters?`): `Promise`\<`boolean`\>

Defined in: [src/services/job-approval.service.ts:325](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/job-approval.service.ts#L325)

Check auto-approval conditions.
Returns true if the job can be auto-approved based on conditions.

## Parameters

### jobDefinitionId

`string`

The job definition ID

### tenantId

`string`

### triggeredBy

`string`

The user who triggered the job

### parameters?

`any`

Job parameters

## Returns

`Promise`\<`boolean`\>

A Promise resolving to true if auto-approval conditions are met
