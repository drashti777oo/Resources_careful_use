import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const employeeSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  department: z.string().min(1, "Department is required"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function EmployeeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
  })

  const onSubmit = (data: EmployeeFormValues) => {
    console.info("Employee form submitted", data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Full name</label>
        <input
          {...register("fullName")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.fullName ? <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Department</label>
        <input
          {...register("department")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {errors.department ? <p className="mt-1 text-xs text-destructive">{errors.department.message}</p> : null}
      </div>

      <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Save employee
      </button>
    </form>
  )
}
