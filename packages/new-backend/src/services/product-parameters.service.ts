import { Effect, pipe } from 'effect'
import { ProductParametersRepository } from '../repositories/product-parameters.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError, ConflictError } from '../lib/errors'
import { frs9ParamProduct } from '../db/schema'

export const ProductParametersService = {
    // CRUD Operations

    /**
     * List all product parameters.
     * 
     * @returns An Effect resolving to an array of transformed product parameters
     */
    /**
     * List product parameters filtered by mode with pagination.
     * 
     * @param mode - The product mode (conventional | sharia)
     * @param options - Pagination and search options
     * @returns An Effect resolving to products and pagination metadata
     */
    list: (mode: string, options: { page: number, limit: number, search?: string }) => {
        console.log(`📝 [PROD-SERVICE] Fetching product parameters for mode: ${mode}, page: ${options.page}, limit: ${options.limit}`);

        return pipe(
            ProductParametersRepository.findMany(options),
            Effect.map(({ products, total }) => ({
                products: products.map(transformProduct),
                pagination: {
                    total,
                    page: options.page,
                    limit: options.limit,
                    pages: Math.ceil(total / options.limit)
                }
            }))
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
                    : Effect.fail(new NotFoundError({ message: 'Product Parameter not found', resource: 'Product Parameter', id: String(id) }))
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
        const { mode, ...dbData } = data
        const now = new Date().toISOString()
        const payload = {
            ...dbData,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }

        return pipe(
            ProductParametersRepository.findByCode(data.prdCode),
            Effect.flatMap(existing =>
                existing
                    ? Effect.fail(new ConflictError({
                        message: `Product Code ${data.prdCode} already exists`,
                        resource: 'Product Parameter',
                        field: 'prdCode',
                        value: data.prdCode
                    }))
                    : (ProductParametersRepository.create(payload as any) as Effect.Effect<any, any>)
            ),
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
        const { mode, ...dbData } = data
        const now = new Date().toISOString()
        const payload = {
            ...dbData,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            ProductParametersRepository.update(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformProduct(updated))
                    : Effect.fail(new NotFoundError({ message: 'Product Parameter not found', resource: 'Product Parameter', id: String(id) }))
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
                    : Effect.fail(new NotFoundError({ message: 'Product Parameter not found', resource: 'Product Parameter', id: String(id) }))
            )
        )
    },

    // Options Helper

    /**
     * Get instrument class options (AL_FLAG field).
     * Dynamically sourced from Business Setting B0003 in FRS9_PARAM_COMMOND.
     * Per tech spec: AL_FLAG = Combo Box (Business Setting 'B0003')
     */
    getInstrumentClassOptions: () => {
        return pipe(
            ParametersRepository.findDetailByCode('B0003'),
            Effect.map(details =>
                details
                    .filter(d => d.value1 !== null && d.value1 !== '')
                    .map(d => ({
                        id: d.value1!,
                        name: d.value2 ?? d.value1!,
                    }))
            )
        )
    }
}

// Helper
const transformProduct = (p: typeof frs9ParamProduct.$inferSelect) => {
    try {
        return {
            ...p,
            id: p.pkid,
            pkid: p.pkid,
            // Safely convert dates to ISO strings for JSON serialization and Zod validation
            // If the date is a string that's not ISO, new Date() might handle it, 
            // but we should catch failures to avoid crashing the whole list.
            createddate: p.createddate ? safeIsoDate(p.createddate) : null,
            updateddate: p.updateddate ? safeIsoDate(p.updateddate) : null,
        }
    } catch (e) {
        console.error(`❌ [PROD-SERVICE] Error transforming product ${p.pkid}:`, e);
        // Return a minimally valid object so the whole list doesn't fail
        return {
            ...p,
            id: p.pkid,
            pkid: p.pkid,
            createddate: null,
            updateddate: null
        }
    }
}

function safeIsoDate(dateVal: any): string | null {
    try {
        const d = new Date(dateVal);
        return isNaN(d.getTime()) ? null : d.toISOString();
    } catch {
        return null;
    }
}
