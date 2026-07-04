import { useAppStore } from "@/store"

export function useAuth() {
  const { isAuthenticated, setAuthenticated } = useAppStore()

  return {
    isAuthenticated,
    login: () => setAuthenticated(true),
    logout: () => setAuthenticated(false),
  }
}
