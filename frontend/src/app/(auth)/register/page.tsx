import { RegisterForm } from './RegisterForm'
import { AuthHostelIllustration } from '@/components/shared/auth-hostel-illustration'

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl border border-stone-100 lg:grid-cols-2">
        {/* Left — form */}
        <div className="flex flex-col justify-center p-10 lg:p-12 animate-slide-left">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 animate-fade-up">Create an account</h1>
            <p className="mt-2 text-base text-stone-500 animate-fade-up delay-100">Join HMSS to find or list hostel rooms</p>
          </div>
          <RegisterForm />
        </div>

        {/* Right — illustration (hidden on mobile) */}
        <AuthHostelIllustration
          heading="List or Discover Rooms"
          subtitle="Whether you're a tenant looking for a room or an owner managing properties — HMSS has you covered."
        />
      </div>
    </div>
  )
}
