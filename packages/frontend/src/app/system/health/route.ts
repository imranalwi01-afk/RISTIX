
import { NextResponse } from 'next/server';

// Force dynamic execution
export const dynamic = 'force-dynamic';

export async function GET() {
  const backendPort = 4232;
  const candidates = [
    `http://127.0.0.1:${backendPort}/api/v1/health`, // Local development (primary)
    `http://localhost:${backendPort}/api/v1/health`,
    `http://new-backend:${backendPort}/api/v1/health`, // Docker internal network
    `http://ifrs9-new-backend-dev:${backendPort}/api/v1/health`, // Container name
    `http://127.0.0.1:3000/api/v1/health`, // Docker default (legacy)
    `http://localhost:3000/api/v1/health`,
    `http://127.0.0.1:3001/api/v1/health`, // Local default (legacy)
    `http://localhost:3001/api/v1/health`,
    `http://new-backend:3000/api/v1/health`, // Docker internal network (legacy)
    `http://ifrs9-new-backend-dev:3000/api/v1/health` // Container name (legacy)
  ];

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
