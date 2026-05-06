interface Orb {
  x: number
  y: number
  size: number
  color: string
  opacity?: number
  dur?: number
}

interface FloatingOrbsProps {
  orbs: Orb[]
}

export default function FloatingOrbs({ orbs }: FloatingOrbsProps) {
  return (
    <>
      {orbs.map((o, i) => {
        const op = o.opacity ?? 0.35
        const hex = Math.round(op * 255).toString(16).padStart(2, '0')
        const hexMid = Math.round(op * 0.45 * 255).toString(16).padStart(2, '0')
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: o.size,
              height: o.size,
              borderRadius: '50%',
              // Dos stops: núcleo saturado + halo intermedio → sensación de volumen
              background: `radial-gradient(circle, ${o.color}${hex} 0%, ${o.color}${hexMid} 35%, transparent 72%)`,
              filter: 'blur(40px) saturate(140%)',
              animation: `float-drift ${o.dur ?? 14}s ease-in-out ${i * 0.6}s infinite`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </>
  )
}
