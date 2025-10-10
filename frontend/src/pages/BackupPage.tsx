import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import {
  Database,
  Download,
  Trash2,
  Plus,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  useBackups,
  useCreateBackup,
  useDeleteBackup,
} from "@/hooks/useBackups";
import { toast } from "sonner";

export default function BackupPage() {
  const { user } = useAuthStore();
  const [deleteFilename, setDeleteFilename] = useState<string | null>(null);

  // Fetch backups data
  const { data: backupData, isLoading, error, refetch } = useBackups();
  const createBackupMutation = useCreateBackup();
  const deleteBackupMutation = useDeleteBackup();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Only admins can access backup management
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleCreateBackup = async () => {
    try {
      await createBackupMutation.mutateAsync();
      toast.success("Backup created successfully!");
    } catch (error) {
      toast.error(
        "Failed to create backup: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    try {
      await deleteBackupMutation.mutateAsync(filename);
      setDeleteFilename(null);
      toast.success("Backup deleted successfully!");
    } catch (error) {
      toast.error(
        "Failed to delete backup: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading backups...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <span className="font-semibold">Error Loading Backups</span>
            </div>
            <p className="text-gray-600 mb-4">
              Unable to load backup information. Please try again.
            </p>
            <Button onClick={() => refetch()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { backups = [], stats } = backupData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Backup Management
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleCreateBackup}
                disabled={createBackupMutation.isPending}
                className="flex items-center gap-2"
              >
                {createBackupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Backup
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Database className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Backups
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalBackups}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <HardDrive className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Size
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalSizeFormatted}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Newest Backup
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {stats.newestBackupFormatted || "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Oldest Backup
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {stats.oldestBackupFormatted || "None"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Backup List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Backups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No backups found
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first backup to ensure your data is safe.
                </p>
                <Button
                  onClick={handleCreateBackup}
                  disabled={createBackupMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createBackupMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create First Backup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(backup.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {backup.filename}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created: {formatDate(backup.createdAt)}</span>
                          <span>Size: {backup.sizeFormatted}</span>
                          <Badge
                            variant={
                              backup.status === "completed"
                                ? "default"
                                : backup.status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {backup.status}
                          </Badge>
                        </div>
                        {backup.error && (
                          <p className="text-sm text-red-600 mt-1">
                            Error: {backup.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {backup.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => {
                            // For now, just show a message. In a real app, this would trigger a download
                            toast.info(
                              "Download feature would be implemented here"
                            );
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      )}

                      <AlertDialog
                        open={deleteFilename === backup.filename}
                        onOpenChange={(open) =>
                          !open && setDeleteFilename(null)
                        }
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            onClick={() => setDeleteFilename(backup.filename)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{backup.filename}
                              "? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteBackup(backup.filename)
                              }
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteBackupMutation.isPending}
                            >
                              {deleteBackupMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Backup Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  About Database Backups
                </h4>
                <p className="text-gray-600">
                  Regular backups are essential for protecting your hotel's
                  data. These backups contain all your hotel information
                  including bookings, guests, rooms, food orders, and system
                  settings.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Backup Schedule
                </h4>
                <p className="text-gray-600">
                  Automated backups are created daily at 2 AM. You can also
                  create manual backups at any time using the "Create Backup"
                  button above.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Retention Policy
                </h4>
                <p className="text-gray-600">
                  Backups are kept for 30 days by default. Older backups are
                  automatically removed to save storage space. Critical backups
                  should be downloaded and stored separately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
