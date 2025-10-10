import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  sizeFormatted: string;
  createdAt: string;
  createdAtFormatted: string;
  status: "completed" | "failed" | "in_progress";
  error?: string;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  totalSizeFormatted: string;
  oldestBackup?: string;
  newestBackup?: string;
  oldestBackupFormatted?: string;
  newestBackupFormatted?: string;
}

export interface BackupListResponse {
  backups: BackupInfo[];
  stats: BackupStats;
}

export const useBackups = () => {
  return useQuery({
    queryKey: ["backups"],
    queryFn: async () => {
      const response = await api.get<BackupListResponse>("/backups");
      return response.data;
    },
  });
};

export const useCreateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<BackupInfo>("/backups");
      return response.data;
    },
    onSuccess: () => {
      // Refresh the backup list
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });
};

export const useDeleteBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await api.delete(`/backups/${filename}`);
      return response.data;
    },
    onSuccess: () => {
      // Refresh the backup list
      queryClient.invalidateQueries({ queryKey: ["backups"] });
    },
  });
};

export const useBackupStats = () => {
  return useQuery({
    queryKey: ["backupStats"],
    queryFn: async () => {
      const response = await api.get<BackupStats>("/backups/stats");
      return response.data;
    },
  });
};
