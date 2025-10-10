import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

// Types
export interface FoodOrder {
  id: string;
  userId: string;
  totalAmount: string;
  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  specialInstructions?: string;
  roomNumber?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FoodOrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  specialInstructions?: string;
  foodItem: {
    id: string;
    name: string;
    description?: string;
    price: string;
    image?: string;
  };
}

export interface FoodOrderWithItems extends FoodOrder {
  items: FoodOrderItem[];
}

export interface CreateOrderData {
  items: {
    foodItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  specialInstructions?: string;
  roomNumber?: string;
}

// Queries
export const useFoodOrders = (status?: string) => {
  return useQuery({
    queryKey: ["foodOrders", status],
    queryFn: async (): Promise<FoodOrder[]> => {
      const url = status ? `/food-orders?status=${status}` : "/food-orders";
      const response = await apiClient.get<FoodOrder[]>(url);
      return response.data || [];
    },
  });
};

export const useMyFoodOrders = () => {
  return useQuery({
    queryKey: ["foodOrders", "my-orders"],
    queryFn: async (): Promise<FoodOrder[]> => {
      const response = await apiClient.get<FoodOrder[]>(
        "/food-orders/my-orders"
      );
      return response.data || [];
    },
  });
};

export const useFoodOrder = (id: string) => {
  return useQuery({
    queryKey: ["foodOrders", id],
    queryFn: async (): Promise<FoodOrderWithItems> => {
      const response = await apiClient.get<FoodOrderWithItems>(
        `/food-orders/${id}`
      );
      return response.data!;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateFoodOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderData): Promise<FoodOrder> => {
      const response = await apiClient.post<FoodOrder>("/food-orders", data);
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodOrders"] });
    },
  });
};

export const useUpdateFoodOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: string;
    }): Promise<FoodOrder> => {
      const response = await apiClient.post<FoodOrder>(
        `/food-orders/${id}/status`,
        { status }
      );
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodOrders"] });
    },
  });
};

export const useDeleteFoodOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/food-orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodOrders"] });
    },
  });
};
