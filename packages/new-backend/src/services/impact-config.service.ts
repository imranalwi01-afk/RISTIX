import { ParametersRepository } from '../repositories/parameters.repository'
import { Effect } from 'effect'

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

export interface ImpactLevelConfig {
    scoreMin: number
    scoreMax: number
    approvalsRequired: number
    slaHours: number
    escalationAfterHours: number
    requireDecisionComment: boolean
    queuePriority: number
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
        low: { scoreMin: 1, scoreMax: 29, approvalsRequired: 1, slaHours: 24, escalationAfterHours: 12, requireDecisionComment: false, queuePriority: 5 },
        medium: { scoreMin: 30, scoreMax: 59, approvalsRequired: 1, slaHours: 8, escalationAfterHours: 4, requireDecisionComment: false, queuePriority: 5 },
        high: { scoreMin: 60, scoreMax: 79, approvalsRequired: 2, slaHours: 4, escalationAfterHours: 2, requireDecisionComment: true, queuePriority: 1 },
        critical: { scoreMin: 80, scoreMax: 100, approvalsRequired: 2, slaHours: 2, escalationAfterHours: 1, requireDecisionComment: true, queuePriority: 0 },
    },
    defaultPriority: 'NORMAL',
    defaultImpact: 'medium',
}

const BUSINESS_SETTING_CODE = 'B0031'

let cachedConfig: ImpactConfig | null = null
let lastFetch = 0
const CACHE_TTL = 30000 // 30s

/**
 * Read impact config from Business Setting B0030 details.
 * Each detail row: value1 = config path (e.g. "levels.low.approvalsRequired"), value2 = value
 * Falls back to DEFAULT_CONFIG if not found.
 */
async function fetchFromBusinessSettings(): Promise<ImpactConfig> {
    try {
        const effect = ParametersRepository.findDetailByCode(BUSINESS_SETTING_CODE)
        const details = await Effect.runPromise(effect)

        if (!details || details.length === 0) return DEFAULT_CONFIG

        const cfg: Record<string, string> = {}
        for (const d of details) {
            const key = d.value1?.trim()
            const val = d.value2?.trim()
            if (key && val !== undefined && val !== null) {
                cfg[key] = val
            }
        }

        if (Object.keys(cfg).length === 0) return DEFAULT_CONFIG

        const merged: ImpactConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG))

        for (const [path, value] of Object.entries(cfg)) {
            const parts = path.split('.')
            let obj: any = merged
            for (let i = 0; i < parts.length - 1; i++) {
                if (!(parts[i] in obj)) obj[parts[i]] = {}
                obj = obj[parts[i]]
            }
            const lastKey = parts[parts.length - 1]
            const existing = obj[lastKey]
            if (typeof existing === 'boolean') {
                obj[lastKey] = value === 'true' || value === '1'
            } else if (typeof existing === 'number') {
                obj[lastKey] = Number(value)
            } else {
                obj[lastKey] = value
            }
        }

        return merged
    } catch {
        return DEFAULT_CONFIG
    }
}

export async function getImpactConfig(): Promise<ImpactConfig> {
    const now = Date.now()
    if (cachedConfig && now - lastFetch < CACHE_TTL) return cachedConfig

    cachedConfig = await fetchFromBusinessSettings()
    lastFetch = now
    return cachedConfig!
}

export function clearImpactConfigCache(): void {
    cachedConfig = null
    lastFetch = 0
}

/**
 * Derive impact level from a numeric score (1-100) using configured score ranges.
 * Falls back to deriveImpactLevel if score is not provided.
 */
export function deriveImpactFromScore(
    score: number | null | undefined,
    jobType: string | null | undefined,
    targetDatabase: string | null | undefined,
    config: ImpactConfig = DEFAULT_CONFIG,
): { impactLevel: ImpactLevel; approvalsRequired: number; slaHours: number; escalationAfterHours: number; requireDecisionComment: boolean; queuePriority: number } {
    const normalizedJobType = String(jobType || '').toUpperCase()
    const normalizedDb = String(targetDatabase || '').toUpperCase()

    // Find impact level by score range
    let impactLevel: ImpactLevel = config.defaultImpact
    if (score !== null && score !== undefined && Number.isFinite(score)) {
        for (const level of ['low', 'medium', 'high', 'critical'] as ImpactLevel[]) {
            const lvl = config.levels[level]
            if (score >= lvl.scoreMin && score <= lvl.scoreMax) {
                impactLevel = level
                break
            }
        }
    }

    const rank = (l: ImpactLevel) => ['low', 'medium', 'high', 'critical'].indexOf(l)

    const typeGuard = config.jobTypeMinimums[normalizedJobType]
    if (typeGuard?.minImpact && rank(typeGuard.minImpact) > rank(impactLevel)) {
        impactLevel = typeGuard.minImpact
    }

    const dbElevation = config.targetDbElevations[normalizedDb]
    if (dbElevation && rank(dbElevation) > rank(impactLevel)) {
        impactLevel = dbElevation
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

/**
 * Derive impact level and requirements from priority, job type, and target database.
 */
export function deriveImpactLevel(
    priority: string | null | undefined,
    jobType: string | null | undefined,
    targetDatabase: string | null | undefined,
    config: ImpactConfig = DEFAULT_CONFIG,
): { impactLevel: ImpactLevel; approvalsRequired: number; slaHours: number; escalationAfterHours: number; requireDecisionComment: boolean; queuePriority: number } {
    const normalizedPriority = String(priority || config.defaultPriority).toUpperCase()
    const normalizedJobType = String(jobType || '').toUpperCase()
    const normalizedDb = String(targetDatabase || '').toUpperCase()

    let impactLevel = config.priorityMapping[normalizedPriority] || config.defaultImpact
    const rank = (l: ImpactLevel) => ['low', 'medium', 'high', 'critical'].indexOf(l)

    const typeGuard = config.jobTypeMinimums[normalizedJobType]
    if (typeGuard?.minImpact && rank(typeGuard.minImpact) > rank(impactLevel)) {
        impactLevel = typeGuard.minImpact
    }

    const dbElevation = config.targetDbElevations[normalizedDb]
    if (dbElevation && rank(dbElevation) > rank(impactLevel)) {
        impactLevel = dbElevation
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
