'use client'
import { useRef } from 'react'

// کج‌شدن سه‌بعدی ملایم با ماوس + مختصات برق نور (فقط ماوس، نه لمس)
export default function Tilt({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`
    el.style.setProperty('--sx', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--sy', `${(y + 0.5) * 100}%`)
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className={`tilt ${className}`}>
      {children}
    </div>
  )
}
