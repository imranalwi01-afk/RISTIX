import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { IORedisInstrumentation, type CommandArgs } from '@opentelemetry/instrumentation-ioredis'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

let sdk: NodeSDK | null = null
let initialized = false

export const SERVICE_NAME = 'ifrs9-backend'

export function initTelemetry() {
  if (initialized) return
  initialized = true

  const isDev = process.env.NODE_ENV !== 'production'
  const otelHost = process.env.OTEL_COLLECTOR_HOST || (isDev ? 'localhost' : 'otel-collector')
  const exporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || `http://${otelHost}:4318/v1/traces`

  if (isDev) {
    console.log(`[OTEL] Trace exporter: ${exporterUrl}`)
  }

  sdk = new NodeSDK({
    serviceName: SERVICE_NAME,
    traceExporter: new OTLPTraceExporter({ url: exporterUrl, headers: {} }),
    instrumentations: [
      new HttpInstrumentation(),
      new IORedisInstrumentation({
        dbStatementSerializer: (_cmdName: string, _cmdArgs: CommandArgs) => _cmdName,
      }),
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
