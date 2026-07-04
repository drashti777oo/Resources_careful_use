import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  Bell,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
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
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={`flex min-h-screen ${darkMode ? "dark bg-zinc-950 text-zinc-100" : "bg-slate-50 text-slate-900"}`}>
      <aside className="w-80 hidden flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm lg:flex">
        <div>
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-violet-600 text-white shadow-lg">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">HRM Pro</p>
                <p className="text-xs text-slate-500">People · Process · Performance</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-linear-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-200/40"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" alt="Alicia Davis" className="h-12 w-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-950">Alicia Davis</p>
                  <ChevronDown size={16} className="text-slate-500" />
                </div>
                <p className="text-xs text-slate-500">HR Manager</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">Quick Actions</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {[
                { label: "Add Employee", icon: Plus },
                { label: "Request Leave", icon: CalendarDays },
                { label: "Approve Leave", icon: ShieldCheck },
                { label: "Run Payroll", icon: Wallet },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
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
          <Outlet />
        </main>
      </div>
    </div>
  )
}
