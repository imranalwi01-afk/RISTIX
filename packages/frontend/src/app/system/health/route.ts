
import { NextResponse } from 'next/server';

// Force dynamic execution
export const dynamic = 'force-dynamic';

export async function GET() {
  const backendPort = process.env.BACKEND_PORT || '5232';

  // Primary source of truth: environment-provided backend origins.
  const baseCandidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.BACKEND_URL,
    `http://127.0.0.1:${backendPort}`,
    `http://localhost:${backendPort}`,
    `http://backend:${backendPort}`,
    `http://new-backend:${backendPort}`,
    `http://ifrs9-new-backend-dev:${backendPort}`,
    // Legacy fallback ports
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'http://localhost:3001',
    'http://new-backend:3000',
    'http://ifrs9-new-backend-dev:3000',
  ].filter((value): value is string => Boolean(value));

  // Backend health endpoint is /health (not /api/v1/health).
  const candidates = Array.from(
    new Set(
      baseCandidates.flatMap((base) => {
        const normalized = base.replace(/\/+$/, '');
        return [`${normalized}/health`, `${normalized}/api/v1/health`];
      })
    )
  );

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          ...data,
          _proxy_source: url,
          _timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      // Ignore and try next
    }
  }

  return NextResponse.json(
    { status: 'unhealthy', error: 'Backend unreachable via proxy' },
    { status: 503 }
  );
}
