import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  tableName?: string;
  recordId?: string;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  topActions: { action: string; count: number }[];
  topTables: { tableName: string; count: number }[];
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Get paginated audit logs with filters
 */
export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: async (): Promise<AuditLogsResponse> => {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/audit-logs?${params.toString()}`);
      return response.data as AuditLogsResponse;
    },
    enabled: true,
  });
};

/**
 * Get audit log statistics
 */
export const useAuditLogStats = () => {
  return useQuery({
    queryKey: ["auditLogStats"],
    queryFn: async () => {
      const response = await api.get("/audit-logs/stats");
      return response.data as AuditLogStats;
    },
  });
};

/**
 * Get unique users for filter dropdown
 */
export const useAuditLogUsers = (
  filters: Pick<AuditLogFilters, "startDate" | "endDate"> = {}
) => {
  return useQuery({
    queryKey: ["auditLogUsers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/audit-logs/users?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get unique table names for filter dropdown
 */
export const useAuditLogTables = (
  filters: Pick<AuditLogFilters, "startDate" | "endDate"> = {}
) => {
  return useQuery({
    queryKey: ["auditLogTables", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await api.get(`/audit-logs/tables?${params.toString()}`);
      return response.data;
    },
  });
};

/**
 * Get a specific audit log entry
 */
export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: ["auditLog", id],
    queryFn: async () => {
      const response = await api.get(`/audit-logs/${id}`);
      return response.data as AuditLogEntry;
    },
    enabled: !!id,
  });
};

/**
 * Helper function to get action color for UI
 */
export const getActionColor = (action: string): string => {
  switch (action.toUpperCase()) {
    case "CREATE":
      return "text-green-600 bg-green-100";
    case "UPDATE":
      return "text-blue-600 bg-blue-100";
    case "DELETE":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

/**
 * Helper function to format action name
 */
export const formatActionName = (action: string): string => {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

/**
 * Helper function to format table name
 */
export const formatTableName = (tableName: string): string => {
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Helper function to format user name
 */
export const formatUserName = (user?: {
  firstName: string;
  lastName: string;
}): string => {
  if (!user) return "Unknown User";
  return `${user.firstName} ${user.lastName}`;
};
