import { useMemo, useState } from "react"
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock, Download, FileText, Filter, MoreHorizontal, Plus, Search } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import type { LeaveRequest } from "@/types"

const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    requester: "Alicia Davis",
    role: "HR Manager",
    leaveType: "Annual",
    startDate: "Jul 12, 2026",
    endDate: "Jul 16, 2026",
    daysRequested: 4,
    reason: "Family vacation",
    status: "Approved",
    statusLabel: "Approved by Robert King",
    requestedOn: "Jul 01, 2026",
  },
  {
    id: "2",
    requester: "Jason Mills",
    role: "Frontend Engineer",
    leaveType: "Sick",
    startDate: "Jul 20, 2026",
    endDate: "Jul 21, 2026",
    daysRequested: 2,
    reason: "Fever and rest",
    status: "Pending",
    statusLabel: "Pending approval from you",
    requestedOn: "Jul 08, 2026",
  },
  {
    id: "3",
    requester: "Sarah Johnson",
    role: "Marketing Specialist",
    leaveType: "Personal",
    startDate: "Aug 05, 2026",
    endDate: "Aug 07, 2026",
    daysRequested: 3,
    reason: "Personal work",
    status: "Pending",
    statusLabel: "Pending approval from you",
    requestedOn: "Jul 10, 2026",
  },
  {
    id: "4",
    requester: "Michael Brown",
    role: "Backend Developer",
    leaveType: "Casual",
    startDate: "Jun 28, 2026",
    endDate: "Jun 28, 2026",
    daysRequested: 1,
    reason: "Personal errands",
    status: "Approved",
    statusLabel: "Approved by you",
    requestedOn: "Jun 25, 2026",
  },
]

const statusClasses: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
  Rejected: "bg-red-500/10 text-red-700",
  Cancelled: "bg-slate-500/10 text-slate-700",
}

export function LeavePage() {
  const [activeTab, setActiveTab] = useState<"my" | "team" | "all">("my")
  const [search, setSearch] = useState("")

  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((item) => {
        const matchesSearch = [item.requester, item.leaveType, item.status, item.reason]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesTab =
          activeTab === "all"
            ? true
            : activeTab === "my"
            ? item.requester === "Alicia Davis"
            : item.requester !== "Alicia Davis"
        return matchesSearch && matchesTab
      }),
    [activeTab, search],
  )

  const summaryRequests = filteredRequests.filter((item) => item.requester === "Alicia Davis").length
  const pendingCount = leaveRequests.filter((item) => item.status === "Pending").length
  const approvedCount = leaveRequests.filter((item) => item.status === "Approved").length

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Leave Management" description="Review leave requests, track approvals, and submit new requests." />

      <div className="grid gap-4 xl:grid-cols-5">
        {[
          {
            label: "Total Requests",
            value: "28",
            detail: "+18% from last month",
            term: "up",
            icon: FileText,
            bg: "bg-violet-50",
            iconBg: "bg-violet-100 text-violet-700",
            color: "#7c3aed",
            spark: "M3 11c2 0 4-3 6-3s4 3 6 3 4-3 6-3 4 3 6 3",
          },
          {
            label: "Pending Approvals",
            value: "4",
            detail: "+20% from last month",
            term: "up",
            icon: CheckCircle2,
            bg: "bg-emerald-50",
            iconBg: "bg-emerald-100 text-emerald-700",
            color: "#10b981",
            spark: "M3 12c2-2 4 4 6 1s4-5 6-2 4 4 6 1",
          },
          {
            label: "Upcoming Leaves",
            value: "6",
            detail: "+12% from last month",
            term: "up",
            icon: Clock,
            bg: "bg-orange-50",
            iconBg: "bg-orange-100 text-orange-700",
            color: "#f97316",
            spark: "M3 10c2-4 4 4 6 0s4-7 6-3 4 6 6 2",
          },
          {
            label: "Approved This Month",
            value: "18",
            detail: "+25% from last month",
            term: "up",
            icon: CalendarDays,
            bg: "bg-sky-50",
            iconBg: "bg-sky-100 text-sky-700",
            color: "#0ea5e9",
            spark: "M3 10c2-1 4 2 6 0s4-3 6-1 4 3 6 0",
          },
          {
            label: "Leave Balance (Avg.)",
            value: "12.5 Days",
            detail: "Days remaining",
            term: "up",
            icon: FileText,
            bg: "bg-pink-50",
            iconBg: "bg-pink-100 text-pink-700",
            color: "#ec4899",
            spark: "M3 11c2-2 4 3 6 1s4-4 6-2 4 3 6 1",
          },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconBg}`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <ArrowUpRight size={14} className={stat.term === "up" ? "text-emerald-500" : "text-red-500"} />
                  <span>{stat.detail}</span>
                </div>
              </div>
              <p className="mt-6 text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</h3>
              <div className="mt-4 h-10 overflow-hidden rounded-full bg-slate-100">
                <svg viewBox="0 0 100 40" className="h-full w-full" preserveAspectRatio="none">
                  <path d={stat.spark} fill="none" stroke={stat.color} strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            {[
              { id: "my", label: "My requests" },
              { id: "team", label: "Team requests" },
              { id: "all", label: "All requests" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "my" | "team" | "all")}
                className={`text-sm font-semibold pb-3 ${
                  activeTab === tab.id
                    ? "border-b-2 border-violet-600 text-violet-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <Plus size={16} /> New request
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Requests</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{summaryRequests}</p>
            <p className="mt-2 text-sm text-slate-500">Submitted by you</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Pending approvals</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{pendingCount}</p>
            <p className="mt-2 text-sm text-slate-500">Awaiting approval</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Upcoming leaves</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{approvedCount}</p>
            <p className="mt-2 text-sm text-slate-500">Scheduled</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Leave requests</h2>
            <p className="mt-1 text-sm text-slate-500">Track approvals and request details for your team.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leave requests..."
                className="w-44 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <Filter size={16} /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-slate-50 text-sm text-slate-900 shadow-sm">
          <div className="grid min-w-full grid-cols-[1.5fr_1fr_0.9fr_0.8fr_1fr_1fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Requester</span>
            <span>Dates</span>
            <span>Type</span>
            <span>Days</span>
            <span>Reason</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y bg-white">
            {filteredRequests.map((request) => (
              <div key={request.id} className="grid min-w-full grid-cols-[1.5fr_1fr_0.9fr_0.8fr_1fr_1fr] gap-4 px-4 py-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{request.requester}</p>
                  <p className="mt-1 text-sm text-slate-500">{request.role}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{request.startDate}</p>
                  <p className="mt-1 text-sm text-slate-500">{request.endDate}</p>
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{request.leaveType}</span>
                <span className="text-slate-900">{request.daysRequested} days</span>
                <span className="text-slate-900">{request.reason}</span>
                <div className="flex items-center justify-end gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}>
                    {request.status}
                  </span>
                  <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
