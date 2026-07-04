import { useMemo, useState } from "react"
import { Clock, TrendingUp } from "lucide-react"

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
      <PageHeader title="Attendance" description="Track team check-in status, review weekly trends, and manage attendance logs." />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <h2 className="mt-2 text-2xl font-semibold">{checkedIn ? "Checked in" : "Ready to check in"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {checkedIn ? `Checked in at ${checkInTime}` : "Tap below to register your today attendance."}
              </p>
              {checkedIn ? (
                <p className="mt-2 text-sm text-muted-foreground">Check out time: {checkOutTime || "Not checked out yet"}</p>
              ) : null}
            </div>
            <div className="rounded-3xl bg-primary/5 p-4 text-primary">
              <Clock size={24} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Check in
            </button>
            <button
              type="button"
              onClick={handleCheckOut}
              className="rounded-full border px-5 py-2 text-sm font-semibold"
            >
              Check out
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">Weekly attendance</p>
            <div className="mt-3 flex items-center gap-2 text-3xl font-semibold">94.2% <span className="text-sm font-normal text-muted-foreground">on time</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Present today</p>
                <p className="mt-2 text-xl font-semibold">28</p>
              </div>
              <div className="rounded-3xl bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Pending approvals</p>
                <p className="mt-2 text-xl font-semibold">4</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <TrendingUp size={16} /> Weekly trend
            </div>
            <div className="mt-4">
              <AttendanceChart />
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
            className="w-full max-w-sm rounded-full border border-input bg-background px-4 py-2 text-sm"
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
