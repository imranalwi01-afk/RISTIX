// packages/backend/src/types/express.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      user?: {
        id: string;
        tenantId: string;
        tenantSlug: string;
        email: string;
        roles: string[];
        permissions: string[];
        sessionId: string;
      };
      tenant?: {
        id: string;
        slug: string;
      };
    }
  }
}

export {};