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
  salary: string
  address: string
}

export interface AttendanceRecord {
  id: string
  employee: string
  date: string
  checkIn: string
  checkOut: string
  status: string
  notes: string
}

export interface LeaveRequest {
  id: string
  requester: string
  leaveType: string
  startDate: string
  endDate: string
  daysRequested: number
  reason: string
  status: string
  approvedBy: string
}

export interface PayrollRecord {
  id: string
  employee: string
  month: string
  year: string
  basicSalary: string
  allowances: string
  deductions: string
  netSalary: string
  status: string
  paymentDate: string
}
