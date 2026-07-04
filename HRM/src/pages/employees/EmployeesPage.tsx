import { useMemo, useState } from "react"
import { Pencil, Plus } from "lucide-react"

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
    hireDate: "2021-05-18",
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
    hireDate: "2022-09-12",
    employmentType: "Full-time",
    status: "On Leave",
    manager: "Laura Scott",
    salary: "$98,300",
    address: "273 River Road, Austin, TX",
  },
  {
    id: "3",
    employeeId: "EMP-003",
    firstName: "Maya",
    lastName: "Patel",
    fullName: "Maya Patel",
    email: "maya.patel@example.com",
    phone: "+1 555 721 045",
    department: "Finance",
    jobTitle: "Payroll Specialist",
    hireDate: "2023-01-03",
    employmentType: "Part-time",
    status: "Active",
    manager: "Alicia Davis",
    salary: "$58,200",
    address: "88 West Ave, Seattle, WA",
  },
]

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-700",
  "On Leave": "bg-amber-500/10 text-amber-700",
  Inactive: "bg-slate-500/10 text-slate-700",
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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <PageHeader title="Employees" description="Browse your employee directory, filter by status, and manage profiles." />
        </div>
        <button
          type="button"
          onClick={openNewEmployee}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus size={16} />
          Add employee
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-background p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Search</p>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or role"
            className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="rounded-3xl border bg-background p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium">Department</label>
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div className="rounded-3xl border bg-background p-4 shadow-sm">
          <label className="mb-2 block text-sm font-medium">Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="grid min-w-full gap-0.5 bg-slate-200/70 px-4 py-3 text-xs uppercase tracking-[0.15em] text-slate-500 dark:bg-slate-900/70">
          <div className="grid grid-cols-[1.4fr_1.4fr_1.2fr_1.1fr_0.9fr_0.9fr_0.8fr] gap-4 py-2 px-2">
            <span>Employee</span>
            <span>Email</span>
            <span>Department</span>
            <span>Title</span>
            <span>Status</span>
            <span>Type</span>
            <span className="text-right">Actions</span>
          </div>
        </div>
        <div className="divide-y bg-background">
          {filteredEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => openEditEmployee(employee)}
              className="grid min-w-full grid-cols-[1.4fr_1.4fr_1.2fr_1.1fr_0.9fr_0.9fr_0.8fr] gap-4 px-4 py-4 text-left transition hover:bg-muted/60"
            >
              <div>
                <p className="font-medium">{employee.fullName}</p>
                <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
              </div>
              <div className="truncate text-sm text-muted-foreground">{employee.email}</div>
              <div className="truncate text-sm text-muted-foreground">{employee.department}</div>
              <div className="truncate text-sm text-muted-foreground">{employee.jobTitle}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[employee.status] ?? "bg-slate-200 text-slate-700"}`}>
                  {employee.status}
                </span>
              </div>
              <div className="truncate text-sm text-muted-foreground">{employee.employmentType}</div>
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-input px-3 py-1 text-xs text-muted-foreground">
                  <Pencil size={14} /> Edit
                </span>
              </div>
            </button>
          ))}
          {filteredEmployees.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No employees match your filters.</div>
          ) : null}
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
