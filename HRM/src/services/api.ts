import { http } from "./http"
import type { AttendanceRecord, DashboardStats, Employee, LeaveRequest, PayrollRecord } from "@/types"

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

const unwrap = <T>(payload: ApiResponse<T> | T): T => {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return payload.data as T
  }

  return payload as T
}

export const authApi = {
  register: async (payload: { name: string; email: string; password: string; role?: string }) => {
    const response = await http.post<ApiResponse<{ id: string; name: string; email: string; role: string }>>("/auth/register", payload)
    return unwrap(response.data)
  },
  login: async (credentials: { email: string; password: string }) => {
    const response = await http.post<ApiResponse<{ token: string; user: { id: string; name: string; email: string; role: string } }>>("/auth/login", credentials)
    return unwrap(response.data)
  },
  getCurrentUser: async () => {
    const response = await http.get<ApiResponse<{ id: string; name: string; email: string; role: string; profilePicture?: string; isVerified?: boolean }>>("/auth/me")
    return unwrap(response.data)
  },
  verifyEmail: async (payload: { email: string; otp: string }) => {
    const response = await http.post<ApiResponse<{ id: string; email: string; role: string }>>("/auth/verify-email", payload)
    return unwrap(response.data)
  },
  resendOtp: async (payload: { email: string }) => {
    const response = await http.post<ApiResponse<{ email: string; verificationSent: boolean }>>("/auth/resend-otp", payload)
    return unwrap(response.data)
  },
}

export const dashboardApi = {
  getStats: async () => {
    const response = await http.get<ApiResponse<DashboardStats>>("/dashboard/stats")
    return unwrap(response.data)
  },
}

export const employeeApi = {
  list: async (params?: Record<string, string | number>) => {
    const response = await http.get<ApiResponse<{ employees: Employee[]; pagination?: unknown }>>("/employees", { params })
    return unwrap(response.data)
  },
  create: async (payload: Record<string, unknown>) => {
    const response = await http.post<ApiResponse<Employee>>("/employees", payload)
    return unwrap(response.data)
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await http.put<ApiResponse<Employee>>(`/employees/${id}`, payload)
    return unwrap(response.data)
  },
}

export const attendanceApi = {
  getMy: async () => {
    const response = await http.get<ApiResponse<{ todayAttendance?: AttendanceRecord | null; monthlyAttendance?: AttendanceRecord[]; statistics?: Record<string, number> }>>("/attendance/me")
    return unwrap(response.data)
  },
  list: async (params?: Record<string, string | number>) => {
    const response = await http.get<ApiResponse<{ attendance: AttendanceRecord[]; pagination?: unknown }>>("/attendance", { params })
    return unwrap(response.data)
  },
  checkIn: async (payload: { employee: string; remarks?: string }) => {
    const response = await http.post<ApiResponse<AttendanceRecord>>("/attendance/checkin", payload)
    return unwrap(response.data)
  },
  checkOut: async (payload: { employee: string; remarks?: string }) => {
    const response = await http.post<ApiResponse<AttendanceRecord>>("/attendance/checkout", payload)
    return unwrap(response.data)
  },
  mark: async (payload: Record<string, unknown>) => {
    const response = await http.post<ApiResponse<AttendanceRecord>>("/attendance/mark", payload)
    return unwrap(response.data)
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await http.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, payload)
    return unwrap(response.data)
  },
  delete: async (id: string) => {
    const response = await http.delete<ApiResponse<null>>(`/attendance/${id}`)
    return unwrap(response.data)
  },
}

export const leaveApi = {
  getMy: async () => {
    const response = await http.get<ApiResponse<LeaveRequest[]>>("/leaves/me")
    return unwrap(response.data)
  },
  list: async (params?: Record<string, string | number>) => {
    const response = await http.get<ApiResponse<{ leaves: LeaveRequest[]; pagination?: unknown }>>("/leaves", { params })
    return unwrap(response.data)
  },
  apply: async (payload: { employee: string; leaveType: string; startDate: string; endDate: string; reason?: string }) => {
    const response = await http.post<ApiResponse<LeaveRequest>>("/leaves", payload)
    return unwrap(response.data)
  },
  approve: async (id: string) => {
    const response = await http.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`)
    return unwrap(response.data)
  },
  reject: async (id: string, payload?: { comments?: string }) => {
    const response = await http.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, payload)
    return unwrap(response.data)
  },
  cancel: async (id: string) => {
    const response = await http.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/cancel`)
    return unwrap(response.data)
  },
  delete: async (id: string) => {
    const response = await http.delete<ApiResponse<null>>(`/leaves/${id}`)
    return unwrap(response.data)
  },
}

export const payrollApi = {
  getMy: async () => {
    const response = await http.get<ApiResponse<PayrollRecord[]>>("/payroll/me")
    return unwrap(response.data)
  },
  list: async (params?: Record<string, string | number>) => {
    const response = await http.get<ApiResponse<{ payrolls: PayrollRecord[]; pagination?: unknown }>>("/payroll", { params })
    return unwrap(response.data)
  },
  generate: async (payload: Record<string, unknown>) => {
    const response = await http.post<ApiResponse<PayrollRecord>>("/payroll", payload)
    return unwrap(response.data)
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const response = await http.put<ApiResponse<PayrollRecord>>(`/payroll/${id}`, payload)
    return unwrap(response.data)
  },
  pay: async (id: string) => {
    const response = await http.put<ApiResponse<PayrollRecord>>(`/payroll/${id}/pay`)
    return unwrap(response.data)
  },
  delete: async (id: string) => {
    const response = await http.delete<ApiResponse<null>>(`/payroll/${id}`)
    return unwrap(response.data)
  },
}
