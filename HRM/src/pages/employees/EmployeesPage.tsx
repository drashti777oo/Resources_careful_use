import { useMemo, useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { ChevronDown, Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react"

import { EmployeeForm, type EmployeeFormValues } from "@/components/forms/EmployeeForm"
import { Modal } from "@/components/ui/Modal"
import { PageHeader } from "@/components/common/PageHeader"
import type { Employee } from "@/types"
import { employeeApi } from "@/services/api"
import { useAuth } from "@/hooks/useAuth"

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
  const { user } = useAuth()
  const location = useLocation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [departmentFilter] = useState("")
  const [statusFilter] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      openNewEmployee()
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await employeeApi.list()
      const mapped = (data.employees || []).map((emp: any) => ({
        ...emp,
        id: emp.id || emp._id,
        fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      }))
      setEmployees(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

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
    const role = user?.role?.toUpperCase()
    if (role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN" || role === "EMPLOYEE") {
      setActiveEmployee(employee)
      setModalOpen(true)
    }
  }

  const handleSaveEmployee = async (data: EmployeeFormValues) => {
    try {
      if (activeEmployee) {
        const id = activeEmployee.id || (activeEmployee as any)._id
        await employeeApi.update(id, data)
      } else {
        await employeeApi.create(data)
      }
      await fetchEmployees()
      setModalOpen(false)
      setActiveEmployee(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save employee")
    }
  }

  const isManagement = useMemo(() => {
    const role = user?.role?.toUpperCase()
    return role === "ADMIN" || role === "HR" || role === "SUPER_ADMIN"
  }, [user])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <PageHeader title="Employees" description="Manage your workforce with search, filters, and quick actions." />
        </div>
        {isManagement && (
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
        )}
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

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Loading employees...</p>
        </div>
      ) : error ? (
        <div className="flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : (
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
                  <div className="h-10 w-10 rounded-2xl bg-violet-100 text-violet-700 grid place-items-center text-sm font-semibold">
                    {employee.firstName?.[0] || ""}{employee.lastName?.[0] || ""}
                  </div>
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
            {filteredEmployees.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">No employees found.</div>
            )}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-background p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Showing 1 to {filteredEmployees.length} of {filteredEmployees.length} employees</p>
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-input px-4 py-2 text-sm">Previous</button>
            <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Next</button>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={activeEmployee ? (isManagement ? "Edit employee" : "View / Edit profile") : "New employee"}
        description={isManagement ? "Save employee profile details and contact information." : "Update your contact details."}
        onClose={() => setModalOpen(false)}
      >
        <EmployeeForm
          isEmployee={!isManagement}
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
          submitLabel={activeEmployee ? (isManagement ? "Update employee" : "Update profile") : "Create employee"}
        />
      </Modal>
    </div>
  )
}
