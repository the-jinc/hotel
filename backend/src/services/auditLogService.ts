import { eq, desc, and, gte, lte, ilike, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditLogs, users, type NewAuditLog } from "../db/schema.js";

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  tableName?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

class AuditLogService {
  async createAuditLog(
    auditData: Omit<NewAuditLog, "id" | "createdAt">
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        ...auditData,
        oldValues: auditData.oldValues
          ? JSON.stringify(auditData.oldValues)
          : null,
        newValues: auditData.newValues
          ? JSON.stringify(auditData.newValues)
          : null,
      });
    } catch (error) {
      // Log the error but don't throw - audit logging should not break the main operation
      console.error("Failed to create audit log:", error);
    }
  }

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<{
    logs: AuditLogEntry[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const {
      userId,
      action,
      tableName,
      startDate,
      endDate,
      search,
      page = 1,
      pageSize = 50,
    } = filters;

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (tableName) {
      conditions.push(eq(auditLogs.tableName, tableName));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    if (search) {
      // Search in user names, table names, or record IDs
      conditions.push(
        // Note: In a real implementation, you might want to use a full-text search
        // For now, we'll search in table name and record ID
        ilike(auditLogs.tableName, `%${search}%`)
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);

    const totalCount = countResult[0].count;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Get paginated results with user information
    const logs = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        action: auditLogs.action,
        tableName: auditLogs.tableName,
        recordId: auditLogs.recordId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset);

    const parsedLogs: AuditLogEntry[] = logs.map((log) => ({
      ...log,
      userEmail: log.userEmail || "Unknown",
      userFirstName: log.userFirstName || "Unknown",
      userLastName: log.userLastName || "User",
      recordId: log.recordId || undefined,
      ipAddress: log.ipAddress || undefined,
      userAgent: log.userAgent || undefined,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
    }));

    return {
      logs: parsedLogs,
      totalCount,
      currentPage: page,
      totalPages,
    };
  }

  async getAuditLogStats(): Promise<{
    totalLogs: number;
    logsToday: number;
    logsThisWeek: number;
    topActions: { action: string; count: number }[];
    topTables: { tableName: string; count: number }[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total logs
    const totalResult = await db.select({ count: count() }).from(auditLogs);
    const totalLogs = totalResult[0].count;

    // Logs today
    const todayResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, today));
    const logsToday = todayResult[0].count;

    // Logs this week
    const weekResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, weekAgo));
    const logsThisWeek = weekResult[0].count;

    // Top actions (simplified - in production you might want proper grouping)
    const actions = await db
      .select({
        action: auditLogs.action,
        count: count(),
      })
      .from(auditLogs)
      .groupBy(auditLogs.action)
      .orderBy(desc(count()))
      .limit(5);

    // Top tables
    const tables = await db
      .select({
        tableName: auditLogs.tableName,
        count: count(),
      })
      .from(auditLogs)
      .groupBy(auditLogs.tableName)
      .orderBy(desc(count()))
      .limit(5);

    return {
      totalLogs,
      logsToday,
      logsThisWeek,
      topActions: actions.map((a) => ({
        action: a.action,
        count: Number(a.count),
      })),
      topTables: tables.map((t) => ({
        tableName: t.tableName,
        count: Number(t.count),
      })),
    };
  }

  async getUsersForFilter(): Promise<
    { id: string; email: string; fullName: string }[]
  > {
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.firstName, users.lastName);

    return userList.map((user) => ({
      id: user.id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`,
    }));
  }

  async getUniqueUsers(filters: AuditLogFilters = {}) {
    try {
      const whereConditions = [];

      if (filters.userId) {
        whereConditions.push(eq(auditLogs.userId, filters.userId));
      }
      if (filters.action) {
        whereConditions.push(eq(auditLogs.action, filters.action));
      }
      if (filters.tableName) {
        whereConditions.push(eq(auditLogs.tableName, filters.tableName));
      }
      if (filters.startDate) {
        whereConditions.push(
          gte(auditLogs.createdAt, new Date(filters.startDate))
        );
      }
      if (filters.endDate) {
        whereConditions.push(
          lte(auditLogs.createdAt, new Date(filters.endDate))
        );
      }

      const conditions =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const uniqueUsers = await db
        .selectDistinct({
          userId: auditLogs.userId,
          user: users,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(conditions)
        .orderBy(users.firstName, users.lastName);

      return uniqueUsers.map((item) => ({
        userId: item.userId,
        user: item.user
          ? {
              id: item.user.id,
              email: item.user.email,
              firstName: item.user.firstName,
              lastName: item.user.lastName,
            }
          : null,
      }));
    } catch (error) {
      console.error("Error getting unique users:", error);
      throw new Error("Failed to get unique users");
    }
  }

  async getUniqueTables(filters: AuditLogFilters = {}) {
    try {
      const whereConditions = [];

      if (filters.userId) {
        whereConditions.push(eq(auditLogs.userId, filters.userId));
      }
      if (filters.action) {
        whereConditions.push(eq(auditLogs.action, filters.action));
      }
      if (filters.tableName) {
        whereConditions.push(eq(auditLogs.tableName, filters.tableName));
      }
      if (filters.startDate) {
        whereConditions.push(
          gte(auditLogs.createdAt, new Date(filters.startDate))
        );
      }
      if (filters.endDate) {
        whereConditions.push(
          lte(auditLogs.createdAt, new Date(filters.endDate))
        );
      }

      const conditions =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const uniqueTables = await db
        .selectDistinct({
          tableName: auditLogs.tableName,
        })
        .from(auditLogs)
        .where(conditions)
        .orderBy(auditLogs.tableName);

      return uniqueTables.map((item) => item.tableName);
    } catch (error) {
      console.error("Error getting unique tables:", error);
      throw new Error("Failed to get unique tables");
    }
  }

  async getAuditLogById(id: string) {
    try {
      const [auditLog] = await db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          tableName: auditLogs.tableName,
          recordId: auditLogs.recordId,
          oldValues: auditLogs.oldValues,
          newValues: auditLogs.newValues,
          createdAt: auditLogs.createdAt,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          user: users,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(eq(auditLogs.id, id));

      if (!auditLog) {
        return null;
      }

      return {
        id: auditLog.id,
        userId: auditLog.userId,
        action: auditLog.action,
        tableName: auditLog.tableName,
        recordId: auditLog.recordId,
        oldValues: this.parseJsonSafely(auditLog.oldValues),
        newValues: this.parseJsonSafely(auditLog.newValues),
        createdAt: auditLog.createdAt,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        user: auditLog.user
          ? {
              id: auditLog.user.id,
              email: auditLog.user.email,
              firstName: auditLog.user.firstName,
              lastName: auditLog.user.lastName,
            }
          : null,
      };
    } catch (error) {
      console.error("Error getting audit log by ID:", error);
      throw new Error("Failed to get audit log");
    }
  }

  private parseJsonSafely(value: string | null): any {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  getActionColor(action: string): string {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "green";
      case "UPDATE":
        return "blue";
      case "DELETE":
        return "red";
      default:
        return "gray";
    }
  }

  formatActionName(action: string): string {
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  }

  formatTableName(tableName: string): string {
    // Convert snake_case to Title Case
    return tableName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

export const auditLogService = new AuditLogService();
