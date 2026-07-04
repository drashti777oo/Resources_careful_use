import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { authApi } from "@/services/api"
import heroImg from "@/assets/hero.png"

const verifySchema = z.object({
  otp: z.string().length(6, "Code must be exactly 6 digits"),
})

type VerifyFormValues = z.infer<typeof verifySchema>

export function VerifyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get("email") || ""

  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isResending, setIsResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormValues>({ resolver: zodResolver(verifySchema) })

  const onSubmit = async (data: VerifyFormValues) => {
    setErrorMessage("")
    setSuccessMessage("")

    try {
      await authApi.verifyEmail({ email, otp: data.otp })
      setSuccessMessage("Email verified successfully! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Verification failed")
    }
  }

  const handleResend = async () => {
    if (!email) {
      setErrorMessage("No email address found to resend code to.")
      return
    }

    setErrorMessage("")
    setSuccessMessage("")
    setIsResending(true)

    try {
      await authApi.resendOtp({ email })
      setSuccessMessage("A new verification code has been sent to your email.")
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to resend code")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <section className="grid min-h-screen grid-cols-1 gap-10 bg-muted p-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div className="mx-auto flex w-full max-w-xl flex-col justify-center gap-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">HRMS</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Verify your email</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            We sent a 6-digit verification code to <span className="font-semibold text-foreground">{email || "your email"}</span>. Enter the code below to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border bg-background p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Verification Code</label>
              <input
                {...register("otp")}
                type="text"
                maxLength={6}
                className="w-full text-center tracking-[0.5em] font-mono text-xl rounded-2xl border border-input bg-background px-4 py-3"
                placeholder="000000"
              />
              {errors.otp ? <p className="mt-2 text-xs text-destructive">{errors.otp.message}</p> : null}
            </div>
          </div>

          {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}
          {successMessage ? <p className="mt-4 text-sm text-emerald-600">{successMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Verifying..." : "Verify email"}
          </button>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="font-semibold text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
            <Link to="/login" className="text-slate-500 hover:underline">
              Back to login
            </Link>
          </div>
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
