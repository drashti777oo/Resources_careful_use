import { AttendanceChart } from "@/components/charts/AttendanceChart"

const stats = [
  { label: "Active Employees", value: "248", detail: "+12%", accent: "text-emerald-600" },
  { label: "Pending Leave", value: "18", detail: "3 urgent", accent: "text-amber-600" },
  { label: "Attendance Rate", value: "94.2%", detail: "+1.8%", accent: "text-emerald-600" },
  { label: "Payroll This Month", value: "$124k", detail: "On track", accent: "text-fuchsia-600" },
]

const upcomingEvents = [
  "Payroll review at 2:00 PM",
  "Interview panel at 4:30 PM",
  "Leave approvals by 6:00 PM",
]

export function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">HRMS Dashboard</h1>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</h2>
              <span className={`text-sm font-semibold ${stat.accent}`}>{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Team Activity</h2>
            </div>
            <div className="text-sm text-muted-foreground">This week</div>
          </div>
          <div className="flex h-72 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm text-muted-foreground">
            Activity chart placeholder
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {upcomingEvents.map((event) => (
                <p key={event} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-slate-800" />
                  {event}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Add Employee</button>
              <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900">Approve Leave</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
