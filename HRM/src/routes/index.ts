import { createElement } from "react"
import { createBrowserRouter } from "react-router-dom"

import { LoginPage } from "@/pages/auth/LoginPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { EmployeesPage } from "@/pages/employees/EmployeesPage"
import { AttendancePage } from "@/pages/attendance/AttendancePage"
import { LeavePage } from "@/pages/leave/LeavePage"
import { PayrollPage } from "@/pages/payroll/PayrollPage"

export const router = createBrowserRouter([
  { path: "/", element: createElement(LoginPage) },
  { path: "/dashboard", element: createElement(DashboardPage) },
  { path: "/employees", element: createElement(EmployeesPage) },
  { path: "/attendance", element: createElement(AttendancePage) },
  { path: "/leave", element: createElement(LeavePage) },
  { path: "/payroll", element: createElement(PayrollPage) },
])
