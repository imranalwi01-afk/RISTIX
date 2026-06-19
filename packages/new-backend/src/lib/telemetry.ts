// @ts-nocheck
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

let sdk: NodeSDK | null = null

export function initTelemetry() {
    if (sdk) return

    const exporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
        headers: {},
    })

    sdk = new NodeSDK({
        serviceName: 'ifrs9-backend',
        traceExporter: exporter,
        instrumentations: [
            new HttpInstrumentation(),
            new PgInstrumentation(),
        ],
    })

    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN)

    sdk.start()

    process.on('SIGTERM', () => {
        sdk?.shutdown()
            .then(() => console.log('OTEL SDK shut down'))
            .catch((err) => console.error('Error shutting down OTEL SDK', err))
    })
}
