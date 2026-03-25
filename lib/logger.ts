interface LogEntry {
  timestamp: string
  level: "INFO" | "WARN" | "ERROR" | "DEBUG"
  step: string
  substep?: string
  userId?: string
  email?: string
  data?: any
  duration?: number
  error?: string
  stack?: string


}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private stepTimers: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatData(data?: any): string {
    if (!data) return ""
    return typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)
  }

  private createLogEntry(
    level: LogEntry["level"],
    step: string,
    message: string,
    data?: any,
    substep?: string,
    userId?: string,
    email?: string,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      step,
      substep,
      userId,
      email,
      data: data ? JSON.stringify(data, null, 2) : undefined,
      error: error?.message,
      stack: error?.stack,
    }
  }

  info(step: string, message: string, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("INFO", step, message, data, substep, userId, email)
    this.logs.push(entry)
    console.log(`🔵 [${step}${substep ? `::${substep}` : ""}] ${message}`, this.formatData(data))
  }

  warn(step: string, message: string, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("WARN", step, message, data, substep, userId, email)
    this.logs.push(entry)
    console.warn(`🟡 [${step}${substep ? `::${substep}` : ""}] ${message}`, this.formatData(data))
  }

  error(step: string, message: string, error?: Error, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("ERROR", step, message, data, substep, userId, email, error)
    this.logs.push(entry)
    console.error(`🔴 [${step}${substep ? `::${substep}` : ""}] ${message}`, error || this.formatData(data))
  }

  debug(step: string, message: string, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("DEBUG", step, message, data, substep, userId, email)
    this.logs.push(entry)
    if (process.env.NODE_ENV === "development") {
      console.debug(`🔍 [${step}${substep ? `::${substep}` : ""}] ${message}`, this.formatData(data))
    }
  }

  startTimer(step: string, substep?: string) {
    const key = substep ? `${step}::${substep}` : step
    this.stepTimers.set(key, Date.now())
    this.debug(step, `Timer started`, undefined, substep)
  }

  endTimer(step: string, substep?: string): number {
    const key = substep ? `${step}::${substep}` : step
    const startTime = this.stepTimers.get(key)
    if (startTime) {
      const duration = Date.now() - startTime
      this.stepTimers.delete(key)
      this.info(step, `Timer ended - Duration: ${duration}ms`, { duration }, substep)
      return duration
    }
    return 0
  }

  security(step: string, message: string, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("WARN", step, `[SECURITY] ${message}`, data, substep, userId, email)
    this.logs.push(entry)
    console.warn(`🚨 [SECURITY][${step}${substep ? `::${substep}` : ""}] ${message}`, this.formatData(data))
  }

  audit(step: string, message: string, data?: any, substep?: string, userId?: string, email?: string) {
    const entry = this.createLogEntry("INFO", step, `[AUDIT] ${message}`, data, substep, userId, email)
    this.logs.push(entry)
    console.log(`📋 [AUDIT][${step}${substep ? `::${substep}` : ""}] ${message}`, this.formatData(data))
  }

  performance(step: string, message: string, duration: number, data?: any, substep?: string, userId?: string) {
    const entry = this.createLogEntry("INFO", step, `[PERF] ${message}`, { ...data, duration }, substep, userId)
    this.logs.push(entry)
    console.log(`⚡ [PERF][${step}${substep ? `::${substep}` : ""}] ${message} (${duration}ms)`, this.formatData(data))
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    this.stepTimers.clear()
  }

  getLogsSummary() {
    const summary = {
      total: this.logs.length,
      byLevel: {
        INFO: this.logs.filter((l) => l.level === "INFO").length,
        WARN: this.logs.filter((l) => l.level === "WARN").length,
        ERROR: this.logs.filter((l) => l.level === "ERROR").length,
        DEBUG: this.logs.filter((l) => l.level === "DEBUG").length,
      },
      byStep: {} as Record<string, number>,
    }

    this.logs.forEach((log) => {
      const stepKey = log.substep ? `${log.step}::${log.substep}` : log.step
      summary.byStep[stepKey] = (summary.byStep[stepKey] || 0) + 1
    })

    return summary
  }

  getSecurityLogs(): LogEntry[] {
    return this.logs.filter((log) => log.data?.includes("[SECURITY]") || log.level === "WARN" || log.level === "ERROR")
  }

  getPerformanceLogs(): LogEntry[] {
    return this.logs.filter((log) => log.data?.includes("[PERF]") || log.duration !== undefined)
  }
}

export const logger = Logger.getInstance()
