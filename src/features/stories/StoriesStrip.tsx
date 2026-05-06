/**
 * StoriesStrip — carousel horizontal de stories (24h). Tap abre viewer fullscreen.
 */
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { STORIES, getViewed, markViewed, type StoryItem } from './storiesData'

export default function StoriesStrip() {
  const [viewed, setViewed] = useState<Set<string>>(() => getViewed())
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  // Auto-advance del viewer
  useEffect(() => {
    if (activeIdx === null) return
    const story = STORIES[activeIdx]
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / story.durationMs)
      setProgress(p)
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        // marcar vista y avanzar
        markViewed(story.id)
        setViewed(v => new Set([...v, story.id]))
        if (activeIdx + 1 < STORIES.length) {
          setActiveIdx(activeIdx + 1)
          setProgress(0)
        } else {
          setActiveIdx(null)
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activeIdx])

  function open(i: number) {
    if ('vibrate' in navigator) navigator.vibrate(10)
    setProgress(0)
    setActiveIdx(i)
  }

  function next() {
    if (activeIdx === null) return
    markViewed(STORIES[activeIdx].id)
    setViewed(v => new Set([...v, STORIES[activeIdx].id]))
    if (activeIdx + 1 < STORIES.length) {
      setActiveIdx(activeIdx + 1)
      setProgress(0)
    } else {
      setActiveIdx(null)
    }
  }

  function prev() {
    if (activeIdx === null) return
    if (activeIdx > 0) {
      setActiveIdx(activeIdx - 1)
      setProgress(0)
    }
  }

  return (
    <>
      <div
        className="screen-scroll"
        style={{
          display: 'flex', gap: 12, padding: '0 20px 8px',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}
      >
        {STORIES.map((s, i) => {
          const isViewed = viewed.has(s.id)
          return (
            <button
              key={s.id}
              onClick={() => open(i)}
              style={{
                flexShrink: 0, background: 'transparent', border: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, padding: 0,
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                padding: 2,
                background: isViewed
                  ? 'rgba(250,245,235,0.15)'
                  : `conic-gradient(from 0deg, ${s.ring}, #FAF5EB, ${s.ring})`,
                boxShadow: isViewed ? 'none' : `0 0 14px ${s.ring}55`,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: s.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26,
                  border: '2px solid #0F0D0A',
                }}>
                  {s.emoji}
                </div>
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 600,
                color: isViewed ? 'rgba(250,245,235,0.5)' : '#FAF5EB',
                maxWidth: 70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {s.title}
              </div>
            </button>
          )
        })}
      </div>

      {/* Viewer fullscreen */}
      {activeIdx !== null && (
        <StoryViewer
          story={STORIES[activeIdx]}
          progress={progress}
          total={STORIES.length}
          index={activeIdx}
          onClose={() => setActiveIdx(null)}
          onNext={next}
          onPrev={prev}
        />
      )}
    </>
  )
}

function StoryViewer({
  story, progress, total, index, onClose, onNext, onPrev,
}: {
  story: StoryItem
  progress: number
  total: number
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: story.bg,
        display: 'flex', flexDirection: 'column',
        animation: 'slide-up-fade 220ms ease-out',
      }}
    >
      {/* Progress bars */}
      <div style={{
        display: 'flex', gap: 4, padding: '10px 14px 0',
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 999,
            background: 'rgba(255,255,255,0.18)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              background: story.ring,
              boxShadow: `0 0 6px ${story.ring}aa`,
              transition: i === index ? 'none' : 'width 200ms',
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: `${story.authorColor}33`,
          border: `2px solid ${story.authorColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Archivo', fontWeight: 800, fontSize: 11,
          color: story.authorColor,
        }}>
          {story.authorBadge}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>
            {story.title}
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.65)' }}>
            {story.timeAgo}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#FAF5EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Body con split tap zones */}
      <div style={{
        flex: 1, display: 'flex',
        position: 'relative',
      }}>
        <button onClick={onPrev} aria-label="Anterior" style={{
          flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
        }} />
        <button onClick={onNext} aria-label="Siguiente" style={{
          flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
        }} />

        {/* Contenido central */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', padding: 30,
        }}>
          <div style={{
            fontSize: 96, marginBottom: 24,
            filter: `drop-shadow(0 0 24px ${story.ring})`,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>
            {story.emoji}
          </div>
          <div style={{
            fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 26,
            color: '#FAF5EB', textAlign: 'center', marginBottom: 10,
            textShadow: '0 4px 18px rgba(0,0,0,0.6)',
          }}>
            {story.subtitle}
          </div>
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 14,
            color: 'rgba(250,245,235,0.85)', textAlign: 'center',
            maxWidth: 320, lineHeight: 1.4,
            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}>
            {story.caption}
          </div>
        </div>
      </div>
    </div>
  )
}
