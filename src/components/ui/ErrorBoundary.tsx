/**
 * ErrorBoundary — evita que un error en una ruta rompa toda la app.
 * Muestra UI neon de error con botón Reintentar.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  hasError: boolean
  message?: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook para Sentry en prod — ver docs/sentry.md
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false, message: undefined })

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: '#0F0D0A', color: '#FAF5EB', textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'rgba(255,91,58,0.18)', border: '1px solid rgba(255,91,58,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
          boxShadow: '0 0 18px rgba(255,91,58,0.3)',
        }}>
          <AlertTriangle size={24} color="#FF5B3A" />
        </div>
        <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
          Algo falló
        </div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: 'rgba(250,245,235,0.6)', maxWidth: 320, marginBottom: 20 }}>
          {this.props.fallbackLabel ?? 'Ocurrió un error inesperado en esta pantalla.'} Probá recargar.
        </div>
        {this.state.message && (
          <div style={{
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,220,180,0.1)',
            fontFamily: 'monospace', fontSize: 11, color: 'rgba(250,245,235,0.55)',
            maxWidth: 320, marginBottom: 20,
          }}>
            {this.state.message}
          </div>
        )}
        <button onClick={this.reset} style={{
          padding: '10px 18px', borderRadius: 12,
          background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
          color: '#0F0D0A', border: 'none', cursor: 'pointer',
          fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 13,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: '0 0 18px rgba(204,255,0,0.35)',
        }}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    )
  }
}
