import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/hooks/useAuth"
import { authApi } from "@/services/api"

export function ProtectedRoute() {
  const { isAuthenticated, token, user, login, setLoading, isLoading } = useAuth()

  useEffect(() => {
    if (!token || user) {
      return
    }

    const loadUser = async () => {
      setLoading(true)
      try {
        const response = await authApi.getCurrentUser()
        login({ token, user: response })
      } catch {
        // Keep the user on login page if no valid session exists.
      } finally {
        setLoading(false)
      }
    }

    void loadUser()
  }, [login, setLoading, token, user])

  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-600">Loading your workspace…</div>
  }

  return <Outlet />
}
