import { Effect, pipe } from 'effect'
import { JournalParametersRepository } from '../repositories/journal-parameters.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamJournal } from '../db/schema'

export const JournalParametersService = {
    // CRUD Operations

    /**
     * List all journal parameters.
     * 
     * @returns An Effect resolving to an array of journal parameters
     */
    list: () => {
        return pipe(
            JournalParametersRepository.findAll(),
            Effect.map(journals => journals.map(transformJournal))
        )
    },

    /**
     * Get a journal parameter by ID.
     * 
     * @param id - The journal parameter ID
     * @returns An Effect resolving to the journal parameter or NotFoundError
     */
    get: (id: number) => {
        return pipe(
            JournalParametersRepository.findById(BigInt(id)),
            Effect.flatMap(journal =>
                journal
                    ? Effect.succeed(transformJournal(journal))
                    : Effect.fail(new NotFoundError({ resource: 'Journal Parameter', id: String(id) }))
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
                    : Effect.fail(new NotFoundError({ resource: 'Journal Parameter', id: String(id) }))
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
        return pipe(
            JournalParametersRepository.delete(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Deleted successfully' })
                    : Effect.fail(new NotFoundError({ resource: 'Journal Parameter', id: String(id) }))
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
                return param.details.map((d: any) => ({
                    id: String(d.value1 || d.paramValue || ''),
                    name: String(d.paramdesc || d.paramDesc || d.value1 || '')
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
