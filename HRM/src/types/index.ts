export interface Employee {
  id: string
  fullName: string
  email: string
  role: string
  department: string
}

export interface AttendanceRecord {
  id: string
  employeeId: string
  date: string
  checkIn: string
  checkOut?: string
}
