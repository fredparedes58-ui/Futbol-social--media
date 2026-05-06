"""Genera futbolbase-brand-guidelines.pdf — manual de marca completo."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, Flowable, KeepTogether
)

# ---------- Paleta ----------
NAVY = HexColor('#050D1A')
NAVY_LIGHT = HexColor('#0A1628')
NEON_GREEN = HexColor('#00FF87')
NEON_GREEN_DARK = HexColor('#00E676')
CYAN = HexColor('#00D4FF')
ORANGE = HexColor('#FF6B00')
PURPLE = HexColor('#B347FF')
PINK = HexColor('#C2185B')
TEXT = HexColor('#FFFFFF')
MUTED = HexColor('#94A3B8')
CARD = HexColor('#0F1B2E')
GREY_LIGHT = HexColor('#E2E8F0')

OUT = 'futbolbase-brand-guidelines.pdf'

# ---------- Estilos ----------
styles = getSampleStyleSheet()

H1 = ParagraphStyle('H1', parent=styles['Heading1'], fontName='Helvetica-Bold',
                    fontSize=22, leading=26, textColor=NEON_GREEN, spaceBefore=4, spaceAfter=10)
H2 = ParagraphStyle('H2', parent=styles['Heading2'], fontName='Helvetica-Bold',
                    fontSize=14, leading=18, textColor=CYAN, spaceBefore=12, spaceAfter=6)
H3 = ParagraphStyle('H3', parent=styles['Heading3'], fontName='Helvetica-Bold',
                    fontSize=11, leading=14, textColor=NEON_GREEN, spaceBefore=8, spaceAfter=4)
BODY = ParagraphStyle('Body', parent=styles['BodyText'], fontName='Helvetica',
                      fontSize=10, leading=14, textColor=HexColor('#1A2332'), alignment=TA_JUSTIFY,
                      spaceAfter=4)
SMALL = ParagraphStyle('Small', parent=BODY, fontSize=8, leading=11, textColor=HexColor('#475569'))
MUTED_S = ParagraphStyle('Muted', parent=BODY, fontSize=9, leading=12, textColor=HexColor('#475569'))


# ---------- Cover ----------
def draw_cover(c):
    w, h = A4
    c.setFillColor(NAVY); c.rect(0, 0, w, h, fill=1, stroke=0)
    # Bandas neon
    c.setFillColor(NEON_GREEN); c.rect(0, h-1.2*cm, w, 0.18*cm, fill=1, stroke=0)
    c.setFillColor(CYAN); c.rect(0, 1*cm, w, 0.12*cm, fill=1, stroke=0)
    # Esfera/balón abstracto
    c.setStrokeColor(NEON_GREEN); c.setLineWidth(2)
    c.circle(w/2, h-9*cm, 2.4*cm, stroke=1, fill=0)
    c.setStrokeColor(CYAN); c.setLineWidth(1)
    c.circle(w/2, h-9*cm, 3.2*cm, stroke=1, fill=0)
    c.setStrokeColor(PURPLE); c.setLineWidth(0.6)
    c.circle(w/2, h-9*cm, 4*cm, stroke=1, fill=0)
    # Logotipo simulado
    c.setFillColor(NEON_GREEN); c.setFont('Helvetica-Bold', 38)
    c.drawCentredString(w/2, h-13*cm, 'FutbolBase')
    c.setFillColor(TEXT); c.setFont('Helvetica', 11)
    c.drawCentredString(w/2, h-14*cm, 'Manual de marca · Brand Guidelines v1.0')
    c.setFillColor(MUTED); c.setFont('Helvetica', 9)
    c.drawCentredString(w/2, h-14.7*cm, 'Una vertical de Krujens Holding')
    # Tagline
    c.setFillColor(CYAN); c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(w/2, 6*cm, 'EL FUTURO DEL FÚTBOL BASE')
    c.setFillColor(TEXT); c.setFont('Helvetica', 9)
    c.drawCentredString(w/2, 5.3*cm, 'Identidad visual · Tono de voz · Aplicaciones · Reglas de uso')
    # Footer
    c.setFillColor(MUTED); c.setFont('Helvetica', 8)
    c.drawString(2*cm, 1.5*cm, 'Confidencial · uso interno y partners autorizados')
    c.drawRightString(w-2*cm, 1.5*cm, '2026')


def on_cover(canv, doc):
    canv.saveState(); draw_cover(canv); canv.restoreState()


def on_pages(canv, doc):
    canv.saveState()
    w, h = A4
    canv.setFillColor(NAVY); canv.rect(0, h-1*cm, w, 1*cm, fill=1, stroke=0)
    canv.setFillColor(NEON_GREEN); canv.setFont('Helvetica-Bold', 9)
    canv.drawString(2*cm, h-0.65*cm, 'FutbolBase · Brand Guidelines')
    canv.setFillColor(TEXT); canv.setFont('Helvetica', 8)
    canv.drawRightString(w-2*cm, h-0.65*cm, f'Página {doc.page}')
    canv.setFillColor(MUTED); canv.setFont('Helvetica', 7)
    canv.drawCentredString(w/2, 1*cm, 'krujens.com/futbolbase · brand@krujens.com')
    canv.restoreState()


# ---------- Swatch de color ----------
class ColorSwatch(Flowable):
    def __init__(self, color, name, hex_code, rgb, usage, w=17*cm, h=2.2*cm):
        Flowable.__init__(self)
        self.color = color; self.name = name; self.hex = hex_code
        self.rgb = rgb; self.usage = usage; self.w = w; self.h = h
    def wrap(self, *a): return self.w, self.h
    def draw(self):
        c = self.canv
        c.setFillColor(self.color); c.rect(0, 0, 5*cm, self.h, fill=1, stroke=0)
        # Hex centrado en swatch
        c.setFillColor(white if self.color != NEON_GREEN else NAVY)
        c.setFont('Helvetica-Bold', 12)
        c.drawCentredString(2.5*cm, self.h/2-0.1*cm, self.hex)
        # Texto al lado
        c.setFillColor(HexColor('#1A2332'))
        c.setFont('Helvetica-Bold', 11)
        c.drawString(5.4*cm, self.h-0.6*cm, self.name)
        c.setFont('Helvetica', 8)
        c.setFillColor(HexColor('#475569'))
        c.drawString(5.4*cm, self.h-1.0*cm, f'RGB {self.rgb}')
        c.drawString(5.4*cm, self.h-1.4*cm, f'Uso: {self.usage}')


# ---------- Logo construction blocks ----------
class LogoBlock(Flowable):
    def __init__(self, w=17*cm, h=5*cm, mode='primary'):
        Flowable.__init__(self); self.w = w; self.h = h; self.mode = mode
    def wrap(self, *a): return self.w, self.h
    def draw(self):
        c = self.canv
        bg = NAVY if self.mode in ('primary', 'mono_dark') else white
        fg = NEON_GREEN if self.mode == 'primary' else (
            white if self.mode == 'mono_dark' else NAVY)
        c.setFillColor(bg); c.rect(0, 0, self.w, self.h, fill=1, stroke=1)
        # Símbolo: círculo concéntrico
        cx, cy = 3*cm, self.h/2
        c.setStrokeColor(fg); c.setLineWidth(1.5)
        c.circle(cx, cy, 1.2*cm, stroke=1, fill=0)
        c.setLineWidth(0.8)
        c.circle(cx, cy, 0.8*cm, stroke=1, fill=0)
        c.setFillColor(fg); c.circle(cx, cy, 0.25*cm, stroke=0, fill=1)
        # Wordmark
        c.setFillColor(fg); c.setFont('Helvetica-Bold', 22)
        c.drawString(cx+1.8*cm, cy-0.15*cm, 'FutbolBase')
        # Etiqueta inferior modo
        c.setFillColor(MUTED); c.setFont('Helvetica', 7)
        c.drawString(0.2*cm, 0.2*cm, self.mode.upper())


# ---------- Documento ----------
doc = SimpleDocTemplate(OUT, pagesize=A4,
                        leftMargin=2*cm, rightMargin=2*cm,
                        topMargin=1.6*cm, bottomMargin=1.6*cm,
                        title='FutbolBase Brand Guidelines',
                        author='Krujens Holding')

story = []
story.append(Spacer(1, 1)); story.append(PageBreak())

# ===== 1. Esencia de marca =====
story.append(Paragraph('01 · Esencia de marca', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Propósito', H2))
story.append(Paragraph(
    'Devolver el tiempo a los clubes de fútbol base y a las familias para que puedan centrarse en lo único '
    'que importa: que los chicos y chicas jueguen, aprendan y disfruten.', BODY))

story.append(Paragraph('Visión', H2))
story.append(Paragraph(
    'Ser la plataforma de referencia del fútbol formativo en habla hispana antes de 2030.', BODY))

story.append(Paragraph('Misión', H2))
story.append(Paragraph(
    'Digitalizar la gestión deportiva de clubes amateur y academias con una herramienta tan simple que la pueda '
    'usar un coordinador voluntario y tan completa que sirva a una academia profesional.', BODY))

story.append(Paragraph('Valores', H2))
vals = [
    ['Cercanía', 'Hablamos como un padre o entrenador, no como un consultor.'],
    ['Honestidad', 'No cobramos lo que no usas. Decimos lo que la app NO hace.'],
    ['Transparencia', 'Cuotas, datos y permisos visibles para todos.'],
    ['Rigor', 'Cumplimos RGPD, Veri*Factu y normativa federativa al pie de la letra.'],
    ['Velocidad', 'Mejor lanzar y mejorar que esperar a la versión perfecta.'],
]
t = Table(vals, colWidths=[3*cm, 14*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,-1), NEON_GREEN),
    ('TEXTCOLOR', (0,0), (0,-1), NAVY),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('BACKGROUND', (1,0), (1,-1), GREY_LIGHT),
    ('TEXTCOLOR', (1,0), (1,-1), HexColor('#1A2332')),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.4, white),
]))
story.append(t)

story.append(Paragraph('Tagline principal', H2))
story.append(Paragraph('<b>EL FUTURO DEL FÚTBOL BASE</b>', BODY))
story.append(Paragraph('Versiones cortas para producto:', H3))
story.append(Paragraph('• Tu club, en una sola app.<br/>'
                       '• El fútbol base, organizado.<br/>'
                       '• Menos WhatsApp, más fútbol.', BODY))

story.append(PageBreak())

# ===== 2. Logo =====
story.append(Paragraph('02 · Logotipo', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Versión principal', H2))
story.append(Paragraph(
    'El logo combina un símbolo (círculos concéntricos que evocan el balón, la órbita y el target) con el '
    'wordmark "FutbolBase". Se usa siempre sobre fondo navy <b>#050D1A</b> con el símbolo y wordmark en verde '
    'neón <b>#00FF87</b>.', BODY))
story.append(Spacer(1, 6))
story.append(LogoBlock(mode='primary'))
story.append(Spacer(1, 8))

story.append(Paragraph('Versión monocromática (fondo oscuro)', H2))
story.append(LogoBlock(mode='mono_dark'))
story.append(Spacer(1, 8))

story.append(Paragraph('Versión monocromática (fondo claro)', H2))
story.append(LogoBlock(mode='mono_light'))
story.append(Spacer(1, 10))

story.append(Paragraph('Área de protección', H2))
story.append(Paragraph(
    'Reservar un margen mínimo equivalente a la altura de la "F" del wordmark alrededor del logo. '
    'No colocar texto, imágenes o bordes dentro de esa zona.', BODY))

story.append(Paragraph('Tamaño mínimo', H2))
story.append(Paragraph(
    '• Digital: 24 px de altura.<br/>'
    '• Impreso: 8 mm de altura.<br/>'
    '• Favicon / app icon: usar solo el símbolo (círculos), sin wordmark.', BODY))

story.append(Paragraph('Usos prohibidos', H2))
prohibited = [
    'No deformar, estirar ni rotar el logo.',
    'No cambiar los colores fuera de la paleta oficial.',
    'No aplicar sombras, bordes 3D, degradados ni efectos.',
    'No colocar el logo sobre fotos sin máscara o capa de oscurecimiento.',
    'No reorganizar símbolo y wordmark (mantener símbolo a la izquierda).',
    'No reemplazar la tipografía del wordmark.',
]
for p in prohibited:
    story.append(Paragraph(f'✗ {p}', BODY))

story.append(PageBreak())

# ===== 3. Color =====
story.append(Paragraph('03 · Sistema de color', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Colores primarios', H2))
story.append(ColorSwatch(NAVY, 'Navy Base', '#050D1A', '5, 13, 26', 'Fondo principal de toda la app'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(NEON_GREEN, 'Neon Green', '#00FF87', '0, 255, 135', 'CTA, marca, acentos primarios'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(TEXT, 'White', '#FFFFFF', '255, 255, 255', 'Texto principal sobre navy'))

story.append(Paragraph('Colores secundarios', H2))
story.append(ColorSwatch(CYAN, 'Cyan', '#00D4FF', '0, 212, 255', 'Información, links, datos secundarios'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(ORANGE, 'Orange', '#FF6B00', '255, 107, 0', 'Stats, performance, energía'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(PURPLE, 'Purple', '#B347FF', '179, 71, 255', 'Categorías premium, badges'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(PINK, 'Pink', '#C2185B', '194, 24, 91', 'Modo familiar / abuelos / alertas suaves'))

story.append(PageBreak())

story.append(Paragraph('Colores de UI', H2))
story.append(ColorSwatch(NAVY_LIGHT, 'Navy Light', '#0A1628', '10, 22, 40', 'Tarjetas y secciones elevadas'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(CARD, 'Card', '#0F1B2E', '15, 27, 46', 'Glassmorphism y bloques internos'))
story.append(Spacer(1, 4))
story.append(ColorSwatch(MUTED, 'Muted', '#94A3B8', '148, 163, 184', 'Texto secundario, captions'))

story.append(Paragraph('Reglas de uso del color', H2))
rules = [
    ['Regla', 'Detalle'],
    ['Contraste', 'Texto blanco sobre navy: AAA. Verde neón sobre navy: AA mínimo en 14px+ bold.'],
    ['Jerarquía', 'Verde = acción. Cyan = información. Naranja = rendimiento. Púrpura = premium.'],
    ['Glow', 'Box-shadow del color del borde, opacity 0.4–0.6, blur 16–24px.'],
    ['Ratio', '70% navy + 20% blanco/muted + 10% acentos neón. Nunca saturar la pantalla de neón.'],
    ['Modo claro', 'No hay modo claro oficial. La identidad es 100% dark.'],
]
t = Table(rules, colWidths=[3*cm, 14*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('TEXTCOLOR', (0,0), (-1,0), NEON_GREEN),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.4, MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('BACKGROUND', (0,1), (0,-1), GREY_LIGHT),
    ('FONTNAME', (0,1), (0,-1), 'Helvetica-Bold'),
]))
story.append(t)

story.append(PageBreak())

# ===== 4. Tipografía =====
story.append(Paragraph('04 · Tipografía', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Familias oficiales', H2))
story.append(Paragraph(
    '<b>Barlow Condensed</b> · Headers, titulares y números grandes. Pesos 700 / 800.<br/>'
    '<b>Inter</b> · Body, UI, párrafos, etiquetas. Pesos 400 / 500 / 600 / 700.<br/>'
    '<b>JetBrains Mono</b> · Código, tokens, IDs técnicos (uso reservado).', BODY))
story.append(Paragraph('Fallback web: <i>system-ui, -apple-system, "Segoe UI", Roboto, sans-serif</i>', SMALL))

story.append(Paragraph('Escala tipográfica', H2))
scale = [
    ['Token', 'Tamaño', 'Line height', 'Uso'],
    ['display', '48 / 56 px', '1.0', 'Hero / Onboarding'],
    ['h1', '32 px', '1.1', 'Cabeceras principales'],
    ['h2', '24 px', '1.15', 'Secciones'],
    ['h3', '18 px', '1.25', 'Sub-secciones'],
    ['body', '16 px', '1.5', 'Texto base'],
    ['small', '14 px', '1.4', 'Captions y meta'],
    ['micro', '12 px', '1.3', 'Labels, badges'],
]
t = Table(scale, colWidths=[3*cm, 3*cm, 3*cm, 8*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('TEXTCOLOR', (0,0), (-1,0), CYAN),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.4, MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [GREY_LIGHT, white]),
]))
story.append(t)

story.append(Paragraph('Reglas de composición', H2))
story.append(Paragraph(
    '• Titulares en MAYÚSCULAS Barlow Condensed 800, tracking +20.<br/>'
    '• Body siempre Inter Regular 400, tracking 0.<br/>'
    '• Nunca mezclar más de 2 familias en una misma vista.<br/>'
    '• Números grandes (stats, marcadores) en Barlow Condensed 700 con color de acento.', BODY))

story.append(PageBreak())

# ===== 5. Iconografía e imagen =====
story.append(Paragraph('05 · Iconografía e imagen', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Iconos', H2))
story.append(Paragraph(
    'Set oficial: <b>Lucide</b> (lucide.dev). Stroke 1.5–2 px, esquinas redondeadas. '
    'Tamaño base 24 px. Color heredado del contexto (verde neón en activos, muted en inactivos).', BODY))

story.append(Paragraph('Fotografía', H2))
story.append(Paragraph(
    'Estilo: cinemático, alto contraste, alta saturación selectiva (verde césped + luz cálida). '
    'Sujetos preferidos: chicos y chicas reales jugando (no posados de stock), entrenadores guiando, '
    'familias compartiendo. Evitar primeros planos genéricos de "hombre con portátil".', BODY))
story.append(Paragraph(
    '<b>Tratamiento:</b> aplicar overlay navy 40% + viñeta para integrar con la UI. '
    'Nunca usar fotos sin tratar sobre fondo navy puro.', BODY))

story.append(Paragraph('Ilustración', H2))
story.append(Paragraph(
    'Geometría limpia, líneas neón sobre navy. Inspiración: HUDs deportivos, infografía de eSports, '
    'patrones de campo de fútbol estilizados. Sin mascotas ni caricaturas infantiles.', BODY))

story.append(Paragraph('Motion', H2))
story.append(Paragraph(
    '• Transiciones <b>200–300 ms</b>, easing <i>ease-out</i>.<br/>'
    '• Glow pulsante en CTA principal: 1.6 s loop.<br/>'
    '• Partículas de fondo: 60–80 puntos, opacity 0.3, drift lento.<br/>'
    '• Sin animaciones que duren más de 600 ms (cansan en uso diario).', BODY))

story.append(PageBreak())

# ===== 6. Tono de voz =====
story.append(Paragraph('06 · Tono de voz', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Personalidad', H2))
story.append(Paragraph(
    'Cercano, directo, honesto. Como un coordinador que sabe lo que hace pero no se da importancia. '
    'Hablamos de "tú" en producto y comunicación a familias; de "vosotros/usted" solo en formal a directivos.', BODY))

story.append(Paragraph('Sí decimos', H3))
story.append(Paragraph(
    '✓ "Tu club, en una sola app."<br/>'
    '✓ "Menos WhatsApp, más fútbol."<br/>'
    '✓ "La cuota la paga el club, no tú."<br/>'
    '✓ "Si no te sirve, te devolvemos el dinero."<br/>'
    '✓ "Estamos pensados para clubes pequeños."', BODY))

story.append(Paragraph('No decimos', H3))
story.append(Paragraph(
    '✗ "Solución integral end-to-end de gestión deportiva."<br/>'
    '✗ "Sinergias entre stakeholders del ecosistema."<br/>'
    '✗ "El líder indiscutible del mercado."<br/>'
    '✗ "Revolucionamos para siempre el fútbol base."', BODY))

story.append(Paragraph('Reglas de redacción', H2))
rules2 = [
    ['Frases cortas', 'Máximo 18 palabras por frase. Si es más, parte en dos.'],
    ['Verbos activos', '"Apunta el partido", no "se procede a apuntar el partido".'],
    ['Sin tecnicismos', 'No usar SaaS, KPI, CRM, ROI en comunicación a familias.'],
    ['Honestidad', 'Decir lo que NO hacemos. Decir el precio sin asteriscos.'],
    ['Cero emojis', 'En documentación oficial. Permitidos en notificaciones push (1 por mensaje).'],
    ['Inclusivo', '"Tu hijo o hija", "los niños y niñas". Nunca solo masculino.'],
]
t = Table(rules2, colWidths=[3.5*cm, 13.5*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,-1), NEON_GREEN),
    ('TEXTCOLOR', (0,0), (0,-1), NAVY),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('BACKGROUND', (1,0), (1,-1), GREY_LIGHT),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.4, white),
]))
story.append(t)

story.append(PageBreak())

# ===== 7. Aplicaciones =====
story.append(Paragraph('07 · Aplicaciones de marca', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

apps = [
    ['Aplicación', 'Especificación'],
    ['App icon (PWA)', '512×512 px · símbolo neón sobre navy · esquinas 22% (iOS auto-mask)'],
    ['Splash screen', 'Navy + símbolo centrado + tagline en cyan abajo'],
    ['Favicon web', '32×32 / 16×16 · solo símbolo'],
    ['Email firma', 'Logo 120 px · nombre Helvetica Bold 14 · cargo muted 11'],
    ['Tarjeta digital', 'vCard con QR a perfil del club. Fondo navy, datos en blanco/cyan.'],
    ['Camisetas / merch', 'Solo símbolo o wordmark sobre tejido oscuro. No mezclar con escudo del club.'],
    ['Slides comerciales', '16:9 · navy fondo · banda neón superior 18 px · tipografía Inter+Barlow'],
    ['Documentos PDF', 'Cabecera navy + nombre doc verde · pie centrado muted'],
    ['Redes sociales', 'IG/TikTok cuadrado o 9:16 · siempre con grano sutil + glow neón'],
]
t = Table(apps, colWidths=[4*cm, 13*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), NAVY),
    ('TEXTCOLOR', (0,0), (-1,0), NEON_GREEN),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.4, MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [GREY_LIGHT, white]),
]))
story.append(t)

story.append(Paragraph('Co-branding con Krujens', H2))
story.append(Paragraph(
    'Cuando aparezca junto al logo de Krujens (parent brand), usar el formato "endorsed":<br/>'
    '<b>FutbolBase</b> + línea vertical neón + <i>by Krujens</i> en muted 9 px.<br/>'
    'Krujens nunca debe dominar visualmente sobre FutbolBase en piezas dirigidas a clubes/familias.', BODY))

story.append(PageBreak())

# ===== 8. Nomenclatura =====
story.append(Paragraph('08 · Nomenclatura y escritura', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

naming = [
    ['Forma correcta', 'Forma incorrecta'],
    ['FutbolBase', 'Futbol Base / Fútbol Base / FUTBOLBASE / Futbolbase'],
    ['FutbolBase Pro / Elite / Starter', 'FutbolBase PRO / Pro de FutbolBase'],
    ['una vertical de Krujens', 'subsidiaria de Krujens / brand de Krujens'],
    ['app FutbolBase', 'aplicación FutbolBase móvil PWA'],
]
t = Table(naming, colWidths=[8.5*cm, 8.5*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,0), NEON_GREEN),
    ('BACKGROUND', (1,0), (1,0), HexColor('#7F1D1D')),
    ('TEXTCOLOR', (0,0), (0,0), NAVY),
    ('TEXTCOLOR', (1,0), (1,0), white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.4, MUTED),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [GREY_LIGHT, white]),
]))
story.append(t)

story.append(Paragraph('Hashtags y handles', H2))
story.append(Paragraph(
    '• Handle oficial: <b>@futbolbase.app</b> (IG, TikTok, X, LinkedIn).<br/>'
    '• Hashtags: #FutbolBase #ElFuturoDelFutbolBase #MenosWhatsAppMasFutbol<br/>'
    '• Dominio: <b>futbolbase.app</b> · email: <b>hola@futbolbase.app</b>', BODY))

story.append(PageBreak())

# ===== 9. Tokens y entrega =====
story.append(Paragraph('09 · Tokens de diseño y entrega', H1))
story.append(HRFlowable(width='100%', color=NEON_GREEN, thickness=1, spaceAfter=10))

story.append(Paragraph('Design tokens (Tailwind / CSS)', H2))
tokens = """colors: {
  navy:        '#050D1A',
  navyLight:   '#0A1628',
  card:        '#0F1B2E',
  neonGreen:   '#00FF87',
  neonGreenD:  '#00E676',
  cyan:        '#00D4FF',
  orange:      '#FF6B00',
  purple:      '#B347FF',
  pink:        '#C2185B',
  text:        '#FFFFFF',
  muted:       '#94A3B8'
},
boxShadow: {
  'glow-green':  '0 0 24px rgba(0,255,135,0.45)',
  'glow-cyan':   '0 0 24px rgba(0,212,255,0.45)',
  'glow-orange': '0 0 24px rgba(255,107,0,0.45)',
  'glow-purple': '0 0 24px rgba(179,71,255,0.45)'
},
borderRadius: { sm: '8px', md: '12px', lg: '16px', xl: '24px' }"""
story.append(Paragraph(f'<font face="Courier" size="8">{tokens.replace(chr(10),"<br/>")}</font>', BODY))

story.append(Paragraph('Assets entregables', H2))
assets = [
    '/brand/logo/futbolbase-primary.svg',
    '/brand/logo/futbolbase-mono-light.svg',
    '/brand/logo/futbolbase-mono-dark.svg',
    '/brand/logo/symbol-only.svg',
    '/brand/icons/app-icon-512.png',
    '/brand/icons/app-icon-192.png',
    '/brand/icons/favicon.ico',
    '/brand/fonts/BarlowCondensed-*.ttf',
    '/brand/fonts/Inter-*.ttf',
    '/brand/templates/slide-deck.pptx',
    '/brand/templates/email-signature.html',
    '/brand/social/instagram-post-template.psd',
    '/brand/social/story-template.psd',
]
for a in assets:
    story.append(Paragraph(f'• <font face="Courier" size="9">{a}</font>', BODY))

story.append(Paragraph('Contacto de marca', H2))
story.append(Paragraph(
    'Cualquier uso del logo, color o tipografía fuera de lo descrito en este manual debe aprobarse por escrito '
    'en <b>brand@krujens.com</b>. Solicitudes de prensa: <b>press@krujens.com</b>.', BODY))

story.append(Spacer(1, 12))
story.append(HRFlowable(width='100%', color=CYAN, thickness=0.6))
story.append(Spacer(1, 6))
story.append(Paragraph(
    'Manual de marca FutbolBase v1.0 · 2026 · © Krujens Holding · Todos los derechos reservados.',
    SMALL))


doc.build(story, onFirstPage=on_cover, onLaterPages=on_pages)
print(f'OK -> {OUT}')
