import { AttendanceChart } from "@/components/charts/AttendanceChart"
import { Building, CalendarDays, Clock, DollarSign, Users } from "lucide-react"

const stats = [
  {
    label: "Total Employees",
    value: "248",
    detail: "+12% this month",
    accent: "text-emerald-600",
    icon: Users,
    iconBg: "bg-emerald-50 text-emerald-700",
  },
  {
    label: "Attendance Rate",
    value: "94.2%",
    detail: "+1.8% this month",
    accent: "text-sky-600",
    icon: CalendarDays,
    iconBg: "bg-sky-50 text-sky-700",
  },
  {
    label: "Pending Leave",
    value: "18",
    detail: "+3 from yesterday",
    accent: "text-amber-600",
    icon: Clock,
    iconBg: "bg-amber-50 text-amber-700",
  },
  {
    label: "Payroll This Month",
    value: "$124,560",
    detail: "On track",
    accent: "text-fuchsia-600",
    icon: DollarSign,
    iconBg: "bg-fuchsia-50 text-fuchsia-700",
  },
  {
    label: "Departments",
    value: "8",
    detail: "No change",
    accent: "text-violet-600",
    icon: Building,
    iconBg: "bg-violet-50 text-violet-700",
  },
]

const departments = [
  { name: "Engineering", employees: "68", attendance: "96.7%" },
  { name: "Marketing", employees: "34", attendance: "92.1%" },
  { name: "Sales", employees: "45", attendance: "93.8%" },
  { name: "Human Resources", employees: "18", attendance: "95.2%" },
  { name: "Finance", employees: "26", attendance: "91.3%" },
]

const recentRequests = [
  { name: "John Doe", type: "Annual Leave", dates: "May 15 - May 18", status: "Pending" },
  { name: "Sarah Johnson", type: "Sick Leave", dates: "May 14 - May 14", status: "Approved" },
  { name: "Michael Brown", type: "Casual Leave", dates: "May 16 - May 16", status: "Pending" },
  { name: "Emily Davis", type: "Annual Leave", dates: "May 20 - May 22", status: "Rejected" },
]

const upcomingEvents = [
  { title: "Payroll review meeting", time: "Today, 2:00 PM" },
  { title: "Interview: Product Designer", time: "Today, 4:30 PM" },
  { title: "Leave approvals", time: "Today, 6:00 PM" },
  { title: "Team building event", time: "May 20, 10:00 AM" },
]

export function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Workforce performance at a glance</h1>
        </div>
        <button className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
          Add Employee
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {stats.map((stat) => (
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
                  <p className="text-4xl font-semibold text-slate-950">248</p>
                  <p className="text-sm text-slate-500">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              {[
                { label: "Present", value: "210", color: "bg-emerald-100 text-emerald-700" },
                { label: "Absent", value: "14", color: "bg-rose-100 text-rose-700" },
                { label: "Late", value: "8", color: "bg-amber-100 text-amber-700" },
                { label: "Half-day", value: "16", color: "bg-sky-100 text-sky-700" },
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
            {departments.map((dept) => (
              <div key={dept.name} className="grid grid-cols-[1.7fr_0.8fr_0.8fr_0.5fr] gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="font-semibold text-slate-950">{dept.name}</div>
                <div>{dept.employees}</div>
                <div>{dept.attendance}</div>
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
            {recentRequests.map((request) => (
              <div key={request.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{request.name}</p>
                    <p className="text-sm text-slate-500">{request.type}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === "Approved" ? "bg-emerald-100 text-emerald-700" : request.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{request.dates}</p>
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
              <p className="mt-2 text-3xl font-semibold text-slate-950">$124,560</p>
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
