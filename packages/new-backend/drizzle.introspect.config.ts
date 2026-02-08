
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    out: './src/db/schema/legacy',
    schema: './src/db/schema/index.ts', // Dummy schema path, not used for introspect but required?
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    // Introspect specific config might go here if needed, but 'out' usually directs the output
})
