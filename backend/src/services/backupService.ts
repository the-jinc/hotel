import { execSync } from "child_process";
import { promises as fs } from "fs";
import path from "path";

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  status: "completed" | "failed" | "in_progress";
  error?: string;
}

class BackupService {
  private backupDir: string;

  constructor() {
    // Use environment variable or default to a backups directory
    this.backupDir =
      process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
    this.ensureBackupDir();
  }

  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<BackupInfo> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `hotel_backup_${timestamp}.sql`;
    const filePath = path.join(this.backupDir, filename);

    const backupInfo: BackupInfo = {
      id: timestamp,
      filename,
      size: 0,
      createdAt: new Date(),
      status: "in_progress",
    };

    try {
      // Build pg_dump command
      const dbUrl =
        process.env.DATABASE_URL ||
        "postgresql://postgres:password@localhost:5432/hotel_db";

      // Parse DATABASE_URL to get connection parameters
      const url = new URL(dbUrl);
      const host = url.hostname;
      const port = url.port || "5432";
      const database = url.pathname.slice(1); // Remove leading '/'
      const username = url.username;
      const password = url.password;

      // Set PGPASSWORD environment variable for authentication
      const env = { ...process.env, PGPASSWORD: password };

      const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${filePath} --verbose --no-password`;

      console.log(`Starting backup: ${command}`);

      // Execute pg_dump
      execSync(command, {
        env,
        stdio: ["pipe", "pipe", "pipe"],
        encoding: "utf8",
      });

      // Get file size
      const stats = await fs.stat(filePath);

      backupInfo.size = stats.size;
      backupInfo.status = "completed";

      console.log(`Backup completed: ${filename} (${stats.size} bytes)`);

      return backupInfo;
    } catch (error) {
      backupInfo.status = "failed";
      backupInfo.error =
        error instanceof Error ? error.message : "Unknown error";

      console.error(`Backup failed: ${backupInfo.error}`);

      // Clean up failed backup file if it exists
      try {
        await fs.unlink(filePath);
      } catch {
        // Ignore cleanup errors
      }

      return backupInfo;
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    try {
      await this.ensureBackupDir();
      const files = await fs.readdir(this.backupDir);

      const backups: BackupInfo[] = [];

      for (const file of files) {
        if (file.endsWith(".sql")) {
          const filePath = path.join(this.backupDir, file);

          try {
            const stats = await fs.stat(filePath);

            // Extract timestamp from filename
            const timestampMatch = file.match(/hotel_backup_(.+)\.sql/);
            const timestamp = timestampMatch
              ? timestampMatch[1]
              : new Date().toISOString();

            backups.push({
              id: timestamp,
              filename: file,
              size: stats.size,
              createdAt: stats.birthtime,
              status: "completed",
            });
          } catch (error) {
            console.error(`Error reading backup file ${file}:`, error);
          }
        }
      }

      // Sort by creation date (newest first)
      return backups.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      console.error("Error listing backups:", error);
      return [];
    }
  }

  async deleteBackup(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.backupDir, filename);
      await fs.unlink(filePath);
      console.log(`Backup deleted: ${filename}`);
      return true;
    } catch (error) {
      console.error(`Error deleting backup ${filename}:`, error);
      return false;
    }
  }

  async getBackupFilePath(filename: string): Promise<string | null> {
    try {
      const filePath = path.join(this.backupDir, filename);
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup?: Date;
    newestBackup?: Date;
  }> {
    const backups = await this.listBackups();

    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    const dates = backups
      .map((b) => b.createdAt)
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: dates[0],
      newestBackup: dates[dates.length - 1],
    };
  }
}

export const backupService = new BackupService();
