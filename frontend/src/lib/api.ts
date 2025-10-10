import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string>),
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle non-JSON responses or empty responses
      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        // Provide more specific error messages based on status code
        let errorMessage = data.message || data.error;

        if (response.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (response.status === 403) {
          errorMessage = "You do not have permission to access this resource.";
        } else if (response.status === 404) {
          errorMessage = "The requested resource was not found.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (!errorMessage) {
          errorMessage = `Request failed with status ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  async get<T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    endpoint: string
  ): Promise<{ success: boolean; data?: T; message?: string }> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Export the base API client as 'api' for backward compatibility
export const api = apiClient;

// Utility function for handling empty data scenarios
export const handleEmptyData = <T>(
  data: T[] | undefined,
  resourceType: string
): T[] => {
  if (!data || data.length === 0) {
    console.info(`No ${resourceType} found`);
    return [];
  }
  return data;
};
