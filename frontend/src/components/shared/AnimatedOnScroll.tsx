'use client'

import { useEffect, useRef } from 'react'

interface AnimatedOnScrollProps {
  children: React.ReactNode
  className?: string
  /** Delay in ms before the reveal transition starts */
  delay?: number
}

/** Reveals children with a fade-up animation when they scroll into view */
export function AnimatedOnScroll({ children, className = '', delay = 0 }: AnimatedOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`scroll-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
