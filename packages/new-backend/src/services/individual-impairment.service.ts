import { Effect, pipe } from 'effect'
import { MasterAccountRepository } from '../repositories/master-account.repository'
import { frs9MasterAccount } from '../db/schema'

export const IndividualImpairmentService = {
    /**
     * Get the individual impairment watchlist.
     * 
     * @param options - Pagination, filtering, and sorting options
     * @param options.page - Page number
     * @param options.limit - Items per page
     * @param options.search - Search term
     * @param options.filter - Filter criteria (stage, impaired_flag, assessment_status)
     * @param options.sort - Sort criteria (field, order)
     * @returns An Effect resolving to a paginated response with transformed watchlist items
     */
    getWatchlist: (options: {
        page: number
        limit: number
        search?: string
        filter?: any
        sort?: any
    }) => {
        return pipe(
            MasterAccountRepository.findAll({
                page: options.page,
                limit: options.limit,
                search: options.search,
                stage: options.filter?.stage,
                impairedFlag: options.filter?.impaired_flag,
                assessmentStatus: options.filter?.assessment_status,
                sortField: options.sort?.field,
                sortOrder: options.sort?.order
            }),
            Effect.map(({ data, total }) => ({
                success: true,
                data: data.map(transformWatchlistItem),
                pagination: {
                    page: options.page,
                    limit: options.limit,
                    total,
                    totalPages: Math.ceil(total / options.limit)
                }
            }))
        )
    }
}

const transformWatchlistItem = (item: typeof frs9MasterAccount.$inferSelect) => ({
    pkid: Number(item.pkid), // Ensure number
    cif_number: item.cifNumber || '',
    cif_name: item.cifName || '',
    account_id: Number(item.accountId),
    account_number: item.accountNumber || '',
    currency: item.currency || 'IDR',
    outstanding_balance: Number(item.outstanding || 0),
    stage: Number(item.stage || 1),
    ecl_amount: Number(item.eclFinalAmt || 0),
    impaired_flag: item.impairedFlag ? 'I' : 'N',
    rating_code: item.internalRatingCode || '',
    assessment_status: 'PENDING', // Default as it's not in Master Account

    // Additional fields required by frontend interface
    prc_date: item.prcDate || new Date().toISOString(),
    eff_date: item.prcDate || new Date().toISOString(),
    eff_interest_rate: Number(item.effInterestRate || 0),
    interest_rate: Number(item.interestRate || 0),
    dpd: Number(item.dpd || 0),
    collectability: Number(item.collectability || 1),
    method: 'DCF', // Default
    provision_amount: Number(item.eclFinalAmt || 0),
    last_review_date: new Date().toISOString(),
    next_review_date: new Date().toISOString(),
    assigned_analyst: 'System',
    priority_level: 'MEDIUM',
    createdby: 'System',
    createddate: new Date().toISOString()
})
