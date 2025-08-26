import { create } from "zustand";
import API from "../api/axios";

const useBookingStore = create<IBookingStore>((set, get) => ({
  bookings: [],
  myBookings: [],
  total: 0,
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await API.get(`/bookings`);
      set({ bookings: res.data, total: res.data.length, loading: false });
    } catch (err: any) {
      console.error("Fetch Bookings Error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch bookings",
        loading: false,
      });
    }
  },

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await API.get("/bookings/my");
      set({ myBookings: res.data, loading: false });
    } catch (err: any) {
      console.error("Fetch My Bookings Error:", err);
      set({
        error: err.response?.data?.message || "Failed to fetch your bookings",
        loading: false,
      });
    }
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    set({ loading: true, error: null });
    try {
      const res = await API.patch(`/bookings/${bookingId}/status`, { status });
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: res.data.status } : b
        ),
        myBookings: state.myBookings.map((b) =>
          b.id === bookingId ? { ...b, status: res.data.status } : b
        ),
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error("Update Booking Status Error:", err);
      set({
        error: err.response?.data?.message || "Failed to update booking status",
        loading: false,
      });
      throw err;
    }
  },

  createBooking: async (bookingData: { roomTypeId: string; checkIn: string; checkOut: string; }) => {
    set({ loading: true, error: null });
    try {
      const res = await API.post('/bookings', bookingData);
      set((state) => ({
        bookings: [...state.bookings, res.data],
        myBookings: [...state.myBookings, res.data],
        total: state.total + 1,
        loading: false,
      }));
      return res.data;
    } catch (err: any) {
      console.error("Create Booking Error:", err);
      set({
        error: err.response?.data?.message || "Failed to create booking",
        loading: false,
      });
      throw err;
    }
  },
}));

export default useBookingStore;
