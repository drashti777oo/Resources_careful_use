import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const employeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Phone is required"),
  department: z.string().min(1, "Department is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  status: z.string().min(1, "Status is required"),
  manager: z.string().min(1, "Manager is required"),
  salary: z.string().min(1, "Salary is required"),
  address: z.string().min(5, "Address is required"),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EmployeeFormProps {
  defaultValues?: EmployeeFormValues
  onSubmit: (values: EmployeeFormValues) => void
  submitLabel?: string
  isEmployee?: boolean
}

export function EmployeeForm({ defaultValues, onSubmit, submitLabel = "Save employee", isEmployee = false }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Employee ID</label>
          <input
            {...register("employeeId")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.employeeId ? <p className="mt-1 text-xs text-destructive">{errors.employeeId.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">First name</label>
          <input
            {...register("firstName")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.firstName ? <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Last name</label>
          <input
            {...register("lastName")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.lastName ? <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            {...register("email")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            {...register("phone")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Department</label>
          <input
            {...register("department")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.department ? <p className="mt-1 text-xs text-destructive">{errors.department.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Job title</label>
          <input
            {...register("jobTitle")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.jobTitle ? <p className="mt-1 text-xs text-destructive">{errors.jobTitle.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Hire date</label>
          <input
            {...register("hireDate")}
            type="date"
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.hireDate ? <p className="mt-1 text-xs text-destructive">{errors.hireDate.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Employment type</label>
          <select
            {...register("employmentType")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">Select type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
          </select>
          {errors.employmentType ? <p className="mt-1 text-xs text-destructive">{errors.employmentType.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            {...register("status")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          >
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
          {errors.status ? <p className="mt-1 text-xs text-destructive">{errors.status.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Manager</label>
          <input
            {...register("manager")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.manager ? <p className="mt-1 text-xs text-destructive">{errors.manager.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Salary</label>
          <input
            {...register("salary")}
            disabled={isEmployee}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
          />
          {errors.salary ? <p className="mt-1 text-xs text-destructive">{errors.salary.message}</p> : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Address</label>
        <textarea
          {...register("address")}
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.address ? <p className="mt-1 text-xs text-destructive">{errors.address.message}</p> : null}
      </div>

      <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        {submitLabel}
      </button>
    </form>
  )
}
