/**
 * shareFifaCard — captura un nodo DOM a PNG y lo comparte via Web Share API
 * o cae a descarga. Usa `html-to-image` (ultra ligero, sin dep nativo).
 */
import { toPng } from 'html-to-image'

export async function shareFifaCard(node: HTMLElement, filename = 'fifa-card.png'): Promise<boolean> {
  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0F0D0A',
    })
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], filename, { type: 'image/png' })

    const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean; share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void> }
    if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: 'Mi tarjeta FútbolBase', text: '¡Mirá mi tarjeta en FútbolBase!' })
      return true
    }

    // Fallback: descargar
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
    return true
  } catch (e) {
    console.error('shareFifaCard failed', e)
    return false
  }
}
