[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: checkAutoApprovalConditions()

> **checkAutoApprovalConditions**(`jobDefinitionId`, `triggeredBy`, `parameters?`): `Promise`\<`boolean`\>

Defined in: [packages/new-backend/src/services/job-approval.service.ts:170](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/job-approval.service.ts#L170)

Check auto-approval conditions.
Returns true if the job can be auto-approved based on conditions.

## Parameters

### jobDefinitionId

`string`

The job definition ID

### triggeredBy

`string`

The user who triggered the job

### parameters?

`any`

Job parameters

## Returns

`Promise`\<`boolean`\>

A Promise resolving to true if auto-approval conditions are met
