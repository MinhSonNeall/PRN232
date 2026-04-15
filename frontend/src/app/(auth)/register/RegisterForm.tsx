'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api/auth'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api/api-client'

export function RegisterForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Tenant' as 'Tenant' | 'Owner' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.fullName) e.fullName = 'Required'
    if (!form.email) e.email = 'Required'
    if (!form.phone) e.phone = 'Required'
    if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await authApi.registerAccount({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: form.role })
      const loginData = await authApi.signIn({ email: form.email, password: form.password })
      login(loginData)
      document.cookie = `hmss_token=${loginData.token}; path=/; max-age=${30 * 60}; SameSite=Strict`
      // Full page navigation ensures middleware sees the fresh cookie
      window.location.href = form.role === 'Tenant' ? '/tenant/requests' : '/owner/property'
    } catch (err) {
      if (err instanceof ApiError) {
        try {
          const body = JSON.parse(err.message)
          if (body.Errors) setErrors({ general: body.Errors.join(', ') })
          else setErrors({ general: err.message })
        } catch {
          setErrors({ general: err.message })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="auth-field" style={{ animationDelay: '0.1s' }}>
        <Input label="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} error={errors.fullName} required className="py-2.5 text-base" />
      </div>
      <div className="auth-field" style={{ animationDelay: '0.18s' }}>
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} required className="py-2.5 text-base" />
      </div>
      <div className="auth-field" style={{ animationDelay: '0.26s' }}>
        <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} error={errors.phone} required className="py-2.5 text-base" />
      </div>
      <div className="auth-field" style={{ animationDelay: '0.34s' }}>
        <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={errors.password} required className="py-2.5 text-base" />
      </div>
      <div className="auth-field" style={{ animationDelay: '0.42s' }}>
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} error={errors.confirmPassword} required className="py-2.5 text-base" />
      </div>
      <div className="space-y-2 auth-field" style={{ animationDelay: '0.5s' }}>
        <label className="block text-sm font-medium text-stone-700">Register as</label>
        <div className="flex gap-6">
          {(['Tenant', 'Owner'] as const).map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setForm(f => ({ ...f, role: r }))} className="h-4 w-4" />
              <span className="text-base">{r}</span>
            </label>
          ))}
        </div>
      </div>
      {errors.general && <p className="text-sm text-red-600 animate-fade-up">{errors.general}</p>}
      <div className="auth-field" style={{ animationDelay: '0.58s' }}>
        <Button type="submit" size="lg" isLoading={isLoading} className="w-full">Create Account</Button>
      </div>
      <p className="text-center text-sm text-stone-600 auth-field" style={{ animationDelay: '0.66s' }}>
        Already have an account? <Link href="/login" className="text-teal-700 hover:underline">Sign In</Link>
      </p>
    </form>
  )
}
