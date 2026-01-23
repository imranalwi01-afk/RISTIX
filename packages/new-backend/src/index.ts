/**
 * Main entry point
 * Starts the Bun server with Socket.IO, Bull queues, and all integrations
 */

import { startServer } from './server'

// Start the integrated server and get configuration
const serverConfig = await startServer()

// Export for Bun.serve - Bun will automatically serve this
export default serverConfig
