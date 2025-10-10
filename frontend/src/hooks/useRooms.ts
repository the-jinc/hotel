import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

// Types
export interface RoomCategory {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  maxOccupancy: number;
  amenities: string | null;
  images: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  categoryId: string;
  status: "available" | "booked" | "cleaning" | "out_of_service";
  floor: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  category: RoomCategory;
}

export interface CreateRoomCategoryData {
  name: string;
  description?: string;
  basePrice: string;
  maxOccupancy: number;
  amenities?: string;
  images?: string;
}

export interface CreateRoomData {
  roomNumber: string;
  categoryId: string;
  floor: number;
  notes?: string;
}

export interface UpdateRoomData {
  roomNumber?: string;
  categoryId?: string;
  status?: "available" | "booked" | "cleaning" | "out_of_service";
  floor?: number;
  notes?: string;
}

// Availability search types
export interface AvailabilityQuery {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  categoryId?: string;
}

export interface AvailableRoom {
  id: string;
  roomNumber: string;
  categoryId: string;
  category: RoomCategory;
  status: string;
  floor: number;
  totalPrice: number;
  nights: number;
}

export interface AvailabilityResponse {
  rooms: AvailableRoom[];
  searchParams: AvailabilityQuery;
  totalResults: number;
}

// Room Categories Hooks
export const useRoomCategories = () => {
  return useQuery({
    queryKey: ["roomCategories"],
    queryFn: async (): Promise<RoomCategory[]> => {
      const response = await apiClient.get<RoomCategory[]>(
        "/admin/room-categories"
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch room categories");
      }
      return response.data;
    },
  });
};

export const useRoomCategory = (id: string) => {
  return useQuery({
    queryKey: ["roomCategory", id],
    queryFn: async (): Promise<RoomCategory> => {
      const response = await apiClient.get<RoomCategory>(
        `/admin/room-categories/${id}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Room category not found");
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoomCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomCategoryData): Promise<RoomCategory> => {
      const response = await apiClient.post<RoomCategory>(
        "/admin/room-categories",
        data
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create room category");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomCategories"] });
    },
  });
};

export const useUpdateRoomCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateRoomCategoryData>;
    }): Promise<RoomCategory> => {
      const response = await apiClient.put<RoomCategory>(
        `/admin/room-categories/${id}`,
        data
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update room category");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["roomCategories"] });
      queryClient.invalidateQueries({ queryKey: ["roomCategory", id] });
    },
  });
};

export const useDeleteRoomCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/admin/room-categories/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete room category");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomCategories"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

// Rooms Hooks
export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async (): Promise<Room[]> => {
      const response = await apiClient.get<Room[]>("/admin/rooms");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch rooms");
      }
      return response.data;
    },
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ["room", id],
    queryFn: async (): Promise<Room> => {
      const response = await apiClient.get<Room>(`/admin/rooms/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Room not found");
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoomData): Promise<Room> => {
      const response = await apiClient.post<Room>("/admin/rooms", data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create room");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRoomData;
    }): Promise<Room> => {
      const response = await apiClient.put<Room>(`/admin/rooms/${id}`, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update room");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", id] });
    },
  });
};

export const useUpdateRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "available" | "booked" | "cleaning" | "out_of_service";
    }): Promise<Room> => {
      const response = await apiClient.put<Room>(`/admin/rooms/${id}/status`, {
        status,
      });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update room status");
      }
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", id] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.delete(`/admin/rooms/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete room");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
};

// Public room availability hook (no auth required)
export const useSearchRooms = (query: AvailabilityQuery | null) => {
  return useQuery({
    queryKey: ["rooms", "availability", query],
    queryFn: async (): Promise<AvailabilityResponse> => {
      if (!query) throw new Error("Search query is required");

      const searchParams = new URLSearchParams();
      searchParams.append("checkInDate", query.checkInDate);
      searchParams.append("checkOutDate", query.checkOutDate);
      searchParams.append("guestCount", query.guestCount.toString());
      if (query.categoryId) {
        searchParams.append("categoryId", query.categoryId);
      }

      const response = await apiClient.get<AvailabilityResponse>(
        `/rooms/availability?${searchParams}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }
      return response.data;
    },
    enabled:
      !!query &&
      !!query.checkInDate &&
      !!query.checkOutDate &&
      !!query.guestCount,
    staleTime: 2 * 60 * 1000, // 2 minutes - room availability changes frequently
  });
};

// Get public room categories (no auth required)
export const usePublicRoomCategories = () => {
  return useQuery({
    queryKey: ["rooms", "categories", "public"],
    queryFn: async (): Promise<RoomCategory[]> => {
      const response = await apiClient.get<RoomCategory[]>("/rooms/categories");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
  });
};

// Get public room details (no auth required)
export const usePublicRoomDetails = (roomId: string | null) => {
  return useQuery({
    queryKey: ["rooms", "public", roomId],
    queryFn: async (): Promise<AvailableRoom> => {
      if (!roomId) throw new Error("Room ID is required");

      const response = await apiClient.get<AvailableRoom>(`/rooms/${roomId}`);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }
      return response.data;
    },
    enabled: !!roomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
