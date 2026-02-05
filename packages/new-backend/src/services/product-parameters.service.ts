import { Effect, pipe } from 'effect'
import { ProductParametersRepository } from '../repositories/product-parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamProduct } from '../db/schema'

export const ProductParametersService = {
    // CRUD Operations

    /**
     * List all product parameters.
     * 
     * @returns An Effect resolving to an array of transformed product parameters
     */
    list: () => {
        console.log('📝 [PROD-SERVICE] Fetching all product parameters');
        return pipe(
            ProductParametersRepository.findAll(),
            Effect.map(products => products.map(transformProduct))
        )
    },

    /**
     * Get a product parameter by ID.
     * 
     * @param id - The product parameter ID
     * @returns An Effect resolving to the product parameter or NotFoundError
     */
    get: (id: number) => {
        console.log(`📝 [PROD-SERVICE] Fetching product parameter ID: ${id}`);
        return pipe(
            ProductParametersRepository.findById(BigInt(id)),
            Effect.flatMap(product =>
                product
                    ? Effect.succeed(transformProduct(product))
                    : Effect.fail(new NotFoundError({ resource: 'Product Parameter', id: String(id) }))
            )
        )
    },

    /**
     * Create a new product parameter.
     * 
     * @param data - The product parameter data
     * @param userId - The ID of the user creating the parameter
     * @returns An Effect resolving to the created product parameter
     */
    create: (data: any, userId: string) => {
        console.log('📝 [PROD-SERVICE] Creating product parameter:', data.prdCode);
        const now = new Date().toISOString()
        const payload = {
            ...data,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            ProductParametersRepository.create(payload as any),
            Effect.map(transformProduct)
        )
    },

    /**
     * Update an existing product parameter.
     * 
     * @param id - The product parameter ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the parameter
     * @returns An Effect resolving to the updated product parameter or NotFoundError
     */
    update: (id: number, data: any, userId: string) => {
        console.log(`📝 [PROD-SERVICE] Updating product parameter ID: ${id}`, data.prdCode);
        const now = new Date().toISOString()
        const payload = {
            ...data,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            ProductParametersRepository.update(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformProduct(updated))
                    : Effect.fail(new NotFoundError({ resource: 'Product Parameter', id: String(id) }))
            )
        )
    },

    /**
     * Delete a product parameter.
     * 
     * @param id - The product parameter ID
     * @returns An Effect resolving to a success message or NotFoundError
     */
    delete: (id: number) => {
        console.log(`📝 [PROD-SERVICE] Deleting product parameter ID: ${id}`);
        return pipe(
            ProductParametersRepository.delete(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Deleted successfully' })
                    : Effect.fail(new NotFoundError({ resource: 'Product Parameter', id: String(id) }))
            )
        )
    },

    // Options Helper

    /** Get instrument class options. */
    getInstrumentClassOptions: () => {
        return Effect.succeed([
            { id: 'A', name: 'Asset' },
            { id: 'L', name: 'Liabilities' }
        ])
    }
}

// Helper
const transformProduct = (p: typeof frs9ParamProduct.$inferSelect) => ({
    ...p,
    id: p.pkid,
})
