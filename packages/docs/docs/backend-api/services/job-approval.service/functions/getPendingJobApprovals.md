[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingJobApprovals()

> **getPendingJobApprovals**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [src/services/job-approval.service.ts:308](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/services/job-approval.service.ts#L308)

Get pending job executions awaiting approval.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Promise`\<`object`[]\>

A Promise resolving to an array of pending job executions
