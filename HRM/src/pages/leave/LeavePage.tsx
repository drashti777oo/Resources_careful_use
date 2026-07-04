import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import type { LeaveRequest } from "@/types"

const leaveRequests: LeaveRequest[] = [
  {
    id: "1",
    requester: "Alicia Davis",
    leaveType: "Annual",
    startDate: "2026-07-12",
    endDate: "2026-07-16",
    daysRequested: 5,
    reason: "Family vacation",
    status: "Approved",
    approvedBy: "Robert King",
  },
  {
    id: "2",
    requester: "Jason Mills",
    leaveType: "Sick",
    startDate: "2026-07-04",
    endDate: "2026-07-05",
    daysRequested: 2,
    reason: "Flu recovery",
    status: "Pending",
    approvedBy: "Alicia Davis",
  },
  {
    id: "3",
    requester: "Maya Patel",
    leaveType: "Unpaid",
    startDate: "2026-07-20",
    endDate: "2026-07-22",
    daysRequested: 3,
    reason: "Personal project",
    status: "Rejected",
    approvedBy: "Robert King",
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

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Leave Management" description="Review leave requests, track approvals, and submit new requests." />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {[
            { id: "my", label: "My requests" },
            { id: "team", label: "Team requests" },
            { id: "all", label: "All requests" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "my" | "team" | "all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "border border-input bg-background text-muted-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus size={16} /> New request
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Requests</p>
          <p className="mt-3 text-3xl font-semibold">{filteredRequests.length}</p>
        </div>
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Pending approvals</p>
          <p className="mt-3 text-3xl font-semibold">{leaveRequests.filter((item) => item.status === "Pending").length}</p>
        </div>
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Upcoming leaves</p>
          <p className="mt-3 text-3xl font-semibold">{leaveRequests.filter((item) => item.status === "Approved").length}</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Leave requests</h2>
            <p className="text-sm text-muted-foreground">Track approvals and request details for your team.</p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leave requests"
            className="w-full max-w-sm rounded-full border border-input bg-background px-4 py-2 text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border bg-slate-50 text-sm text-slate-900 shadow-sm">
          <div className="grid min-w-full grid-cols-[1.3fr_1fr_1fr_0.8fr_0.9fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Requester</span>
            <span>Dates</span>
            <span>Type</span>
            <span>Days</span>
            <span>Status</span>
          </div>
          <div className="divide-y bg-white">
            {filteredRequests.map((request) => (
              <div key={request.id} className="grid min-w-full grid-cols-[1.3fr_1fr_1fr_0.8fr_0.9fr] gap-4 px-4 py-4 hover:bg-muted/50">
                <div>
                  <p className="font-medium">{request.requester}</p>
                  <p className="text-sm text-muted-foreground">Approved by {request.approvedBy}</p>
                </div>
                <span>{request.startDate} - {request.endDate}</span>
                <span>{request.leaveType}</span>
                <span>{request.daysRequested}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}>{request.status}</span>
              </div>
            ))}
            {filteredRequests.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No leave requests match your current filters.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
