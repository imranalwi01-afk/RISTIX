/**
 * Main entry point
 * Starts the Bun server with Socket.IO, Bull queues, and all integrations
 */

import { startServer } from './server'

// Start the integrated server and serve with Bun
const serverConfig = await startServer()

// Export default for Bun.serve
export default Bun.serve(serverConfig)
