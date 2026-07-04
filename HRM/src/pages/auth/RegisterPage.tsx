import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import heroImg from "@/assets/hero.png"
import { authApi } from "@/services/api"

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage("")

    try {
      await authApi.register({ ...data, role: "EMPLOYEE" })
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to register")
    }
  }

  return (
    <section className="grid min-h-screen grid-cols-1 gap-10 bg-muted p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div className="mx-auto flex w-full max-w-xl flex-col justify-center gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">HRMS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Sign up to start managing employees, attendance, leave and payroll.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border bg-background p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <input
                {...register("name")}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="Your full name"
              />
              {errors.name ? <p className="mt-2 text-xs text-destructive">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="name@example.com"
              />
              {errors.email ? <p className="mt-2 text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="Create a password"
              />
              {errors.password ? <p className="mt-2 text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
          </div>

          {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Registering..." : "Create account"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account? <span className="font-semibold text-primary">Log in</span>
          </p>
        </form>
      </div>

      <div className="hidden h-full items-center justify-center lg:flex">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl">
          <img src={heroImg} alt="HRMS hero illustration" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/80 to-transparent p-8 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-200">HR dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold">Manage people and processes in one place.</h2>
            <ul className="mt-5 space-y-2 text-sm text-slate-200/90">
              <li>• Secure employee access</li>
              <li>• Modern attendance tracking</li>
              <li>• Leave and payroll at a glance</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
