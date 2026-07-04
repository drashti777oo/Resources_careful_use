import { useMemo, useState, useEffect } from "react"
import {
  Calendar,
  CalendarDays,
  Clock,
  Download,
  Users,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"
import { attendanceApi, employeeApi } from "@/services/api"
import type { AttendanceRecord } from "@/types"

export function AttendancePage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [employeeRecordId, setEmployeeRecordId] = useState<string>("")
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string>("")
  const [checkOutTime, setCheckOutTime] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const isManagement = useMemo(() => {
    const role = user?.role?.toUpperCase()
    return role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN"
  }, [user])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const role = user?.role?.toUpperCase()

      if (role === "EMPLOYEE") {
        // Fetch current user's employee ID first
        const empList = await employeeApi.list()
        if (empList.employees && empList.employees.length > 0) {
          const empId = empList.employees[0].id || (empList.employees[0] as any)._id
          setEmployeeRecordId(empId)

          // Fetch attendance details
          const data = await attendanceApi.getMy()
          const today = data.todayAttendance
          if (today) {
            setCheckedIn(!!today.checkIn)
            setCheckInTime(today.checkIn || "")
            setCheckOutTime(today.checkOut || "")
          } else {
            setCheckedIn(false)
            setCheckInTime("")
            setCheckOutTime("")
          }

          // Map monthly logs
          const monthlyLogs = (data.monthlyAttendance || []).map((item: any) => ({
            ...item,
            id: item.id || item._id,
            employee: user?.name || "Employee",
          }))
          setRecords(monthlyLogs)
        }
      } else {
        // Management fetches all logs
        const data = await attendanceApi.list()
        const allLogs = (data.attendance || []).map((item: any) => ({
          ...item,
          id: item.id || item._id,
        }))
        setRecords(allLogs)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()
  }, [user])

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const empName = typeof record.employee === "object"
        ? `${(record.employee as any).firstName || ""} ${(record.employee as any).lastName || ""}`.trim()
        : record.employee || ""
      const matchesSearch = [empName, record.date, record.status, record.notes]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchesSearch
    })
  }, [records, search])

  const handleCheckIn = async () => {
    if (!employeeRecordId) {
      alert("Employee record not loaded yet. Please try again.")
      return
    }
    try {
      setError("")
      const todayRecord = await attendanceApi.checkIn({ employee: employeeRecordId, remarks: "Checked in via web app" })
      setCheckedIn(true)
      setCheckInTime(todayRecord.checkIn || "")
      setCheckOutTime("")
      await fetchAttendance()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Check-in failed")
    }
  }

  const handleCheckOut = async () => {
    if (!employeeRecordId) {
      alert("Employee record not loaded yet. Please try again.")
      return
    }
    try {
      setError("")
      const todayRecord = await attendanceApi.checkOut({ employee: employeeRecordId, remarks: "Checked out via web app" })
      setCheckOutTime(todayRecord.checkOut || "")
      await fetchAttendance()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Check-out failed")
    }
  }

  const getEmployeeName = (emp: any) => {
    if (!emp) return "—"
    if (typeof emp === "string") return emp
    if (emp.firstName || emp.lastName) {
      return `${emp.firstName || ""} ${emp.lastName || ""}`.trim()
    }
    return "—"
  }

  const getDisplayTime = (timeStr: string) => {
    if (!timeStr) return "—"
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getDisplayDate = (dateStr: string) => {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString()
  }

  const activeEmployeesCount = useMemo(() => {
    return isManagement ? records.length : 1
  }, [records, isManagement])

  const presentCount = useMemo(() => {
    return records.filter((r) => r.status?.toLowerCase() === "present").length
  }, [records])

  const lateCount = useMemo(() => {
    return records.filter((r) => r.status?.toLowerCase() === "late").length
  }, [records])

  const attendanceRate = useMemo(() => {
    if (records.length === 0) return "100%"
    const presentOrLate = records.filter(
      (r) => r.status?.toLowerCase() === "present" || r.status?.toLowerCase() === "late"
    ).length
    return `${Math.round((presentOrLate / records.length) * 1000) / 10}%`
  }, [records])

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm text-slate-600">Welcome back, {user?.name} 👋</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Attendance</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {isManagement
              ? "Track team check-in status, review weekly trends, and manage attendance logs."
              : "Review your check-in history, daily attendance markers, and working logs."}
          </p>
        </div>
        {isManagement && (
          <div className="flex items-center justify-end gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300">
              <Download size={16} /> Export report
            </button>
          </div>
        )}
      </div>

      {isManagement && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Tracked employees",
              value: String(activeEmployeesCount),
              delta: "Active in database",
              icon: Users,
              accent: "bg-violet-50 text-violet-600",
              trend: "text-emerald-600",
            },
            {
              label: "Present Records",
              value: String(presentCount),
              delta: "Present markers",
              icon: CalendarDays,
              accent: "bg-emerald-50 text-emerald-700",
              trend: "text-emerald-600",
            },
            {
              label: "Late Records",
              value: String(lateCount),
              delta: "Late markers",
              icon: Clock,
              accent: "bg-amber-50 text-amber-700",
              trend: "text-rose-600",
            },
            {
              label: "Attendance Rate",
              value: attendanceRate,
              delta: "Average rate",
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
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Daily check-in / check-out</h2>
              <p className="text-sm text-slate-600">Register your attendance for today.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Clock size={14} /> Live
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Check In Time", value: getDisplayTime(checkInTime) || "Not checked in", accent: "text-emerald-600" },
              { label: "Check Out Time", value: getDisplayTime(checkOutTime) || "Not checked out", accent: "text-rose-600" },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{item.value}</h3>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkedIn}
              className="min-w-35 rounded-full border border-emerald-500 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
            >
              Check In
            </button>
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={!checkedIn || !!checkOutTime}
              className="min-w-35 rounded-full border border-rose-400 bg-white px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Check Out
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Upcoming Events</h2>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            {[
              { title: "Payroll review meeting", subtitle: "Today, 2:00 PM", color: "bg-violet-100 text-violet-700" },
              { title: "Interview panel at 4:30 PM", subtitle: "Today, 4:30 PM", color: "bg-amber-100 text-amber-700" },
              { title: "Leave approvals", subtitle: "Today, 6:00 PM", color: "bg-green-100 text-emerald-700" },
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Attendance log</h2>
            <p className="text-sm text-slate-600">Recent records.</p>
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
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50">
            <p className="text-sm text-slate-500">Loading attendance records...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
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
                  <span className="font-medium text-slate-950">{getEmployeeName(record.employee)}</span>
                  <span className="text-slate-600">{getDisplayDate(record.date)}</span>
                  <span className="text-slate-900">{getDisplayTime(record.checkIn)}</span>
                  <span className="text-slate-900">{getDisplayTime(record.checkOut)}</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {record.status}
                  </span>
                </div>
              ))}
              {filteredRecords.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">No attendance logs found.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
