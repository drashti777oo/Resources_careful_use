import { useMemo, useState, useEffect } from "react"
import { DollarSign, Search, Check, Trash2 } from "lucide-react"

import { Modal } from "@/components/ui/Modal"
import { useAuth } from "@/hooks/useAuth"
import { payrollApi, employeeApi } from "@/services/api"
import type { PayrollRecord, Employee } from "@/types"

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
}

export function PayrollPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  // Generate Payroll Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [basicSalary, setBasicSalary] = useState<number>(0)
  const [allowances, setAllowances] = useState<number>(0)
  const [bonus, setBonus] = useState<number>(0)
  const [deductions, setDeductions] = useState<number>(0)
  const [tax, setTax] = useState<number>(0)
  const [remarks, setRemarks] = useState("")

  const isManagement = useMemo(() => {
    const role = user?.role?.toUpperCase()
    return role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN"
  }, [user])

  const fetchPayrollData = async () => {
    try {
      setLoading(true)
      if (isManagement) {
        const [payrollRes, employeeRes] = await Promise.all([
          payrollApi.list(),
          employeeApi.list(),
        ])
        setRecords(payrollRes.payrolls || [])
        setEmployees(employeeRes.employees || [])
        if (employeeRes.employees && employeeRes.employees.length > 0) {
          const firstEmp = employeeRes.employees[0]
          setSelectedEmployee(firstEmp.id || (firstEmp as any)._id || "")
          setBasicSalary(firstEmp.salary || 0)
        }
      } else {
        const data = await payrollApi.getMy()
        setRecords(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payroll records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayrollData()
  }, [user, isManagement])

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const empName = typeof item.employee === "object"
        ? `${(item.employee as any).firstName || ""} ${(item.employee as any).lastName || ""}`.trim()
        : String(item.employee || "")
      const matchesSearch = [empName, item.paymentStatus || item.status, String(item.month), String(item.year)]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
      return matchesSearch
    })
  }, [records, search])

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) {
      alert("Please select an employee.")
      return
    }
    try {
      await payrollApi.generate({
        employee: selectedEmployee,
        month,
        year,
        basicSalary,
        allowances,
        bonus,
        deductions,
        tax,
        remarks,
      })
      alert("Payroll record generated successfully!")
      setModalOpen(false)
      setRemarks("")
      fetchPayrollData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate payroll")
    }
  }

  const handlePay = async (id: string) => {
    if (!confirm("Are you sure you want to mark this payroll record as Paid?")) return
    try {
      await payrollApi.pay(id)
      alert("Payroll record marked as paid successfully!")
      fetchPayrollData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Payment processing failed")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return
    try {
      await payrollApi.delete(id)
      alert("Payroll record deleted.")
      fetchPayrollData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deletion failed")
    }
  }

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployee(empId)
    const emp = employees.find((e) => (e.id || (e as any)._id) === empId)
    if (emp) {
      setBasicSalary(emp.salary || 0)
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



  const totalNetSalary = useMemo(() => {
    return filteredRecords.reduce((acc, item) => acc + (item.netSalary || 0), 0)
  }, [filteredRecords])

  const totalDeductions = useMemo(() => {
    return filteredRecords.reduce((acc, item) => acc + (item.deductions || 0), 0)
  }, [filteredRecords])

  const paidCount = useMemo(() => {
    return filteredRecords.filter((item) => (item.paymentStatus || item.status) === "Paid").length
  }, [filteredRecords])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm text-slate-600">Welcome back, {user?.name}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Payroll</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isManagement
              ? "Review payroll totals, generate salary runs, and manage payments."
              : "Review your salary statements, pay slips, and transaction logs."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              className="w-48 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          {isManagement && (
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <DollarSign size={16} /> Generate payroll
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          { label: "Net payroll", value: `$${totalNetSalary.toLocaleString()}`, detail: "Sum of all filtered records", icon: "💜", accent: "text-violet-600" },
          { label: "Total deductions", value: `$${totalDeductions.toLocaleString()}`, detail: "Sum of all deductions", icon: "💚", accent: "text-emerald-600" },
          { label: "Payments processed", value: `${paidCount} paid`, detail: "Successfully completed runs", icon: "💙", accent: "text-sky-600" },
          { label: "Records total", value: String(filteredRecords.length), detail: "Filtered runs", icon: "🧑‍🤝‍🧑", accent: "text-amber-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">{item.icon}</div>
              <span className={`text-xs font-semibold ${item.accent}`}>{item.detail}</span>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Payroll records</h2>
            <p className="mt-1 text-sm text-slate-500">List of salary runs and payouts.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50 mt-6">
            <p className="text-sm text-slate-500">Loading payroll data...</p>
          </div>
        ) : error ? (
          <div className="flex min-h-64 items-center justify-center rounded-3xl bg-slate-50 mt-6">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border bg-slate-50">
            <div className="grid min-w-full grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
              <span>Employee</span>
              <span>Month/Year</span>
              <span>Basic</span>
              <span>Allowances</span>
              <span>Deductions</span>
              <span>Net pay</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y bg-white">
              {filteredRecords.map((record: any) => {
                const statusStr = record.paymentStatus || record.status || "Pending"
                return (
                  <div key={record.id || record._id} className="grid min-w-full grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-4 hover:bg-slate-50 items-center">
                    <div>
                      <p className="font-semibold text-slate-950">{getEmployeeName(record.employee)}</p>
                      <p className="text-xs text-slate-400">ID: {record.id || record._id}</p>
                    </div>
                    <span className="text-slate-900 font-medium">{record.month}/{record.year}</span>
                    <span className="text-slate-900">${record.basicSalary?.toLocaleString()}</span>
                    <span className="text-slate-900">${record.allowances?.toLocaleString()}</span>
                    <span className="text-slate-900">${record.deductions?.toLocaleString()}</span>
                    <span className="font-semibold text-violet-700">${record.netSalary?.toLocaleString()}</span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold max-w-24 ${statusClasses[statusStr] || "bg-slate-100 text-slate-700"}`}>
                      {statusStr}
                    </span>
                    <div className="flex items-center justify-end gap-2">
                      {statusStr.toLowerCase() === "pending" && isManagement ? (
                        <>
                          <button
                            onClick={() => handlePay(record.id || record._id)}
                            className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 hover:bg-emerald-100 transition"
                            title="Mark Paid"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id || record._id)}
                            className="h-8 w-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 hover:bg-rose-100 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredRecords.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">No payroll records found.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Generate Payroll Run" description="Generate a new monthly payroll statement." onClose={() => setModalOpen(false)}>
        <form onSubmit={handleGeneratePayroll} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              {employees.map((emp: any) => (
                <option key={emp.id || emp._id} value={emp.id || emp._id}>
                  {getEmployeeName(emp)} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2026, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Basic Salary ($)</label>
              <input
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Allowances ($)</label>
              <input
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Bonus ($)</label>
              <input
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Deductions ($)</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tax ($)</label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="E.g. July payroll run"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 animate-pulse"
          >
            Generate Statement
          </button>
        </form>
      </Modal>
    </div>
  )
}
