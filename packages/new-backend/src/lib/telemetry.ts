import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanStatusCode } from '@opentelemetry/api'
import type { Context as HonoContext } from 'hono'

let sdk: NodeSDK | null = null
let initialized = false

const SERVICE_NAME = 'ifrs9-backend'

export function initTelemetry() {
    if (initialized) return
    initialized = true

    const isDev = process.env.NODE_ENV !== 'production'
    const otelHost = process.env.OTEL_COLLECTOR_HOST || (isDev ? 'localhost' : 'otel-collector')
    const exporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || `http://${otelHost}:4318/v1/traces`

    if (isDev) {
        console.log(`[OTEL] Initializing with exporter: ${exporterUrl}`)
    }

    const exporter = new OTLPTraceExporter({
        url: exporterUrl,
        headers: {},
    })

    sdk = new NodeSDK({
        serviceName: SERVICE_NAME,
        traceExporter: exporter,
        instrumentations: [
            new HttpInstrumentation(),
            new PgInstrumentation(),
        ],
    })

    diag.setLogger(new DiagConsoleLogger(), isDev ? DiagLogLevel.DEBUG : DiagLogLevel.WARN)

    sdk.start()

    process.on('SIGTERM', () => {
        sdk?.shutdown()
            .then(() => console.log('[OTEL] SDK shut down'))
            .catch((err) => console.error('[OTEL] Error shutting down SDK', err))
    })
}

// Create a span for a Hono request
export function traceHonoRequest(c: HonoContext, spanName: string) {
    const tracer = trace.getTracer(SERVICE_NAME)
    const span = tracer.startSpan(spanName, {
        attributes: {
            'http.method': c.req.method,
            'http.url': c.req.url,
            'http.path': c.req.path,
            'tenant_id': (c.get('tenantId') as string) || '',
            'user_id': (c.get('userId') as string) || '',
        },
    })
    return { span, end: (statusCode: number) => {
        span.setAttribute('http.status_code', statusCode)
        if (statusCode >= 400) {
            span.setStatus({ code: SpanStatusCode.ERROR })
        }
        span.end()
    }}
}
