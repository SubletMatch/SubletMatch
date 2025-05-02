// This is a placeholder service that will be implemented when the backend is ready
export const authService = {
  async signIn(email: string, password: string) {
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/api/v1/auth/token", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || "Failed to sign in" };
      }

      const data = await response.json();
      // Store the token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
      }
      return { success: true, token: data.access_token };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Network error occurred" };
    }
  },

  async signUp(email: string, username: string, password: string) {
    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: username,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || "Failed to sign up" };
      }

      const data = await response.json();
      // Store the token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
      }
      return { success: true, token: data.access_token };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "Network error occurred" };
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return localStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      return !!this.getToken();
    } catch (error) {
      console.error("Error checking authentication:", error);
      return false;
    }
  },

  logout(): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  },
};
 