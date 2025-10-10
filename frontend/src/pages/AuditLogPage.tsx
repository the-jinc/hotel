import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Filter, RefreshCw, Eye, Download } from "lucide-react";
import {
  useAuditLogs,
  useAuditLogStats,
  useAuditLogUsers,
  useAuditLogTables,
  getActionColor,
  formatActionName,
  formatTableName,
  type AuditLogFilters,
} from "../hooks/useAuditLogs";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const AuditLogPage: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Data queries
  const { data: auditLogs, isLoading, refetch } = useAuditLogs(filters);
  const { data: stats, isLoading: statsLoading } = useAuditLogStats();
  const { data: users } = useAuditLogUsers();
  const { data: tables } = useAuditLogTables();

  // Only allow admin access
  if (!user || user.role !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              Access denied. Admin privileges required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFilterChange = (
    key: keyof AuditLogFilters,
    value: string | number
  ) => {
    // Convert "all-*" values to undefined to clear the filter
    let processedValue: string | number | undefined = value;
    if (typeof value === "string") {
      if (
        value === "all-users" ||
        value === "all-actions" ||
        value === "all-tables"
      ) {
        processedValue = undefined;
      }
    }

    setFilters((prev) => ({
      ...prev,
      [key]: processedValue,
      page:
        key !== "page"
          ? 1
          : typeof value === "string"
          ? parseInt(value)
          : value, // Reset to first page when changing filters
    }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 50 });
  };

  const handleExportLogs = () => {
    // In a real implementation, this would trigger a download
    console.log("Exporting audit logs with filters:", filters);
  };

  const renderLogDetails = (log: any) => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Basic Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Action:</span>
            <Badge className={`ml-2 ${getActionColor(log.action)}`}>
              {formatActionName(log.action)}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Table:</span>{" "}
            {formatTableName(log.tableName)}
          </div>
          <div>
            <span className="font-medium">User:</span> {log.userFirstName}{" "}
            {log.userLastName}
          </div>
          <div>
            <span className="font-medium">Time:</span>{" "}
            {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm:ss")}
          </div>
          {log.recordId && (
            <div>
              <span className="font-medium">Record ID:</span> {log.recordId}
            </div>
          )}
          {log.ipAddress && (
            <div>
              <span className="font-medium">IP Address:</span> {log.ipAddress}
            </div>
          )}
        </div>
      </div>

      {(log.oldValues || log.newValues) && (
        <div>
          <h4 className="font-semibold mb-2">Data Changes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {log.oldValues && (
              <div>
                <span className="font-medium text-red-600">Old Values:</span>
                <pre className="bg-red-50 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(log.oldValues, null, 2)}
                </pre>
              </div>
            )}
            {log.newValues && (
              <div>
                <span className="font-medium text-green-600">New Values:</span>
                <pre className="bg-green-50 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(log.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {log.userAgent && (
        <div>
          <span className="font-medium">User Agent:</span>
          <p className="text-xs text-gray-600 mt-1">{log.userAgent}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-600">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <p className="text-xs text-gray-600">Total Logs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.logsToday}</div>
              <p className="text-xs text-gray-600">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.logsThisWeek}</div>
              <p className="text-xs text-gray-600">This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-1">Top Action</div>
              <div className="text-xs">
                {stats.topActions[0]
                  ? `${formatActionName(stats.topActions[0].action)} (${
                      stats.topActions[0].count
                    })`
                  : "None"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-semibold mb-1">Top Table</div>
              <div className="text-xs">
                {stats.topTables[0]
                  ? `${formatTableName(stats.topTables[0].tableName)} (${
                      stats.topTables[0].count
                    })`
                  : "None"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">User</label>
                <Select
                  value={filters.userId || "all-users"}
                  onValueChange={(value) => handleFilterChange("userId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-users">All users</SelectItem>
                    {Array.isArray(users) &&
                      users.map((userItem: any) => (
                        <SelectItem
                          key={userItem.userId}
                          value={userItem.userId}
                        >
                          {userItem.user
                            ? `${userItem.user.firstName} ${userItem.user.lastName}`
                            : "Unknown User"}{" "}
                          ({userItem.user?.email || "No email"})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Action</label>
                <Select
                  value={filters.action || "all-actions"}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-actions">All actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Table</label>
                <Select
                  value={filters.tableName || "all-tables"}
                  onValueChange={(value) =>
                    handleFilterChange("tableName", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-tables">All tables</SelectItem>
                    {Array.isArray(tables) &&
                      tables.map((table: string) => (
                        <SelectItem key={table} value={table}>
                          {formatTableName(table)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Record ID
                </label>
                <Input
                  placeholder="Enter record ID"
                  value={filters.recordId || ""}
                  onChange={(e) =>
                    handleFilterChange("recordId", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  IP Address
                </label>
                <Input
                  placeholder="Enter IP address"
                  value={filters.ipAddress || ""}
                  onChange={(e) =>
                    handleFilterChange("ipAddress", e.target.value)
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading audit logs...</div>
          ) : auditLogs?.logs?.length ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Time</th>
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Action</th>
                      <th className="text-left p-2">Table</th>
                      <th className="text-left p-2">Record ID</th>
                      <th className="text-left p-2">IP Address</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.logs.map((log: any) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          {format(new Date(log.createdAt), "MMM dd, HH:mm")}
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">
                              {log.userFirstName} {log.userLastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {log.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge className={getActionColor(log.action)}>
                            {formatActionName(log.action)}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {formatTableName(log.tableName)}
                        </td>
                        <td className="p-2">
                          {log.recordId ? (
                            <code className="text-xs bg-gray-100 px-1 rounded">
                              {log.recordId.length > 8
                                ? `${log.recordId.slice(0, 8)}...`
                                : log.recordId}
                            </code>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-2">{log.ipAddress || "-"}</td>
                        <td className="p-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Audit Log Details
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                  {renderLogDetails(log)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {auditLogs && auditLogs.totalCount > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(auditLogs.currentPage - 1) * (filters.limit || 50) + 1} to{" "}
                    {Math.min(
                      auditLogs.currentPage * (filters.limit || 50),
                      auditLogs.totalCount
                    )}{" "}
                    of {auditLogs.totalCount} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditLogs.currentPage <= 1}
                      onClick={() =>
                        handleFilterChange("page", auditLogs.currentPage - 1)
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {auditLogs.currentPage} of {auditLogs.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={auditLogs.currentPage >= auditLogs.totalPages}
                      onClick={() =>
                        handleFilterChange("page", auditLogs.currentPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No audit logs found. Try adjusting your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogPage;
