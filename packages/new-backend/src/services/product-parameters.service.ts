import { Effect, pipe } from 'effect'
import { ProductParametersRepository } from '../repositories/product-parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamProduct } from '../db/schema'

export const ProductParametersService = {
    // CRUD Operations
    list: () => {
        return pipe(
            ProductParametersRepository.findAll(),
            Effect.map(products => products.map(transformProduct))
        )
    },

    get: (id: number) => {
        return pipe(
            ProductParametersRepository.findById(BigInt(id)),
            Effect.flatMap(product =>
                product
                    ? Effect.succeed(transformProduct(product))
                    : Effect.fail(new NotFoundError({ resource: 'Product Parameter', id: String(id) }))
            )
        )
    },

    create: (data: any, userId: string) => {
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

    update: (id: number, data: any, userId: string) => {
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

    delete: (id: number) => {
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
