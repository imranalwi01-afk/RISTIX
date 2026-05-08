export const INDIVIDUAL_IMPAIRMENT_V2_ENTITY_TYPE = 'individual_impairment_v2'

export const INDIVIDUAL_IMPAIRMENT_V2_SUBTYPES = {
    OVERRIDE: 'override',
} as const

export const isIndividualImpairmentV2Path = (path: string): boolean =>
    String(path || '').startsWith('/api/v2/individual-impairment')

