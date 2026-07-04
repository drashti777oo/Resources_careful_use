import { useAppStore } from "@/store"

interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  profilePicture?: string
  isVerified?: boolean
}

export function useAuth() {
  const { isAuthenticated, isLoading, token, user, setAuth, clearAuth, setLoading } = useAppStore()

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    login: (payload: { token: string; user: AuthUser }) => setAuth(payload),
    logout: () => clearAuth(),
    setLoading,
  }
}
