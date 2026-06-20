import { platformDb } from '../config/database'
import { platformSettings } from '../db/schema/platform.schema'
import { eq } from 'drizzle-orm'

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ImpactLevelConfig {
    approvalsRequired: number
    slaHours: number
    escalationAfterHours: number
    requireDecisionComment: boolean
    queuePriority: number // BullMQ priority (0=highest)
}

export interface ImpactConfig {
    priorityMapping: Record<string, ImpactLevel>
    jobTypeMinimums: Record<string, { minImpact: ImpactLevel; minApprovals: number; forceComment: boolean }>
    targetDbElevations: Record<string, ImpactLevel>
    levels: Record<ImpactLevel, ImpactLevelConfig>
    defaultPriority: string
    defaultImpact: ImpactLevel
}

const DEFAULT_CONFIG: ImpactConfig = {
    priorityMapping: {
        LOW: 'low',
        NORMAL: 'medium',
        MEDIUM: 'medium',
        HIGH: 'high',
        CRITICAL: 'critical',
    },
    jobTypeMinimums: {
        SQL_SP: { minImpact: 'high', minApprovals: 2, forceComment: true },
        SHELL_COMMAND: { minImpact: 'critical', minApprovals: 2, forceComment: true },
    },
    targetDbElevations: {
        LEGACY: 'high',
    },
    levels: {
        low: {
            approvalsRequired: 1,
            slaHours: 24,
            escalationAfterHours: 12,
            requireDecisionComment: false,
            queuePriority: 5,
        },
        medium: {
            approvalsRequired: 1,
            slaHours: 8,
            escalationAfterHours: 4,
            requireDecisionComment: false,
            queuePriority: 5,
        },
        high: {
            approvalsRequired: 2,
            slaHours: 4,
            escalationAfterHours: 2,
            requireDecisionComment: true,
            queuePriority: 1,
        },
        critical: {
            approvalsRequired: 2,
            slaHours: 2,
            escalationAfterHours: 1,
            requireDecisionComment: true,
            queuePriority: 0,
        },
    },
    defaultPriority: 'NORMAL',
    defaultImpact: 'medium',
}

let cachedConfig: ImpactConfig | null = null

function mergeConfig(base: ImpactConfig, override: Partial<ImpactConfig>): ImpactConfig {
    return {
        ...base,
        ...override,
        priorityMapping: { ...base.priorityMapping, ...override.priorityMapping },
        jobTypeMinimums: { ...base.jobTypeMinimums, ...override.jobTypeMinimums },
        targetDbElevations: { ...base.targetDbElevations, ...override.targetDbElevations },
        levels: {
            low: { ...base.levels.low, ...override.levels?.low },
            medium: { ...base.levels.medium, ...override.levels?.medium },
            high: { ...base.levels.high, ...override.levels?.high },
            critical: { ...base.levels.critical, ...override.levels?.critical },
        },
    }
}

export async function getImpactConfig(): Promise<ImpactConfig> {
    if (cachedConfig) return cachedConfig

    try {
        const rows = await platformDb
            .select({ value: platformSettings.value })
            .from(platformSettings)
            .where(eq(platformSettings.key, 'impact_level_config'))
            .limit(1)

        if (rows.length > 0 && rows[0].value) {
            const override = rows[0].value as Partial<ImpactConfig>
            cachedConfig = mergeConfig(DEFAULT_CONFIG, override)
        } else {
            cachedConfig = DEFAULT_CONFIG
        }
    } catch {
        cachedConfig = DEFAULT_CONFIG
    }

    return cachedConfig!
}

export function clearImpactConfigCache(): void {
    cachedConfig = null
}

export function deriveImpactLevel(
    priority: string | null | undefined,
    jobType: string | null | undefined,
    targetDatabase: string | null | undefined,
    config: ImpactConfig = DEFAULT_CONFIG,
): { impactLevel: ImpactLevel; approvalsRequired: number; slaHours: number; escalationAfterHours: number; requireDecisionComment: boolean; queuePriority: number } {
    const normalizedPriority = String(priority || config.defaultPriority).toUpperCase()
    const normalizedJobType = String(jobType || '').toUpperCase()

    let impactLevel = config.priorityMapping[normalizedPriority] || config.defaultImpact

    // Job type minimums can elevate impact
    const typeGuard = config.jobTypeMinimums[normalizedJobType]
    if (typeGuard?.minImpact) {
        const rank = (l: ImpactLevel) => ['low', 'medium', 'high', 'critical'].indexOf(l)
        if (rank(typeGuard.minImpact) > rank(impactLevel)) {
            impactLevel = typeGuard.minImpact
        }
    }

    // Target database can elevate impact
    const normalizedDb = String(targetDatabase || '').toUpperCase()
    const dbElevation = config.targetDbElevations[normalizedDb]
    if (dbElevation) {
        const rank = (l: ImpactLevel) => ['low', 'medium', 'high', 'critical'].indexOf(l)
        if (rank(dbElevation) > rank(impactLevel)) {
            impactLevel = dbElevation
        }
    }

    const levelConfig = config.levels[impactLevel]

    let approvalsRequired = levelConfig.approvalsRequired
    if (typeGuard?.minApprovals && typeGuard.minApprovals > approvalsRequired) {
        approvalsRequired = typeGuard.minApprovals
    }

    return {
        impactLevel,
        approvalsRequired,
        slaHours: levelConfig.slaHours,
        escalationAfterHours: levelConfig.escalationAfterHours,
        requireDecisionComment: typeGuard?.forceComment ?? levelConfig.requireDecisionComment,
        queuePriority: levelConfig.queuePriority,
    }
}
