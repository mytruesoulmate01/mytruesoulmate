import { createLogger, format, transports } from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

// Enhanced logging interface for password reset operations
interface PasswordResetLogContext {
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  tokenId?: string
  step: string
  substep?: string
  duration?: number
  metadata?: Record<string, any>
}

class AdvancedLogger {
  private static instance: AdvancedLogger
  private winstonLogger: any

  private constructor() {
    this.initializeWinston()
  }

  static getInstance(): AdvancedLogger {
    if (!AdvancedLogger.instance) {
      AdvancedLogger.instance = new AdvancedLogger()
    }
    return AdvancedLogger.instance
  }

  private initializeWinston() {
    // Custom format for structured logging
    const customFormat = format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level: level.toUpperCase(),
          message,
          ...meta,
        })
      }),
    )

    // Create winston logger
    this.winstonLogger = createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: customFormat,
      defaultMeta: {
        service: "mytruesoulmate-password-reset",
        environment: process.env.NODE_ENV || "development",
      },
      transports: [
        // Console transport for development
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
            format.printf(({ timestamp, level, message, step, substep, userId, email }) => {
              const stepInfo = substep ? `${step}::${substep}` : step
              const userInfo = userId ? `[User:${userId}]` : email ? `[Email:${email}]` : ""
              return `${timestamp} ${level} [${stepInfo}] ${userInfo} ${message}`
            }),
          ),
        }),

        // File transport for all logs
        new DailyRotateFile({
          filename: "logs/password-reset-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "14d",
          format: customFormat,
        }),

        // Separate file for errors
        new DailyRotateFile({
          filename: "logs/password-reset-errors-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxSize: "20m",
          maxFiles: "30d",
          format: customFormat,
        }),

        // Security events file
        new DailyRotateFile({
          filename: "logs/password-reset-security-%DATE%.log",
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "90d",
          format: customFormat,
          level: "warn",
        }),
      ],
    })
  }

  // Password reset specific logging methods
  logPasswordResetRequest(context: PasswordResetLogContext) {
    this.winstonLogger.info("Password reset requested", {
      ...context,
      event: "password_reset_request",
      sensitive: false,
    })
  }

  logPasswordResetEmailSent(context: PasswordResetLogContext) {
    this.winstonLogger.info("Password reset email sent", {
      ...context,
      event: "password_reset_email_sent",
      sensitive: false,
    })
  }

  logPasswordResetTokenValidation(context: PasswordResetLogContext & { valid: boolean }) {
    this.winstonLogger.info("Password reset token validated", {
      ...context,
      event: "password_reset_token_validation",
      sensitive: false,
    })
  }

  logPasswordResetSuccess(context: PasswordResetLogContext) {
    this.winstonLogger.info("Password reset completed successfully", {
      ...context,
      event: "password_reset_success",
      sensitive: false,
    })
  }

  logPasswordResetFailure(context: PasswordResetLogContext & { reason: string; error?: Error }) {
    this.winstonLogger.error("Password reset failed", {
      ...context,
      event: "password_reset_failure",
      sensitive: false,
      error: context.error?.message,
      stack: context.error?.stack,
    })
  }

  logSecurityEvent(context: PasswordResetLogContext & { eventType: string; severity: "low" | "medium" | "high" }) {
    this.winstonLogger.warn("Security event detected", {
      ...context,
      event: "security_event",
      sensitive: true,
    })
  }

  logRateLimitExceeded(context: PasswordResetLogContext & { limitType: "global" | "user" }) {
    this.winstonLogger.warn("Rate limit exceeded", {
      ...context,
      event: "rate_limit_exceeded",
      sensitive: true,
    })
  }

  // Generic logging methods
  info(message: string, context?: PasswordResetLogContext) {
    this.winstonLogger.info(message, context)
  }

  warn(message: string, context?: PasswordResetLogContext) {
    this.winstonLogger.warn(message, context)
  }

  error(message: string, error?: Error, context?: PasswordResetLogContext) {
    this.winstonLogger.error(message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    })
  }

  debug(message: string, context?: PasswordResetLogContext) {
    this.winstonLogger.debug(message, context)
  }
}

export const advancedLogger = AdvancedLogger.getInstance()
