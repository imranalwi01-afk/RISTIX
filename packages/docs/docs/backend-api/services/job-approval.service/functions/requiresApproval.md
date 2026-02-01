[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: requiresApproval()

> **requiresApproval**(`jobDefinitionId`): `Promise`\<`boolean`\>

Defined in: [packages/new-backend/src/services/job-approval.service.ts:14](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/job-approval.service.ts#L14)

Check if a job requires approval before execution.

## Parameters

### jobDefinitionId

`string`

The ID of the job definition

## Returns

`Promise`\<`boolean`\>

A Promise resolving to true if approval is required
