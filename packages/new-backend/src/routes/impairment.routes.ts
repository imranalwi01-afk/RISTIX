
import { Hono } from 'hono'
import { legacyDb as db } from '../config'
import { eq, desc, sql, and } from 'drizzle-orm'
import {
    frs9ImpCaEclSum,
    frs9ImpCaEclConfigh,
    frs9ImpCaResultH,
    frs9ImpCaResultD
} from '../db/schema'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

// ---- Schemas ----

const runCalculationSchema = z.object({
    calculationName: z.string(),
    calculationType: z.enum(['ECL', 'PD', 'LGD', 'EAD', 'STAGING']),
    portfolioId: z.string().optional(),
    reportingDate: z.string(),
    currency: z.string().default('IDR'),
    assumptions: z.string().optional()
})

// ---- Routes ----

// GET /results - Get detailed impairment results (frs9ImpCaResultH)
app.get('/results', async (c) => {
    try {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '10')
        const offset = (page - 1) * limit

        const data = await db
            .select()
            .from(frs9ImpCaResultH)
            .orderBy(desc(frs9ImpCaResultH.prcDate))
            .limit(limit)
            .offset(offset)

        // Count total for pagination (optional, separate query for performance)
        // For now using placeholder to adhere to "just table" speed request
        const total = 1000

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching impairment results:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch results',
            error: String(error)
        }, 500)
    }
})

// GET /calculations - Get aggregates history
app.get('/calculations', async (c) => {
    try {
        // Aggregate EclSum by Date and Model
        const results = await db
            .select({
                id: sql<string>`CONCAT(${frs9ImpCaEclSum.prcDate}, '-', ${frs9ImpCaEclSum.eclModelId})`.as('id'),
                calculationName: frs9ImpCaEclConfigh.eclModelName,
                calculationType: sql<string>`'ECL'`, // Default to ECL since referencing ECL table
                portfolioId: sql<string>`'ALL'`, // Placeholder
                portfolioName: sql<string>`'All Segments'`,
                calculationDate: frs9ImpCaEclSum.prcDate,
                reportingDate: frs9ImpCaEclSum.prcDate,
                currency: sql<string>`'IDR'`,
                totalExposure: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`,
                totalECL: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                stage1Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                stage2Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                stage3Exposure: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN COALESCE(${frs9ImpCaEclSum.outstanding}, 0) ELSE 0 END)`,
                stage1ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                stage2ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                stage3ECL: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN (COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) ELSE 0 END)`,
                modelVersion: frs9ImpCaEclConfigh.pkid,
                status: sql<string>`'COMPLETED'`, // Assume items in SUM table are completed
                progress: sql<number>`100`,
                createdBy: frs9ImpCaEclConfigh.createdby,
                createdAt: frs9ImpCaEclConfigh.createddate,
            })
            .from(frs9ImpCaEclSum)
            .leftJoin(
                frs9ImpCaEclConfigh,
                eq(frs9ImpCaEclSum.eclModelId, frs9ImpCaEclConfigh.pkid)
            )
            .groupBy(
                frs9ImpCaEclSum.prcDate,
                frs9ImpCaEclSum.eclModelId,
                frs9ImpCaEclConfigh.eclModelName,
                frs9ImpCaEclConfigh.pkid,
                frs9ImpCaEclConfigh.createdby,
                frs9ImpCaEclConfigh.createddate
            )
            .orderBy(desc(frs9ImpCaEclSum.prcDate))
            .limit(50);

        // Calculate coverage ratio
        const formattedResults = results.map(r => ({
            ...r,
            coverageRatio: r.totalExposure && r.totalExposure > 0
                ? (r.totalECL / r.totalExposure) * 100
                : 0,
            assumptions: `Based on model ${r.calculationName} (ID: ${r.modelVersion})`
        }));

        return c.json({
            success: true,
            data: formattedResults,
            pagination: {
                total: results.length,
                page: 1,
                limit: 50,
                totalPages: 1
            }
        })

    } catch (error) {
        console.error('Error fetching impairment calculations:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch calculations',
            error: String(error)
        }, 500)
    }
})

// GET /configurations - Get ECL Configurations
app.get('/configurations', async (c) => {
    try {
        const configs = await db
            .select()
            .from(frs9ImpCaEclConfigh)
            .orderBy(desc(frs9ImpCaEclConfigh.createddate))
            .limit(20);

        const formattedConfigs = configs.map(cfg => ({
            id: String(cfg.pkid),
            configName: cfg.eclModelName,
            configType: 'ECL_MODEL',
            isActive: cfg.activeFlag,
            parameters: {
                module: cfg.module,
                effectiveDate: cfg.effectiveDate
            },
            modelVersion: '1.0', // Placeholder
            lastUpdated: cfg.updateddate || cfg.createddate,
            updatedBy: cfg.updatedby || cfg.createdby
        }));

        return c.json({
            success: true,
            data: formattedConfigs
        })
    } catch (error) {
        console.error('Error fetching configurations:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch configurations'
        }, 500)
    }
})

// POST /run-calculation - Mock calculation trigger
app.post('/run-calculation', zValidator('json', runCalculationSchema), async (c) => {
    try {
        const payload = c.req.valid('json');

        console.log('Starting calculation for:', payload.calculationName);

        // In a real system, this would trigger a job queue or procedure
        // For now, we return success

        return c.json({
            success: true,
            message: 'Calculation job submitted successfully',
            jobId: 'JOB-' + Date.now()
        })
    } catch (error) {
        return c.json({
            success: false,
            message: 'Failed to submit calculation',
            error: String(error)
        }, 500)
    }
})

// GET /ecl-details - Get detailed ECL breakdown by account
app.get('/ecl-details', async (c) => {
    try {
        const page = Number(c.req.query('page') || '1')
        const limit = Number(c.req.query('limit') || '20')
        const offset = (page - 1) * limit
        const accountId = c.req.query('accountId')

        let query = db.select().from(frs9ImpCaResultD)

        if (accountId) {
            query = query.where(eq(frs9ImpCaResultD.accountId, Number(accountId))) as any
        }

        const data = await query
            .orderBy(desc(frs9ImpCaResultD.prcDate))
            .limit(limit)
            .offset(offset)

        return c.json({
            success: true,
            data: data,
            pagination: {
                page,
                limit,
                total: data.length,
                totalPages: Math.ceil(data.length / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching ECL details:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch ECL details',
            error: String(error)
        }, 500)
    }
})

// GET /staging-analysis - Get stage transition analysis
app.get('/staging-analysis', async (c) => {
    try {
        const results = await db
            .select({
                prcDate: frs9ImpCaEclSum.prcDate,
                stage: frs9ImpCaEclSum.stage,
                segmentId: frs9ImpCaEclSum.segmentId,
                totalOutstanding: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`,
                totalECL: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                avgOutstanding: sql<number>`AVG(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`
            })
            .from(frs9ImpCaEclSum)
            .groupBy(frs9ImpCaEclSum.prcDate, frs9ImpCaEclSum.stage, frs9ImpCaEclSum.segmentId)
            .orderBy(desc(frs9ImpCaEclSum.prcDate), frs9ImpCaEclSum.stage)
            .limit(100)

        return c.json({
            success: true,
            data: results
        })
    } catch (error) {
        console.error('Error fetching staging analysis:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch staging analysis',
            error: String(error)
        }, 500)
    }
})

