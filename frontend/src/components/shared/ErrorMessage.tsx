interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        {/* Circle-X icon */}
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M15 9l-6 6M9 9l6 6" />
        </svg>
        <div>
          <p className="text-sm font-medium text-red-800">{message}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 underline underline-offset-2">
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
