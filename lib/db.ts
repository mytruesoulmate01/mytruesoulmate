import { neon } from "@neondatabase/serverless"

// Shared Neon SQL instance
const sql = neon(process.env.DATABASE_URL_NEON_DEVELOPMENT!)

export const query = sql.query.bind(sql)

export { sql }

export interface User {
  user_id: string
  email_id: string
  user_role: string
  token_version?: number // Added token_version to User interface
  password?: string
  failed_attempts?: number
  locked_until?: Date | null
  last_failed_attempt?: Date | null
  email_verified?: boolean // Added email verification fields to User interface
  email_verification_otp?: string | null
  otp_expires_at?: Date | null
  email_verified_at?: Date | null
}

// --- DatabaseError as a class for instanceof checks ---
export class DatabaseError extends Error {
  code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = "DatabaseError"
    this.code = code
  }
}

export function parseDatabaseError(error: any): DatabaseError {
  if (error instanceof DatabaseError) return error
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined
  const message = error && typeof error === "object" && "message" in error ? error.message : String(error)
  return new DatabaseError(message || "A database error occurred", code)
}

// --- Core Functions ---

export async function authenticateUser(email: string): Promise<User | null> {
  try {
    const result =
      await sql`SELECT user_id, email_id, password, user_role, token_version, failed_attempts, locked_until, last_failed_attempt, email_verified, email_verification_otp, otp_expires_at, email_verified_at FROM user_registration WHERE email_id = ${email}`
    if (result.length === 0) return null
    return result[0] as User
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function upsertHybridDocsRecord(docId: string, content: string, ownerId: string) {
  await sql`INSERT INTO documents (doc_id, content, owner_id) VALUES (${docId}, ${content}, ${ownerId}) ON CONFLICT (doc_id) DO UPDATE SET content = EXCLUDED.content`
}

export async function resetPassword(userId: string, newPassword: string) {
  await sql`UPDATE user_registration SET password = ${newPassword} WHERE user_id = ${userId}`
  return true
}

export async function validatePasswordResetToken(token: string): Promise<{
  user_id: string
  email_id: string
  token_id: string
} | null> {
  try {
    const bcrypt = await import("bcryptjs")

    // Fetch all active (unused, non-expired) tokens
    const activeTokens = await sql`
      SELECT 
        prt.id as token_id,
        prt.user_id,
        prt.token as hashed_token,
        prt.expires_at,
        u.email_id
      FROM password_reset_tokens prt
      JOIN user_registration u ON prt.user_id = u.user_id
      WHERE prt.used = false 
      AND prt.expires_at > NOW()
      ORDER BY prt.created_at DESC
    `

    // Compare raw token against each hashed token
    for (const tokenRecord of activeTokens) {
      const isMatch = await bcrypt.compare(token, tokenRecord.hashed_token)
      if (isMatch) {
        return {
          user_id: tokenRecord.user_id,
          email_id: tokenRecord.email_id,
          token_id: tokenRecord.token_id,
        }
      }
    }

    return null
  } catch (error) {
    console.error("Token validation error:", error)
    throw parseDatabaseError(error)
  }
}

export async function markTokenAsUsedHybrid(token: string) {
  try {
    const bcrypt = await import("bcryptjs")

    // Fetch all active tokens
    const activeTokens = await sql`
      SELECT id, token as hashed_token
      FROM password_reset_tokens
      WHERE used = false
    `

    // Find matching token
    for (const tokenRecord of activeTokens) {
      const isMatch = await bcrypt.compare(token, tokenRecord.hashed_token)
      if (isMatch) {
        await sql`UPDATE password_reset_tokens SET used = true WHERE id = ${tokenRecord.id}`
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Mark token as used error:", error)
    throw parseDatabaseError(error)
  }
}

export async function healthCheck(): Promise<boolean> {
  const result = await sql`SELECT 1`
  return result.length === 1
}

// --- Utility Functions from db-utils-migrated.ts ---

export async function getUserByEmailWithRole(email: string) {
  try {
    const result = await sql`
      SELECT user_id, email_id, user_role, token_version, failed_attempts, locked_until, last_failed_attempt, email_verified, email_verification_otp, otp_expires_at, email_verified_at
      FROM user_registration
      WHERE email_id = ${email}
    `
    if (result.length === 0) return null
    const user = result[0]
    return {
      user_id: user.user_id,
      email_id: user.email_id,
      user_role: user.user_role || "user",
      token_version: user.token_version,
      failed_attempts: user.failed_attempts,
      locked_until: user.locked_until,
      last_failed_attempt: user.last_failed_attempt,
      email_verified: user.email_verified,
      email_verification_otp: user.email_verification_otp,
      otp_expires_at: user.otp_expires_at,
      email_verified_at: user.email_verified_at,
    }
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function getUserByIdWithRole(userId: string) {
  try {
    const result = await sql`
      SELECT user_id, email_id, user_role, token_version, failed_attempts, locked_until, last_failed_attempt, email_verified, email_verification_otp, otp_expires_at, email_verified_at
      FROM user_registration
      WHERE user_id = ${userId}
    `
    if (result.length === 0) return null
    const user = result[0]
    return {
      user_id: user.user_id,
      email_id: user.email_id,
      user_role: user.user_role || "user",
      token_version: user.token_version,
      failed_attempts: user.failed_attempts,
      locked_until: user.locked_until,
      last_failed_attempt: user.last_failed_attempt,
      email_verified: user.email_verified,
      email_verification_otp: user.email_verification_otp,
      otp_expires_at: user.otp_expires_at,
      email_verified_at: user.email_verified_at,
    }
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function getAllDocsRecordsWithUserEmail() {
  try {
    const result = await sql`
      SELECT d.*, u.email_id
      FROM documents d
      LEFT JOIN user_registration u ON d.owner_id = u.user_id
    `
    return result
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function hasUserWithEmail(email: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM user_registration WHERE email_id = ${email} LIMIT 1
  `
  return result.length > 0
}

export async function hasVerificationRecords(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM verification WHERE user_id = ${userId} LIMIT 1
  `
  return result.length > 0
}

export async function hasTrustScoreRecords(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT 1 FROM trustscore WHERE user_id = ${userId} LIMIT 1
  `
  return result.length > 0
}

export async function upsertDocsRecord(docId: string, content: string, ownerId: string) {
  // Try update first
  const updateResult = await sql`
    UPDATE documents SET content = ${content} WHERE doc_id = ${docId} AND owner_id = ${ownerId}
  `
  if (updateResult.length === 0) {
    // If no rows updated, insert
    await sql`
      INSERT INTO documents (doc_id, content, owner_id) VALUES (${docId}, ${content}, ${ownerId})
    `
  }
  return true
}

export async function getUserVerificationData(userId: string) {
  const result = await sql`
    SELECT * FROM verification WHERE user_id = ${userId}
  `
  return result
}

export async function getUserTrustScoreData(userId: string) {
  const result = await sql`
    SELECT * FROM trustscore WHERE user_id = ${userId}
  `
  return result
}

export function validateDocumentFields(doc: any): boolean {
  // Example validation: ensure required fields exist
  return !!(doc && doc.doc_id && doc.content && doc.owner_id)
}

// --- Schema/Health Check Functions from db-schema-migrated.ts ---

/**
 * Verify that the required database tables exist using Neon serverless
 */
export async function verifyDatabaseSchema(): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_registration'
      ) as exists
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error("Database schema verification failed:", error)
    return false
  }
}

/**
 * Get information about the user_registration table columns using Neon serverless
 */
export async function getUserRegistrationTableInfo(): Promise<any[]> {
  try {
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'user_registration'
    `
    return result
  } catch (error) {
    console.error("Failed to get user_registration table info:", error)
    return []
  }
}

/**
 * Verify that all required tables exist using Neon serverless
 */
export async function verifyAllRequiredTables(): Promise<{
  allTablesExist: boolean
  existingTables: string[]
  missingTables: string[]
}> {
  const requiredTables = ["user_registration", "docs_trustscore_details", "trust_sharing_details"]

  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY(${requiredTables})
    `
    const existingTables = result.map((row: any) => row.table_name)
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    return {
      allTablesExist: missingTables.length === 0,
      existingTables,
      missingTables,
    }
  } catch (error) {
    console.error("Failed to verify all required tables:", error)
    return {
      allTablesExist: false,
      existingTables: [],
      missingTables: requiredTables,
    }
  }
}

/**
 * Get detailed information about a specific table using Neon serverless
 */
export async function getTableInfo(tableName: string): Promise<{
  exists: boolean
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>
  indexes: Array<{
    index_name: string
    column_name: string
    is_unique: boolean
  }>
}> {
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists
    `
    if (!tableExists[0]?.exists) {
      return {
        exists: false,
        columns: [],
        indexes: [],
      }
    }

    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = ${tableName}
      ORDER BY ordinal_position
    `

    // Get index information
    const indexes = await sql`
      SELECT 
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = ${tableName}
      AND t.relkind = 'r'
    `

    return {
      exists: true,
      columns,
      indexes,
    }
  } catch (error) {
    console.error(`Failed to get table info for ${tableName}:`, error)
    return {
      exists: false,
      columns: [],
      indexes: [],
    }
  }
}

/**
 * Check database connection health using Neon serverless
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean
  serverTime: string | null
  version: string | null
  error: string | null
}> {
  try {
    const result = await sql`
      SELECT 
        NOW() as server_time,
        version() as version
    `
    if (result.length > 0) {
      return {
        isHealthy: true,
        serverTime: result[0].server_time,
        version: result[0].version,
        error: null,
      }
    }
    return {
      isHealthy: false,
      serverTime: null,
      version: null,
      error: "No data returned from health check query",
    }
  } catch (error) {
    return {
      isHealthy: false,
      serverTime: null,
      version: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function incrementTokenVersion(email: string): Promise<void> {
  try {
    await sql`UPDATE user_registration SET token_version = token_version + 1 WHERE email_id = ${email}`
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function incrementFailedAttempts(email: string): Promise<void> {
  try {
    await sql`
      UPDATE user_registration 
      SET failed_attempts = COALESCE(failed_attempts, 0) + 1,
          last_failed_attempt = NOW()
      WHERE email_id = ${email}
    `
  } catch (error) {
    throw parseDatabaseError(error)
  }
}

export async function resetFailedAttempts(email: string): Promise<void> {
  try {
    await sql`
      UPDATE user_registration 
      SET failed_attempts = 0,
          last_failed_attempt = NULL
      WHERE email_id = ${email}
    `
  } catch (error) {
    throw parseDatabaseError(error)
  }
}
