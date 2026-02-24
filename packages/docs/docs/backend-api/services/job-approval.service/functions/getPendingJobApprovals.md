[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingJobApprovals()

> **getPendingJobApprovals**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/job-approval.service.ts:308](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/job-approval.service.ts#L308)

Get pending job executions awaiting approval.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Promise`\<`object`[]\>

A Promise resolving to an array of pending job executions
