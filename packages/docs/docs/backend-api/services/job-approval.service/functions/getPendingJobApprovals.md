[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: getPendingJobApprovals()

> **getPendingJobApprovals**(`tenantId`): `Promise`\<`object`[]\>

Defined in: [packages/new-backend/src/services/job-approval.service.ts:153](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/job-approval.service.ts#L153)

Get pending job executions awaiting approval.

## Parameters

### tenantId

`string`

The tenant ID

## Returns

`Promise`\<`object`[]\>

A Promise resolving to an array of pending job executions
