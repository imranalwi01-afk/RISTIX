[**Backend API Reference v1.0.0**](../../../../README.md)

***

# Variable: workflowsRelations

> `const` **workflowsRelations**: `Relations`\<`"workflows"`, \{ `jobs`: `Many`\<`"workflow_jobs"`\>; `requestedByUser`: `One`\<`"users"`, `false`\>; `tenant`: `One`\<`"tenants"`, `true`\>; `transitions`: `Many`\<`"workflow_transitions"`\>; \}\>

Defined in: [src/db/schema/workflows.schema.ts:149](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/db/schema/workflows.schema.ts#L149)
