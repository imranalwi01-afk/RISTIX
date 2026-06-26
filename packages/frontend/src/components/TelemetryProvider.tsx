'use client';

import { useEffect, type ReactNode } from 'react';

export function TelemetryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
        const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');

        const otelHost = process.env.NEXT_PUBLIC_OTEL_HOST || window.location.hostname;
        const exporterUrl = `http://${otelHost}:4318/v1/traces`;

        const { WebTracerProvider } = await import('@opentelemetry/sdk-trace-web');
        const provider = new WebTracerProvider({
          spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: exporterUrl }))],
        });
        provider.register();

        try {
          const { FetchInstrumentation } = await import('@opentelemetry/instrumentation-fetch');
          const { XMLHttpRequestInstrumentation } = await import('@opentelemetry/instrumentation-xml-http-request');
          const { registerInstrumentations } = await import('@opentelemetry/instrumentation');
          registerInstrumentations({
            tracerProvider: provider,
            instrumentations: [
              new FetchInstrumentation({ propagateTraceHeaderCorsUrls: /.*/, clearTimingResources: true }),
              new XMLHttpRequestInstrumentation({ propagateTraceHeaderCorsUrls: /.*/ }),
            ],
          });
        } catch { /* instrumentations not available */ }

        cleanup = () => { provider.shutdown(); };
      } catch {
        // browser OTel unavailable
      }
    }

    init();
    return () => { cleanup?.(); };
  }, []);

  return children;
}
