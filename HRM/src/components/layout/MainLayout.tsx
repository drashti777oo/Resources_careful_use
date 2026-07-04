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
  Search,
  Settings,
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
      <aside className={`${collapsed ? "w-20" : "w-72"} hidden flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-sm lg:flex`}>
        <div>
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">HRMS</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">People Operations</h2>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
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
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-violet-100 text-violet-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                {!collapsed ? <span>{label}</span> : null}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">People Ops Inc.</p>
            <p className="mt-1 text-xs text-slate-500">Enterprise Plan</p>
          </div>

          <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
              AD
            </div>
            {!collapsed ? (
              <div>
                <p className="text-sm font-semibold text-slate-950">Alicia Davis</p>
                <p className="text-xs text-slate-500">HR Manager</p>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search employees, departments..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm focus:border-violet-300 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100">
                <Settings size={18} />
              </button>
              <button className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>
              <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm sm:flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">AD</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">Alicia Davis</p>
                  <p className="text-xs text-slate-500">HR Manager</p>
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
