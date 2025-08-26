
import { create } from "zustand";
import API from "../api/axios";

interface Room {
  id: string;
  type?: string;
  price?: number;
  quantity?: number;
  description?: string;
  images?: string[];
  // Extend as needed
}

interface RoomState {
  rooms: Room[];
  room: Room | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  search: string;
  availabilityCalendar: any;
  calendarLoading: boolean;
  calendarError: string | null;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  fetchRooms: () => Promise<void>;
  fetchRoomById: (id: string) => Promise<void>;
  createRoom: (data: any) => Promise<any>;
  updateRoom: (id: string, data: any) => Promise<any>;
  deleteRoom: (id: string) => Promise<void>;
  fetchAvailabilityCalendar: (startDate: string, endDate: string) => Promise<void>;
}

const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  room: null, // New state for a single room
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 5,
  search: "",
  availabilityCalendar: {},
  calendarLoading: false,
  calendarError: null,

  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search }),

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const { page, limit, search } = get();
      const res = await API.get("/rooms", {
        params: { page, limit, search },
      });

      const data = res.data;

      // Backend currently returns an array of room types (no pagination metadata)
      // Older frontend code expected { roomTypes: Room[], total: number }
      let rooms: Room[] = [];
      let total = 0;

      if (Array.isArray(data)) {
        rooms = data;
        total = data.length;
      } else if (data) {
        rooms = data.roomTypes || data.rooms || [];
        // Derive total from provided total or length fallback
        total = data.total ?? rooms.length;
      }

      // Client-side search fallback if backend doesn't implement it
      if (search && rooms.length) {
        const term = search.toLowerCase();
        rooms = rooms.filter(r =>
          [r.type, r.description]
            .filter(Boolean)
            .some(v => (v as string).toLowerCase().includes(term))
        );
        total = rooms.length;
        // Simple client-side pagination slice
        const start = (page - 1) * limit;
        rooms = rooms.slice(start, start + limit);
      }

      set({ rooms, total, loading: false });
    } catch (err: any) {
      console.error("fetchRooms error:", err.response ?? err);
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch rooms",
        loading: false,
      });
    }
  },
fetchRoomById: async (id) => {
  set({ loading: true, error: null, room: null });
  try {
    const res = await API.get(`/rooms/${id}`); // Ensure this matches your backend route
    set({ room: res.data, loading: false });
  } catch (err: any) {
    console.error("fetchRoomById error:", err.response ?? err);
    set({
      error: err.response?.data?.message || err.message || "Failed to fetch room details",
      loading: false,
    });
  }
},

  createRoom: async (data) => {
    try {
      const res = await API.post("/rooms", data);
      // Backend returns the created room object directly
      const created: Room = res.data.room || res.data;
      set((state: RoomState) => ({ rooms: [...state.rooms, created] }));
      return created;
    } catch (err: any) {
      console.error("createRoom error:", err.response ?? err);
      throw err;
    }
  },

  updateRoom: async (id, data) => {
    try {
      const res = await API.patch(`/rooms/${id}`, data);
      const updated: Room = res.data.updated || res.data;
      set((state: RoomState) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updated : r)),
        room: state.room && state.room.id === id ? updated : state.room,
      }));
      return updated;
    } catch (err: any) {
      console.error("updateRoom error:", err.response ?? err);
      throw err;
    }
  },

  deleteRoom: async (id) => {
    try {
      await API.delete(`/rooms/${id}`);
      set((state: RoomState) => ({
        rooms: state.rooms.filter((r) => r.id !== id),
        room: state.room && state.room.id === id ? null : state.room,
      }));
    } catch (err: any) {
      console.error("deleteRoom error:", err.response ?? err);
      throw err;
    }
  },

  fetchAvailabilityCalendar: async (startDate, endDate) => {
    set({ calendarLoading: true, calendarError: null });
    try {
      const res = await API.get("/rooms/availability-calendar", {
        params: { startDate, endDate },
      });
      set({ availabilityCalendar: res.data, calendarLoading: false });
    } catch (err: any) {
      set({
        calendarError: err.response?.data?.message || "Failed to fetch calendar",
        calendarLoading: false,
      });
    }
  },
}));

export default useRoomStore;
