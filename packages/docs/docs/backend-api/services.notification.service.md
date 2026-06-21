[**Backend API Reference v1.0.0**](index.md)

***

# services/notification.service

## Variables

### createInAppNotification

> `const` **createInAppNotification**: `Effect`{`<`}(`job`, `title`, `message`, `userId`, `actionUrl?`) => `Promise`{`<`}`void`{`>`}, `never`, `never`{`>`}

Defined in: [src/services/notification.service.ts:226](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L226)

Create in-app notification record (stored in DB)

***

### sendEmailNotification

> `const` **sendEmailNotification**: `Effect`{`<`}(`job`, `toEmail`, `templateContext`) => `Promise`{`<`}`string`{`>`}, `never`, `never`{`>`}

Defined in: [src/services/notification.service.ts:164](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L164)

Send email notification (called from Bull job handler)

***

### sendWebhookNotification

> `const` **sendWebhookNotification**: `Effect`{`<`}(`job`, `webhookUrl`, `payload`) => `Promise`{`<`}`Response`{`>`}, `never`, `never`{`>`}

Defined in: [src/services/notification.service.ts:192](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L192)

Send webhook notification (for external integrations)

## Functions

### notifyApprovalApproved()

> **notifyApprovalApproved**(`workflowId`, `tenantId`, `approvalRequestId`, `requesterUserId`, `requesterEmail`, `approverName`, `workflowName`): `Promise`{`<`}`void`{`>`}

Defined in: [src/services/notification.service.ts:270](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L270)

#### Parameters

##### workflowId

`string`

##### tenantId

`string`

##### approvalRequestId

`string`

##### requesterUserId

`string`

##### requesterEmail

`string`

##### approverName

`string`

##### workflowName

`string`

#### Returns

`Promise`{`<`}`void`{`>`}

***

### notifyApprovalRejected()

> **notifyApprovalRejected**(`workflowId`, `tenantId`, `approvalRequestId`, `requesterUserId`, `requesterEmail`, `approverName`, `workflowName`, `rejectionReason?`): `Promise`{`<`}`void`{`>`}

Defined in: [src/services/notification.service.ts:295](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L295)

#### Parameters

##### workflowId

`string`

##### tenantId

`string`

##### approvalRequestId

`string`

##### requesterUserId

`string`

##### requesterEmail

`string`

##### approverName

`string`

##### workflowName

`string`

##### rejectionReason?

`string`

#### Returns

`Promise`{`<`}`void`{`>`}

***

### notifyApprovalRequested()

> **notifyApprovalRequested**(`workflowId`, `tenantId`, `approvalRequestId`, `approverUserId`, `approverEmail`, `requesterName`, `workflowName`, `approvalUrl`): `Promise`{`<`}`void`{`>`}

Defined in: [src/services/notification.service.ts:244](https://github.com/ifrspro/ifrs9-iaf/blob/4458eb912394f1ae1de02c71ac49eb0c2b8c73a8/packages/new-backend/src/services/notification.service.ts#L244)

Queue approval notification (called from approval service)
This adds the job to Bull queue; actual sending happens in job handler

#### Parameters

##### workflowId

`string`

##### tenantId

`string`

##### approvalRequestId

`string`

##### approverUserId

`string`

##### approverEmail

`string`

##### requesterName

`string`

##### workflowName

`string`

##### approvalUrl

`string`

#### Returns

`Promise`{`<`}`void`{`>`}
