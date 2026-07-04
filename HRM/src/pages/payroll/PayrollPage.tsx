import { useMemo, useState } from "react"
import { Download, DollarSign } from "lucide-react"

import { PageHeader } from "@/components/common/PageHeader"
import type { PayrollRecord } from "@/types"

const payrollData: PayrollRecord[] = [
  {
    id: "1",
    employee: "Alicia Davis",
    month: "July",
    year: "2026",
    basicSalary: "$6,500",
    allowances: "$800",
    deductions: "$120",
    netSalary: "$7,180",
    status: "Processed",
    paymentDate: "2026-07-25",
  },
  {
    id: "2",
    employee: "Jason Mills",
    month: "July",
    year: "2026",
    basicSalary: "$7,400",
    allowances: "$520",
    deductions: "$200",
    netSalary: "$7,720",
    status: "Paid",
    paymentDate: "2026-07-22",
  },
  {
    id: "3",
    employee: "Maya Patel",
    month: "July",
    year: "2026",
    basicSalary: "$4,800",
    allowances: "$420",
    deductions: "$90",
    netSalary: "$5,130",
    status: "Draft",
    paymentDate: "—",
  },
]

const statusClasses: Record<string, string> = {
  Paid: "bg-emerald-500/10 text-emerald-700",
  Processed: "bg-sky-500/10 text-sky-700",
  Draft: "bg-amber-500/10 text-amber-700",
}

export function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState("July")

  const records = useMemo(
    () => payrollData.filter((item) => item.month === selectedMonth),
    [selectedMonth],
  )

  const totalPayroll = records.reduce((sum, record) => sum + Number(record.netSalary.replace(/[^\d.-]/g, "")), 0)
  const totalDeductions = records.reduce((sum, record) => sum + Number(record.deductions.replace(/[^\d.-]/g, "")), 0)

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Payroll" description="Review payroll totals, process salary runs, and export payment reports." />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-3xl border bg-background p-4 shadow-sm">
          <label className="text-sm font-medium text-muted-foreground">Month</label>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="mt-2 rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="July">July 2026</option>
            <option value="June">June 2026</option>
            <option value="May">May 2026</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <DollarSign size={16} /> Process payroll
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold">
            <Download size={16} /> Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Net payroll</p>
          <p className="mt-3 text-3xl font-semibold">${totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total deductions</p>
          <p className="mt-3 text-3xl font-semibold">${totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="rounded-3xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Payments</p>
          <p className="mt-3 text-3xl font-semibold">{records.filter((record) => record.status === "Paid").length} paid</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Payroll records</h2>
            <p className="text-sm text-muted-foreground">List of salary runs for {selectedMonth}.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border bg-slate-50 text-sm text-slate-900 shadow-sm">
          <div className="grid min-w-full grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Employee</span>
            <span>Basic</span>
            <span>Allowances</span>
            <span>Deductions</span>
            <span>Net</span>
            <span>Status</span>
          </div>
          <div className="divide-y bg-white">
            {records.map((record) => (
              <div key={record.id} className="grid min-w-full grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-4 hover:bg-muted/50">
                <div>
                  <p className="font-medium">{record.employee}</p>
                  <p className="text-sm text-muted-foreground">{record.paymentDate}</p>
                </div>
                <span>{record.basicSalary}</span>
                <span>{record.allowances}</span>
                <span>{record.deductions}</span>
                <span className="font-semibold">{record.netSalary}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[record.status]}`}>{record.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
