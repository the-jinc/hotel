import { Hono } from "hono";
import { jwtAuth, requireAdmin } from "../middleware/auth.js";
import { auditLogService } from "../services/auditLogService.js";

const auditLogs = new Hono();

// All audit log routes require admin access
auditLogs.use("*", jwtAuth);
auditLogs.use("*", requireAdmin);

/**
 * GET /audit-logs
 * Get audit logs with filtering and pagination
 */
auditLogs.get("/", async (c) => {
  try {
    const {
      page = "1",
      limit = "50",
      userId,
      action,
      tableName,
      recordId,
      startDate,
      endDate,
      ipAddress,
    } = c.req.query();

    const filters: any = {};

    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (tableName) filters.tableName = tableName;
    if (recordId) filters.recordId = recordId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (ipAddress) filters.ipAddress = ipAddress;
    filters.page = parseInt(page);
    filters.pageSize = parseInt(limit);

    const result = await auditLogService.getAuditLogs(filters);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch audit logs",
      },
      500
    );
  }
});

/**
 * GET /audit-logs/stats
 * Get audit log statistics
 */
auditLogs.get("/stats", async (c) => {
  try {
    const stats = await auditLogService.getAuditLogStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching audit log stats:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch audit log statistics",
      },
      500
    );
  }
});

/**
 * GET /audit-logs/users
 * Get unique users who have audit logs
 */
auditLogs.get("/users", async (c) => {
  try {
    const { startDate, endDate } = c.req.query();

    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const users = await auditLogService.getUniqueUsers(filters);

    return c.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching audit log users:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch audit log users",
      },
      500
    );
  }
});

/**
 * GET /audit-logs/tables
 * Get unique table names that have audit logs
 */
auditLogs.get("/tables", async (c) => {
  try {
    const { startDate, endDate } = c.req.query();

    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const tables = await auditLogService.getUniqueTables(filters);

    return c.json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("Error fetching audit log tables:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch audit log tables",
      },
      500
    );
  }
});

/**
 * GET /audit-logs/:id
 * Get a specific audit log entry
 */
auditLogs.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const auditLog = await auditLogService.getAuditLogById(id);

    if (!auditLog) {
      return c.json(
        {
          success: false,
          error: "Audit log not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      data: auditLog,
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch audit log",
      },
      500
    );
  }
});

export default auditLogs;
