import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

// Types
export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateFoodCategoryData
  extends Partial<CreateFoodCategoryData> {}

// Queries
export const useFoodCategories = () => {
  return useQuery({
    queryKey: ["foodCategories"],
    queryFn: async (): Promise<FoodCategory[]> => {
      const response = await apiClient.get<FoodCategory[]>("/food-categories");
      return response.data || [];
    },
  });
};

export const useFoodCategoriesAdmin = () => {
  return useQuery({
    queryKey: ["foodCategories", "admin"],
    queryFn: async (): Promise<FoodCategory[]> => {
      const response = await apiClient.get<FoodCategory[]>(
        "/food-categories/all"
      );
      return response.data || [];
    },
  });
};

export const useFoodCategory = (id: string) => {
  return useQuery({
    queryKey: ["foodCategories", id],
    queryFn: async (): Promise<FoodCategory> => {
      const response = await apiClient.get<FoodCategory>(
        `/food-categories/${id}`
      );
      return response.data!;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateFoodCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFoodCategoryData): Promise<FoodCategory> => {
      const response = await apiClient.post<FoodCategory>(
        "/food-categories",
        data
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
    },
  });
};

export const useUpdateFoodCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFoodCategoryData;
    }): Promise<FoodCategory> => {
      const response = await apiClient.put<FoodCategory>(
        `/food-categories/${id}`,
        data
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
    },
  });
};

export const useDeleteFoodCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/food-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
    },
  });
};
