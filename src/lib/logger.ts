/**
 * Structured JSON Logger with PII Redaction
 * Provides consistent logging across the application with automatic PII masking
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  requestId?: string;
  userId?: string;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

// PII patterns to redact
const PII_PATTERNS = [
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: "[EMAIL_REDACTED]" },
  // Phone numbers (various formats)
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: "[PHONE_REDACTED]" },
  { pattern: /\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b/g, replacement: "[PHONE_REDACTED]" },
  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[SSN_REDACTED]" },
  // Credit card numbers (basic pattern)
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: "[CC_REDACTED]" },
  // IP addresses
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, replacement: "[IP_REDACTED]" },
];

// Sensitive field names to redact
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "apiKey",
  "secret",
  "authorization",
  "creditCard",
  "ssn",
  "phoneNumber",
  "email",
  "address",
  "zipCode",
  "postalCode",
];

/**
 * Redacts PII from a string
 */
function redactPII(text: string): string {
  let redacted = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    redacted = redacted.replace(pattern, replacement);
  }
  return redacted;
}

/**
 * Recursively redacts sensitive fields from an object
 */
function redactSensitiveFields(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return redactPII(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveFields(item));
  }

  if (typeof obj === "object") {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some((field) =>
        lowerKey.includes(field.toLowerCase())
      );

      if (isSensitive) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = redactSensitiveFields(value);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * Formats a log entry as JSON
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry, null, process.env.NODE_ENV === "development" ? 2 : 0);
}

/**
 * Base logging function
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: redactPII(message),
    context: context ? (redactSensitiveFields(context) as LogContext) : undefined,
  };

  if (error) {
    entry.error = {
      message: redactPII(error.message),
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      code: "code" in error ? String(error.code) : undefined,
    };
  }

  const formatted = formatLogEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

/**
 * Logger instance with convenience methods
 */
export const logger = {
  /**
   * Log debug information (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      log("debug", message, context);
    }
  },

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    log("info", message, context);
  },

  /**
   * Log warnings
   */
  warn(message: string, context?: LogContext): void {
    log("warn", message, context);
  },

  /**
   * Log errors
   */
  error(message: string, error?: Error, context?: LogContext): void {
    log("error", message, context, error);
  },

  /**
   * Create a child logger with a request ID
   */
  withRequestId(requestId: string) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...context, requestId }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...context, requestId }),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...context, requestId }),
      error: (message: string, error?: Error, context?: LogContext) =>
        logger.error(message, error, { ...context, requestId }),
    };
  },

  /**
   * Create a child logger with a user ID
   * Note: User ID is redacted for privacy
   */
  withUserId(_userId: string) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...context, userId: "[USER_ID_REDACTED]" }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...context, userId: "[USER_ID_REDACTED]" }),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...context, userId: "[USER_ID_REDACTED]" }),
      error: (message: string, error?: Error, context?: LogContext) =>
        logger.error(message, error, { ...context, userId: "[USER_ID_REDACTED]" }),
    };
  },
};

/**
 * Utility to generate request IDs
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
