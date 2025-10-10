/**
 * Environment configuration for database connections
 * Centralizes all database-related environment variables
 */

export interface DatabaseConfig {
  connectionString: string
  useServerless: boolean
  enableLogging: boolean
  maxRetries: number
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  const connectionString = process.env.DATABASE_URL_NEON_DEVELOPMENT

  if (!connectionString) {
    throw new Error("DATABASE_URL_NEON_DEVELOPMENT environment variable is required")
  }

  // Validate Neon connection string format
  if (!connectionString.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL_NEON_DEVELOPMENT must be a valid PostgreSQL connection string")
  }

  return {
    connectionString,
    useServerless: process.env.USE_NEON_SERVERLESS === "true",
    enableLogging: process.env.DB_LOGGING === "true",
    maxRetries: Number.parseInt(process.env.DB_MAX_RETRIES || "3", 10),
  }
}

/**
 * Validate database connection string format
 */
export function validateConnectionString(connectionString: string): boolean {
  try {
    const url = new URL(connectionString)
    return (
      url.protocol === "postgresql:" &&
      url.hostname.length > 0 &&
      url.pathname.length > 1 &&
      url.searchParams.get("sslmode") === "require"
    )
  } catch {
    return false
  }
}

/**
 * Environment validation for migration
 */
export function validateMigrationEnvironment(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  if (!process.env.DATABASE_URL_NEON_DEVELOPMENT) {
    errors.push("DATABASE_URL_NEON_DEVELOPMENT environment variable is missing")
  } else if (!validateConnectionString(process.env.DATABASE_URL_NEON_DEVELOPMENT)) {
    errors.push("DATABASE_URL_NEON_DEVELOPMENT format is invalid")
  }

  // Check optional environment variables
  if (!process.env.USE_NEON_SERVERLESS) {
    warnings.push("USE_NEON_SERVERLESS not set, defaulting to false")
  }

  if (!process.env.DB_LOGGING) {
    warnings.push("DB_LOGGING not set, defaulting to false")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
