import pino from 'pino'

// Central Pino logger for the new backend
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    base: {
        service: 'ifrs9-new-backend',
        environment: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
})

/**
 * Update the root logger with a corrected environment value.
 * Called after env.ts has fully parsed and validated process.env.
 */
let _envSet = false
export function setEnvironment(env: string) {
    if (_envSet) return
    _envSet = true
    // pino loggers are immutable, so we warn but can't update the base
    // The server startup log already includes the correct env.NODE_ENV
    if (env !== (process.env.NODE_ENV || 'development')) {
        logger.warn({ parsedEnv: env, rawEnv: process.env.NODE_ENV }, 'NODE_ENV mismatch between raw process.env and parsed env config')
    }
}

// Helper to create child logger with correlation/request IDs
export function withRequestIds(ctx: { requestId?: string; tenantId?: string; userId?: string }) {
    const { requestId, tenantId, userId } = ctx
    return logger.child({ requestId, tenantId, userId })
}

export type Logger = typeof logger
