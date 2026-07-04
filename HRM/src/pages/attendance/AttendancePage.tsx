import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  Calendar,
  CalendarDays,
  ChevronDown,
  Clock,
  Download,
  Users,
} from "lucide-react"

import { AttendanceChart } from "@/components/charts/AttendanceChart"
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
          <p className="text-sm text-slate-600">Welcome back, Alicia 👋</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Attendance</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Track team check-in status, review weekly trends, and manage attendance logs.</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
            <Download size={16} /> Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Active employees",
            value: "248",
            delta: "+12% from last month",
            icon: Users,
            accent: "bg-violet-50 text-violet-600",
            trend: "text-emerald-600",
          },
          {
            label: "Present Today",
            value: "228",
            delta: "+8% from yesterday",
            icon: CalendarDays,
            accent: "bg-emerald-50 text-emerald-700",
            trend: "text-emerald-600",
          },
          {
            label: "Late Today",
            value: "14",
            delta: "-3% from yesterday",
            icon: Clock,
            accent: "bg-amber-50 text-amber-700",
            trend: "text-rose-600",
          },
          {
            label: "Attendance Rate",
            value: "94.2%",
            delta: "+1.8% from last month",
            icon: Calendar,
            accent: "bg-pink-50 text-pink-700",
            trend: "text-emerald-600",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</h2>
              </div>
              <div className={`${card.accent} grid h-12 w-12 place-items-center rounded-2xl`}>
                <card.icon size={20} />
              </div>
            </div>
            <p className={`mt-4 text-sm font-semibold ${card.trend}`}>{card.delta}</p>
            <div className="mt-4 h-10 rounded-3xl bg-slate-100"></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Today’s attendance</h2>
              <p className="text-sm text-slate-600">Tap below to register your today attendance.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Clock size={14} /> 09:18 AM
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Present", value: "228", percent: "+8% from yesterday", accent: "text-emerald-600" },
              { label: "Late", value: "14", percent: "-3% from yesterday", accent: "text-rose-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</h3>
                <p className={`mt-2 text-sm font-semibold ${item.accent}`}>{item.percent}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              className="min-w-35 rounded-full border border-emerald-500 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              Check In
            </button>
            <button
              type="button"
              onClick={handleCheckOut}
              className="min-w-35 rounded-full border border-rose-400 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-slate-50"
            >
              Check Out
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Last checked in</p>
            <p className="mt-1">Yesterday at 09:05 AM</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Weekly attendance overview</h2>
                <p className="text-sm text-slate-600">See week-to-date attendance trends.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                This week <ChevronDown size={14} />
              </div>
            </div>
            <AttendanceChart />
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Upcoming events</h2>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                <ArrowUpRight size={16} /> View all
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              {[
                { title: "Payroll review meeting", subtitle: "Today, 2:00 PM", color: "bg-violet-100 text-violet-700" },
                { title: "Interview panel at 4:30 PM", subtitle: "Today, 4:30 PM", color: "bg-amber-100 text-amber-700" },
                { title: "Leave approvals", subtitle: "Today, 6:00 PM", color: "bg-green-100 text-emerald-700" },
                { title: "Team building event", subtitle: "May 20, 10:00 AM", color: "bg-sky-100 text-sky-700" },
              ].map((event) => (
                <div key={event.title} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-950">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.subtitle}</p>
                  </div>
                  <span className={`${event.color} inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold`}>
                    •
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Attendance log</h2>
            <p className="text-sm text-slate-600">Recent team attendance records.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
                className="h-11 rounded-full border border-slate-200 bg-slate-100 px-4 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Download size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-sm shadow-sm">
          <div className="grid min-w-full grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Employee</span>
            <span>Date</span>
            <span>Check in</span>
            <span>Check out</span>
            <span>Status</span>
          </div>
          <div className="divide-y bg-white">
            {filteredRecords.map((record) => (
              <div key={record.id} className="grid min-w-full grid-cols-[1.2fr_1fr_1fr_0.9fr_0.8fr] gap-4 px-4 py-4 hover:bg-slate-50">
                <span className="font-medium text-slate-950">{record.employee}</span>
                <span className="text-slate-600">{record.date}</span>
                <span className="text-slate-900">{record.checkIn || "—"}</span>
                <span className="text-slate-900">{record.checkOut || "—"}</span>
                <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
