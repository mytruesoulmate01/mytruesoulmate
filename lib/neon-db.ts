/**
 * New Neon Serverless Database Layer
 * Replaces the traditional PostgreSQL pool approach
 */

import { neon } from "@neondatabase/serverless"
import { getDatabaseConfig } from "./environment-config"

// Global SQL client instance for reuse
let sqlClient: ReturnType<typeof neon> | null = null

/**
 * Get or create Neon SQL client
 * Replaces the getPool() function
 */
export function getSQL() {
  if (!sqlClient) {
    const config = getDatabaseConfig()
    sqlClient = neon(config.connectionString)

    if (config.enableLogging) {
      console.log("Neon serverless client created")
    }
  }
  return sqlClient
}

/**
 * Execute a query using Neon serverless
 * Replaces the traditional query(text, params) function
 */
export async function executeQuery<T = any>(queryTemplate: TemplateStringsArray, ...values: any[]): Promise<T[]> {
  const startTime = Date.now()
  const sql = getSQL()

  try {
    const result = await sql(queryTemplate, ...values)
    const duration = Date.now() - startTime

    const config = getDatabaseConfig()
    if (config.enableLogging) {
      console.log("Executed Neon query", {
        query: String.raw(queryTemplate, ...values.map(() => "?")),
        duration: `${duration}ms`,
        rows: result.length,
      })
    }

    return result as T[]
  } catch (error) {
    const duration = Date.now() - startTime
    console.error("Neon query error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`,
      query: String.raw(queryTemplate, ...values.map(() => "?")),
    })

    // Enhanced error handling for common Neon scenarios
    if (error instanceof Error) {
      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        console.error("Table not found. Available tables can be checked with schema queries.")
      }

      if (error.message.includes("connection")) {
        console.error("Connection issue. Check DATABASE_URL_NEON_DEVELOPMENT and network connectivity.")
      }
    }

    throw error
  }
}

/**
 * Execute multiple queries in sequence (transaction alternative)
 * Replaces the transaction() function for simple cases
 */
export async function executeSequence<T>(operations: Array<() => Promise<any>>): Promise<T[]> {
  const results: T[] = []
  const config = getDatabaseConfig()

  try {
    for (let i = 0; i < operations.length; i++) {
      const result = await operations[i]()
      results.push(result)

      if (config.enableLogging) {
        console.log(`Sequence operation ${i + 1}/${operations.length} completed`)
      }
    }

    return results
  } catch (error) {
    console.error(`Sequence failed at operation ${results.length + 1}:`, error)
    throw error
  }
}

/**
 * Health check for Neon database
 * Replaces the healthCheck() function
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const sql = getSQL()
    const result = await sql`SELECT NOW() as current_time`
    return result.length === 1 && result[0].current_time
  } catch (error) {
    console.error("Neon health check failed:", error)
    return false
  }
}

/**
 * Get database information
 */
export async function getDatabaseInfo(): Promise<{
  serverVersion: string
  currentTime: string
  connectionValid: boolean
}> {
  try {
    const sql = getSQL()
    const result = await sql`
      SELECT 
        version() as server_version,
        NOW() as current_time
    `

    return {
      serverVersion: result[0].server_version,
      currentTime: result[0].current_time,
      connectionValid: true,
    }
  } catch (error) {
    return {
      serverVersion: "Unknown",
      currentTime: "Unknown",
      connectionValid: false,
    }
  }
}

/**
 * Execute a raw SQL query (for complex operations)
 */
export async function executeRawQuery<T = any>(sqlString: string, params: Record<string, any> = {}): Promise<T[]> {
  const sql = getSQL()

  // Convert named parameters to template literal format
  let processedQuery = sqlString
  const values: any[] = []

  Object.entries(params).forEach(([key, value]) => {
    processedQuery = processedQuery.replace(new RegExp(`:${key}`, "g"), `$${values.length + 1}`)
    values.push(value)
  })

  // This is a simplified approach - in practice, you'd need more sophisticated parameter handling
  console.warn("executeRawQuery is a compatibility function. Consider migrating to template literals.")

  try {
    // For now, we'll use a simple approach
    const result = await sql([processedQuery] as any, ...values)
    return result as T[]
  } catch (error) {
    console.error("Raw query execution failed:", error)
    throw error
  }
}
