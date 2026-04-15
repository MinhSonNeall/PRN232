'use client'

import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with fade-in */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ animation: 'fadeIn 0.2s ease' }}
        onClick={onClose}
      />
      {/* Modal content with scale-in */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-100"
        style={{ animation: 'scaleIn 0.2s ease' }}
      >
        <h2 className="mb-4 text-lg font-semibold text-stone-900">{title}</h2>
        <div className="text-sm text-stone-700">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
