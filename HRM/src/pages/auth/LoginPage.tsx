import { useNavigate } from "react-router-dom"

import { useAuth } from "@/hooks/useAuth"

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    login()
    navigate("/dashboard")
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-muted p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border bg-background p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">HRMS authentication placeholder.</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="admin@hrms.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input type="password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
        </div>

        <button type="submit" className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Continue to dashboard
        </button>
      </form>
    </section>
  )
}
