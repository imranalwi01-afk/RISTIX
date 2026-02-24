[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: calculateOffset()

> **calculateOffset**(`page`, `limit`): `number`

Defined in: [src/repositories/base.repository.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/cf4905123c7eb3e9046f36ce3f92dd13536ac238/packages/new-backend/src/repositories/base.repository.ts#L97)

Calculate the database query 'offset' from page and limit.

## Parameters

### page

`number`

1-based page index

### limit

`number`

Number of items per page

## Returns

`number`

The calculate offset index
