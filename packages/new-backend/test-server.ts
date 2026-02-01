
import { app } from './src/app';
import { logger } from './src/lib/logger';

const port = 4233;

console.log('🚀 Starting Lite Test Server (No Redis)...');

app.onError((err, c) => {
    console.error('🔥 Server Error:', err);
    return c.json({ success: false, error: err.message }, 500);
});

Bun.serve({
    port,
    fetch(req: Request, server: any) {
        return app.fetch(req, server);
    }
});

console.log(`✅ Lite Test Server running at http://localhost:${port}`);
