import axios from "axios";

const AUTH_BASE_URL =
  import.meta.env.VITE_API_AUTH_URL || "http://localhost:5001";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  data: {
    id: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    service?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  service?: string;
}

class AuthService {
  /**
   * Login service user with email and password (for hotel, admin, etc.)
   * Stores tokens in localStorage and returns user data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const serviceSecret = import.meta.env.VITE_SERVICE_SECRET;

    if (!serviceSecret) {
      throw new Error("Service secret not configured");
    }

    const response = await axios.post<AuthResponse>(
      `${AUTH_BASE_URL}/api/auth/service/login`,
      credentials,
      {
        headers: {
          "service-secret": serviceSecret,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { accessToken, refreshToken, data } = response.data;

    // Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(data));

    return response.data;
  }

  /**
   * Login customer with email and password
   * Stores tokens in localStorage and returns user data
   */
  async loginCustomer(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${AUTH_BASE_URL}/api/auth/customer/login`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { accessToken, refreshToken, data } = response.data;

    // Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(data));

    return response.data;
  }

  /**
   * Register new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${AUTH_BASE_URL}/api/auth/customer/register`,
      credentials,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { accessToken, refreshToken, data } = response.data;

    // Store tokens
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(data));

    return response.data;
  }

  /**
   * Logout user
   * Clears tokens and makes logout request to server
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await axios.post(
          `${AUTH_BASE_URL}/api/auth/logout`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post<{ accessToken: string }>(
      `${AUTH_BASE_URL}/api/auth/token/refresh`,
      { refreshToken },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const { accessToken } = response.data;
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = localStorage.getItem("accessToken");
    const user = this.getCurrentUser();

    return !!(accessToken && user);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
