import { Effect, pipe } from 'effect'
import { JournalParametersRepository } from '../repositories/journal-parameters.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamJournal } from '../db/schema'
import type { ListQuery } from '../lib/http/list-query'

export const JournalParametersService = {
    // CRUD Operations

    /**
     * List all journal parameters.
     * 
     * @returns An Effect resolving to an array of journal parameters
     */
    list: () => {
        console.log('📋 Listing all journal parameters')
        return pipe(
            JournalParametersRepository.findAll(),
            Effect.map(journals => journals.map(transformJournal))
        )
    },

    listPage: (query: ListQuery) => {
        console.log('📋 Listing paged journal parameters', query)
        return pipe(
            JournalParametersRepository.findMany({
                page: query.page,
                offset: query.offset,
                limit: query.limit,
                search: query.search,
                glGroup: typeof query.filters.glGroup === 'string' ? query.filters.glGroup : undefined,
                currency: typeof query.filters.currency === 'string' ? query.filters.currency : undefined,
                activeFlag:
                    typeof query.filters.activeFlag === 'boolean' || typeof query.filters.activeFlag === 'string'
                        ? query.filters.activeFlag
                        : undefined,
                filters: query.filters,
                sort: query.sort,
            }),
            Effect.map(({ journals, total }) => ({
                rows: journals.map(transformJournal),
                total,
            })),
        )
    },

    /**
     * Get a journal parameter by ID.
     * 
     * @param id - The journal parameter ID
     * @returns An Effect resolving to the journal parameter or NotFoundError
     */
    get: (id: number) => {
        console.log(`📄 Getting journal parameter: ${id}`)
        return pipe(
            JournalParametersRepository.findById(BigInt(id)),
            Effect.flatMap(journal =>
                journal
                    ? Effect.succeed(transformJournal(journal))
                    : Effect.fail(new NotFoundError({ message: 'Journal Parameter not found', resource: 'Journal Parameter', id: String(id) }))
            )
        )
    },

    /**
     * Create a new journal parameter.
     * 
     * @param data - The journal parameter data
     * @param userId - The ID of the user creating the parameter
     * @returns An Effect resolving to the created journal parameter
     */
    create: (data: any, userId: string) => {
        console.log(`➕ Creating journal parameter: ${data.glCode}`)
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
            JournalParametersRepository.create(payload as any),
            Effect.map(journal => transformJournal(journal))
        )
    },

    /**
     * Update an existing journal parameter.
     * 
     * @param id - The journal parameter ID
     * @param data - The data to update
     * @param userId - The ID of the user updating the parameter
     * @returns An Effect resolving to the updated journal parameter or NotFoundError
     */
    update: (id: number, data: any, userId: string) => {
        console.log(`✏️ Updating journal parameter: ${id} (${data.glCode})`)
        const now = new Date().toISOString()
        const payload = {
            ...data,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            JournalParametersRepository.update(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformJournal(updated))
                    : Effect.fail(new NotFoundError({ message: 'Journal Parameter not found', resource: 'Journal Parameter', id: String(id) }))
            )
        )
    },

    /**
     * Delete a journal parameter.
     * 
     * @param id - The journal parameter ID
     * @returns An Effect resolving to a success message or NotFoundError
     */
    delete: (id: number) => {
        console.log(`🗑️ Deleting journal parameter: ${id}`)
        return pipe(
            JournalParametersRepository.delete(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Deleted successfully' })
                    : Effect.fail(new NotFoundError({ message: 'Journal Parameter not found', resource: 'Journal Parameter', id: String(id) }))
            )
        )
    },

    // Dropdown Options Helpers

    /**
     * Get dropdown options for a specific parameter code (internal helper).
     */
    getOptions: (paramCode: string) => {
        return pipe(
            ParametersRepository.findHeaderByCode(paramCode),
            Effect.map((param: any) => {
                if (!param || !param.details) return []
                return param.details
                    .filter((d: any) => d.value1 !== null && d.value1 !== '')
                    .map((d: any) => ({
                        id: String(d.value1),
                        name: String(d.value2 ?? d.value1)
                    }))
            })
        )
    },

    /** Get GL Group options */
    getGlGroupOptions: () => JournalParametersService.getOptions('B0004'),
    /** Get Currency options */
    getCurrencyOptions: () => JournalParametersService.getOptions('B0001'),
    /** Get Journal Type options */
    getJournalTypeOptions: () => JournalParametersService.getOptions('B0006'),
    /** Get Journal Code options */
    getJournalCodeOptions: () => JournalParametersService.getOptions('B0008'),
    /** Get Debit/Credit options */
    getDbCrOptions: () => JournalParametersService.getOptions('B0007'),
}

// Helper
const transformJournal = (j: typeof frs9ParamJournal.$inferSelect) => ({
    // Pass specific fields if needed, or return all for now. Schema matches input mostly.
    ...j,
    id: j.pkid,
})
