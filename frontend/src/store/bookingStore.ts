import { create } from "zustand";
import API from "../api/axios";

interface Booking {
  id: string;
  roomType: { type: string };
  totalPrice: number;
  status: string;
  // Add other booking properties as needed
}

interface BookingState {
  bookings: Booking[];
  myBookings: Booking[];
  total: number;
  page: number;
  limit: number;
  search: string;
  loading: boolean;
  error: string | null;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  createBooking: (bookingData: any) => Promise<any>;
  fetchBookings: () => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: string) => Promise<any>;
  getBookingById: (id: string) => Promise<any>;
  calculateTotalRevenue: () => number;
  getRevenueByRoomType: () => { roomType: string; revenue: number }[];
}

const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  myBookings: [],
  total: 0,
  page: 1,
  limit: 10,
  search: "",
  loading: false,
  error: null,
  statusFilter: "all",

  // Actions
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search }),

  // ✅ Create Booking (updated to handle price fields)
  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/bookings', bookingData);
      
      // Update both admin and user bookings state
      set(state => ({
        bookings: [res.data, ...state.bookings],
        myBookings: [res.data, ...state.myBookings],
        total: state.total + 1,
        loading: false
      }));
      
      return res.data;
    } catch (err: any) {
      console.error("Create Booking Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to create booking",
        loading: false
      });
      throw err;
    }
  },

  // ✅ Fetch bookings (admin - updated to handle price fields)
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const { page, limit, search, statusFilter } = get();

      const statusQuery = statusFilter && statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await API.get(
        `/bookings?page=${page}&limit=${limit}&search=${search}${statusQuery}`
      );

      // Map bookings to ensure price fields are properly handled
      const bookingsWithPrices = res.data.bookings.map((booking: any) => ({
        ...booking,
        pricePerNight: booking.roomPrice,
        totalPrice: booking.totalPrice,
        nights: booking.nights
      }));

      set({ 
        bookings: bookingsWithPrices, 
        total: res.data.total,
        loading: false
      });
    } catch (err: any) {
      console.error("Fetch Bookings Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to fetch bookings",
        loading: false
      });
    }
  },

  // ✅ Fetch my bookings (user - updated to handle price fields)
  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await API.get("/bookings/my");
      
      // Map bookings to ensure price fields are properly handled
      const myBookingsWithPrices = res.data.map((booking: any) => ({
        ...booking,
        pricePerNight: booking.roomPrice,
        totalPrice: booking.totalPrice,
        nights: booking.nights
      }));

      set({ 
        myBookings: myBookingsWithPrices,
        loading: false
      });
    } catch (err: any) {
      console.error("Fetch My Bookings Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to fetch your bookings",
        loading: false
      });
    }
  },

  // ✅ Delete booking (admin only)
  deleteBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      await API.delete(`/bookings/${id}`);
      
      // Optimistically remove from state
      set(state => ({
        bookings: state.bookings.filter(b => b.id !== id),
        myBookings: state.myBookings.filter(b => b.id !== id),
        total: state.total - 1,
        loading: false
      }));
      
      // Refresh to ensure consistency
      get().fetchBookings();
    } catch (err: any) {
      console.error("Delete Booking Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to delete booking",
        loading: false
      });
    }
  },

  // ✅ Update booking status (admin: confirm, user: cancel)
  updateBookingStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await API.patch(`/bookings/${id}/status`, { status });
      
      // Optimistically update state
      set(state => ({
        bookings: state.bookings.map(b => 
          b.id === id ? { ...b, status } : b
        ),
        myBookings: state.myBookings.map(b => 
          b.id === id ? { ...b, status } : b
        ),
        loading: false
      }));
      
      return res.data;
    } catch (err: any) {
      console.error("Update Booking Status Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to update booking status",
        loading: false
      });
      throw err;
    }
  },

  // ✅ Get booking by ID
  getBookingById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await API.get(`/bookings/${id}`);
      set({ loading: false });
      
      // Ensure price fields are properly structured
      return {
        ...res.data,
        pricePerNight: res.data.roomPrice,
        totalPrice: res.data.totalPrice,
        nights: res.data.nights
      };
    } catch (err: any) {
      console.error("Get Booking Error:", err);
      set({ 
        error: err.response?.data?.message || "Failed to fetch booking",
        loading: false
      });
      throw err;
    }
  },

  // ✅ Calculate total revenue (utility function)
  calculateTotalRevenue: () => {
    const { bookings } = get();
    return bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  },

  // ✅ Get revenue by room type (utility function)
  getRevenueByRoomType: () => {
    const { bookings } = get();
    const revenueMap: { [key: string]: number } = {};
    
    bookings
      .filter(b => b.status === 'confirmed')
      .forEach(booking => {
        const roomType = booking.roomType?.type || 'Unknown';
        revenueMap[roomType] = (revenueMap[roomType] || 0) + booking.totalPrice;
      });
    
    return Object.entries(revenueMap).map(([type, revenue]) => ({
      roomType: type,
      revenue
    }));
  }
}));

export default useBookingStore;