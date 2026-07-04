import { createBrowserRouter } from "react-router-dom"

import { MainLayout } from "@/components/layout/MainLayout"
import { ProtectedRoute } from "@/components/routes/ProtectedRoute"
import { LoginPage } from "@/pages/auth/LoginPage"
import { RegisterPage } from "@/pages/auth/RegisterPage"
import { VerifyPage } from "@/pages/auth/VerifyPage"
import { DashboardPage } from "@/pages/dashboard/DashboardPage"
import { EmployeesPage } from "@/pages/employees/EmployeesPage"
import { AttendancePage } from "@/pages/attendance/AttendancePage"
import { LeavePage } from "@/pages/leave/LeavePage"
import { PayrollPage } from "@/pages/payroll/PayrollPage"

export const appRoutes = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/employees", element: <EmployeesPage /> },
          { path: "/attendance", element: <AttendancePage /> },
          { path: "/leave", element: <LeavePage /> },
          { path: "/payroll", element: <PayrollPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <LoginPage />,
  },
])
