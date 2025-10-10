import { Hono } from "hono";
import { jwtAuth, requireAdmin } from "../middleware/auth.js";
import { backupService } from "../services/backupService.js";

const backups = new Hono();

// Apply authentication middleware - only admins can access backup routes
backups.use("*", jwtAuth);
backups.use("*", requireAdmin);

// POST /backups - Create a new backup
backups.post("/", async (c) => {
  try {
    console.log("Creating new backup...");

    const backupInfo = await backupService.createBackup();

    if (backupInfo.status === "failed") {
      return c.json(
        {
          success: false,
          error: "Backup creation failed",
          details: backupInfo.error,
        },
        500
      );
    }

    return c.json({
      success: true,
      message: "Backup created successfully",
      data: {
        ...backupInfo,
        sizeFormatted: backupService.formatFileSize(backupInfo.size),
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create backup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /backups - List all backups
backups.get("/", async (c) => {
  try {
    const backupList = await backupService.listBackups();

    // Add formatted file sizes
    const backupsWithFormatted = backupList.map((backup) => ({
      ...backup,
      sizeFormatted: backupService.formatFileSize(backup.size),
      createdAtFormatted: backup.createdAt.toLocaleString(),
    }));

    const stats = await backupService.getBackupStats();

    return c.json({
      success: true,
      data: {
        backups: backupsWithFormatted,
        stats: {
          ...stats,
          totalSizeFormatted: backupService.formatFileSize(stats.totalSize),
        },
      },
    });
  } catch (error) {
    console.error("Error listing backups:", error);
    return c.json(
      {
        success: false,
        error: "Failed to list backups",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// DELETE /backups/:filename - Delete a specific backup
backups.delete("/:filename", async (c) => {
  try {
    const filename = c.req.param("filename");

    if (!filename) {
      return c.json(
        {
          success: false,
          error: "Filename parameter is required",
        },
        400
      );
    }

    // Validate filename format for security
    if (!filename.match(/^hotel_backup_[\w-]+\.sql$/)) {
      return c.json(
        {
          success: false,
          error: "Invalid backup filename format",
        },
        400
      );
    }

    const deleted = await backupService.deleteBackup(filename);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: "Failed to delete backup file",
        },
        500
      );
    }

    return c.json({
      success: true,
      message: `Backup ${filename} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting backup:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete backup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /backups/:filename/download - Download a specific backup file
backups.get("/:filename/download", async (c) => {
  try {
    const filename = c.req.param("filename");

    if (!filename) {
      return c.json(
        {
          success: false,
          error: "Filename parameter is required",
        },
        400
      );
    }

    // Validate filename format for security
    if (!filename.match(/^hotel_backup_[\w-]+\.sql$/)) {
      return c.json(
        {
          success: false,
          error: "Invalid backup filename format",
        },
        400
      );
    }

    const filePath = await backupService.getBackupFilePath(filename);

    if (!filePath) {
      return c.json(
        {
          success: false,
          error: "Backup file not found",
        },
        404
      );
    }

    // For file downloads, we'd typically stream the file
    // For now, we'll return the file path for the frontend to handle
    return c.json({
      success: true,
      message: "Backup file is ready for download",
      data: {
        filename,
        downloadUrl: `/backups/${filename}/download`,
      },
    });
  } catch (error) {
    console.error("Error preparing backup download:", error);
    return c.json(
      {
        success: false,
        error: "Failed to prepare backup download",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// GET /backups/stats - Get backup statistics
backups.get("/stats", async (c) => {
  try {
    const stats = await backupService.getBackupStats();

    return c.json({
      success: true,
      data: {
        ...stats,
        totalSizeFormatted: backupService.formatFileSize(stats.totalSize),
        oldestBackupFormatted: stats.oldestBackup?.toLocaleString(),
        newestBackupFormatted: stats.newestBackup?.toLocaleString(),
      },
    });
  } catch (error) {
    console.error("Error getting backup stats:", error);
    return c.json(
      {
        success: false,
        error: "Failed to get backup statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

export default backups;
