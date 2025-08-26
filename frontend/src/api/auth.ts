import API from "./axios";
import { type User } from "../store/authStore";

// Unified auth response (backend currently returns only { token } for success)
export interface AuthResponse {
  token?: string;
  user?: User; // reserved for future expansion
}

export class ApiError extends Error {
  status?: number;
  details?: any;
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const extractErrorMessage = (data: any): string => {
  if (!data) return "Unexpected error";
  return data.error || data.message || "Unexpected error";
};

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  try {
    // Normalize email to lowercase for uniqueness consistency
    const response = await API.post<AuthResponse>("/auth/register", { name, email: email.toLowerCase(), password });
    return response.data; // likely { token }
  } catch (error: any) {
    if (error.response) {
      const msg = extractErrorMessage(error.response.data);
      throw new ApiError(msg, error.response.status, error.response.data);
    }
    throw new ApiError("Network or server error");
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await API.post<AuthResponse>("/auth/login", { email: email.toLowerCase(), password });
    return response.data; // { token }
  } catch (error: any) {
    if (error.response) {
      const msg = extractErrorMessage(error.response.data);
      throw new ApiError(msg, error.response.status, error.response.data);
    }
    throw new ApiError("Network or server error");
  }
};
