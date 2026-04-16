import { eq } from 'drizzle-orm'
import { legacyDb } from '../config'
import { frs9ParamCommonh, frs9ParamCommond } from '../db/schema'

const REPORT_DEBUG_PARAM_CODE = 'SDBGREPO'
const REPORT_DEBUG_PARAM_SEQ = 1

export interface ReportDebugConfig {
    enabled: boolean
    source: 'db' | 'default'
    paramCode: string
}

const toBoolean = (value: unknown): boolean => String(value).trim().toLowerCase() === 'true'

const nowIso = () => new Date().toISOString()

export const reportDebugSettingsService = {
    async getConfig(): Promise<ReportDebugConfig> {
        const detail = await legacyDb.query.frs9ParamCommond.findFirst({
            where: eq(frs9ParamCommond.paramCode, REPORT_DEBUG_PARAM_CODE),
            orderBy: [frs9ParamCommond.paramSeq],
        })

        if (!detail) {
            return {
                enabled: false,
                source: 'default',
                paramCode: REPORT_DEBUG_PARAM_CODE,
            }
        }

        return {
            enabled: toBoolean(detail.value1),
            source: 'db',
            paramCode: REPORT_DEBUG_PARAM_CODE,
        }
    },

    async setEnabled(enabled: boolean, userId: string): Promise<ReportDebugConfig> {
        const timestamp = nowIso()

        const existingHeader = await legacyDb.query.frs9ParamCommonh.findFirst({
            where: eq(frs9ParamCommonh.paramCode, REPORT_DEBUG_PARAM_CODE),
        })

        if (!existingHeader) {
            await legacyDb.insert(frs9ParamCommonh).values({
                paramCode: REPORT_DEBUG_PARAM_CODE,
                paramName: 'Report Debug Options',
                paramUsage: 'Controls admin-only IFRS9 report query debugging metadata',
                paramType: 'S',
                createdby: userId,
                createdhost: 'localhost',
                createddate: timestamp,
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: timestamp,
            })
        }

        const existingDetail = await legacyDb.query.frs9ParamCommond.findFirst({
            where: eq(frs9ParamCommond.paramCode, REPORT_DEBUG_PARAM_CODE),
            orderBy: [frs9ParamCommond.paramSeq],
        })

        if (!existingDetail) {
            await legacyDb.insert(frs9ParamCommond).values({
                paramCode: REPORT_DEBUG_PARAM_CODE,
                paramSeq: REPORT_DEBUG_PARAM_SEQ,
                value1: String(enabled),
                value2: 'ifrs9-reports',
                value3: 'global',
                paramdesc: 'Admin-only IFRS9 report debug metadata toggle',
                createdby: userId,
                createdhost: 'localhost',
                createddate: timestamp,
                updatedby: userId,
                updatedhost: 'localhost',
                updateddate: timestamp,
            })
        } else {
            await legacyDb
                .update(frs9ParamCommond)
                .set({
                    value1: String(enabled),
                    updatedby: userId,
                    updatedhost: 'localhost',
                    updateddate: timestamp,
                })
                .where(eq(frs9ParamCommond.pkid, existingDetail.pkid))
        }

        return {
            enabled,
            source: 'db',
            paramCode: REPORT_DEBUG_PARAM_CODE,
        }
    },
}
