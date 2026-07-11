'use client';

import { useEffect, type ReactNode } from 'react';

export function TelemetryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only enable browser RUM when the OTel collector is accessible.
    // In production (ristix.bdo-ki.com/ifrspro.id) the collector isn't publicly
    // exposed, so the CSP would block direct connections. Developers can
    // override with NEXT_PUBLIC_OTEL_ENABLED=true.
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    // Only enable if explicitly requested via environment variable. 
    // Enabling by default on localhost causes network errors if the collector isn't running.
    const isEnabled = process.env.NEXT_PUBLIC_OTEL_ENABLED === 'true';
    if (!isEnabled) return;

    let cleanup: (() => void) | undefined;

    async function init() {
      try {
        const { BatchSpanProcessor } = await import('@opentelemetry/sdk-trace-base');
        const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');

        const otelHost = isLocalhost ? 'localhost' : (process.env.NEXT_PUBLIC_OTEL_HOST || hostname);
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
