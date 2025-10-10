import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore, type User } from "@/store/authStore";

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Login hook
export const useLogin = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
    },
  });
};

// Register hook
export const useRegister = () => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (userData: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        userData
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
      }
      return response.data;
    },
    onSuccess: (data) => {
      login(data.user, data.token);
    },
  });
};

// Forgot password hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post("/auth/forgot-password", { email });
      if (!response.success) {
        throw new Error(
          response.message || "Failed to send password reset email"
        );
      }
      return response;
    },
  });
};

// Logout hook
export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // In a real app, you might want to call an API endpoint to invalidate the token
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached queries
    },
  });
};

// Get current user profile (for checking if token is still valid)
export const useCurrentUser = () => {
  const { token, logout } = useAuthStore();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<User> => {
      try {
        const response = await apiClient.get<User>("/auth/me");
        if (!response.success || !response.data) {
          throw new Error(response.message || "User not found");
        }
        return response.data;
      } catch (error) {
        // If the request fails (e.g., token expired), log out the user
        logout();
        throw error;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Convenience hook that returns auth store state and common auth actions
export const useAuth = () => {
  const authStore = useAuthStore();
  return {
    ...authStore,
    login: useLogin(),
    register: useRegister(),
    logout: useLogout(),
    forgotPassword: useForgotPassword(),
  };
};
