import { create } from "zustand";
import API from "../api/axios";

interface User {
  id: string;
  role: string;
  // Add other user properties as needed
}

interface UserState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  search: string;
  currentUser: User | null;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  setCurrentUser: (user: User | null) => void;
  createUser: (data: any) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateUser: (id: string, data: any) => Promise<void>;
  updateCurrentUser: (data: any) => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  total: 0,
  loading: false,
  error: null,
  page: 1,
  limit: 10,
  search: "",
  currentUser: null,

  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search }),
  setCurrentUser: (user) => set({ currentUser: user }),

  createUser: async (data) => {
    try {
      const res = await API.post("/users", data);
      set((state: UserState) => ({
        users: [res.data.user, ...state.users],
        total: state.total + 1,
      }));
    } catch (err: any) {
      console.error("Create user failed", err.response?.data || err.message); // log the real error
      throw err; // important: rethrow to allow modal to catch it
    }
  },

  fetchUsers: async () => {
    const { page, limit, search } = get();
    set({ loading: true });
    try {
      const res = await API.get("/users", {
        params: { page, limit, search },
      });
      set({ users: res.data.users, total: res.data.total, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchCurrentUser: async () => {
    try {
      const res = await API.get("/auth/me");
      set({ currentUser: res.data.user });
    } catch (err: any) {
      console.error("Failed to fetch current user", err);
      set({ currentUser: null });
    }
  },

  updateUser: async (id, data) => {
    try {
      const res = await API.patch(`/users/${id}`, data);
      set((state: UserState) => ({
        users: state.users.map((u) =>
          u.id === id ? res.data.user : u
        ),
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateCurrentUser: async (data) => {
    try {
      const res = await API.patch("/auth/me", data);
      set({ currentUser: res.data.user });

      set((state: UserState) => ({
        users: state.users.map((u) =>
          u.id === res.data.user.id ? res.data.user : u
        ),
      }));
    } catch (err: any) {
      console.error("Update current user failed", err);
    }
  },

  updateUserRole: async (id, role) => {
    try {
      await API.put(`/users/${id}`, { role });
      set((state: UserState) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, role } : u
        ),
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  deleteUser: async (id) => {
    try {
      await API.delete(`/users/${id}`);
      set((state: UserState) => ({
        users: state.users.filter((u) => u.id !== id),
        total: state.total - 1,
      }));
    } catch (err: any) {
      console.error(err);
    }
  },
}));

export default useUserStore;
