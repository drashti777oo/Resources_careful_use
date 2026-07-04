import { AttendanceChart } from "@/components/charts/AttendanceChart"

const stats = [
  { label: "Active Employees", value: "248", detail: "+12% this month" },
  { label: "Pending Leave", value: "18", detail: "3 urgent" },
  { label: "Attendance Rate", value: "94.2%", detail: "+1.8%" },
  { label: "Payroll This Month", value: "$124k", detail: "On track" },
]

export function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-semibold">HRMS Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Team activity</h2>
              <p className="text-sm text-muted-foreground">Weekly attendance overview</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">This week</span>
          </div>
          <AttendanceChart />
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Upcoming events</h2>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="rounded-2xl bg-muted/50 p-4">Payroll review meeting at 2:00 PM</div>
              <div className="rounded-2xl bg-muted/50 p-4">Interview panel with UX team</div>
              <div className="rounded-2xl bg-muted/50 p-4">Leave approvals due by 6:00 PM</div>
            </div>
          </div>

          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add employee</button>
              <button className="rounded-full border px-4 py-2 text-sm font-medium">Approve leave</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
