import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  Bell,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Wallet,
} from "lucide-react"

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
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`flex min-h-screen ${darkMode ? "dark bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
      <aside className={`${collapsed ? "w-20" : "w-72"} hidden flex-col justify-between border-r bg-background/95 p-4 shadow-sm lg:flex`}>
        <div>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">HRMS</p>
              <h2 className="mt-1 text-lg font-semibold">People Ops</h2>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="rounded-full border p-2 text-muted-foreground transition hover:bg-accent"
            >
              {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
            </button>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed ? <span>{label}</span> : null}
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
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </aside>

      <div className="flex-1">
        <header className="border-b bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back</p>
              <h1 className="text-lg font-semibold">Human Resource Management</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDarkMode((value) => !value)}
                className="rounded-full border p-2 text-muted-foreground transition hover:bg-accent"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                type="button"
                className="relative rounded-full border p-2 text-muted-foreground transition hover:bg-accent"
              >
                <Bell size={16} />
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              </button>

              <div className="flex items-center gap-3 rounded-full border bg-muted/60 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  AD
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">Alicia Davis</p>
                  <p className="text-xs text-muted-foreground">HR Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Overview</p>
            <h2 className="text-2xl font-semibold">HRMS Dashboard</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Active Employees", value: "248", change: "+12%" },
              { title: "Pending Leave", value: "18", change: "3 urgent" },
              { title: "Attendance Rate", value: "94.2%", change: "+1.8%" },
              { title: "Payroll This Month", value: "$124k", change: "On track" },
            ].map((card) => (
              <div key={card.title} className="rounded-xl border bg-background p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-semibold">{card.value}</span>
                  <span className="text-sm text-emerald-600">{card.change}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">Team Activity</h3>
                <span className="text-sm text-muted-foreground">This week</span>
              </div>
              <div className="flex h-48 items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
                Activity chart placeholder
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <h3 className="font-semibold">Upcoming Events</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Payroll review at 2:00 PM</li>
                  <li>• Interview panel at 4:30 PM</li>
                  <li>• Leave approvals by 6:00 PM</li>
                </ul>
              </div>
              <div className="rounded-xl border bg-background p-4 shadow-sm">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground">Add Employee</button>
                  <button className="rounded-full border px-3 py-2 text-sm">Approve Leave</button>
                </div>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
