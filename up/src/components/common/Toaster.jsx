import { useEffect, useState } from 'react'

let toastHandler = null

export const toast = {
  success: (message) => toastHandler?.addToast(message, 'success'),
  error: (message) => toastHandler?.addToast(message, 'error'),
  warning: (message) => toastHandler?.addToast(message, 'warning'),
  info: (message) => toastHandler?.addToast(message, 'info'),
}

export const Toaster = () => {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastHandler = {
      addToast: (message, type) => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])

        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, 3500)
      },
    }

    return () => {
      toastHandler = null
    }
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const typeClasses = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-sky-200 bg-sky-50 text-sky-800',
  }

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-1100 flex w-full max-w-sm flex-col gap-3"
      aria-live="assertive"
      aria-atomic="true"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg ${typeClasses[item.type]}`}
          role="alert"
        >
          <p className="text-sm font-medium">{item.message}</p>
          <button
            type="button"
            onClick={() => removeToast(item.id)}
            className="shrink-0 text-base leading-none opacity-70 transition hover:opacity-100"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}