import path from "node:path";

/**
 * Loads .env.local into process.env before the test environment imports any
 * module that reads from it (lib/env.ts validates required vars at import).
 */
process.loadEnvFile(path.resolve(__dirname, "..", ".env.local"));
