import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    accessToken: session?.user?.accessToken,
    isGuest: session?.user?.isGuest || false,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}

// Helper to get authorization header for API calls
export function getAuthHeaders(accessToken?: string) {
  if (!accessToken) return {};

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
