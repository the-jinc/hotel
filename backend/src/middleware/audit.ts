import type { Context, Next, MiddlewareHandler } from "hono";
import { auditLogService } from "../services/auditLogService.js";
import type { AuthenticatedUser } from "./rbac.js";

interface AuditConfig {
  action?: "CREATE" | "UPDATE" | "DELETE";
  tableName?: string;
  recordIdParam?: string; // Parameter name to get record ID from (e.g., 'id')
  captureBody?: boolean; // Whether to capture request body
}

/**
 * Audit middleware that logs critical operations
 * Should be applied after authentication middleware
 */
export const auditMiddleware = (config: AuditConfig): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    const user = c.get("user") as AuthenticatedUser;

    if (!user) {
      // If no user, skip audit logging
      await next();
      return;
    }

    const method = c.req.method;
    const path = c.req.path;

    // Determine action based on HTTP method if not specified
    let action = config.action;
    if (!action) {
      switch (method) {
        case "POST":
          action = "CREATE";
          break;
        case "PUT":
        case "PATCH":
          action = "UPDATE";
          break;
        case "DELETE":
          action = "DELETE";
          break;
        default:
          // Don't audit GET requests or other methods
          await next();
          return;
      }
    }

    // Extract table name from config or URL path
    let tableName = config.tableName;
    if (!tableName) {
      // Try to extract from path (e.g., /api/users/123 -> users)
      const pathParts = path.split("/").filter(Boolean);
      if (pathParts.length >= 2) {
        tableName = pathParts[1]; // Assume second part is the resource name
      } else {
        tableName = "unknown";
      }
    }

    // Extract record ID if available
    let recordId: string | undefined;
    if (config.recordIdParam) {
      recordId = c.req.param(config.recordIdParam);
    }

    // Capture request body for CREATE/UPDATE operations
    let newValues: any = null;
    if (config.captureBody && (action === "CREATE" || action === "UPDATE")) {
      try {
        newValues = await c.req.json();
      } catch {
        // If body is not JSON, skip capturing it
      }
    }

    // Get client IP and User-Agent
    const ipAddress =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const userAgent = c.req.header("user-agent");

    // Execute the main request
    await next();

    // Only log if the request was successful (2xx status)
    const status = c.res.status;
    if (status >= 200 && status < 300) {
      // Create audit log entry asynchronously (don't wait for it)
      setImmediate(() => {
        auditLogService.createAuditLog({
          userId: user.id,
          action,
          tableName,
          recordId,
          newValues,
          oldValues: null, // For now, we're not capturing old values
          ipAddress,
          userAgent,
        });
      });
    }
  };
};

/**
 * Convenience function to create audit middleware for specific operations
 */
export const createAuditMiddleware = {
  /**
   * Audit user management operations
   */
  users: () =>
    auditMiddleware({
      tableName: "users",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit room management operations
   */
  rooms: () =>
    auditMiddleware({
      tableName: "rooms",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit room category operations
   */
  roomCategories: () =>
    auditMiddleware({
      tableName: "room_categories",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit booking operations
   */
  bookings: () =>
    auditMiddleware({
      tableName: "bookings",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit food category operations
   */
  foodCategories: () =>
    auditMiddleware({
      tableName: "food_categories",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit food item operations
   */
  foodItems: () =>
    auditMiddleware({
      tableName: "food_items",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Audit food order operations
   */
  foodOrders: () =>
    auditMiddleware({
      tableName: "food_orders",
      recordIdParam: "id",
      captureBody: true,
    }),

  /**
   * Generic audit middleware with custom configuration
   */
  custom: (config: AuditConfig) => auditMiddleware(config),
};
