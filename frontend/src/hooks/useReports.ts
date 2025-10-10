import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface OccupancyReport {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  adr: number;
  revpar: number;
}

export interface RevenueReport {
  date: string;
  roomRevenue: number;
  foodRevenue: number;
  totalRevenue: number;
  bookingsCount: number;
  ordersCount: number;
}

export interface FoodSalesReport {
  categoryName: string;
  itemName: string;
  quantitySold: number;
  revenue: number;
  averageOrderValue: number;
}

export interface KPIData {
  totalRevenue: number;
  roomRevenue: number;
  foodRevenue: number;
  adr: number;
  revpar: number;
  totalBookings: number;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  groupBy?: "day" | "week" | "month";
}

export const useOccupancyReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ["occupancyReport", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.groupBy && { groupBy: filters.groupBy }),
      });

      const response = await api.get<OccupancyReport[]>(
        `/reports/occupancy?${params}`
      );
      return response.data || [];
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
};

export const useRevenueReport = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ["revenueReport", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.groupBy && { groupBy: filters.groupBy }),
      });

      const response = await api.get<RevenueReport[]>(
        `/reports/revenue?${params}`
      );
      return response.data || [];
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
};

export const useFoodSalesReport = (filters: Omit<ReportFilters, "groupBy">) => {
  return useQuery({
    queryKey: ["foodSalesReport", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      const response = await api.get<FoodSalesReport[]>(
        `/reports/food-sales?${params}`
      );
      return response.data || [];
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
};

export const useKPIs = (filters: Omit<ReportFilters, "groupBy">) => {
  return useQuery({
    queryKey: ["kpis", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });

      const response = await api.get<KPIData>(`/reports/kpis?${params}`);
      return response.data;
    },
    enabled: !!filters.startDate && !!filters.endDate,
  });
};
