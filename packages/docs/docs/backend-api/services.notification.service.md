[**Backend API Reference v1.0.0**](index.md)

***

# services/notification.service

## Variables

### createInAppNotification

> `const` **createInAppNotification**: `Effect`&lt;(`job`, `title`, `message`, `userId`, `actionUrl?`) => `Promise`&lt;`void`&gt;, `never`, `never`&gt;

Defined in: [src/services/notification.service.ts:311](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L311)

Create in-app notification record (stored in DB)

***

### sendEmailNotification

> `const` **sendEmailNotification**: `Effect`&lt;(`job`, `toEmail`, `templateContext`) => `Promise`&lt;`string`&gt;, `never`, `never`&gt;

Defined in: [src/services/notification.service.ts:249](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L249)

Send email notification (called from Bull job handler)

***

### sendWebhookNotification

> `const` **sendWebhookNotification**: `Effect`&lt;(`job`, `webhookUrl`, `payload`) => `Promise`&lt;`Response`&gt;, `never`, `never`&gt;

Defined in: [src/services/notification.service.ts:277](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L277)

Send webhook notification (for external integrations)

## Functions

### getSmtpConfig()

> **getSmtpConfig**(): `Promise`&lt;&#123; `auth`: &#123; `pass`: `any`; `user`: `any`; &#125; &#124; `undefined`; `from`: `any`; `fromName`: `any`; `host`: `any`; `port`: `number`; `secure`: `any`; &#125;&gt;

Defined in: [src/services/notification.service.ts:19](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L19)

#### Returns

`Promise`&lt;&#123; `auth`: &#123; `pass`: `any`; `user`: `any`; &#125; &#124; `undefined`; `from`: `any`; `fromName`: `any`; `host`: `any`; `port`: `number`; `secure`: `any`; &#125;&gt;

***

### notifyApprovalApproved()

> **notifyApprovalApproved**(`workflowId`, `tenantId`, `approvalRequestId`, `requesterUserId`, `requesterEmail`, `approverName`, `workflowName`): `Promise`&lt;`void`&gt;

Defined in: [src/services/notification.service.ts:355](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L355)

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

`Promise`&lt;`void`&gt;

***

### notifyApprovalRejected()

> **notifyApprovalRejected**(`workflowId`, `tenantId`, `approvalRequestId`, `requesterUserId`, `requesterEmail`, `approverName`, `workflowName`, `rejectionReason?`): `Promise`&lt;`void`&gt;

Defined in: [src/services/notification.service.ts:380](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L380)

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

`Promise`&lt;`void`&gt;

***

### notifyApprovalRequested()

> **notifyApprovalRequested**(`workflowId`, `tenantId`, `approvalRequestId`, `approverUserId`, `approverEmail`, `requesterName`, `workflowName`, `approvalUrl`): `Promise`&lt;`void`&gt;

Defined in: [src/services/notification.service.ts:329](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L329)

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

`Promise`&lt;`void`&gt;

***

### sendForgotPasswordEmail()

> **sendForgotPasswordEmail**(`toEmail`, `userName`, `resetUrl`): `Promise`&lt;`void`&gt;

Defined in: [src/services/notification.service.ts:409](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L409)

Send a forgot password email directly

#### Parameters

##### toEmail

`string`

##### userName

`string`

##### resetUrl

`string`

#### Returns

`Promise`&lt;`void`&gt;

***

### testSmtpConnection()

> **testSmtpConnection**(`config`): `Promise`&lt;`boolean`&gt;

Defined in: [src/services/notification.service.ts:66](https://github.com/ifrspro/ifrs9-iaf/blob/bb1ac57ad2b5d07ecfce33a99f28955a8c25940f/packages/new-backend/src/services/notification.service.ts#L66)

#### Parameters

##### config

`any`

#### Returns

`Promise`&lt;`boolean`&gt;
