import { useMemo, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Check, X, FileText, Plus, Search, Clock, CheckCircle2 } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import { Modal } from "@/components/ui/Modal"
import { useAuth } from "@/hooks/useAuth"
import { leaveApi, employeeApi } from "@/services/api"
import type { LeaveRequest } from "@/types"

const statusClasses: Record<string, string> = {
  Approved: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
  Rejected: "bg-red-500/10 text-red-700",
  Cancelled: "bg-slate-500/10 text-slate-700",
}

export function LeavePage() {
  const { user } = useAuth()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<"my" | "all">("my")
  const [search, setSearch] = useState("")
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (location.state && (location.state as any).openRequest) {
      setModalOpen(true)
      window.history.replaceState({}, document.title)
    }
  }, [location])
  
  // Leave Form State
  const [leaveType, setLeaveType] = useState("Paid")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reason, setReason] = useState("")

  const isManagement = useMemo(() => {
    const role = user?.role?.toUpperCase()
    return role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN" || role === "MANAGER"
  }, [user])

  const fetchLeaves = async () => {
    try {
      setLoading(true)
      if (activeTab === "my") {
        const data = await leaveApi.getMy()
        setRequests(data || [])
      } else {
        const data = await leaveApi.list()
        setRequests(data.leaves || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leave requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaves()
  }, [activeTab, user])

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const requesterName = getEmployeeName(item.employee || item.requester)
      const matchesSearch = [requesterName, item.leaveType, item.status, item.reason]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchesSearch
    })
  }, [requests, search])

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const empList = await employeeApi.list()
      if (!empList.employees || empList.employees.length === 0) {
        alert("Employee profile record not found. Cannot apply for leave.")
        return
      }
      const empId = empList.employees[0].id || (empList.employees[0] as any)._id

      await leaveApi.apply({
        employee: empId,
        leaveType,
        startDate,
        endDate,
        reason,
      })

      alert("Leave request submitted successfully!")
      setModalOpen(false)
      setStartDate("")
      setEndDate("")
      setReason("")
      fetchLeaves()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit leave request")
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await leaveApi.approve(id)
      alert("Leave request approved!")
      fetchLeaves()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approval failed")
    }
  }

  const handleReject = async (id: string) => {
    const comments = prompt("Enter comments/reason for rejection:") || ""
    try {
      await leaveApi.reject(id, { comments })
      alert("Leave request rejected.")
      fetchLeaves()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Rejection failed")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return
    try {
      await leaveApi.cancel(id)
      alert("Leave request cancelled.")
      fetchLeaves()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cancellation failed")
    }
  }

  function getEmployeeName(emp: any) {
    if (!emp) return "—"
    if (typeof emp === "string") return emp
    if (emp.firstName || emp.lastName) {
      return `${emp.firstName || ""} ${emp.lastName || ""}`.trim()
    }
    return "—"
  }

  function getDisplayDate(dateStr: string) {
    if (!dateStr) return "—"
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader title="Leave Management" description="Review leave requests, track approvals, and submit new requests." />
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition"
        >
          <Plus size={16} /> New request
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={`text-sm font-semibold pb-3 ${
                activeTab === "my"
                  ? "border-b-2 border-violet-600 text-violet-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              My requests
            </button>
            {isManagement && (
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`text-sm font-semibold pb-3 ${
                  activeTab === "all"
                    ? "border-b-2 border-violet-600 text-violet-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All company requests
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Leaves</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{requests.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-990">
                    {requests.filter((r) => r.status?.toLowerCase() === "pending").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Approved</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {requests.filter((r) => r.status?.toLowerCase() === "approved").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Leave requests log</h2>
            <p className="mt-1 text-sm text-slate-500">Track and review company leaves.</p>
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
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50">
            <p className="text-sm text-slate-500">Loading leave requests...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border bg-slate-50 text-sm text-slate-900 shadow-sm">
            <div className="grid min-w-full grid-cols-[1.5fr_1fr_0.8fr_0.6fr_1fr_0.9fr_1fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
              <span>Requester</span>
              <span>Dates</span>
              <span>Type</span>
              <span>Days</span>
              <span>Reason</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y bg-white">
              {filteredRequests.map((request: any) => (
                <div key={request.id || request._id} className="grid min-w-full grid-cols-[1.5fr_1fr_0.8fr_0.6fr_1fr_0.9fr_1fr] gap-4 px-4 py-4 hover:bg-slate-50 items-center">
                  <div>
                    <p className="font-semibold text-slate-950">{getEmployeeName(request.employee || request.requester)}</p>
                    <p className="text-xs text-slate-500">{(request.employee || request.requester)?.designation || "Employee"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{getDisplayDate(request.startDate)}</p>
                    <p className="text-xs text-slate-500">{getDisplayDate(request.endDate)}</p>
                  </div>
                  <span className="inline-flex justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 max-w-20">
                    {request.leaveType}
                  </span>
                  <span className="text-slate-900 font-medium">{request.daysRequested || request.totalDays || "—"} days</span>
                  <span className="text-slate-900 truncate max-w-40">{request.reason || "—"}</span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold max-w-28 ${statusClasses[request.status] || "bg-slate-100 text-slate-700"}`}>
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      request.status === "Approved"
                        ? "bg-emerald-500"
                        : request.status === "Pending"
                        ? "bg-amber-500"
                        : request.status === "Rejected"
                        ? "bg-red-500"
                        : "bg-slate-400"
                    }`} />
                    {request.status}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    {request.status?.toLowerCase() === "pending" && isManagement && activeTab === "all" ? (
                      <>
                        <button
                          onClick={() => handleApprove(request.id || request._id)}
                          className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(request.id || request._id)}
                          className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 hover:bg-rose-100 transition"
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : request.status?.toLowerCase() === "pending" && activeTab === "my" ? (
                      <button
                        onClick={() => handleCancel(request.id || request._id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">No leave requests found.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Apply for Leave" description="Fill out the details to request leave approval." onClose={() => setModalOpen(false)}>
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="Paid">Paid</option>
              <option value="Sick">Sick</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Casual">Casual</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reason</label>
            <textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="E.g., Medical check-up, Family function..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Submit Request
          </button>
        </form>
      </Modal>
    </div>
  )
}
