import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AttendanceChart } from "@/components/charts/AttendanceChart"
import { Building, CalendarDays, Clock, DollarSign, Users, LogOut } from "lucide-react"

import { dashboardApi } from "@/services/api"
import { useAuth } from "@/hooks/useAuth"
import type { DashboardStats } from "@/types"

const upcomingEvents = [
  { title: "Payroll review meeting", time: "Today, 2:00 PM" },
  { title: "Interview: Product Designer", time: "Today, 4:30 PM" },
  { title: "Leave approvals", time: "Today, 6:00 PM" },
  { title: "Team building event", time: "May 20, 10:00 AM" },
]

const initialStats: DashboardStats = {
  totalEmployees: 0,
  totalDepartments: 0,
  activeEmployees: 0,
  inactiveEmployees: 0,
  attendance: { presentToday: 0, absentToday: 0, lateToday: 0, leaveToday: 0 },
  leaves: { pending: 0, approved: 0, rejected: 0 },
  payroll: { paid: 0, pending: 0 },
}

export function DashboardPage() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch stats if user is admin/hr (employees will get 403)
    const role = user?.role?.toUpperCase()
    if (role === "EMPLOYEE") {
      setLoading(false)
      return
    }

    const loadStats = async () => {
      try {
        const response = await dashboardApi.getStats()
        setStats(response)
      } catch {
        setStats(initialStats)
      } finally {
        setLoading(false)
      }
    }

    void loadStats()
  }, [user])

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Employees",
        value: stats.totalEmployees.toString(),
        detail: `${stats.activeEmployees} active`,
        accent: "text-emerald-600",
        icon: Users,
        iconBg: "bg-emerald-50 text-emerald-700",
      },
      {
        label: "Attendance Rate",
        value: `${Math.max(0, Math.round(((stats.attendance.presentToday / Math.max(1, stats.attendance.presentToday + stats.attendance.absentToday + stats.attendance.lateToday + stats.attendance.leaveToday)) * 100) * 10) / 10)}%`,
        detail: `${stats.attendance.presentToday} present today`,
        accent: "text-sky-600",
        icon: CalendarDays,
        iconBg: "bg-sky-50 text-sky-700",
      },
      {
        label: "Pending Leave",
        value: stats.leaves.pending.toString(),
        detail: `${stats.leaves.approved} approved`,
        accent: "text-amber-600",
        icon: Clock,
        iconBg: "bg-amber-50 text-amber-700",
      },
      {
        label: "Payroll This Month",
        value: `${stats.payroll.paid} paid`,
        detail: `${stats.payroll.pending} pending`,
        accent: "text-fuchsia-600",
        icon: DollarSign,
        iconBg: "bg-fuchsia-50 text-fuchsia-700",
      },
      {
        label: "Departments",
        value: stats.totalDepartments.toString(),
        detail: "Live from API",
        accent: "text-violet-600",
        icon: Building,
        iconBg: "bg-violet-50 text-violet-700",
      },
    ],
    [stats],
  )

  // Render Employee Dashboard as defined in specifications document section 3.2.1
  if (user?.role?.toUpperCase() === "EMPLOYEE") {
    return (
      <div className="space-y-6 p-6">
        <div>
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-[0.2em]">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 mt-1">Welcome back, {user?.name}</h1>
        </div>

        {/* Quick Access Cards: Profile, Attendance, Leave Requests, Logout */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/employees"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Profile</span>
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600 transition group-hover:scale-110">
                <Users size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">View personal and job details</p>
          </Link>

          <Link
            to="/attendance"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attendance</span>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600 transition group-hover:scale-110">
                <CalendarDays size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Check in or view logs</p>
          </Link>

          <Link
            to="/leave"
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Leave Requests</span>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600 transition group-hover:scale-110">
                <Clock size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Request leave and check status</p>
          </Link>

          <button
            onClick={logout}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-left transition hover:shadow-md hover:border-slate-300 w-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Logout</span>
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600 transition group-hover:scale-110">
                <LogOut size={20} />
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Log out of your account</p>
          </button>
        </div>

        {/* Recent Activity or Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-slate-950">System Check-in Completed</p>
                  <p className="text-xs text-slate-500">Today, 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <div>
                  <p className="font-medium text-slate-950">July Payroll Processed</p>
                  <p className="text-xs text-slate-500">Yesterday, 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Alerts & Notifications</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-amber-800">
                <Clock size={18} className="text-amber-600" />
                <div>
                  <p className="font-medium text-amber-950">Pending Leave Request</p>
                  <p className="text-xs text-amber-700">Your casual leave request is pending HR approval.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                <Building size={18} className="text-emerald-600" />
                <div>
                  <p className="font-medium text-emerald-900">Holiday Notice</p>
                  <p className="text-xs text-emerald-700">Office will be closed on upcoming national holiday.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin / HR / Manager Dashboard as defined in specifications document section 3.2.2
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Workforce performance at a glance</h1>
        </div>
        <Link
          to="/employees"
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Add Employee
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {summaryCards.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} grid h-12 w-12 place-items-center rounded-2xl`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className={`mt-4 text-sm font-semibold ${stat.accent}`}>{stat.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Attendance Overview</h2>
              <p className="text-sm text-slate-500">This week</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              This Week
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <AttendanceChart />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Today’s Attendance</h2>
                <p className="text-sm text-slate-500">Live attendance summary</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">Total</div>
            </div>
            <div className="relative flex h-64 items-center justify-center rounded-3xl bg-slate-50 p-6">
              <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-slate-100 to-white" />
              <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-8 border-emerald-500/40" style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)" }} />
                <div className="absolute inset-0 rounded-full border-8 border-amber-500/40" style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)" }} />
                <div className="absolute inset-0 rounded-full border-8 border-rose-500/40" style={{ clipPath: "polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)" }} />
                <div className="absolute inset-0 rounded-full border-8 border-sky-500/40" style={{ clipPath: "polygon(50% 50%, 50% 0%, 0% 0%, 0% 50%)" }} />
                <div className="relative flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-semibold text-slate-950">{stats.totalEmployees}</p>
                  <p className="text-sm text-slate-500">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              {[
                { label: "Present", value: stats.attendance.presentToday.toString(), color: "bg-emerald-100 text-emerald-700" },
                { label: "Absent", value: stats.attendance.absentToday.toString(), color: "bg-rose-100 text-rose-700" },
                { label: "Late", value: stats.attendance.lateToday.toString(), color: "bg-amber-100 text-amber-700" },
                { label: "Leave", value: stats.attendance.leaveToday.toString(), color: "bg-sky-100 text-sky-700" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span>{item.label}</span>
                  <span className={`${item.color} inline-flex h-8 min-w-20 items-center justify-center rounded-full px-3 text-xs font-semibold`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Upcoming Events</h2>
              <button className="text-sm font-semibold text-violet-600">View all</button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              {upcomingEvents.map((event) => (
                <div key={event.title} className="rounded-3xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="font-semibold text-slate-950">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Department Overview</h2>
              <p className="text-sm text-slate-500">This month</p>
            </div>
            <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">This Month</button>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-[1.7fr_0.8fr_0.8fr_0.5fr] gap-4 px-4 pb-3 text-xs uppercase tracking-[0.18em] text-slate-500">
              <span>Department</span>
              <span>Employees</span>
              <span>Attendance</span>
              <span>Trend</span>
            </div>
            {(stats.departmentDistribution ?? []).map((dept) => (
              <div key={dept.department} className="grid grid-cols-[1.7fr_0.8fr_0.8fr_0.5fr] gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="font-semibold text-slate-950">{dept.department}</div>
                <div>{dept.count}</div>
                <div>Live</div>
                <div className="text-right text-emerald-600">⬈</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Leave Requests</h2>
              <p className="text-sm text-slate-500">View recent team leave activity.</p>
            </div>
            <button className="text-sm font-semibold text-violet-600">View all</button>
          </div>
          <div className="space-y-4">
            {(stats.recentEmployees ?? []).map((employee) => (
              <div key={employee.employeeId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-slate-500">{employee.department}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${employee.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                    {employee.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{employee.employeeId}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Payroll Summary</h2>
              <p className="text-sm text-slate-500">This month</p>
            </div>
            <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">This Month</button>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="mb-6 text-sm text-slate-700">
              <p className="text-sm text-slate-500">Total Payroll</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.payroll.paid}</p>
              <p className="mt-2 text-sm text-emerald-600">+8.2% vs last month</p>
            </div>
            <div className="space-y-3">
              {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => (
                <div key={month} className="flex items-end gap-3">
                  <span className="w-12 text-xs text-slate-500">{month}</span>
                  <div className={`h-10 flex-1 rounded-full ${index === 5 ? 'bg-violet-600' : 'bg-violet-200'}`} style={{ maxWidth: `${40 + index * 10}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
