/**
 * Main entry point
 * Starts the server with Socket.IO, Bull queues, and all integrations
 */

import { startServer } from './server'

// Start the integrated server
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
})
