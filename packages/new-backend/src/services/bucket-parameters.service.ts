import { Effect, pipe } from 'effect'
import { BucketParametersRepository } from '../repositories/bucket-parameters.repository'
import { NotFoundError } from '../lib/errors'
import { frs9ParamBucketh, frs9ParamBucketd } from '../db/schema'

/**
 * Service for managing Bucket Parameters.
 * Handles business logic for bucket headers and details.
 */
export const BucketParametersService = {
    // Header Methods

    /**
     * List bucket headers with optional search and filtering.
     * 
     * @param query - Query parameters for search and filtering
     * @returns A promise resolving to an array of bucket headers
     */
    listHeaders: (query: { search?: string; basis?: string }) => {
        return pipe(
            BucketParametersRepository.findHeaders(query.search, query.basis),
            Effect.map(headers => headers.map(transformHeader))
        )
    },

    /**
     * Get a bucket header by ID.
     * 
     * @param id - The ID of the bucket header
     * @returns A promise resolving to the bucket header
     * @throws NotFoundError if the header is not found
     */
    getHeader: (id: number) => {
        return pipe(
            BucketParametersRepository.findHeaderById(BigInt(id)),
            Effect.flatMap(header =>
                header
                    ? Effect.succeed(transformHeader(header))
                    : Effect.fail(new NotFoundError({ message: 'Bucket Header not found', resource: 'Bucket Header', id: String(id) }))
            )
        )
    },

    /**
     * Create a new bucket header.
     * 
     * @param data - The data for the new bucket header
     * @param userId - The ID of the user creating the header
     * @returns A promise resolving to the created bucket header
     */
    createHeader: (data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            bucketGroup: data.bucket_group,
            bucketDesc: data.bucket_group_desc || '',
            basis: data.basis,
            closedFlag: data.include_close,
            woFlag: data.include_wo,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            BucketParametersRepository.createHeader(payload as any),
            Effect.map(transformHeader)
        )
    },

    /**
     * Update an existing bucket header.
     * 
     * @param id - The ID of the bucket header to update
     * @param data - The updated data
     * @param userId - The ID of the user updating the header
     * @returns A promise resolving to the updated bucket header
     * @throws NotFoundError if the header is not found
     */
    updateHeader: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            bucketGroup: data.bucket_group,
            bucketDesc: data.bucket_group_desc,
            basis: data.basis,
            closedFlag: data.include_close,
            woFlag: data.include_wo,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        // Remove undefined fields
        Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key])

        return pipe(
            BucketParametersRepository.updateHeader(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformHeader(updated))
                    : Effect.fail(new NotFoundError({ message: 'Bucket Header not found', resource: 'Bucket Header', id: String(id) }))
            )
        )
    },

    /**
     * Delete a bucket header.
     * 
     * @param id - The ID of the bucket header to delete
     * @returns A promise resolving to a success message
     */
    deleteHeader: (id: number) => {
        return pipe(
            BucketParametersRepository.deleteHeader(BigInt(id)),
            Effect.map(() => ({ message: 'Deleted successfully' }))
        )
    },

    // Detail Methods

    /**
     * List details for a specific bucket header.
     * 
     * @param headerId - The ID of the bucket header
     * @returns A promise resolving to an array of bucket details
     */
    listDetails: (headerId: number) => {
        return pipe(
            BucketParametersRepository.findDetailsByHeaderId(BigInt(headerId)),
            Effect.map(details => details.map(transformDetail))
        )
    },

    /**
     * Create a new bucket detail.
     * 
     * @param headerId - The ID of the parent bucket header
     * @param data - The data for the new bucket detail
     * @param userId - The ID of the user creating the detail
     * @returns A promise resolving to the created bucket detail
     */
    createDetail: (headerId: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            pkidHeader: headerId,
            bucketName: data.bucket_name,
            rangeStart: data.range_start,
            rangeEnd: data.range_end,
            bucketId: data.seq,
            createdby: userId,
            createdhost: 'localhost',
            createddate: now,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        return pipe(
            BucketParametersRepository.createDetail(payload as any),
            Effect.map(transformDetail)
        )
    },

    /**
     * Update an existing bucket detail.
     * 
     * @param id - The ID of the bucket detail to update
     * @param data - The updated data
     * @param userId - The ID of the user updating the detail
     * @returns A promise resolving to the updated bucket detail
     * @throws NotFoundError if the detail is not found
     */
    updateDetail: (id: number, data: any, userId: string) => {
        const now = new Date().toISOString()
        const payload = {
            bucketName: data.bucket_name,
            rangeStart: data.range_start,
            rangeEnd: data.range_end,
            bucketId: data.seq,
            updatedby: userId,
            updatedhost: 'localhost',
            updateddate: now
        }
        Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key])

        return pipe(
            BucketParametersRepository.updateDetail(BigInt(id), payload as any),
            Effect.flatMap(updated =>
                updated
                    ? Effect.succeed(transformDetail(updated))
                    : Effect.fail(new NotFoundError({ message: 'Bucket Detail not found', resource: 'Bucket Detail', id: String(id) }))
            )
        )
    },

    /**
     * Delete a bucket detail.
     * 
     * @param id - The ID of the bucket detail to delete
     * @returns A promise resolving to a success message
     * @throws NotFoundError if the detail is not found
     */
    deleteDetail: (id: number) => {
        return pipe(
            BucketParametersRepository.deleteDetail(BigInt(id)),
            Effect.flatMap(deleted =>
                deleted
                    ? Effect.succeed({ message: 'Detail deleted' })
                    : Effect.fail(new NotFoundError({ message: 'Bucket Detail not found', resource: 'Bucket Detail', id: String(id) }))
            )
        )
    }
}

// Helpers
const transformHeader = (header: typeof frs9ParamBucketh.$inferSelect) => ({
    id: Number(header.pkid),
    bucket_group: header.bucketGroup,
    bucket_group_desc: header.bucketDesc,
    basis: header.basis || 'D',
    include_close: header.closedFlag,
    include_wo: header.woFlag,
    active_flag: true, // Legacy compatibility
    created_by: header.createdby,
    updated_by: header.updatedby,
    created_date: header.createddate,
    updated_date: header.updateddate,
})

const transformDetail = (detail: typeof frs9ParamBucketd.$inferSelect) => ({
    id: Number(detail.pkid),
    bucket_id: detail.pkidHeader,
    bucket_name: detail.bucketName,
    range_start: detail.rangeStart,
    range_end: detail.rangeEnd,
    seq: detail.bucketId,
    active_flag: true,
    created_by: detail.createdby,
    updated_by: detail.updatedby,
    created_date: detail.createddate,
    updated_date: detail.updateddate,
})
