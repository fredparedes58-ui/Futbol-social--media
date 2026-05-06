import { useCallback, useState, type MouseEvent as RMouseEvent } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

/**
 * Hook que genera ripples desde el punto de click.
 * Usar con un contenedor `position: relative; overflow: hidden`.
 */
export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const spawn = useCallback((e: RMouseEvent<HTMLElement>) => {
    const target = e.currentTarget
    const rect = target.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const id = Date.now() + Math.random()
    setRipples(prev => [...prev, { id, x, y, size }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650)
  }, [])

  return { ripples, spawn }
}

export function RippleLayer({
  ripples,
  color = 'rgba(255, 255, 255, 0.35)',
}: {
  ripples: Ripple[]
  color?: string
}) {
  return (
    <>
      {ripples.map(r => (
        <span
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            borderRadius: '50%',
            background: color,
            pointerEvents: 'none',
            animation: 'ripple-out 600ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards',
          }}
        />
      ))}
    </>
  )
}
