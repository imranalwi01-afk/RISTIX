[**Backend API Reference v1.0.0**](../../../../README.md)

***

# Variable: notificationsRelations

> `const` **notificationsRelations**: `Relations`\<`"notifications"`, \{ `approvalRequest`: `One`\<`"approval_requests"`, `false`\>; `deliveries`: `Many`\<`"notification_deliveries"`\>; `tenant`: `One`\<`"tenants"`, `true`\>; `triggerUser`: `One`\<`"users"`, `false`\>; \}\>

Defined in: [src/db/schema/approval.schema.ts:275](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/db/schema/approval.schema.ts#L275)
