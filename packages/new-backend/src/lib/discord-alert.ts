/**
 * Simple Discord webhook sender for Grafana alerts.
 * Translates Grafana webhook JSON to Discord embed format.
 */

const WEBHOOK_URL = process.env.DISCORD_ALERT_WEBHOOK_URL || ''

interface GrafanaAlertPayload {
  title?: string
  message?: string
  state?: string
  ruleName?: string
  ruleUrl?: string
  evalMatches?: Array<{
    metric: string
    value: number
    tags?: Record<string, string>
  }>
}

interface DiscordEmbed {
  title: string
  description: string
  color: number
  fields?: Array<{ name: string; value: string; inline?: boolean }>
  timestamp?: string
}

const STATUS_COLORS: Record<string, number> = {
  alerting: 0xE02B2B,
  firing: 0xE02B2B,
  ok: 0x2ECC71,
  resolved: 0x2ECC71,
  warning: 0xF1C40F,
  pending: 0x95A5A6,
  error: 0xE02B2B,
  critical: 0xE02B2B,
}

export function buildDiscordPayload(payload: GrafanaAlertPayload, defaultTitle = 'IFRS9 Alert') {
  const state = (payload.state || 'alerting').toLowerCase()
  const color = STATUS_COLORS[state] || STATUS_COLORS.alerting
  const embed: DiscordEmbed = {
    title: payload.title || payload.ruleName || defaultTitle,
    description: payload.message || '',
    color,
    timestamp: new Date().toISOString(),
  }

  if (payload.evalMatches && payload.evalMatches.length > 0) {
    embed.fields = payload.evalMatches.slice(0, 5).map((m) => ({
      name: m.metric,
      value: `\`${m.value.toFixed(4)}\``,
      inline: true,
    }))
  }

  if (payload.ruleUrl) {
    embed.title += ' — View in Grafana'
  }

  return {
    username: 'IFRS9 AlertManager',
    content: state === 'ok' || state === 'resolved' ? '✅ **Resolved**' : '🚨 **Alert**',
    embeds: [embed],
  }
}

export async function sendDiscordAlert(payload: GrafanaAlertPayload): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn('[DiscordAlert] No DISCORD_ALERT_WEBHOOK_URL configured')
    return false
  }

  try {
    const body = buildDiscordPayload(payload)
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error(`[DiscordAlert] Webhook returned ${res.status}: ${await res.text()}`)
      return false
    }
    console.log(`[DiscordAlert] Sent: ${payload.title || payload.ruleName || 'unknown'} (${payload.state})`)
    return true
  } catch (err) {
    console.error('[DiscordAlert] Failed to send:', err)
    return false
  }
}

export function createDiscordAlertHandler() {
  return async (c: any) => {
    const payload: GrafanaAlertPayload = await c.req.json()
    const sent = await sendDiscordAlert(payload)
    return c.json({ success: sent })
  }
}
