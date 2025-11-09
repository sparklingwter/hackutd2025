/**
 * Error Tracking Integration
 * Placeholder for Sentry or similar error tracking service
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Add SENTRY_DSN to environment variables
 * 4. Uncomment Sentry initialization code below
 */

import { logger } from "./logger";

export interface ErrorContext {
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Initialize error tracking
 * Call this in your app initialization (e.g., _app.tsx or layout.tsx)
 */
export function initErrorTracking(): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    logger.info("Error tracking initialized", {
      environment: process.env.NODE_ENV,
    });

    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      beforeSend(event, hint) {
        // Add custom filtering or PII scrubbing here
        return event;
      },
    });
    */
  } else {
    logger.info("Error tracking disabled (development mode or no DSN configured)");
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: ErrorContext): void {
  // Log to console/structured logs
  logger.error("Exception captured", error, context);

  // Send to error tracking service
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.captureException(error, {
      contexts: {
        custom: context ?? {},
      },
    });
    */
  }
}

/**
 * Capture a message (non-error event)
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: ErrorContext
): void {
  // Log to console/structured logs
  switch (level) {
    case "info":
      logger.info(message, context);
      break;
    case "warning":
      logger.warn(message, context);
      break;
    case "error":
      logger.error(message, undefined, context);
      break;
  }

  // Send to error tracking service
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.captureMessage(message, {
      level: level === "warning" ? "warning" : level === "error" ? "error" : "info",
      contexts: {
        custom: context ?? {},
      },
    });
    */
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(_userId: string): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.setUser({
      id: userId,
    });
    */
    
    logger.debug("User context set for error tracking", { userId: "[REDACTED]" });
  }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.setUser(null);
    */
    
    logger.debug("User context cleared for error tracking");
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Uncomment when Sentry is installed:
    /*
    import * as Sentry from "@sentry/nextjs";
    
    Sentry.addBreadcrumb({
      message,
      category: category ?? "custom",
      data: data ?? {},
      level: "info",
    });
    */
    
    logger.debug("Breadcrumb added", { message, category, data });
  }
}

/**
 * Wrap a function with error tracking
 */
export function withErrorTracking<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error: Error) => {
          captureException(error, {
            ...context,
            functionName: fn.name,
          });
          throw error;
        }) as ReturnType<T>;
      }
      
      return result;
    } catch (error) {
      captureException(error as Error, {
        ...context,
        functionName: fn.name,
      });
      throw error;
    }
  }) as T;
}
