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
      localStorage.setItem("token", data.access_token);
      return { success: true };
    } catch (error) {
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
      localStorage.setItem("token", data.access_token);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Network error occurred" };
    }
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  logout(): void {
    localStorage.removeItem("token");
  },
};
