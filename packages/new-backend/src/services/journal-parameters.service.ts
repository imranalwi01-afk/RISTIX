import { Effect, pipe } from 'effect'
import { JournalParametersRepository } from '../repositories/journal-parameters.repository'
import { ParametersRepository } from '../repositories/parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamJournal } from '../db/schema'

export const JournalParametersService = {
    // CRUD Operations
    list: () => {
        return pipe(
            JournalParametersRepository.findAll(),
            Effect.map(journals => journals.map(transformJournal))
        )
    },

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

    getGlGroupOptions: () => JournalParametersService.getOptions('B0004'),
    getCurrencyOptions: () => JournalParametersService.getOptions('B0001'),
    getJournalTypeOptions: () => JournalParametersService.getOptions('B0006'),
    getJournalCodeOptions: () => JournalParametersService.getOptions('B0008'),
    getDbCrOptions: () => JournalParametersService.getOptions('B0007'),
}

// Helper
const transformJournal = (j: typeof frs9ParamJournal.$inferSelect) => ({
    // Pass specific fields if needed, or return all for now. Schema matches input mostly.
    ...j,
    id: j.pkid,
})
