
import { NextResponse } from 'next/server';

// Force dynamic execution so it doesn't cache the result at build time
export const dynamic = 'force-dynamic';

export async function GET() {
  const backendPort = 4232; // Known backend port
  // Try localhost first, then 127.0.0.1 as fallback
  const candidates = [
    `http://localhost:3000/api/v1/health`, // Docker default
    `http://127.0.0.1:3000/api/v1/health`,
    `http://localhost:3001/api/v1/health`, // Local default
    `http://127.0.0.1:3001/api/v1/health`,
    `http://new-backend:3000/api/v1/health`, // Docker internal network
    `http://ifrs9-new-backend-dev:3000/api/v1/health`, // Container name
    `http://localhost:${backendPort}/api/v1/health`, // Keep original as backup
    `http://127.0.0.1:${backendPort}/api/v1/health`
  ];

  for (const url of candidates) {
    try {
      console.log(`[Health Proxy] Trying: ${url}`);
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(2000) // Fast timeout
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ ...data, _source: url });
      }
    } catch (error) {
      console.warn(`[Health Proxy] Failed to connect to ${url}:`, error);
      // Continue to next candidate
    }
  }

  // If all failed
  return NextResponse.json(
    {
      status: 'unhealthy',
      error: 'Backend unreachable on all candidates',
      details: 'Evaluated localhost and 127.0.0.1 on port 4232',
      timestamp: new Date().toISOString()
    },
    { status: 503 }
  );
}
