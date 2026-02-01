[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: notifyApprovalRequested()

> **notifyApprovalRequested**(`workflowId`, `tenantId`, `approvalRequestId`, `approverUserId`, `approverEmail`, `requesterName`, `workflowName`, `approvalUrl`): `Promise`\<`void`\>

Defined in: [packages/new-backend/src/services/notification.service.ts:244](https://github.com/ifrspro/ifrs9-iaf/blob/2c233b31171a451bb86daacd4389a961f1213deb/packages/new-backend/src/services/notification.service.ts#L244)

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
