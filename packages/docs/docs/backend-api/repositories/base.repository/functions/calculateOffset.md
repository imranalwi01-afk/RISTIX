[**Backend API Reference v1.0.0**](../../../README.md)

***

# Function: calculateOffset()

> **calculateOffset**(`page`, `limit`): `number`

Defined in: [src/repositories/base.repository.ts:97](https://github.com/ifrspro/ifrs9-iaf/blob/5a4b2221d62f9d823811e12bfc71b7ff82ae62fa/packages/new-backend/src/repositories/base.repository.ts#L97)

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
