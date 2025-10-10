import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

// Types
export interface FoodItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: string;
  image?: string;
  isAvailable: boolean;
  preparationTime?: number;
  allergens?: string;
  ingredients?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItemWithCategory extends FoodItem {
  category: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface CreateFoodItemData {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  allergens?: string;
  ingredients?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  sortOrder?: number;
}

export interface UpdateFoodItemData extends Partial<CreateFoodItemData> {}

// Queries
export const useFoodItems = (categoryId?: string) => {
  return useQuery({
    queryKey: ["foodItems", categoryId],
    queryFn: async (): Promise<FoodItem[]> => {
      const url = categoryId
        ? `/food-items?category_id=${categoryId}`
        : "/food-items";
      const response = await apiClient.get<FoodItem[]>(url);
      return response.data || [];
    },
  });
};

export const useFoodItemsAdmin = () => {
  return useQuery({
    queryKey: ["foodItems", "admin"],
    queryFn: async (): Promise<FoodItemWithCategory[]> => {
      const response = await apiClient.get<FoodItemWithCategory[]>(
        "/food-items/admin/all"
      );
      return response.data || [];
    },
  });
};

export const useFoodItem = (id: string) => {
  return useQuery({
    queryKey: ["foodItems", id],
    queryFn: async (): Promise<FoodItem> => {
      const response = await apiClient.get<FoodItem>(`/food-items/${id}`);
      return response.data!;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFoodItemData): Promise<FoodItem> => {
      const response = await apiClient.post<FoodItem>("/food-items", data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
  });
};

export const useUpdateFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFoodItemData;
    }): Promise<FoodItem> => {
      const response = await apiClient.put<FoodItem>(`/food-items/${id}`, data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
  });
};

export const useDeleteFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/food-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
  });
};
