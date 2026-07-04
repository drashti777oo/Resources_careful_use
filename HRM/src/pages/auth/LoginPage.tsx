import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useAuth } from "@/hooks/useAuth"
import heroImg from "@/assets/hero.png"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data: LoginFormValues) => {
    login()
    navigate("/dashboard")
    console.log("Login data", data)
  }

  const heroCards = useMemo(
    () => [
      "Secure employee access",
      "Modern attendance tracking",
      "Leave and payroll at a glance",
    ],
    [],
  )

  return (
    <section className="grid min-h-screen grid-cols-1 gap-10 bg-muted p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div className="mx-auto flex w-full max-w-xl flex-col justify-center gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">HRMS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to your account</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Access employee data, attendance, leave approvals, and payroll tools with one secure login.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border bg-background p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="admin@hrms.com"
              />
              {errors.email ? <p className="mt-2 text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
                placeholder="Enter your password"
              />
              {errors.password ? <p className="mt-2 text-xs text-destructive">{errors.password.message}</p> : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Continue to dashboard
          </button>
        </form>
      </div>

      <div className="hidden h-full items-center justify-center lg:flex">
        <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border bg-background shadow-2xl">
          <img src={heroImg} alt="HRMS hero illustration" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-8 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-200">HR dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold">Manage people and processes in one place.</h2>
            <ul className="mt-5 space-y-2 text-sm text-slate-200/90">
              {heroCards.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
