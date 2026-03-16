"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { parseApiError } from "@/lib/utils";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();

  // Fetch current user (hydrate store)
  const { isLoading: profileLoading, data: profileData, isError: profileError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    enabled: true,
    retry: false,
  });

  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    }
  }, [profileData, setUser]);

  useEffect(() => {
    if (profileError) {
      clearAuth();
    }
  }, [profileError, clearAuth]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}! 👋`);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      toast.success(`Welcome to TaskFlow, ${data.user.name}! 🎉`);
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: () => {
      // Force logout even if API call fails
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading: profileLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
