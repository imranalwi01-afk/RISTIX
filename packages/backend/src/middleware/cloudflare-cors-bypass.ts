// packages/backend/src/middleware/cloudflare-cors-bypass.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Cloudflare CORS Bypass Middleware
 *
 * This middleware handles the specific case where Cloudflare reverse proxy
 * strips the Origin header before requests reach the backend.
 *
 * It adds custom headers that help identify legitimate IAF requests
 * even when Origin header is missing.
 */
export const cloudflareCorsBypassMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Check if this is likely an IAF request based on various indicators
  const isLikelyIAFRequest = (): boolean => {
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';
    const xForwardedFor = req.headers['x-forwarded-for'] as string;
    const xForwardedHost = req.headers['x-forwarded-host'] as string;
    const host = req.headers.host;

    console.log(`🔍 Cloudflare Bypass Check:`);
    console.log(`  - User-Agent: ${userAgent}`);
    console.log(`  - Referer: ${referer}`);
    console.log(`  - X-Forwarded-For: ${xForwardedFor}`);
    console.log(`  - X-Forwarded-Host: ${xForwardedHost}`);
    console.log(`  - Host: ${host}`);

    // Check for IAF-specific patterns
    const isIAFUserAgent = userAgent.includes('Mozilla') && userAgent.includes('Chrome');
    const isIAFReferer = referer.includes('ifrspro.id') || referer.includes('danafin.com');
    const isIAFHost = host && (
      host.includes('ifrspro.id') ||
      host.includes('danafin.com') ||
      host.includes('iaf-ifrs')
    );
    const isIAFForwardedHost = xForwardedHost && (
      xForwardedHost.includes('ifrspro.id') ||
      xForwardedHost.includes('danafin.com') ||
      xForwardedHost.includes('iaf-ifrs')
    );

    // Check for common API patterns that indicate legitimate requests
    const hasAuthHeader = req.headers.authorization;
    const hasContentType = req.headers['content-type'];
    const isAPIRequest = req.path.startsWith('/api/') || hasAuthHeader || hasContentType;

    const isLikelyIAF = (
      isIAFUserAgent && (isIAFReferer || isIAFHost || isIAFForwardedHost) ||
      isAPIRequest && (isIAFReferer || isIAFHost || isIAFForwardedHost)
    );

    console.log(`  - IAF User-Agent: ${isIAFUserAgent}`);
    console.log(`  - IAF Referer: ${isIAFReferer}`);
    console.log(`  - IAF Host: ${isIAFHost}`);
    console.log(`  - IAF Forwarded Host: ${isIAFForwardedHost}`);
    console.log(`  - API Request: ${isAPIRequest}`);
    console.log(`  - Likely IAF Request: ${isLikelyIAF}`);

    return isLikelyIAF;
  };

  // Add custom headers to help CORS middleware identify legitimate requests
  if (isLikelyIAFRequest()) {
    // Set a custom header that indicates this is a legitimate IAF request
    req.headers['x-iaf-verified-request'] = 'true';

    // If Origin is missing, add a reconstructed origin based on available headers
    if (!req.headers.origin) {
      const host = req.headers.host || req.headers['x-forwarded-host'];
      if (host && typeof host === 'string') {
        // Construct the most likely origin
        if (host.includes('danafin.com')) {
          req.headers['x-reconstructed-origin'] = `https://${host}`;
        } else if (host.includes('ifrspro.id')) {
          req.headers['x-reconstructed-origin'] = `https://${host}`;
        }
      }
    }
  }

  console.log(`✅ Cloudflare CORS bypass middleware completed`);
  next();
};

export default cloudflareCorsBypassMiddleware;