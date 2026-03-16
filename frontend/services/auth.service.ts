import api from "@/lib/api";
import {
  ApiResponse,
  AuthResponse,
  User,
} from "@/lib/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      data
    );
    return response.data.data!;
  },

  /**
   * Login an existing user
   */
  async login(data: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data.data!;
  },

  /**
   * Logout — revoke current refresh token
   */
  async logout(): Promise<void> {
    await api.post("/auth/logout", {});
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<{ user: User }>>("/auth/me");
    return response.data.data!.user;
  },
};
