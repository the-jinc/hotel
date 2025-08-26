import type { Booking } from './booking';

export interface IBookingStore {
  bookings: Booking[];
  myBookings: Booking[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number; // Re-added
  limit: number; // Re-added
  search: string; // Re-added
  statusFilter: string; // Re-added
  setStatusFilter: (status: string) => void; // Re-added
  setPage: (page: number) => void; // Re-added
  setSearch: (search: string) => void; // Re-added
  fetchBookings: () => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<any>;
  createBooking: (bookingData: { roomTypeId: string; checkIn: string; checkOut: string; }) => Promise<any>;
  deleteBooking: (id: string) => Promise<void>; // Re-added
  getBookingById?: (id: string) => Promise<any>; // Re-added, optional
  calculateTotalRevenue?: () => number; // Re-added, optional
  getRevenueByRoomType?: () => { roomType: string; revenue: number }[]; // Re-added, optional
}
