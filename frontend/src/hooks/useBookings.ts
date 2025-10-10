import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface CreateBookingData {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  roomIds: string[];
  specialRequests?: string;
}

export interface BookingWithDetails {
  id: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  status: string;
  guestCount: number;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  rooms: Array<{
    id: string;
    roomNumber: string;
    nightlyRate: string;
    category: {
      id: string;
      name: string;
      description: string | null;
    };
  }>;
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
}

export interface PaymentData {
  bookingId: string;
  amount: string;
  paymentMethod: "credit_card" | "debit_card" | "cash" | "bank_transfer";
  transactionId?: string;
}

// Create a new booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateBookingData
    ): Promise<BookingWithDetails> => {
      const response = await apiClient.post<BookingWithDetails>(
        "/bookings",
        data
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create booking");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate bookings queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
};

// Process payment for a booking
export const useProcessPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PaymentData): Promise<BookingWithDetails> => {
      const response = await apiClient.post<BookingWithDetails>(
        `/bookings/${data.bookingId}/payment`,
        {
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
        }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to process payment");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and update booking queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.setQueryData(["booking", data.id], data);
    },
  });
};

// Get user's bookings
export const useMyBookings = () => {
  return useQuery({
    queryKey: ["my-bookings"],
    queryFn: async (): Promise<BookingWithDetails[]> => {
      const response = await apiClient.get<BookingWithDetails[]>(
        "/bookings/my-bookings"
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch bookings");
      }

      return response.data;
    },
  });
};

// Get all bookings (staff only)
export const useAllBookings = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async (): Promise<BookingWithDetails[]> => {
      const response = await apiClient.get<BookingWithDetails[]>("/bookings");

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch bookings");
      }

      return response.data;
    },
  });
};

// Get specific booking details
export const useBooking = (bookingId: string) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async (): Promise<BookingWithDetails> => {
      const response = await apiClient.get<BookingWithDetails>(
        `/bookings/${bookingId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch booking");
      }

      return response.data;
    },
    enabled: !!bookingId,
  });
};

// Cancel a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string): Promise<BookingWithDetails> => {
      const response = await apiClient.put<BookingWithDetails>(
        `/bookings/${bookingId}/cancel`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to cancel booking");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Update queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.setQueryData(["booking", data.id], data);
    },
  });
};

// Update booking status (staff only)
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }): Promise<BookingWithDetails> => {
      const response = await apiClient.put<BookingWithDetails>(
        `/bookings/${bookingId}/status`,
        { status }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update booking status");
      }

      return response.data;
    },
    onSuccess: (data) => {
      // Update queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      queryClient.setQueryData(["booking", data.id], data);
    },
  });
};
