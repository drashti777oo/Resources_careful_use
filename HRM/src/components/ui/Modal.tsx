import { type ReactNode } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  title?: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border bg-background shadow-2xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div className="space-y-1">
            {title ? <h2 className="text-xl font-semibold">{title}</h2> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
