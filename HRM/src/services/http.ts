import axios from "axios"

import { useAppStore } from "@/store"

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = useAppStore.getState().token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || "Request failed"
    return Promise.reject(new Error(message))
  },
)
