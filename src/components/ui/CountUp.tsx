import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface CountUpProps {
  value: number
  duration?: number        // ms
  decimals?: number
  prefix?: string
  suffix?: string
  style?: CSSProperties
  className?: string
  /** Si true, sólo anima cuando el elemento entra en viewport. */
  whenVisible?: boolean
}

// Easing: easeOutExpo — arrancada rápida, frenada suave (lectura deportiva)
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Anima un número desde 0 hasta `value` con requestAnimationFrame.
 * Respeta `prefers-reduced-motion` → muestra el valor final directo.
 * Si `whenVisible`, arranca cuando el nodo entra en pantalla.
 */
export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
  className,
  whenVisible = true,
}: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setDisplay(value); return }

    let raf = 0
    const run = () => {
      if (started.current) return
      started.current = true
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setDisplay(value * easeOutExpo(t))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    if (!whenVisible) { run(); return () => cancelAnimationFrame(raf) }

    const node = ref.current
    if (!node) { run(); return () => cancelAnimationFrame(raf) }

    const io = new IntersectionObserver(
      (entries) => { if (entries.some(e => e.isIntersecting)) run() },
      { threshold: 0.3 },
    )
    io.observe(node)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value, duration, whenVisible])

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toString()

  return (
    <span
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums', ...style }}
    >
      {prefix}{formatted}{suffix}
    </span>
  )
}
