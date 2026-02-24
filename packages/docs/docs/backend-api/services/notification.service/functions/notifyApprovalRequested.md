[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: notifyApprovalRequested()

> **notifyApprovalRequested**(`workflowId`, `tenantId`, `approvalRequestId`, `approverUserId`, `approverEmail`, `requesterName`, `workflowName`, `approvalUrl`): `Promise`\<`void`\>

Defined in: [src/services/notification.service.ts:244](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/services/notification.service.ts#L244)

Queue approval notification (called from approval service)
This adds the job to Bull queue; actual sending happens in job handler

## Parameters

### workflowId

`string`

### tenantId

`string`

### approvalRequestId

`string`

### approverUserId

`string`

### approverEmail

`string`

### requesterName

`string`

### workflowName

`string`

### approvalUrl

`string`

## Returns

`Promise`\<`void`\>
