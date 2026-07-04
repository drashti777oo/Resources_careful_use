import { useMemo, useState } from "react"
import { Calendar, ChevronDown, CheckCircle, Download, DollarSign, Filter, MoreHorizontal, Plus, Search, TrendingUp, UserCheck, Users } from "lucide-react"

import { EmployeeForm, type EmployeeFormValues } from "@/components/forms/EmployeeForm"
import { Modal } from "@/components/ui/Modal"
import { PageHeader } from "@/components/common/PageHeader"
import type { Employee } from "@/types"

const initialEmployees: Employee[] = [
  {
    id: "1",
    employeeId: "EMP-001",
    firstName: "Alicia",
    lastName: "Davis",
    fullName: "Alicia Davis",
    email: "alicia.davis@example.com",
    phone: "+1 555 348 210",
    department: "Human Resources",
    jobTitle: "HR Manager",
    hireDate: "Jan 15, 2023",
    employmentType: "Full-time",
    status: "Active",
    manager: "Robert King",
    salary: "$84,500",
    address: "123 Main Street, San Francisco, CA",
  },
  {
    id: "2",
    employeeId: "EMP-002",
    firstName: "Jason",
    lastName: "Mills",
    fullName: "Jason Mills",
    email: "jason.mills@example.com",
    phone: "+1 555 198 764",
    department: "Engineering",
    jobTitle: "Frontend Engineer",
    hireDate: "Mar 10, 2023",
    employmentType: "Full-time",
    status: "On Leave",
    manager: "Laura Scott",
    salary: "$98,300",
    address: "273 River Road, Austin, TX",
  },
  {
    id: "3",
    employeeId: "EMP-003",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 555 332 991",
    department: "Marketing",
    jobTitle: "Marketing Specialist",
    hireDate: "Feb 20, 2023",
    employmentType: "Full-time",
    status: "Active",
    manager: "Alicia Davis",
    salary: "$72,100",
    address: "44 Meridian Lane, Denver, CO",
  },
  {
    id: "4",
    employeeId: "EMP-004",
    firstName: "Michael",
    lastName: "Brown",
    fullName: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 555 804 773",
    department: "Engineering",
    jobTitle: "Backend Developer",
    hireDate: "Apr 05, 2023",
    employmentType: "Full-time",
    status: "Active",
    manager: "Laura Scott",
    salary: "$91,700",
    address: "732 Oak Street, Portland, OR",
  },
  {
    id: "5",
    employeeId: "EMP-005",
    firstName: "Emily",
    lastName: "Davis",
    fullName: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 555 501 208",
    department: "Finance",
    jobTitle: "Finance Analyst",
    hireDate: "May 12, 2023",
    employmentType: "Full-time",
    status: "Active",
    manager: "Robert King",
    salary: "$76,400",
    address: "19 North Ave, Boston, MA",
  },
  {
    id: "6",
    employeeId: "EMP-006",
    firstName: "David",
    lastName: "Wilson",
    fullName: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+1 555 917 334",
    department: "Sales",
    jobTitle: "Sales Executive",
    hireDate: "Jun 18, 2023",
    employmentType: "Full-time",
    status: "Inactive",
    manager: "Alicia Davis",
    salary: "$69,800",
    address: "502 Lakeside Way, Miami, FL",
  },
]

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-700",
  "On Leave": "bg-amber-500/10 text-amber-700",
  Inactive: "bg-slate-500/10 text-slate-700",
}

