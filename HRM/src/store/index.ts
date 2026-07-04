import { create } from "zustand"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  profilePicture?: string
  isVerified?: boolean
}

interface AppStore {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (payload: { token: string | null; user: UserProfile | null }) => void
  clearAuth: () => void
  setLoading: (value: boolean) => void
}

const STORAGE_KEY = "hrms-auth"

const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return { token: null, user: null, isAuthenticated: false }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { token: null, user: null, isAuthenticated: false }
    }

    const parsed = JSON.parse(stored) as { token?: string | null; user?: UserProfile | null }
    return {
      token: parsed.token ?? null,
      user: parsed.user ?? null,
      isAuthenticated: Boolean(parsed.token),
    }
  } catch {
    return { token: null, user: null, isAuthenticated: false }
  }
}

export const useAppStore = create<AppStore>((set) => ({
  ...readStoredAuth(),
  isLoading: false,
  setAuth: ({ token, user }) => {
    if (typeof window !== "undefined") {
      if (token) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }))
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }

    set({ token, user, isAuthenticated: Boolean(token) })
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }

    set({ token: null, user: null, isAuthenticated: false })
  },
  setLoading: (value) => set({ isLoading: value }),
}))