// GET /provision-summary - Get provision summary
app.get('/provision-summary', async (c) => {
    try {
        const prcDate = c.req.query('prcDate')

        const results = await db
            .select({
                prcDate: frs9ImpCaEclSum.prcDate,
                totalAccounts: sql<number>`COUNT(*)`,
                totalOutstanding: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))`,
                totalECLOnBalance: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0))`,
                totalECLOffBalance: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                totalECL: sql<number>`SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0))`,
                stage1Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '1' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                stage2Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '2' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                stage3Provision: sql<number>`SUM(CASE WHEN ${frs9ImpCaEclSum.stage} = '3' THEN COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0) ELSE 0 END)`,
                coverageRatio: sql<number>`CASE WHEN SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0)) > 0 THEN (SUM(COALESCE(${frs9ImpCaEclSum.eclAmtCaOnbs}, 0) + COALESCE(${frs9ImpCaEclSum.eclAmtCaOffbs}, 0)) / SUM(COALESCE(${frs9ImpCaEclSum.outstanding}, 0))) * 100 ELSE 0 END`
            })
            .from(frs9ImpCaEclSum)
            .groupBy(frs9ImpCaEclSum.prcDate)
            .orderBy(desc(frs9ImpCaEclSum.prcDate))
            .limit(prcDate ? 1 : 12)

        return c.json({
            success: true,
            data: results
        })
    } catch (error) {
        console.error('Error fetching provision summary:', error)
        return c.json({
            success: false,
            message: 'Failed to fetch provision summary',
            error: String(error)
        }, 500)
    }
})

export default app
