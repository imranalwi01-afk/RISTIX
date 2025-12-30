import { app } from './app'
import { env, closeDatabase } from './config'

console.log(`
╔════════════════════════════════════════════════════════╗
║        IFRS9 New Backend - Hono + Drizzle + Bun        ║
╠════════════════════════════════════════════════════════╣
║  Runtime: Bun ${Bun.version.padEnd(42)}║
║  Environment: ${env.NODE_ENV.padEnd(39)}║
║  Port: ${env.PORT.toString().padEnd(46)}║
╚════════════════════════════════════════════════════════╝
`)

// Graceful shutdown
const shutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...')
    await closeDatabase()
    process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Export for Bun server
export default {
    port: env.PORT,
    hostname: env.HOST,
    fetch: app.fetch,
}
