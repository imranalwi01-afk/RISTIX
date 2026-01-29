import pino from 'pino'

const isDev = (process.env.NODE_ENV || 'development') === 'development'

// Central Pino logger for the new backend
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
    base: {
        service: 'ifrs9-new-backend',
        environment: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: isDev
        ? {
              target: 'pino-pretty',
              options: {
                  colorize: true,
                  translateTime: 'HH:MM:ss.l',
                  singleLine: false,
              },
          }
        : undefined,
})

// Helper to create child logger with correlation/request IDs
export function withRequestIds(ctx: { requestId?: string; tenantId?: string; userId?: string }) {
    const { requestId, tenantId, userId } = ctx
    return logger.child({ requestId, tenantId, userId })
}

export type Logger = typeof logger
