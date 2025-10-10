import { Resend } from "resend"
import { logger } from "./logger"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

interface RateLimitData {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const rateLimitData: RateLimitData = {}

// Rate limiting: 5 emails per hour per IP
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now()
  const key = `email_${ipAddress}`

  if (!rateLimitData[key]) {
    rateLimitData[key] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW }
  }

  const data = rateLimitData[key]

  // Reset if window has passed
  if (now > data.resetTime) {
    data.count = 0
    data.resetTime = now + RATE_LIMIT_WINDOW
  }

  if (data.count >= RATE_LIMIT_MAX) {
    logger.warn(
      "email-service",
      "Rate limit exceeded",
      {
        ipAddress,
        count: data.count,
        resetTime: new Date(data.resetTime).toISOString(),
      },
      "rate-limit-exceeded",
    )
    return false
  }

  data.count++
  return true
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  ipAddress = "unknown",
): Promise<EmailResult> {
  logger.startTimer("email-service", "password-reset")

  try {
    logger.info(
      "email-service",
      "Password reset email process started",
      {
        email,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
      "password-reset-start",
    )

    if (!process.env.RESEND_SENDER_EMAIL) {
      logger.error(
        "email-service",
        "RESEND_SENDER_EMAIL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-sender-email",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      logger.error(
        "email-service",
        "NEXT_PUBLIC_APP_URL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-app-url",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    // Check rate limiting
    if (!checkRateLimit(ipAddress)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      }
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    const senderEmail = process.env.RESEND_SENDER_EMAIL

    logger.info(
      "email-service",
      "Sending reset email",
      {
        to: email,
        from: senderEmail,
        resetUrl: resetUrl.replace(resetToken, "[REDACTED]"),
        ipAddress,
      },
      "sending-reset-email",
    )

    const emailData = {
      from: senderEmail,
      to: email,
      subject: "Reset Your MyTrueSoulMate Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MyTrueSoulMate</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password for your MyTrueSoulMate account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p>This link will expire in 30 minutes for security reasons.</p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
              <p>This email was sent from MyTrueSoulMate Security System</p>
              <p>© 2025 MyTrueSoulMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        MyTrueSoulMate - Password Reset Request
        
        Hello,
        
        We received a request to reset your password for your MyTrueSoulMate account.
        
        To reset your password, click the following link:
        ${resetUrl}
        
        This link will expire in 30 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        
        © 2025 MyTrueSoulMate. All rights reserved.
      `,
    }

    const result = await resend.emails.send(emailData)
    const duration = logger.endTimer("email-service", "password-reset")

    if (result.error) {
      logger.error(
        "email-service",
        "Password reset email failed",
        result.error,
        {
          email,
          error: result.error.message || "unknown",
          ipAddress,
          statusCode: result.error.statusCode || "unknown",
        },
        "password-reset-error",
      )

      return {
        success: false,
        error: result.error.message || "Failed to send email",
      }
    }

    logger.info(
      "email-service",
      "Password reset email sent successfully",
      {
        email,
        messageId: result.data?.id,
        ipAddress,
        processingTime: duration,
      },
      "password-reset-success",
    )

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    logger.endTimer("email-service", "password-reset")

    logger.error(
      "email-service",
      "Password reset email exception",
      error instanceof Error ? error : undefined,
      {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ipAddress,
      },
      "password-reset-exception",
    )

    return {
      success: false,
      error: "Failed to send password reset email",
    }
  }
}

export async function sendPasswordResetConfirmationEmail(email: string, ipAddress = "unknown"): Promise<EmailResult> {
  logger.startTimer("email-service", "confirmation")

  try {
    logger.info(
      "email-service",
      "Password reset confirmation email process started",
      {
        email,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
      "confirmation-start",
    )

    if (!process.env.RESEND_SENDER_EMAIL) {
      logger.error(
        "email-service",
        "RESEND_SENDER_EMAIL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-sender-email",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      logger.error(
        "email-service",
        "NEXT_PUBLIC_APP_URL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-app-url",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    // Check rate limiting
    if (!checkRateLimit(ipAddress)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      }
    }

    const senderEmail = process.env.RESEND_SENDER_EMAIL
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`

    logger.info(
      "email-service",
      "Sending confirmation email",
      {
        to: email,
        from: senderEmail,
        loginUrl: loginUrl.replace(process.env.NEXT_PUBLIC_APP_URL, "[REDACTED]"),
        ipAddress,
      },
      "sending-confirmation-email",
    )

    const emailData = {
      from: senderEmail,
      to: email,
      subject: "Password Successfully Reset - MyTrueSoulMate",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MyTrueSoulMate</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Password Reset Successful</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #28a745; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 24px;">✓</div>
            </div>
            
            <h2 style="color: #333; margin-top: 0; text-align: center;">Password Successfully Reset</h2>
            
            <p>Hello,</p>
            
            <p>Your MyTrueSoulMate account password has been successfully reset. You can now log in with your new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Your Account</a>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Security Information:</h3>
              <ul style="color: #6c757d; margin: 0;">
                <li>Password reset completed at: ${new Date().toLocaleString()}</li>
                <li>If you didn't make this change, please contact support immediately</li>
                <li>We recommend using a strong, unique password</li>
              </ul>
            </div>
            
            <p>If you have any questions or concerns about your account security, please don't hesitate to contact our support team.</p>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
              <p>This email was sent from MyTrueSoulMate Security System</p>
              <p>© 2025 MyTrueSoulMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        MyTrueSoulMate - Password Reset Successful
        
        Hello,
        
        Your MyTrueSoulMate account password has been successfully reset. You can now log in with your new password.
        
        Login at: ${loginUrl}
        
        Security Information:
        - Password reset completed at: ${new Date().toLocaleString()}
        - If you didn't make this change, please contact support immediately
        - We recommend using a strong, unique password
        
        If you have any questions or concerns about your account security, please contact our support team.
        
        © 2025 MyTrueSoulMate. All rights reserved.
      `,
    }

    const result = await resend.emails.send(emailData)
    const duration = logger.endTimer("email-service", "confirmation")

    if (result.error) {
      logger.error(
        "email-service",
        "Password reset confirmation email failed",
        result.error,
        {
          email,
          error: result.error,
          ipAddress,
          statusCode: result.error.statusCode || "unknown",
        },
        "confirmation-error",
      )

      return {
        success: false,
        error: result.error.message || "Failed to send confirmation email",
      }
    }

    logger.info(
      "email-service",
      "Password reset confirmation email sent successfully",
      {
        email,
        messageId: result.data?.id,
        ipAddress,
        processingTime: duration,
      },
      "confirmation-success",
    )

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    logger.endTimer("email-service", "confirmation")

    logger.error(
      "email-service",
      "Password reset confirmation email exception",
      error instanceof Error ? error : undefined,
      {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ipAddress,
      },
      "confirmation-exception",
    )

    return {
      success: false,
      error: "Failed to send confirmation email",
    }
  }
}

export async function sendVerificationEmail(
  email: string,
  verificationToken: string,
  ipAddress = "unknown",
): Promise<EmailResult> {
  logger.startTimer("email-service", "verification")

  try {
    logger.info(
      "email-service",
      "Email verification process started",
      {
        email,
        ipAddress,
        timestamp: new Date().toISOString(),
      },
      "verification-start",
    )

    if (!process.env.RESEND_SENDER_EMAIL) {
      logger.error(
        "email-service",
        "RESEND_SENDER_EMAIL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-sender-email",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      logger.error(
        "email-service",
        "NEXT_PUBLIC_APP_URL environment variable not set",
        undefined,
        {
          email,
          ipAddress,
        },
        "missing-app-url",
      )
      return {
        success: false,
        error: "Email service not configured. Please contact administrator.",
      }
    }

    // Check rate limiting
    if (!checkRateLimit(ipAddress)) {
      return {
        success: false,
        error: "Rate limit exceeded. Please try again later.",
      }
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    const senderEmail = process.env.RESEND_SENDER_EMAIL

    logger.info(
      "email-service",
      "Sending verification email",
      {
        to: email,
        from: senderEmail,
        verificationUrl: verificationUrl.replace(verificationToken, "[REDACTED]"),
        ipAddress,
      },
      "sending-verification-email",
    )

    const emailData = {
      from: senderEmail,
      to: email,
      subject: "Verify Your Email - MyTrueSoulMate",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MyTrueSoulMate</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0;">Welcome! Please Verify Your Email</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            
            <p>Hello,</p>
            
            <p>Thank you for signing up for MyTrueSoulMate! To complete your registration and start finding your soulmate, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            
            <p>This link will expire in 24 hours for security reasons.</p>
            
            <p>Once verified, you'll be able to:</p>
            <ul style="color: #555;">
              <li>Access your account</li>
              <li>Complete your profile</li>
              <li>Start connecting with potential matches</li>
              <li>Explore all features of MyTrueSoulMate</li>
            </ul>
            
            <p>If you didn't create an account with MyTrueSoulMate, please ignore this email.</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
              <p>This email was sent from MyTrueSoulMate</p>
              <p>© 2025 MyTrueSoulMate. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        MyTrueSoulMate - Verify Your Email
        
        Hello,
        
        Thank you for signing up for MyTrueSoulMate! To complete your registration and start finding your soulmate, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 24 hours for security reasons.
        
        Once verified, you'll be able to:
        - Access your account
        - Complete your profile
        - Start connecting with potential matches
        - Explore all features of MyTrueSoulMate
        
        If you didn't create an account with MyTrueSoulMate, please ignore this email.
        
        © 2025 MyTrueSoulMate. All rights reserved.
      `,
    }

    const result = await resend.emails.send(emailData)
    const duration = logger.endTimer("email-service", "verification")

    if (result.error) {
      logger.error(
        "email-service",
        "Email verification failed",
        result.error,
        {
          email,
          error: result.error.message || "unknown",
          ipAddress,
          statusCode: result.error.statusCode || "unknown",
        },
        "verification-error",
      )

      return {
        success: false,
        error: result.error.message || "Failed to send verification email",
      }
    }

    logger.info(
      "email-service",
      "Email verification sent successfully",
      {
        email,
        messageId: result.data?.id,
        ipAddress,
        processingTime: duration,
      },
      "verification-success",
    )

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error) {
    logger.endTimer("email-service", "verification")

    logger.error(
      "email-service",
      "Email verification exception",
      error instanceof Error ? error : undefined,
      {
        email,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ipAddress,
      },
      "verification-exception",
    )

    return {
      success: false,
      error: "Failed to send verification email",
    }
  }
}

export async function testResendConnection(): Promise<any> {
  try {
    logger.info("email-service", "Starting Resend connection test", undefined, "connection-test-start")

    const apiKey = process.env.RESEND_API_KEY
    const senderEmail = process.env.RESEND_SENDER_EMAIL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const environment = {
      RESEND_API_KEY: apiKey ? "SET" : "NOT SET",
      RESEND_SENDER_EMAIL: senderEmail || "NOT SET",
      NEXT_PUBLIC_APP_URL: appUrl || "NOT SET",
    }

    logger.info("email-service", "Environment check completed", environment, "environment-check")

    if (!senderEmail) {
      const result = {
        success: false,
        message: "RESEND_SENDER_EMAIL environment variable not set",
        environment,
        timestamp: new Date().toISOString(),
      }
      logger.error(
        "email-service",
        "Connection test failed - missing sender email",
        undefined,
        result,
        "connection-test-failed",
      )
      return result
    }

    // Test connection with a simple API call
    const testResult = await resend.emails.send({
      from: senderEmail,
      to: "test@example.com", // This will fail but test the connection
      subject: "Connection Test",
      text: "This is a connection test",
    })

    const result = {
      success: true,
      message: "Resend connection test successful",
      environment,
      connectionTest: {
        data: testResult.data,
        error: testResult.error,
      },
      timestamp: new Date().toISOString(),
    }

    logger.info("email-service", "Resend connection test completed successfully", result, "connection-test-complete")
    return result
  } catch (error) {
    const result = {
      success: false,
      message: "Resend connection test failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }

    logger.error(
      "email-service",
      "Resend connection test failed",
      error instanceof Error ? error : undefined,
      result,
      "connection-test-failed",
    )
    return result
  }
}

export function cleanupRateLimitData(): void {
  const now = Date.now()
  Object.keys(rateLimitData).forEach((key) => {
    if (now > rateLimitData[key].resetTime) {
      delete rateLimitData[key]
    }
  })

  logger.info(
    "email-service",
    "Rate limit data cleanup completed",
    {
      remainingEntries: Object.keys(rateLimitData).length,
    },
    "rate-limit-cleanup",
  )
}

// Cleanup rate limit data every hour
setInterval(cleanupRateLimitData, 60 * 60 * 1000)
