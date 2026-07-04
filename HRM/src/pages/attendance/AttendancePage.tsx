import { useMemo, useState } from "react"
import { ArrowUpRight, Clock, Download, TrendingUp } from "lucide-react"

import { AttendanceChart } from "@/components/charts/AttendanceChart"
import { PageHeader } from "@/components/common/PageHeader"
import type { AttendanceRecord } from "@/types"

const attendanceRecords: AttendanceRecord[] = [
  { id: "1", employee: "Alicia Davis", date: "2026-07-01", checkIn: "08:58", checkOut: "17:05", status: "Present", notes: "On time" },
  { id: "2", employee: "Jason Mills", date: "2026-07-01", checkIn: "09:18", checkOut: "17:12", status: "Late", notes: "Traffic" },
  { id: "3", employee: "Maya Patel", date: "2026-06-30", checkIn: "08:45", checkOut: "16:58", status: "Present", notes: "" },
  { id: "4", employee: "Norman Lee", date: "2026-06-30", checkIn: "", checkOut: "", status: "Absent", notes: "Sick leave" },
]

export function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string>("")
  const [checkOutTime, setCheckOutTime] = useState<string>("")
  const [search, setSearch] = useState("")

  const filteredRecords = useMemo(
    () =>
      attendanceRecords.filter((record) =>
        [record.employee, record.date, record.status, record.notes]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [search],
  )

  const handleCheckIn = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setCheckedIn(true)
    setCheckInTime(time)
    setCheckOutTime("")
  }

  const handleCheckOut = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    setCheckOutTime(time)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, Alicia 👋</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Attendance</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Track team check-in status, review weekly trends, and manage attendance logs.</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm shadow-sm">
            <Download size={16} /> Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active employees", value: "248", delta: "+18% from last month" },
          { label: "Present today", value: "228", delta: "+6% from yesterday" },
          { label: "Late today", value: "14", delta: "+3% from yesterday" },
          { label: "Attendance rate", value: "94.2%", delta: "+1.8% from last month" },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border bg-background p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">{card.value}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today’s attendance</h2>
              <p className="text-sm text-muted-foreground">Tap below to register your today attendance.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">09:18 AM</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-sm text-muted-foreground">Present</p>
              <h3 className="mt-3 text-3xl font-semibold">228</h3>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
              <p className="text-sm text-muted-foreground">Absent</p>
              <h3 className="mt-3 text-3xl font-semibold">6</h3>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Check In
            </button>
            <button
              type="button"
              onClick={handleCheckOut}
              className="rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold"
            >
              Check Out
            </button>
          </div>
          <div className="mt-4 rounded-3xl bg-slate-100 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-slate-900">Last checked in:</p>
            <p>Yesterday at 09:05 AM</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Weekly attendance overview</h2>
                <p className="text-sm text-muted-foreground">See week-to-date attendance trends.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">This week</span>
            </div>
            <AttendanceChart />
          </div>
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Upcoming events</h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-2 text-sm">
                <ArrowUpRight size={16} /> View all
              </button>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Payroll review meeting</p>
                <p>Today, 2:00 PM</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Interview panel</p>
                <p>Today, 4:30 PM</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Team building event</p>
                <p>May 20, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Attendance log</h2>
            <p className="text-sm text-muted-foreground">Recent team attendance records.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records"
            className="w-full max-w-sm rounded-full border border-input bg-background px-4 py-3 text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border bg-slate-50 text-sm text-slate-900 shadow-sm">
          <div className="grid min-w-full grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Name</span>
            <span>Date</span>
            <span>Check in</span>
            <span>Check out</span>
            <span>Status</span>
          </div>
          <div className="divide-y bg-white">
            {filteredRecords.map((record) => (
              <div key={record.id} className="grid min-w-full grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr] gap-4 px-4 py-4 hover:bg-muted/50">
                <span className="font-medium">{record.employee}</span>
                <span className="text-muted-foreground">{record.date}</span>
                <span>{record.checkIn || "—"}</span>
                <span>{record.checkOut || "—"}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{record.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
