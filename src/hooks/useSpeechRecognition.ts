/**
 * useSpeechRecognition — wrapper ligero sobre Web Speech API.
 * Retorna `supported`, `listening`, `transcript`, `start/stop` y `error`.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

// Tipos mínimos para webkitSpeechRecognition (no están en lib.dom por defecto)
interface SRResultAlt { transcript: string; confidence: number }
interface SRResult { 0: SRResultAlt; isFinal: boolean; length: number }
interface SRResultList { 0: SRResult; length: number; [i: number]: SRResult }
interface SREvent { resultIndex: number; results: SRResultList }
interface SRErrorEvent { error: string }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SREvent) => void) | null
  onerror: ((e: SRErrorEvent) => void) | null
  onend: (() => void) | null
}
type SRCtor = new () => SpeechRecognitionLike

interface WindowWithSR {
  SpeechRecognition?: SRCtor
  webkitSpeechRecognition?: SRCtor
}

export function useSpeechRecognition(lang = 'es-AR') {
  const w = (typeof window !== 'undefined' ? window : undefined) as unknown as WindowWithSR | undefined
  const Ctor = w?.SpeechRecognition ?? w?.webkitSpeechRecognition
  const supported = !!Ctor

  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  useEffect(() => {
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true
    rec.onresult = (e: SREvent) => {
      let txt = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        txt += e.results[i][0].transcript
      }
      setTranscript(txt)
    }
    rec.onerror = (e: SRErrorEvent) => {
      setError(e.error)
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    return () => { try { rec.abort() } catch { /* ignore */ } }
  }, [Ctor, lang])

  const start = useCallback(() => {
    if (!recRef.current) return
    setTranscript('')
    setError(null)
    try {
      recRef.current.start()
      setListening(true)
    } catch { /* ya estaba iniciado */ }
  }, [])

  const stop = useCallback(() => {
    if (!recRef.current) return
    try { recRef.current.stop() } catch { /* ignore */ }
    setListening(false)
  }, [])

  return { supported, listening, transcript, error, start, stop }
}
