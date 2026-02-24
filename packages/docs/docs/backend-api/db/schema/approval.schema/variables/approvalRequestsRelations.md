[**Backend API Reference v1.0.0**](../../../../README.md)

***

# Variable: approvalRequestsRelations

> `const` **approvalRequestsRelations**: `Relations`\<`"approval_requests"`, \{ `actions`: `Many`\<`"approval_actions"`\>; `matrix`: `One`\<`"approval_matrices"`, `false`\>; `notifications`: `Many`\<`"notifications"`\>; `requester`: `One`\<`"users"`, `true`\>; `tenant`: `One`\<`"tenants"`, `true`\>; \}\>

Defined in: [src/db/schema/approval.schema.ts:243](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/db/schema/approval.schema.ts#L243)
