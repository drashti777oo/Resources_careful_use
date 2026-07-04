export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  profilePicture?: string
  isVerified?: boolean
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  department: string
  jobTitle: string
  hireDate: string
  employmentType: string
  status: string
  manager: string
  salary: any
  address: string
}

export interface AttendanceRecord {
  id: string
  employee: any
  date: string
  checkIn: string
  checkOut: string
  status: string
  notes?: string
  remarks?: string
}

export interface LeaveRequest {
  id: string
  employee?: any
  requester: string
  role?: string
  leaveType: string
  startDate: string
  endDate: string
  daysRequested?: number
  totalDays?: number
  reason: string
  status: string
  statusLabel?: string
  requestedOn?: string
  approvedBy?: string
}

export interface PayrollRecord {
  id: string
  employee: any
  month: number | string
  year: number | string
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  paymentStatus?: string
  status: string
  paymentDate: string
}

export interface DashboardStats {
  totalEmployees: number
  totalDepartments: number
  activeEmployees: number
  inactiveEmployees: number
  attendance: {
    presentToday: number
    absentToday: number
    lateToday: number
    leaveToday: number
  }
  leaves: {
    pending: number
    approved: number
    rejected: number
  }
  payroll: {
    paid: number
    pending: number
  }
  recentEmployees?: Array<{
    employeeId: string
    firstName: string
    lastName: string
    department: string
    joiningDate?: string
    status: string
  }>
  monthlyAttendance?: Array<{
    month: string
    present: number
    absent: number
    late: number
    leave: number
    halfDay: number
  }>
  departmentDistribution?: Array<{
    department: string
    count: number
  }>
}
