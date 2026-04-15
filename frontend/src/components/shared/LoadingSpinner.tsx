interface LoadingSpinnerProps {
  className?: string
  text?: string
}

export function LoadingSpinner({ className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      {text && <p className="text-sm text-stone-500">{text}</p>}
    </div>
  )
}
