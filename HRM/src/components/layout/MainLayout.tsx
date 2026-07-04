import { NavLink, Outlet } from "react-router-dom"
import { Activity, CalendarDays, LayoutDashboard, LogOut, ShieldCheck, Users, Wallet } from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarDays },
  { to: "/leave", label: "Leave", icon: ShieldCheck },
  { to: "/payroll", label: "Payroll", icon: Wallet },
]

export function MainLayout() {
  const { logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-72 flex-col justify-between border-r bg-background p-6 lg:flex">
        <div>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">HRMS</p>
            <h2 className="mt-2 text-xl font-semibold">People Operations</h2>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <div className="flex-1">
        <header className="border-b bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold">Human Resource Management</h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-2 text-sm">
              <Activity size={16} className="text-primary" />
              System ready
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
