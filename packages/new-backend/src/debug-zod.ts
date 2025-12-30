
import { z } from '@hono/zod-openapi'

console.log('--- Starting Debug Script ---')
try {
    const schema = z.string().openapi({ example: 'test' })
    console.log('Schema created successfully', schema)
} catch (e) {
    console.error('Error creating schema:', e)
}

try {
    const schema2 = z.string().datetime().openapi({ example: '2020-01-01T00:00:00Z' })
    console.log('Datetime schema created successfully', schema2)
} catch (e) {
    console.error('Error creating datetime schema:', e)
}
console.log('--- End Debug Script ---')
