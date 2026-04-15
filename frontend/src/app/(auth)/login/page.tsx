import { Suspense } from 'react'
import { LoginForm } from './LoginForm'
import { AuthHostelIllustration } from '@/components/shared/auth-hostel-illustration'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl border border-stone-100 lg:grid-cols-2">
        {/* Left — form */}
        <div className="flex flex-col justify-center p-10 lg:p-12 animate-slide-left">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 animate-fade-up">Welcome back</h1>
            <p className="mt-2 text-base text-stone-500 animate-fade-up delay-100">Sign in to your account to continue</p>
          </div>
          <Suspense><LoginForm /></Suspense>
        </div>

        {/* Right — illustration (hidden on mobile) */}
        <AuthHostelIllustration
          heading="Find Your Perfect Hostel"
          subtitle="Browse hundreds of verified hostel rooms with transparent pricing and trusted reviews."
        />
      </div>
    </div>
  )
}
