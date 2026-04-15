import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-semibold text-stone-700">{label}</label>}
    <input
      ref={ref}
      className={`block w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_0_3px_rgba(20,184,166,0.1)] ${
        error ? 'border-red-500 focus:ring-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : 'border-stone-300 hover:border-stone-400'
      } ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
))
Input.displayName = 'Input'