const departmentClasses: Record<string, string> = {
  "Human Resources": "bg-violet-100 text-violet-700",
  Engineering: "bg-sky-100 text-sky-700",
  Finance: "bg-amber-100 text-amber-700",
  Marketing: "bg-emerald-100 text-emerald-700",
  Sales: "bg-fuchsia-100 text-fuchsia-700",
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const matchesSearch = [employee.fullName, employee.email, employee.jobTitle, employee.department]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
        const matchesDepartment = departmentFilter ? employee.department === departmentFilter : true
        const matchesStatus = statusFilter ? employee.status === statusFilter : true

        return matchesSearch && matchesDepartment && matchesStatus
      }),
    [employees, search, departmentFilter, statusFilter],
  )

  const openNewEmployee = () => {
    setActiveEmployee(null)
    setModalOpen(true)
  }

  const openEditEmployee = (employee: Employee) => {
    setActiveEmployee(employee)
    setModalOpen(true)
  }

  const handleSaveEmployee = (data: EmployeeFormValues) => {
    const updatedEmployee: Employee = {
      id: activeEmployee?.id ?? String(Date.now()),
      fullName: `${data.firstName} ${data.lastName}`,
      ...data,
    }

    setEmployees((current) => {
      if (activeEmployee) {
        return current.map((item) => (item.id === activeEmployee.id ? updatedEmployee : item))
      }
      return [updatedEmployee, ...current]
    })

    setModalOpen(false)
    setActiveEmployee(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 xl:grid-cols-5">
        {[
          {
            label: "Total employees",
            value: "248",
            detail: "+12% this month",
            accent: "text-violet-600",
            icon: Users,
            iconBg: "bg-violet-50 text-violet-700",
            chartBg: "bg-violet-100",
          },
          {
            label: "Active employees",
            value: "230",
            detail: "+8% this month",
            accent: "text-emerald-600",
            icon: UserCheck,
            iconBg: "bg-emerald-50 text-emerald-700",
            chartBg: "bg-emerald-100",
          },
          {
            label: "On leave",
            value: "12",
            detail: "-2 from last month",
            accent: "text-amber-600",
            icon: Calendar,
            iconBg: "bg-amber-50 text-amber-700",
            chartBg: "bg-amber-100",
          },
          {
            label: "Attendance rate",
            value: "94.2%",
            detail: "+1.8% this month",
            accent: "text-sky-600",
            icon: CheckCircle,
            iconBg: "bg-sky-50 text-sky-700",
            chartBg: "bg-sky-100",
          },
          {
            label: "Payroll this month",
            value: "$124,560",
            detail: "On track",
            accent: "text-fuchsia-600",
            icon: DollarSign,
            iconBg: "bg-fuchsia-50 text-fuchsia-700",
            chartBg: "bg-fuchsia-100",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-950">{stat.value}</p>
              </div>
              <div className={`${stat.iconBg} grid h-12 w-12 place-items-center rounded-2xl`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className={`text-sm font-semibold ${stat.accent}`}>{stat.detail}</span>
              <div className={`${stat.chartBg} h-10 w-full rounded-3xl`} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <PageHeader title="Employees" description="Manage your workforce with search, filters, and quick actions." />
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 text-sm text-slate-700 shadow-sm">
            <Download size={16} /> Export
          </button>
          <button
            type="button"
            onClick={openNewEmployee}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <Plus size={16} /> Add employee
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr] xl:grid-cols-[1.8fr_1fr_1fr_1fr_0.4fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-300"
            />
          </div>
          <button
            type="button"
            className="inline-flex min-w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm"
          >
            All departments
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="inline-flex min-w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm"
          >
            All statuses
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="inline-flex min-w-full items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-sm"
          >
            All employment types
            <ChevronDown size={16} />
          </button>
          <div className="flex items-center justify-end gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              <Filter size={16} /> More filters
            </button>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-700">Reset</button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid min-w-full gap-0.5 bg-slate-100 px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
          <div className="grid grid-cols-[0.5fr_1.4fr_1.4fr_1.2fr_1.1fr_0.9fr_0.9fr_0.5fr] gap-4 py-3 px-2">
            <span className="text-left"> </span>
            <span>Employee</span>
            <span>Email</span>
            <span>Department</span>
            <span>Title</span>
            <span>Status</span>
            <span>Type</span>
            <span className="text-right">Joined</span>
          </div>
        </div>
        <div className="divide-y bg-slate-50">
          {filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => openEditEmployee(employee)}
              className="grid min-w-full grid-cols-[0.5fr_1.4fr_1.4fr_1.2fr_1.1fr_0.9fr_0.9fr_0.5fr] gap-4 px-4 py-5 text-left transition hover:bg-slate-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-sm text-slate-500"> </span>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-violet-100 text-violet-700 grid place-items-center text-sm font-semibold">{employee.firstName[0]}{employee.lastName[0]}</div>
                <div>
                  <p className="font-semibold text-slate-950">{employee.fullName}</p>
                  <p className="text-sm text-slate-500">{employee.employeeId}</p>
                </div>
              </div>
              <div className="truncate text-sm text-slate-500">{employee.email}</div>
              <div className="truncate text-sm text-slate-500">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${departmentClasses[employee.department] ?? "bg-slate-100 text-slate-700"}`}>
                  {employee.department}
                </span>
              </div>
              <div className="truncate text-sm text-slate-500">{employee.jobTitle}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[employee.status] ?? "bg-slate-200 text-slate-700"}`}>
                  {employee.status}
                </span>
              </div>
              <div className="truncate text-sm text-slate-500">{employee.employmentType}</div>
              <div className="flex items-center justify-end text-sm text-slate-500">
                <MoreHorizontal size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Showing 1 to {filteredEmployees.length} of 248 employees</p>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-input px-4 py-2 text-sm">Previous</button>
          <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Next</button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={activeEmployee ? "Edit employee" : "New employee"}
        description="Save employee profile details and contact information."
        onClose={() => setModalOpen(false)}
      >
        <EmployeeForm
          defaultValues={
            activeEmployee
              ? {
                  employeeId: activeEmployee.employeeId,
                  firstName: activeEmployee.firstName,
                  lastName: activeEmployee.lastName,
                  email: activeEmployee.email,
                  phone: activeEmployee.phone,
                  department: activeEmployee.department,
                  jobTitle: activeEmployee.jobTitle,
                  hireDate: activeEmployee.hireDate,
                  employmentType: activeEmployee.employmentType,
                  status: activeEmployee.status,
                  manager: activeEmployee.manager,
                  salary: activeEmployee.salary,
                  address: activeEmployee.address,
                }
              : undefined
          }
          onSubmit={handleSaveEmployee}
          submitLabel={activeEmployee ? "Update employee" : "Create employee"}
        />
      </Modal>
    </div>
  )
}
