[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: requiresApproval()

> **requiresApproval**(`jobDefinitionId`, `tenantId`): `Promise`\<`boolean`\>

Defined in: [src/services/job-approval.service.ts:23](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-approval.service.ts#L23)

Check if a job requires approval before execution.

## Parameters

### jobDefinitionId

`string`

The ID of the job definition

### tenantId

`string`

## Returns

`Promise`\<`boolean`\>

A Promise resolving to true if approval is required
