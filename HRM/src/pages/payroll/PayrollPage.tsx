import { useMemo, useState } from "react"
import { Download, DollarSign, Search } from "lucide-react"

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
  const [search, setSearch] = useState("")

  const records = useMemo(
    () =>
      payrollData
        .filter((item) => item.month === selectedMonth)
        .filter((item) =>
          [item.employee, item.status, item.paymentDate]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
    [selectedMonth, search],
  )

  const totalPayroll = records.reduce((sum, record) => sum + Number(record.netSalary.replace(/[^\d.-]/g, "")), 0)
  const totalDeductions = records.reduce((sum, record) => sum + Number(record.deductions.replace(/[^\d.-]/g, "")), 0)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, Alicia</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Payroll</h1>
          <p className="mt-2 text-sm text-muted-foreground">Review payroll totals, process salary runs, and export payment reports.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm sm:flex">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employees, payroll, reports..."
              className="w-56 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
            <DollarSign size={16} /> Process payroll
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
            <Download size={16} /> Export report
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          { label: "Net payroll", value: "$20,030", trend: "+12.5% vs last month", icon: "💜", accent: "text-violet-600" },
          { label: "Total deductions", value: "$410", trend: "+3.2% vs last month", icon: "💚", accent: "text-emerald-600" },
          { label: "Total payments", value: "1 paid", trend: "0% vs last month", icon: "💙", accent: "text-sky-600" },
          { label: "Employees", value: "28", trend: "0% vs last month", icon: "🧑‍🤝‍🧑", accent: "text-amber-600" },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">{item.icon}</div>
              <span className={`text-sm font-semibold ${item.accent}`}>{item.trend}</span>
            </div>
            <div className="mt-5">
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
            <div className="mt-5 h-10 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Payroll period</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">July 2026</h2>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
              >
                <option value="July">July 2026</option>
                <option value="June">June 2026</option>
                <option value="May">May 2026</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Payroll overview</p>
                  <p className="mt-1 text-xs text-slate-400">Net payroll composition</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">$20,030</div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[2rem] bg-white p-6">
                  <div className="relative flex h-56 w-full items-center justify-center">
                    <svg viewBox="0 0 160 160" className="h-full w-full">
                      <circle cx="80" cy="80" r="60" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="20"
                        strokeDasharray="337 377"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="20"
                        strokeDasharray="7.2 377"
                        strokeDashoffset="-337"
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="20"
                        strokeDasharray="22.6 377"
                        strokeDashoffset="-344.2"
                        strokeLinecap="round"
                        transform="rotate(-90 80 80)"
                      />
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-semibold text-slate-900">$20,030</p>
                      <p className="text-sm text-slate-500">Net Payroll</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl bg-white p-6 text-sm text-slate-700">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-600" />
                      <span className="font-medium text-slate-900">Net Payroll</span>
                      <span className="ml-auto text-slate-500">$20,030 (92.1%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span className="font-medium text-slate-900">Deductions</span>
                      <span className="ml-auto text-slate-500">$410 (1.9%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
                      <span className="font-medium text-slate-900">Taxes</span>
                      <span className="ml-auto text-slate-500">$1,560 (6.0%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">✓</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Payroll run completed</p>
                      <p className="mt-1 text-sm text-slate-500">July 2026 payroll has been processed successfully.</p>
                      <p className="mt-3 text-xs text-slate-400">Completed on Jul 25, 2026 at 10:30 AM</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid gap-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">Employees</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">28</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">Paid</p>
                    <p className="mt-2 text-2xl font-semibold text-emerald-700">28</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm text-slate-500">Failed</p>
                    <p className="mt-2 text-2xl font-semibold text-rose-700">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Payroll records</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">List of salary runs for July.</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search payroll records..."
                className="w-48 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Filter
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border bg-slate-50">
          <div className="grid min-w-full grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.16em] text-slate-600">
            <span>Employee</span>
            <span>Basic</span>
            <span>Allowances</span>
            <span>Deductions</span>
            <span>Net pay</span>
            <span>Status</span>
          </div>
          <div className="divide-y bg-white">
            {records.map((record) => (
              <div key={record.id} className="grid min-w-full grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-4 py-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{record.employee}</p>
                  <p className="text-xs text-slate-400">EMP-00{record.id}</p>
                </div>
                <span className="text-slate-900">{record.basicSalary}</span>
                <span className="text-slate-900">{record.allowances}</span>
                <span className="text-slate-900">{record.deductions}</span>
                <span className="font-semibold text-violet-700">{record.netSalary}</span>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[record.status]}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Showing 1 to 4 of 28 records</p>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">10 per page</button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">1</button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">2</button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">3</button>
              <button className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
