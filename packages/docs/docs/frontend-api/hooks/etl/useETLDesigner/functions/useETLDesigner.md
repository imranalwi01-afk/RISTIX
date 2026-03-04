[**Frontend API Reference v1.0.0**](../../../../README.md)

***

# Function: useETLDesigner()

> **useETLDesigner**(): `object`

Defined in: [hooks/etl/useETLDesigner.ts:5](https://github.com/ifrspro/ifrs9-iaf/blob/2301badfc5ea65510b50f0438f532e45a5ab486b/packages/frontend/src/hooks/etl/useETLDesigner.ts#L5)

## Returns

`object`

### currentWorkflow

> **currentWorkflow**: `null`

### error

> **error**: `string` \| `null`

### executeWorkflow()

> **executeWorkflow**: (`workflowId`) => `Promise`\<`string`\>

#### Parameters

##### workflowId

`string`

#### Returns

`Promise`\<`string`\>

### loading

> **loading**: `boolean`

### loadWorkflow()

> **loadWorkflow**: () => `void`

#### Returns

`void`

### pauseExecution()

> **pauseExecution**: () => `void`

#### Returns

`void`

### saveWorkflow()

> **saveWorkflow**: (`name`, `description`, `definition`) => `Promise`\<`void`\>

#### Parameters

##### name

`string`

##### description

`string`

##### definition

`any`

#### Returns

`Promise`\<`void`\>

### stopExecution()

> **stopExecution**: () => `void`

#### Returns

`void`

### validateWorkflow()

> **validateWorkflow**: () => `void`

#### Returns

`void`
