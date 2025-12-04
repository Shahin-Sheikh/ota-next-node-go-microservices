import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  authService,
  type LoginCredentials,
  type RegisterCredentials,
  type AuthResponse,
} from "@/services/auth.service";
import { useAuth } from "@/contexts/auth.context";
import { AxiosError } from "axios";

interface ErrorResponse {
  success: boolean;
  message: string;
}

/**
 * Hook for login mutation
 */
export const useLogin = (): UseMutationResult<
  AuthResponse,
  AxiosError<ErrorResponse>,
  LoginCredentials
> => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation<AuthResponse, AxiosError<ErrorResponse>, LoginCredentials>(
    {
      mutationFn: async (credentials: LoginCredentials) => {
        return await authService.login(credentials);
      },
      onSuccess: (data) => {
        setUser(data.data);
        toast.success("Login successful!", {
          description: `Welcome back, ${data.data.name}!`,
        });
        navigate("/dashboard");
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.message || "Login failed. Please try again.";
        toast.error("Login Failed", {
          description: errorMessage,
        });
      },
    }
  );
};

/**
 * Hook for register mutation
 */
export const useRegister = (): UseMutationResult<
  AuthResponse,
  AxiosError<ErrorResponse>,
  RegisterCredentials
> => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return useMutation<
    AuthResponse,
    AxiosError<ErrorResponse>,
    RegisterCredentials
  >({
    mutationFn: async (credentials: RegisterCredentials) => {
      return await authService.register(credentials);
    },
    onSuccess: (data) => {
      setUser(data.data);
      toast.success("Registration successful!", {
        description: `Welcome, ${data.data.name}!`,
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    },
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });
};
