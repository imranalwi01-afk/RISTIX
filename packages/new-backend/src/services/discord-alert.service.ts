import { env } from '../config/env'
import { logger } from '../lib/logger'

export type AlertSeverity = 'info' | 'warn' | 'error' | 'critical'

export interface DiscordAlertPayload {
    source: 'backend' | 'frontend' | 'worker' | 'system'
    severity: AlertSeverity
    event: string
    message: string
    requestId?: string
    tenantId?: string
    userId?: string
    context?: Record<string, unknown>
}

const levelRank: Record<AlertSeverity, number> = {
    info: 10,
    warn: 20,
    error: 30,
    critical: 40,
}

const throttledEvents = new Map<string, number>()

function normalizeMinLevel(level: string | undefined): AlertSeverity {
    const normalized = (level || 'error').toLowerCase()
    if (normalized === 'info' || normalized === 'warn' || normalized === 'error' || normalized === 'critical') {
        return normalized
    }
    return 'error'
}

function escapeForDiscord(value: unknown): string {
    const asString = String(value ?? '')
    return asString.replace(/\r?\n/g, ' ').trim()
}

function truncate(text: string, max: number): string {
    if (text.length <= max) return text
    return `${text.slice(0, Math.max(0, max - 3))}...`
}

function shouldThrottle(key: string): boolean {
    const now = Date.now()
    const throttleMs = Number(env.ALERT_THROTTLE_MS || 60000)
    const lastSent = throttledEvents.get(key)
    if (lastSent && now - lastSent < throttleMs) {
        return true
    }
    throttledEvents.set(key, now)
    return false
}

function buildDiscordContent(payload: DiscordAlertPayload): string {
    const metaParts = [
        payload.requestId ? `requestId=${escapeForDiscord(payload.requestId)}` : null,
        payload.tenantId ? `tenantId=${escapeForDiscord(payload.tenantId)}` : null,
        payload.userId ? `userId=${escapeForDiscord(payload.userId)}` : null,
    ].filter(Boolean)

    const context = payload.context ? truncate(escapeForDiscord(JSON.stringify(payload.context)), 700) : ''
    const title = `[IFRS9][${payload.source.toUpperCase()}][${payload.severity.toUpperCase()}] ${payload.event}`
    const body = truncate(escapeForDiscord(payload.message), 900)
    const meta = metaParts.length ? ` | ${metaParts.join(' ')}` : ''
    const ctx = context ? ` | context=${context}` : ''

    return truncate(`${title} | ${body}${meta}${ctx}`, 1900)
}

export async function sendDiscordAlert(payload: DiscordAlertPayload): Promise<boolean> {
    const webhookUrl = (env.ALERT_DISCORD_WEBHOOK_URL || '').trim()
    if (!webhookUrl) return false

    const minLevel = normalizeMinLevel(env.ALERT_MIN_LEVEL)
    if (levelRank[payload.severity] < levelRank[minLevel]) {
        return false
    }

    const throttleKey = `${payload.source}:${payload.severity}:${payload.event}:${payload.message}`
    if (shouldThrottle(throttleKey)) {
        return false
    }

    const isDiscordWebhook = /discord(app)?\.com\/api\/webhooks\//i.test(webhookUrl)
    const timeoutMs = Number(env.ALERT_DISCORD_TIMEOUT_MS || 5000)

    const requestBody = isDiscordWebhook
        ? { content: buildDiscordContent(payload) }
        : {
            service: 'ifrs9-new-backend',
            source: payload.source,
            severity: payload.severity,
            event: payload.event,
            message: payload.message,
            requestId: payload.requestId,
            tenantId: payload.tenantId,
            userId: payload.userId,
            context: payload.context,
            timestamp: new Date().toISOString(),
        }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(timeoutMs),
        })

        if (!response.ok) {
            logger.warn({ status: response.status, event: payload.event }, 'Discord alert HTTP request failed')
            return false
        }

        return true
    } catch (error) {
        logger.warn({ err: error, event: payload.event }, 'Discord alert dispatch failed')
        return false
    }
}
