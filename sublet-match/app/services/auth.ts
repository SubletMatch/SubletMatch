import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AuthResponse {
  success: boolean;
  error?: string;
  token?: string;
  message?: string;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(`${API_URL}/auth/token`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return {
        success: true,
        token: response.data.access_token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Invalid email or password",
      };
    }
  },

  async signUp(
    email: string,
    name: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        name,
        password,
      });

      return {
        success: true,
        token: response.data.access_token,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to create account",
      };
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Forgot password error:", error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          "Failed to send reset link. Please try again later.",
      };
    }
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      });

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || "Failed to reset password",
      };
    }
  },
};
