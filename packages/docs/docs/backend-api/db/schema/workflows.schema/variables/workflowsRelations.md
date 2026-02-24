[**Backend API Reference v1.0.0**](../../../../README.md)

***

# Variable: workflowsRelations

> `const` **workflowsRelations**: `Relations`\<`"workflows"`, \{ `jobs`: `Many`\<`"workflow_jobs"`\>; `requestedByUser`: `One`\<`"users"`, `false`\>; `tenant`: `One`\<`"tenants"`, `true`\>; `transitions`: `Many`\<`"workflow_transitions"`\>; \}\>

Defined in: [src/db/schema/workflows.schema.ts:149](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/db/schema/workflows.schema.ts#L149)
