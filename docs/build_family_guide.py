# -*- coding: utf-8 -*-
"""
Genera el dossier orientado a FAMILIAS, TUTORES y JUGADORES.
Salida: futbolbase-guia-familias.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, Flowable,
)
from reportlab.lib.colors import HexColor

# Paleta legible
NAVY      = HexColor("#0A1628")
GREEN     = HexColor("#00A86B")
GREEN_LT  = HexColor("#E6F8F0")
CYAN      = HexColor("#0077A8")
CYAN_LT   = HexColor("#E0F4FA")
ORANGE    = HexColor("#D45A00")
ORANGE_LT = HexColor("#FFEFE0")
PURPLE    = HexColor("#6B2EA8")
PURPLE_LT = HexColor("#F1E8FB")
GOLD      = HexColor("#B8860B")
GOLD_LT   = HexColor("#FFF6D9")
PINK      = HexColor("#C2185B")
PINK_LT   = HexColor("#FCE4EC")
GREY      = HexColor("#475569")
GREY_LT   = HexColor("#F1F5F9")
LINE      = HexColor("#CBD5E1")
RED       = HexColor("#C0392B")

OUT = "futbolbase-guia-familias.pdf"

ss = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=ss["Heading1"],
    fontName="Helvetica-Bold", fontSize=22, leading=26,
    textColor=NAVY, spaceBefore=4, spaceAfter=10)
H2 = ParagraphStyle("H2", parent=ss["Heading2"],
    fontName="Helvetica-Bold", fontSize=15, leading=18,
    textColor=GREEN, spaceBefore=10, spaceAfter=6)
H3 = ParagraphStyle("H3", parent=ss["Heading3"],
    fontName="Helvetica-Bold", fontSize=11.5, leading=14,
    textColor=NAVY, spaceBefore=6, spaceAfter=3)
BODY = ParagraphStyle("BODY", parent=ss["BodyText"],
    fontName="Helvetica", fontSize=10.5, leading=15,
    textColor=NAVY, spaceAfter=6, alignment=TA_JUSTIFY)
BODY_C = ParagraphStyle("BODYC", parent=BODY, alignment=TA_CENTER)
SMALL = ParagraphStyle("SMALL", parent=BODY, fontSize=8.8, leading=11.5, textColor=GREY)
LBL   = ParagraphStyle("LBL", parent=BODY, fontSize=8, leading=10,
    textColor=GREY, alignment=TA_CENTER, fontName="Helvetica-Bold")
KPIV  = ParagraphStyle("KPIV", parent=BODY, fontSize=22, leading=24,
    textColor=GREEN, alignment=TA_CENTER, fontName="Helvetica-Bold")
QUOTE = ParagraphStyle("QUOTE", parent=BODY, fontSize=11, leading=15,
    textColor=GREY, leftIndent=14, rightIndent=14, spaceBefore=6, spaceAfter=6,
    fontName="Helvetica-Oblique")

def info_box(title, body_html, color=GREEN, bg=GREEN_LT):
    title_style = ParagraphStyle("ibt", parent=H3, textColor=color, spaceAfter=4)
    body_style  = ParagraphStyle("ibb", parent=BODY, fontSize=10, leading=14)
    cell = [[Paragraph(title, title_style)],
            [Paragraph(body_html, body_style)]]
    t = Table(cell, colWidths=[16.4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg),
        ("LINEBEFORE",(0,0),(0,-1),3, color),
        ("LEFTPADDING",(0,0),(-1,-1),12),
        ("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),8),
    ]))
    return t

def kpi_card(value, label, color=GREEN, bg=GREEN_LT):
    sv = ParagraphStyle("v", parent=KPIV, textColor=color)
    t = Table([[Paragraph(f"<b>{value}</b>", sv)],
               [Paragraph(label, LBL)]],
              colWidths=[4.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg),
        ("BOX",(0,0),(-1,-1),0.6,color),
        ("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    return t

def section_header(num, title, color=GREEN):
    h = ParagraphStyle("sh", parent=H1, textColor=color)
    sub = ParagraphStyle("shn", parent=SMALL, textColor=GREY,
        fontName="Helvetica-Bold", spaceAfter=2)
    return [Paragraph(f"CAPÍTULO {num}", sub),
            Paragraph(title, h),
            HRFlowable(width="100%", thickness=2, color=color, spaceBefore=2, spaceAfter=12)]

# ===================== PORTADA =====================
def draw_cover(c):
    w, h = A4
    c.setFillColor(NAVY)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    # Bandas neon
    c.setFillColor(HexColor("#00FF87"))
    c.rect(0, h-0.6*cm, w, 0.6*cm, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFB800"))
    c.rect(0, 0, w, 0.4*cm, fill=1, stroke=0)
    # Estrellas decorativas
    import random
    random.seed(42)
    c.setFillColor(HexColor("#00FF87"))
    for _ in range(70):
        x = random.uniform(0, w); y = random.uniform(2*cm, h-2*cm)
        r = random.uniform(0.3, 1.5)
        c.setFillColor(HexColor("#00FF87") if random.random() > 0.5 else HexColor("#00D4FF"))
        c.circle(x, y, r, fill=1, stroke=0)
    # Eyebrow
    c.setFillColor(HexColor("#00FF87"))
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(w/2, h-3*cm, "GUIA PARA FAMILIAS, TUTORES Y JUGADORES")
    # Título
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 50)
    c.drawCentredString(w/2, h-6*cm, "FutbolBase")
    c.setFont("Helvetica", 18)
    c.setFillColor(HexColor("#CBD5E1"))
    c.drawCentredString(w/2, h-7*cm, "La app del club de tu hijo o hija")
    # Línea
    c.setStrokeColor(HexColor("#00FF87"))
    c.setLineWidth(1.2)
    c.line(w/2-3.5*cm, h-7.6*cm, w/2+3.5*cm, h-7.6*cm)
    # Headline grande
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(w/2, h-10.2*cm, "Todo lo que pasa en el club,")
    c.drawCentredString(w/2, h-11.2*cm, "en una sola app.")
    # Pictogramas (3 columnas)
    icons = [
        ("Calendario claro", "del entreno y partido"),
        ("Cuotas transparentes", "y recibos al instante"),
        ("Fotos del partido", "y progreso del jugador"),
    ]
    base_y = h-15.5*cm
    cols_x = [w*0.22, w*0.50, w*0.78]
    c.setStrokeColor(HexColor("#00FF87"))
    c.setLineWidth(0.8)
    for (t1, t2), x in zip(icons, cols_x):
        c.circle(x, base_y, 0.7*cm, fill=0, stroke=1)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(colors.white)
        c.drawCentredString(x, base_y - 1.6*cm, t1)
        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#94A3B8"))
        c.drawCentredString(x, base_y - 2.1*cm, t2)
    # Caja CTA
    c.setStrokeColor(HexColor("#00FF87"))
    c.setLineWidth(0.8)
    c.roundRect(w/2-7*cm, 4.0*cm, 14*cm, 1.8*cm, 12, stroke=1, fill=0)
    c.setFillColor(HexColor("#00FF87"))
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(w/2, 5.2*cm, "GRATIS PARA TI · LA CUOTA LA PAGA SOLO EL CLUB")
    c.setFillColor(HexColor("#94A3B8"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(w/2, 4.5*cm,
        "Disponible en iPhone, Android y navegador  -  Sin instalar nada de la tienda")
    # Footer
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(w/2, 2.6*cm, "UNA SOLUCION KRUJENS")
    c.setFillColor(HexColor("#94A3B8"))
    c.setFont("Helvetica", 8.5)
    c.drawCentredString(w/2, 2.0*cm,
        "futbolbase.app  -  hola@futbolbase.app  -  +34 600 000 000")
    c.drawCentredString(w/2, 1.5*cm, "Guia para familias  -  Edicion 2026")
    c.drawCentredString(w/2, 1.0*cm, "Documento gratuito  -  Compartelo con quien quieras")

def on_cover(canv, doc):
    canv.saveState(); draw_cover(canv); canv.restoreState()

def on_page(canv, doc):
    canv.saveState()
    w, h = A4
    canv.setFillColor(NAVY)
    canv.rect(0, h-1.1*cm, w, 1.1*cm, fill=1, stroke=0)
    canv.setFillColor(HexColor("#00FF87"))
    canv.rect(0, h-1.15*cm, w, 0.05*cm, fill=1, stroke=0)
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 9)
    canv.drawString(1.5*cm, h-0.75*cm, "FutbolBase  -  Guia para familias 2026")
    canv.setFillColor(HexColor("#94A3B8"))
    canv.setFont("Helvetica", 8)
    canv.drawRightString(w-1.5*cm, h-0.75*cm, "Una solucion Krujens")
    # Footer
    canv.setStrokeColor(LINE); canv.setLineWidth(0.4)
    canv.line(1.5*cm, 1.2*cm, w-1.5*cm, 1.2*cm)
    canv.setFillColor(GREY); canv.setFont("Helvetica", 7.8)
    canv.drawString(1.5*cm, 0.7*cm, "futbolbase.app  -  hola@futbolbase.app")
    canv.drawCentredString(w/2, 0.7*cm, "Guia gratuita  -  Compartela libremente")
    canv.drawRightString(w-1.5*cm, 0.7*cm, f"Pagina {doc.page}")
    canv.restoreState()

# ===================== CONTENIDO =====================
story = []
story.append(Spacer(1,1))
story.append(PageBreak())

# ÍNDICE
story += section_header("00", "Lo que vas a encontrar en esta guía", GREEN)
toc = [
    ["1.",  "Carta abierta a las familias",                          "3"],
    ["2.",  "Qué es FutbolBase en 90 segundos",                      "4"],
    ["3.",  "Cómo cambia tu día a día (antes / después)",            "5"],
    ["4.",  "Para PADRES y MADRES — tu vista en la app",             "6"],
    ["5.",  "Para TUTORES LEGALES y representantes",                 "8"],
    ["6.",  "Para tu HIJO o HIJA — su mundo dentro",                 "9"],
    ["7.",  "Para los ABUELOS — modo simplificado",                  "11"],
    ["8.",  "Calendario, avisos y notificaciones",                   "12"],
    ["9.",  "Mensajes — fin de los 14 grupos de WhatsApp",           "13"],
    ["10.", "Cuotas, recibos y pagos — sin sorpresas",               "14"],
    ["11.", "Fotos y vídeos — privacidad ante todo",                 "15"],
    ["12.", "Tus datos y los del menor — explicado claro",           "16"],
    ["13.", "Lo que FutbolBase NO hace (y por qué)",                 "17"],
    ["14.", "Preguntas frecuentes de las familias",                  "18"],
    ["15.", "Cómo empezar paso a paso",                              "20"],
    ["16.", "Soporte, contacto y ayuda",                             "21"],
]
t = Table(toc, colWidths=[1.2*cm, 13.6*cm, 1.6*cm])
t.setStyle(TableStyle([
    ("FONTNAME",(0,0),(-1,-1),"Helvetica"),
    ("FONTSIZE",(0,0),(-1,-1),10.5),
    ("TEXTCOLOR",(0,0),(0,-1),GREEN),
    ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(2,0),(2,-1),GREY),
    ("ALIGN",(2,0),(2,-1),"RIGHT"),
    ("BOTTOMPADDING",(0,0),(-1,-1),7),
    ("TOPPADDING",(0,0),(-1,-1),7),
    ("LINEBELOW",(0,0),(-1,-1),0.3,LINE),
]))
story.append(t)
story.append(PageBreak())

# 1. CARTA ABIERTA
story += section_header("01", "Carta abierta a las familias", GREEN)
story.append(Paragraph("Hola,", BODY))
story.append(Paragraph(
    "Si estás leyendo esta guía es porque el club o academia de tu hijo o hija "
    "está usando — o va a empezar a usar — <b>FutbolBase</b>. No te vamos a vender "
    "nada: la cuota la paga el club, no tú. Para ti, esta app es completamente "
    "gratuita.",
    BODY))
story.append(Paragraph(
    "Sabemos lo que significa tener un peque en un club de fútbol. Significa "
    "saltar entre <b>14 grupos de WhatsApp</b>, intentar acordarte de a qué hora "
    "es el partido del sábado, perseguir al tesorero por el recibo de marzo, no "
    "saber muy bien cómo va tu hijo en el equipo y cruzar los dedos para que las "
    "fotos del partido no acaben en un sitio que no toca.",
    BODY))
story.append(Paragraph(
    "<b>FutbolBase está pensada para que ese caos desaparezca.</b> Una sola app, "
    "una sola pantalla. El calendario filtrado solo a lo de tu hijo. Los recibos "
    "siempre disponibles. Las fotos del partido con consentimiento que tú "
    "controlas. Y, si tu hijo es ya un poco mayor, una tarjeta tipo videojuego "
    "donde ve crecer sus estadísticas según va entrenando.",
    BODY))
story.append(Paragraph(
    "Esta guía te explica todo lo que vas a encontrar. Sin tecnicismos, sin "
    "letra pequeña. Si después de leerla queda alguna duda, al final tienes "
    "nuestro contacto directo. Escríbenos, te respondemos en menos de un día.",
    BODY))
story.append(Paragraph(
    "Bienvenida, bienvenido. Gracias por confiar tu tiempo en leernos.",
    BODY))
story.append(Spacer(1, 14))
story.append(Paragraph("<b>El equipo de FutbolBase</b>", BODY))
story.append(Paragraph("Una solución Krujens · Hecha en España", SMALL))
story.append(PageBreak())

# 2. QUÉ ES EN 90 SEGUNDOS
story += section_header("02", "Qué es FutbolBase en 90 segundos", CYAN)
story.append(info_box("La idea, en una frase",
    "FutbolBase es <b>una sola app</b> que reúne todo lo que afecta a tu hijo o "
    "hija en su club de fútbol: calendario, mensajes, recibos, fotos del "
    "partido, evolución como jugador y comunicación con el entrenador.",
    GREEN, GREEN_LT))
story.append(Spacer(1, 8))

story.append(Paragraph("Lo que cubre, en 5 puntos", H3))
puntos = [
    ("📅", "Calendario filtrado",
     "Solo los entrenos y partidos de tu hijo. Sin ruido del resto del club. "
     "Con direcciones, mapas y recordatorios automáticos."),
    ("💬", "Mensajes ordenados",
     "Comunicados del club, mensajes del entrenador y avisos importantes en "
     "un buzón único. Marcado de leído. Sin stickers ni audios de 4 minutos."),
    ("💳", "Cuotas y recibos",
     "Domiciliación clara, pagos por Bizum o tarjeta, recibos descargables "
     "siempre que los necesites. Cero hojas de cálculo perdidas."),
    ("📸", "Fotos y vídeos del partido",
     "Compartidas por el delegado del equipo. Solo a las familias "
     "autorizadas. Tú decides si quieres que tu hijo aparezca."),
    ("⭐", "Tu hijo como protagonista",
     "Su tarjeta tipo videojuego, sus estadísticas, sus logros. Le motiva "
     "entrenar y a ti te da visibilidad real de cómo evoluciona."),
]
for icon, t_, body in puntos:
    row = Table([[Paragraph(f"<font size='18'>{icon}</font>", BODY_C),
                  Paragraph(f"<b>{t_}.</b> {body}", BODY)]],
                colWidths=[1.4*cm, 15*cm])
    row.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    story.append(row)
story.append(Spacer(1, 8))

story.append(Paragraph("Cómo se instala (spoiler: no se instala)", H3))
story.append(Paragraph(
    "FutbolBase es una <b>aplicación web instalable</b>. Eso significa que "
    "<b>no tienes que entrar a la App Store ni a Google Play</b>. Cuando "
    "el club te dé acceso, recibirás un enlace por email o SMS. Lo abres, "
    "le das a ‘Añadir a la pantalla de inicio’ y ya tienes el icono en "
    "el móvil como una app más. Funciona igual en iPhone (desde iOS 14) y "
    "Android (desde Android 8).",
    BODY))
story.append(Paragraph(
    "Si prefieres no instalar nada, puedes usar FutbolBase desde el "
    "navegador del ordenador. Funciona igual. Tus datos están en la nube "
    "y los ves desde cualquier dispositivo.",
    BODY))
story.append(PageBreak())

# 3. ANTES / DESPUÉS
story += section_header("03", "Cómo cambia tu día a día", ORANGE)
story.append(Paragraph(
    "Comparativa honesta de cómo es la vida de una familia <b>antes</b> de "
    "FutbolBase y <b>después</b>. No exageramos: es lo que nos cuentan las "
    "familias que ya lo usan en clubes piloto.",
    BODY))
story.append(Spacer(1, 6))

ad = [
    ["Situación", "ANTES (lo que conoces)", "DESPUÉS (con FutbolBase)"],
    ["Hora del partido del sábado",
     "Pregunto a 3 padres distintos en el WhatsApp del equipo. Alguien dice las 10, otro las 10:15. Llego sin saber.",
     "Notificación 24 h y 1 h antes con hora, dirección y mapa. Cero dudas."],
    ["Recibo de la cuota",
     "Lo recibí en marzo, ahora no lo encuentro y mi gestor me lo pide para Hacienda.",
     "Entro a la app, sección ‘Recibos’, descargo los 12 meses en PDF en 30 segundos."],
    ["Cómo va mi hijo",
     "Pregunto al entrenador en la salida del entreno; me dice ‘bien, bien’. Sin más detalle.",
     "Veo su tarjeta con asistencias, goles, evolución física, mensaje trimestral del entrenador."],
    ["Fotos del partido",
     "Las suben a un Drive público. Cualquiera con el enlace las ve. Me incomoda.",
     "Solo las familias del equipo pueden verlas. Tú decides si tu hijo aparece o no."],
    ["Cambiar el número de cuenta",
     "Mando un email al tesorero. Nadie lo lee. Devuelven el siguiente recibo.",
     "Lo cambio yo desde la app en 1 minuto. Aplicado al instante."],
    ["Mi hijo se aburre y quiere dejar el fútbol",
     "Me entero en mayo cuando me dice que no quiere ir más.",
     "El entrenador detecta su bajón anímico (si nos lo permites) y avisa. Hablamos a tiempo."],
    ["Avisar de que mi hijo falta al entreno",
     "Escribo al WhatsApp del equipo, queda enterrado bajo 80 mensajes.",
     "Botón ‘No puedo asistir’ en el evento. El entrenador lo recibe sin caos."],
    ["Mi suegra quiere ver fotos del nieto",
     "Le reenvío fotos por WhatsApp, las pierde, me pregunta de nuevo.",
     "Le doy acceso ‘modo abuelo’: ve calendario y fotos sin nada complicado."],
]
t = Table(ad, colWidths=[3.6*cm, 6.4*cm, 6.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), NAVY),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BACKGROUND",(2,1),(2,-1), GREEN_LT),
    ("BACKGROUND",(1,1),(1,-1), HexColor("#FAEEEE")),
]))
story.append(t)
story.append(PageBreak())

# 4. PADRES Y MADRES (2 páginas)
story += section_header("04", "Para PADRES y MADRES", PURPLE)
story.append(Paragraph(
    "Aquí está, pantalla por pantalla, lo que vas a ver al entrar en FutbolBase "
    "siendo padre o madre de un jugador del club.",
    BODY))

pantallas = [
    ("Pantalla de inicio",
     "Lo más importante: próximo entreno, próximo partido, mensajes sin "
     "leer, alertas. Si hoy no hay nada, no te molesta con nada. La app es "
     "discreta a propósito."),
    ("Mi hijo o hija",
     "Su perfil completo: foto, dorsal, posición, equipo, entrenador, "
     "estadísticas de la temporada, evolución gráfica de los últimos 6 meses, "
     "y mensaje del entrenador (cuando lo escriba, no antes)."),
    ("Calendario",
     "Solo entrenos y partidos del hijo. Cada evento incluye hora, dirección "
     "exacta, mapa, qué equipación llevar y notas del entrenador. Puedes "
     "exportarlo a Google Calendar o Apple Calendar para que aparezca junto "
     "a tu agenda personal."),
    ("Mensajes",
     "Tres pestañas: anuncios oficiales del club (los importantes), del "
     "entrenador del equipo y mensajes 1-a-1 contigo. Marcado claro de "
     "leído / no leído. Botón ‘silenciar 24 h’ si necesitas un respiro."),
    ("Cuotas",
     "Estado actual (al día, pendiente, vencida), historial de pagos, "
     "próximo cargo programado, descarga de recibos, cambio de cuenta o "
     "tarjeta, opción de fraccionamiento si el club lo permite."),
    ("Galería",
     "Fotos y vídeos del último partido y del entrenamiento, subidas por el "
     "delegado del equipo. Solo familias del equipo pueden verlas. Descarga "
     "en alta calidad. Borrado automático a los 90 días por privacidad."),
    ("Documentos",
     "Certificado de pertenencia (útil para becas, IRPF, colegio), "
     "autorizaciones firmadas, consentimientos de imagen, ficha federativa, "
     "seguro deportivo. Todo descargable cuando lo necesites."),
    ("Encuestas",
     "El club te pregunta cosas: equipación nueva, fecha de cena fin de "
     "temporada, opinión sobre la planificación. Tu voto cuenta. Resultados "
     "transparentes."),
    ("Mi cuenta",
     "Tus datos personales, contacto de emergencia, preferencias de "
     "notificaciones (cuándo te avisamos y cuándo no), y los "
     "consentimientos que has dado al club (revocables 1-click)."),
]
for ti, body in pantallas:
    story.append(info_box(ti, body, PURPLE, PURPLE_LT))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# 4 (cont) - Beneficios concretos
story.append(Paragraph("Tres cosas que probablemente vas a agradecer", H3))
beneficios = [
    ("Tiempo recuperado",
     "Familias en piloto reportan un ahorro medio de <b>2-3 horas a la "
     "semana</b> antes dedicadas a buscar info en grupos de WhatsApp, "
     "preguntar horarios y reenviar mensajes a tu pareja.", GREEN, GREEN_LT),
    ("Tranquilidad sobre tu hijo",
     "Por primera vez tienes datos objetivos de su evolución. Si va bien, "
     "lo ves. Si algo no va, también. Se acabó el ‘bien, bien’ del entrenador "
     "en la puerta del campo.", CYAN, CYAN_LT),
    ("Confianza con el club",
     "Ver dónde se va tu cuota, qué decide la junta, cuándo cambian las "
     "cosas y por qué. Un club transparente es un club al que quieres seguir "
     "perteneciendo.", ORANGE, ORANGE_LT),
]
for ti, body, c, bg in beneficios:
    story.append(info_box(ti, body, c, bg))
    story.append(Spacer(1, 5))

story.append(Spacer(1, 10))
story.append(Paragraph(
    "<i>“Yo era de los que decía que ya tenía bastantes apps en el móvil. "
    "A los 15 días no me imaginaba la temporada sin esto. Sobre todo por las "
    "fotos de mi hijo, que antes acababan en un Drive abierto.”</i> — "
    "Padre, jugador alevín, club piloto Valencia.",
    QUOTE))

story.append(PageBreak())

# 5. TUTORES LEGALES
story += section_header("05", "Para TUTORES LEGALES y representantes", CYAN)
story.append(Paragraph(
    "Si eres el tutor o tutora legal de un menor, o un representante autorizado "
    "(abuelo, tío, custodio compartido), FutbolBase reconoce tu rol con "
    "permisos específicos. Esta página explica cómo funciona en los casos "
    "menos típicos.",
    BODY))

casos = [
    ("Custodia compartida",
     "Ambos progenitores pueden tener cuentas independientes con acceso "
     "completo al perfil del menor. Cada uno gestiona su domiciliación. "
     "Las decisiones que requieren ambas firmas (autorizaciones de viaje, "
     "consentimientos) se piden a los dos por separado."),
    ("Tutor legal no biológico",
     "Documentación acreditativa subida una vez al sistema (resolución "
     "judicial o certificado de tutela). Acceso pleno equiparable al de "
     "un progenitor. El club valida la documentación."),
    ("Familia de acogida",
     "Acceso temporal por temporada con renovación cada año deportivo. "
     "Las administraciones competentes pueden tener acceso de lectura "
     "supervisado si así lo establece el régimen de acogimiento."),
    ("Representante deportivo (jugador 16+)",
     "A partir de 16 años el jugador puede autorizar a un agente "
     "registrado para acceder a sus datos deportivos (ranking, scouting). "
     "Acceso limitado y revocable. Nunca incluye datos económicos del "
     "club ni información de menores del equipo."),
    ("Familias monoparentales",
     "Sin diferencia funcional. Toda la app está diseñada para que un solo "
     "adulto pueda gestionarla cómodamente. No hacemos suposiciones sobre "
     "el modelo familiar."),
    ("Otros adultos autorizados",
     "El padre/madre/tutor puede dar acceso ‘invitado’ a un familiar de "
     "confianza (abuelo, tío, monitor de extraescolar) con permisos "
     "limitados: solo calendario y fotos, sin datos económicos ni "
     "comunicación con el entrenador."),
]
for t_, body in casos:
    story.append(info_box(t_, body, CYAN, CYAN_LT))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# 6. JUGADOR (2 páginas)
story += section_header("06", "Para tu HIJO o HIJA — su mundo dentro", GOLD)
story.append(Paragraph(
    "Esta es la parte que más le va a gustar. FutbolBase tiene una experiencia "
    "pensada como un videojuego ligero: el chaval entra a verse a sí mismo "
    "como protagonista, no a hacer trámites.",
    BODY))

story.append(Paragraph("Su tarjeta tipo videojuego", H3))
story.append(Paragraph(
    "Lo primero que ve es <b>su tarjeta personal estilo cromo coleccionable</b>. "
    "Foto, dorsal, posición, equipo. Y debajo, sus atributos en 4 categorías: "
    "<b>físico, técnico, mental y juego en equipo</b>. Cada atributo va de 0 "
    "a 99 y sube cuando entrena, cuando asiste con regularidad y cuando el "
    "entrenador valora su semana.",
    BODY))
story.append(Paragraph(
    "Puede personalizar el fondo de la tarjeta, el color, los efectos (foil, "
    "holográfica, edición especial). Y puede compartirla con sus amigos del "
    "club como una imagen, sin filtrar datos personales.",
    BODY))

story.append(Paragraph("Sus estadísticas y récords", H3))
stats = [
    ["Métrica", "Qué ve el jugador"],
    ["Asistencia",        "Racha actual (‘llevas 8 entrenos seguidos’), récord histórico, % de la temporada."],
    ["Goles y asistencias","Por partido y acumulados de la temporada. Comparados con la media del equipo (anonimizada)."],
    ["Minutos jugados",   "Para que sepa cuánto rola con el equipo. Útil para hablar con el entrenador con datos."],
    ["Test físicos",      "Sprint, salto, agilidad. Comparado con su anterior medición. Le motiva mejorar."],
    ["MVPs y reconocimientos","Cuántas veces ha sido elegido mejor del partido. Se lo cuenta a sus amigos."],
]
t = Table(stats, colWidths=[4*cm, 12.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), GOLD),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9.4),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
]))
story.append(t)

story.append(Paragraph("Logros desbloqueables (badges)", H3))
story.append(Paragraph(
    "Pequeñas medallas que aparecen cuando hace algo notable: ‘Primera "
    "asistencia’, ‘Hat-trick’, ‘Portería a cero’, ‘Racha 10 entrenos’, "
    "‘MVP del mes’, ‘Compañero del año’ (votado por el equipo). Cada badge "
    "tiene un diseño único y se queda en su perfil para siempre.",
    BODY))

story.append(PageBreak())

# 6 (cont) - jugador parte 2
story.append(Paragraph("Por edades — qué activamos según el jugador", H3))
edades = [
    ["Edad", "Qué tiene activado", "Qué bloqueamos por seguridad"],
    ["6-9 años",   "Calendario, fotos, tarjeta básica. Cuenta gestionada por padre.", "Chat libre, ranking visible, datos físicos sensibles."],
    ["10-12 años", "Tarjeta tipo FIFA, badges, retos del entrenador, calendario.",     "Chat 1-a-1 con personas no autorizadas, fotos a redes externas."],
    ["13-15 años", "Tarjeta completa, ranking del equipo, retos, diario emocional.",   "Compartir datos físicos sin autorización del tutor."],
    ["16+ años",   "Experiencia completa, posibilidad de compartir scouting con agentes autorizados.", "Solo bloqueos a petición del tutor o del club."],
]
t = Table(edades, colWidths=[2.6*cm, 7*cm, 6.8*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), NAVY),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("ALIGN",(0,0),(0,-1),"CENTER"),
]))
story.append(t)
story.append(Spacer(1, 8))

story.append(info_box("Diseñada para no ser adictiva",
    "A diferencia de las redes sociales, FutbolBase <b>no tiene scroll "
    "infinito, no tiene likes públicos, no tiene comentarios libres entre "
    "menores</b>. Los badges son finitos, el ranking está anonimizado y "
    "solo se chatea con personas autorizadas del club. Queremos engancharle "
    "al fútbol, no a la pantalla.",
    GREEN, GREEN_LT))

story.append(Spacer(1, 8))
story.append(info_box("Diario emocional (a partir de 13 años)",
    "Una pestaña privada donde el jugador anota cómo se sintió en cada "
    "entreno (de 1 a 5 caras). <b>Solo el coordinador deportivo lo ve "
    "AGREGADO, nunca individualmente sin permiso del menor</b>. Sirve para "
    "detectar bajones anímicos a tiempo y prevenir abandonos. Tu hijo "
    "puede desactivarlo cuando quiera.",
    PURPLE, PURPLE_LT))

story.append(Spacer(1, 6))
story.append(Paragraph(
    "<i>“Mi hijo abre la app antes de cada entreno para ver si su asistencia "
    "perfecta sigue intacta. Antes ni recordaba si tenía que ir.”</i> — "
    "Madre de jugador alevín, club piloto Valencia.",
    QUOTE))

story.append(PageBreak())

# 7. ABUELOS
story += section_header("07", "Para los ABUELOS — modo simplificado", PINK)
story.append(Paragraph(
    "Los abuelos son parte de la familia del jugador. Pero no tienen por qué "
    "lidiar con apps complicadas. Por eso hicimos el ‘modo abuelo’: una vista "
    "súper simplificada con letra grande, solo dos cosas y nada más.",
    BODY))
story.append(Spacer(1, 4))

abuelo = [
    ("📅", "Calendario",
     "Cuándo juega el nieto y dónde. Si quieren ir a verle, basta con "
     "abrir la app: hora, dirección y mapa con un toque."),
    ("📸", "Fotos del partido",
     "La galería del último partido. Pueden descargarlas en alta y "
     "guardarlas en su móvil, sin saber qué es ‘la nube’ ni preocuparse "
     "por permisos. Las fotos son de su nieto, ya están autorizadas."),
]
for icon, t_, body in abuelo:
    row = Table([[Paragraph(f"<font size='28'>{icon}</font>", BODY_C),
                  Paragraph(f"<b>{t_}.</b> {body}", BODY)]],
                colWidths=[2*cm, 14.4*cm])
    row.setStyle(TableStyle([
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("LEFTPADDING",(0,0),(-1,-1),0),
        ("BOTTOMPADDING",(0,0),(-1,-1),10),
    ]))
    story.append(row)

story.append(Spacer(1, 4))
story.append(info_box("Cómo se activa",
    "El padre o madre del jugador entra a su pantalla, sección ‘Mi cuenta · "
    "Familiares’, y añade el email o teléfono del abuelo. El abuelo recibe "
    "un enlace, le da a ‘instalar’ y ya tiene el acceso simplificado. "
    "Puedes quitarle el acceso cuando quieras con un toque.",
    PINK, PINK_LT))

story.append(Spacer(1, 8))
story.append(Paragraph("Características del modo abuelo", H3))
feats = [
    "Letra un 30 % más grande que la vista normal.",
    "Botones grandes, sin menús anidados.",
    "Sin notificaciones intrusivas (solo el día del partido, 2 h antes).",
    "Sin acceso a datos económicos ni a chats con el entrenador.",
    "Sin posibilidad de cambiar configuraciones por error.",
    "Modo claro por defecto (mejor visibilidad para vista cansada).",
]
for f in feats:
    story.append(Paragraph(f"<font color='{PINK.hexval()[0:7]}'><b>·</b></font>  {f}", BODY))

story.append(PageBreak())

# 8. CALENDARIO
story += section_header("08", "Calendario, avisos y notificaciones", GREEN)
story.append(Paragraph(
    "Es la sección más usada con diferencia. Aquí explicamos qué te avisa "
    "FutbolBase, cuándo y cómo puedes silenciarlo si necesitas un respiro.",
    BODY))

story.append(Paragraph("Tipos de eventos que verás", H3))
events = [
    ["Tipo", "Color", "Cuándo te avisamos"],
    ["Entrenamiento",       "Azul",      "1 hora antes (configurable)."],
    ["Partido oficial",     "Verde",     "24 h antes y 2 h antes."],
    ["Partido amistoso",    "Verde claro","24 h antes."],
    ["Reunión de padres",   "Naranja",   "48 h antes y el mismo día."],
    ["Acto del club",       "Morado",    "Una semana antes y el día anterior."],
    ["Cambio de horario",   "Rojo",      "Inmediatamente cuando se publica."],
    ["Cancelación",         "Gris",      "Inmediatamente cuando se publica."],
]
t = Table(events, colWidths=[5*cm, 4*cm, 7.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), GREEN),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9.4),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
]))
story.append(t)

story.append(Paragraph("Tú decides cuándo molestamos y cuándo no", H3))
story.append(Paragraph(
    "En ‘Mi cuenta · Notificaciones’ puedes configurar:",
    BODY))
notif = [
    "Horario silencioso: por defecto 22:30-08:00. Modificable.",
    "Tipos a recibir: solo lo crítico, todo, o nada.",
    "Canales: solo push, push + email, solo email, ninguno.",
    "Modo vacaciones: silencia todo durante un rango de fechas.",
    "Días sin partido: si tu hijo no juega esa semana, no te molestamos.",
]
for f in notif:
    story.append(Paragraph(f"<font color='{GREEN.hexval()[0:7]}'><b>·</b></font>  {f}", BODY))

story.append(Spacer(1, 6))
story.append(info_box("Sincronización con tu calendario personal",
    "Puedes suscribir el calendario de FutbolBase a Google Calendar, Apple "
    "Calendar u Outlook con un solo enlace. Los eventos del club aparecen "
    "junto a tu agenda personal, con el color que tú elijas. Si el club "
    "cambia algo, se actualiza automáticamente.",
    CYAN, CYAN_LT))

story.append(PageBreak())

# 9. MENSAJES
story += section_header("09", "Mensajes — fin de los 14 grupos de WhatsApp", CYAN)
story.append(Paragraph(
    "Hablemos del problema de fondo: WhatsApp es genial para cosas personales, "
    "pero <b>terrible</b> para gestionar un club. La info importante se pierde "
    "entre stickers, los audios de 4 minutos sustituyen a un mensaje claro, "
    "y los grupos crecen hasta volverse inhabitables.",
    BODY))

story.append(Paragraph("Qué hace FutbolBase distinto", H3))
diff = [
    ("Anuncios oficiales separados",
     "Lo que dice la junta o el coordinador va en una pestaña diferente. "
     "No se mezcla con bromas o mensajes del día a día. Si hay algo "
     "importante, lo encuentras."),
    ("Confirmación de lectura",
     "El club sabe quién ha leído el comunicado y quién no. Si tú no lo "
     "leíste, te lo recuerda al día siguiente con prioridad."),
    ("Mensajes 1-a-1 con el entrenador",
     "Sin grupo. Solo tú y el entrenador. Con horario configurable: "
     "mensajes fuera de las 9-21h llegan en cola hasta el siguiente día "
     "hábil. El entrenador descansa, tú también."),
    ("Sin reenvíos masivos",
     "No se puede reenviar contenido fuera del club. Si alguien intenta "
     "abusar (spam, contenido inapropiado), la moderación lo bloquea."),
    ("Búsqueda real",
     "Buscas ‘equipación’ y aparecen los 3 mensajes que mencionan el "
     "tema. En WhatsApp, suerte. En FutbolBase, búsqueda completa."),
]
for ti, body in diff:
    story.append(info_box(ti, body, CYAN, CYAN_LT))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 6))
story.append(info_box("¿Y si quiero seguir usando WhatsApp para hablar con otros padres?",
    "Sigue usándolo, sin problema. Lo personal es personal. FutbolBase no "
    "intenta sustituir tu vida social con los padres del equipo. Solo "
    "sustituye el caos institucional del club.",
    GREEN, GREEN_LT))

story.append(PageBreak())

# 10. CUOTAS
story += section_header("10", "Cuotas, recibos y pagos — sin sorpresas", ORANGE)
story.append(Paragraph(
    "El dinero es delicado. Por eso esta sección es de las más cuidadas. "
    "Aquí te explicamos exactamente cómo se gestionan los pagos, qué decides "
    "tú y qué decide el club.",
    BODY))

story.append(Paragraph("Qué decides tú", H3))
dec = [
    "El método de pago: domiciliación SEPA, Bizum o tarjeta (entre los que el club permita).",
    "El número de cuenta o tarjeta. Cambiable las veces que necesites.",
    "Si quieres recibir el recibo por email, push o ambos.",
    "Si quieres notificación por adelantado del próximo cargo (recomendado).",
    "Si quieres descargar todos los recibos del año en un único PDF (útil para Hacienda).",
]
for d in dec:
    story.append(Paragraph(f"<font color='{ORANGE.hexval()[0:7]}'><b>·</b></font>  {d}", BODY))

story.append(Paragraph("Qué decide el club", H3))
clb = [
    "El importe de la cuota y la frecuencia (mensual, trimestral, anual).",
    "Si permite fraccionamientos en plazos.",
    "Las penalizaciones por impago (si las hay).",
    "Las becas y descuentos (familia numerosa, hermanos, social).",
    "Las cuotas extraordinarias (equipación, viaje, torneo) y si son opt-in.",
]
for d in clb:
    story.append(Paragraph(f"<font color='{NAVY.hexval()[0:7]}'><b>·</b></font>  {d}", BODY))

story.append(Spacer(1, 6))
story.append(info_box("Si tienes un problema económico puntual",
    "Esto es importante. Si una temporada se te complica y no puedes pagar la "
    "cuota a tiempo, FutbolBase incluye una opción <b>‘Hablar con el club’</b> "
    "discreta y privada. El tesorero o presidente recibe el mensaje sin que "
    "el resto del club lo sepa, y puede ofrecerte un plan personalizado, una "
    "beca social o un fraccionamiento. Cero estigma, cero papeleos delante de "
    "otros padres.",
    GREEN, GREEN_LT))

story.append(Spacer(1, 6))
story.append(info_box("Lo que NUNCA verás",
    "Cobros sorpresa sin aviso previo. Comisiones ocultas. Recibos sin "
    "concepto claro. Si ves algo que no encaja, escríbenos a "
    "<b>familias@futbolbase.app</b> y lo resolvemos en menos de 24 h.",
    RED, HexColor("#FAEEEE")))

story.append(PageBreak())

# 11. FOTOS Y VIDEOS
story += section_header("11", "Fotos y vídeos — privacidad ante todo", PURPLE)
story.append(Paragraph(
    "Las fotos de tu hijo o hija son <b>tuyas y suyas</b>. FutbolBase está "
    "diseñada con esa premisa. Aquí te explicamos exactamente cómo funciona "
    "el consentimiento de imagen y qué decides tú en cada momento.",
    BODY))

story.append(Paragraph("Tres niveles de consentimiento que tú controlas", H3))
nivs = [
    ["Nivel", "Para qué sirve", "Tú decides"],
    ["Imágenes internas",
     "Fotos solo visibles para las familias del equipo (galería privada, álbum del partido).",
     "Sí o no, en cualquier momento."],
    ["Web del club",
     "Imágenes que el club puede usar en su web pública o boletines internos.",
     "Sí, no, o solo en grupo (no en primer plano)."],
    ["Redes sociales del club",
     "Imágenes que el club puede publicar en Instagram, X o Facebook del club.",
     "Sí, no, o solo en grupo."],
]
t = Table(nivs, colWidths=[3.6*cm, 7.4*cm, 5.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), PURPLE),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
]))
story.append(t)

story.append(Paragraph("Lo importante: revocación inmediata", H3))
story.append(Paragraph(
    "Si en cualquier momento decides retirar el consentimiento — porque ha "
    "cambiado tu situación, porque tu hijo te lo pide, o porque simplemente "
    "ya no te apetece — entras en ‘Mi cuenta · Consentimientos’ y lo "
    "desactivas. <b>Las fotos se ocultan inmediatamente</b> de la app y se "
    "marcan para retirada de la web y redes en menos de 7 días. Sin "
    "preguntas, sin papeleo, sin ‘ya hablaremos’.",
    BODY))

story.append(Spacer(1, 6))
story.append(info_box("¿Qué pasa con las fotos antiguas?",
    "Cuando revocas un consentimiento, se aplica también a las fotos "
    "<b>históricas</b> donde aparece tu hijo. No es solo de aquí en adelante: "
    "es retroactivo. La RGPD lo exige y nosotros lo cumplimos.",
    GREEN, GREEN_LT))

story.append(Spacer(1, 6))
story.append(info_box("Borrado automático por defecto",
    "Las fotos del partido y del entrenamiento se borran automáticamente "
    "<b>a los 90 días</b>. Si quieres conservarlas, descárgalas a tu móvil "
    "u ordenador. Si el club quiere conservar alguna para su archivo "
    "histórico, te pide consentimiento expreso.",
    CYAN, CYAN_LT))

story.append(PageBreak())

# 12. DATOS Y RGPD
story += section_header("12", "Tus datos y los del menor", GREEN)
story.append(Paragraph(
    "RGPD en lenguaje claro. Sin parrafadas legales. Lo que de verdad "
    "importa, en 7 puntos.",
    BODY))

rgpd = [
    ("¿Quién es dueño de los datos?",
     "Tú y el club. <b>FutbolBase no es dueño de nada</b>. Somos solo el "
     "‘encargado del tratamiento’: cuidamos los datos, pero el club los "
     "controla y tú tienes derechos sobre los del menor."),
    ("¿Dónde están guardados?",
     "En servidores en la Unión Europea (Frankfurt y Madrid). Nunca salen "
     "de la UE salvo casos puntuales bien regulados (procesador de pagos), "
     "y siempre con contratos legales firmados."),
    ("¿Quién puede ver los datos?",
     "Solo las personas autorizadas del club (entrenador del equipo, "
     "coordinador, tesorero) y tú. Otras familias del equipo solo ven lo "
     "público (calendario, alineaciones). Nadie de fuera del club ve nada."),
    ("¿Qué datos del menor recogemos?",
     "Nombre, fecha de nacimiento, foto (si autorizas), ficha federativa, "
     "datos deportivos (asistencia, goles, estadísticas). <b>Nada más</b>. "
     "Sin ubicación, sin contactos del móvil, sin micrófono, sin cámara "
     "(las fotos las suben los adultos del club, no la app sola)."),
    ("¿Y los datos económicos?",
     "Tu IBAN o tarjeta están <b>tokenizados</b>: el club nunca los ve "
     "directamente. Solo ve un identificador anónimo. La pasarela de "
     "pagos (Stripe, regulada en Europa) los procesa con cifrado bancario."),
    ("¿Cuánto tiempo guardamos los datos?",
     "Mientras tu hijo o hija sea miembro del club, más 1 temporada "
     "después por si vuelve. Cuando se da de baja definitiva, los datos "
     "se anonimizan o borran a los 12 meses (lo que pidas). Las facturas "
     "se conservan 6 años por ley fiscal."),
    ("¿Cómo ejerzo mis derechos?",
     "Acceso, rectificación, borrado, portabilidad, oposición. Todo "
     "desde ‘Mi cuenta · Privacidad’ con un botón por cada derecho. O "
     "escribiendo a <b>dpo@futbolbase.app</b>. Respuesta en menos de "
     "30 días, normalmente en 2-3."),
]
for ti, body in rgpd:
    story.append(info_box(ti, body, GREEN, GREEN_LT))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# 13. LO QUE NO HACE
story += section_header("13", "Lo que FutbolBase NO hace (y por qué)", ORANGE)
story.append(Paragraph(
    "Honestidad ante todo. Hay cosas que <b>deliberadamente</b> no hacemos. "
    "No es que se nos olviden — es que pensamos que no deberían hacerse.",
    BODY))

nono = [
    ("No vendemos los datos a terceros",
     "Nunca. Punto. Nuestro modelo es que el club nos paga; no necesitamos "
     "monetizar tu información ni la del menor. Si alguna vez cambia esto, "
     "te lo decimos antes con 90 días de antelación y puedes irte."),
    ("No mostramos publicidad",
     "Cero anuncios. Cero patrocinadores intrusivos. Solo el escudo del "
     "club y, si el club lo decide, alguno de sus patrocinadores propios "
     "en una zona definida (no pop-ups, no banners agresivos)."),
    ("No usamos algoritmos de adicción",
     "Sin scroll infinito. Sin notificaciones falsas para que vuelvas. "
     "Sin ‘alguien comentó tu foto’ inventado. La app funciona cuando "
     "necesitas algo del club; el resto del tiempo es invisible."),
    ("No hacemos chats abiertos entre menores",
     "Los chats son siempre 1-a-1 con un adulto autorizado del club, "
     "o canales de equipo moderados por el entrenador. Nunca grupos "
     "libres entre menores sin supervisión."),
    ("No pedimos acceso a tus contactos, ubicación o cámara",
     "Cuando instalas la app, no te pedimos permisos del móvil que no "
     "sean estrictamente necesarios. Las fotos las suben los adultos del "
     "club desde sus dispositivos, no la app desde el tuyo."),
    ("No reemplazamos a los profesionales",
     "Si tu hijo está triste, ansioso o tiene problemas, FutbolBase "
     "puede ayudar a detectarlo, pero <b>no es psicólogo, ni médico, ni "
     "trabajador social</b>. Damos señales; los humanos toman decisiones."),
]
for ti, body in nono:
    story.append(info_box(ti, body, ORANGE, ORANGE_LT))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# 14. FAQ - 2 páginas
story += section_header("14", "Preguntas frecuentes de las familias", CYAN)
faqs = [
    ("¿Tengo que pagar yo algo por usar FutbolBase?",
     "No. La app es gratuita para las familias y los jugadores. La cuota mensual la paga el club al fabricante. Tú no pagas un céntimo extra."),
    ("¿Puedo seguir hablando por WhatsApp con otros padres?",
     "Por supuesto. FutbolBase no quita tu vida social. Solo sustituye los grupos institucionales del club. Lo personal sigue donde tú quieras."),
    ("¿Qué pasa si no quiero usar la app?",
     "Habla con el club. La mayoría puede ofrecerte una vía alternativa (email, papel) para lo esencial. No deberías ser obligado a usar tecnología que no te gusta. Eso sí, perderás funcionalidades como el calendario filtrado, las fotos y la tarjeta del jugador."),
    ("¿Funciona en móviles antiguos?",
     "Sí. Funciona en iPhone desde iOS 14 (año 2020) y Android desde la versión 8 (año 2017). Cubrimos el 99 % de móviles en España."),
    ("¿Mi hijo necesita su propio móvil para usarla?",
     "No. Hasta los 12 años, la app la gestiona el padre o madre desde su móvil. A partir de 13 años, si tienes un móvil propio, puede tener su propia cuenta vinculada a la tuya."),
    ("¿Y si tenemos custodia compartida y los dos queremos acceder?",
     "Cada progenitor puede tener su propia cuenta. Ambos ven lo mismo del menor. Cada uno gestiona su domiciliación. Los consentimientos importantes se piden a ambos."),
    ("Mi hijo es introvertido y no quiere que lo vean en fotos. ¿Qué hago?",
     "Vas a ‘Consentimientos · Imagen’ y desactivas las fotos. El delegado del equipo recibe el aviso y deja de etiquetarle. Si ya hay fotos antiguas, se ocultan automáticamente."),
    ("¿Puedo dar acceso a la abuela?",
     "Sí. ‘Mi cuenta · Familiares’ → añadir email o teléfono → eliges ‘modo abuelo’ (vista simplificada). La abuela recibe un enlace, lo instala y ya está."),
    ("¿La app me espía? ¿Lee mis mensajes de WhatsApp?",
     "No. FutbolBase solo ve lo que pasa <b>dentro de FutbolBase</b>. No tiene acceso a tus contactos, mensajes, fotos personales, ubicación, micrófono ni cámara. Cuando la instalas, no te pedimos esos permisos."),
    ("¿Puedo borrar todos los datos de mi hijo si me voy del club?",
     "Sí. ‘Mi cuenta · Privacidad · Borrado de datos’. Te avisamos de qué se conserva por ley (facturas: 6 años) y qué se borra inmediatamente. Te enviamos un certificado de borrado por email."),
    ("¿Y si la empresa cierra? ¿Mis datos desaparecen?",
     "Tenemos un acuerdo legal de continuidad: si FutbolBase deja de operar, el club recibe todos los datos en CSV abierto y dispone de 3 meses para migrar a otra plataforma con tus datos intactos."),
    ("Mi hijo está en una academia privada, no en un club federado. ¿Funciona igual?",
     "Sí, exactamente igual. FutbolBase está pensada tanto para clubes federados como para academias privadas, escuelas municipales y campus de verano."),
]
for q, a in faqs:
    story.append(Paragraph(f"<b>· {q}</b>",
        ParagraphStyle("faqq", parent=BODY, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=2)))
    story.append(Paragraph(a, ParagraphStyle("faqa", parent=BODY, leftIndent=12, spaceAfter=8)))
story.append(PageBreak())

# 15. CÓMO EMPEZAR
story += section_header("15", "Cómo empezar — paso a paso", GREEN)
story.append(Paragraph(
    "Si tu club ya está usando FutbolBase, sigue estos pasos. Tardarás unos "
    "10 minutos. Si tu club no la usa todavía, al final de esta sección tienes "
    "qué hacer.",
    BODY))

steps = [
    ("Paso 1 — Recibe el enlace de tu club",
     "El club te envía un email o SMS con un enlace personalizado. Asunto "
     "tipo: ‘Bienvenida a FutbolBase, [nombre del club]’. Si no lo encuentras, "
     "revisa la carpeta de Spam o Promociones.", GREEN),
    ("Paso 2 — Abre el enlace en tu móvil",
     "Le das al enlace. Se abre en el navegador. NO descargas nada. Lo que "
     "ves es ya la app.", CYAN),
    ("Paso 3 — Crea tu contraseña",
     "Te pedirá tu nombre, apellidos y crear una contraseña. Datos del menor "
     "ya están precargados por el club (no tienes que volver a teclearlos).", ORANGE),
    ("Paso 4 — Instala el icono en tu móvil",
     "El navegador te pregunta si quieres ‘Añadir a la pantalla de inicio’. "
     "Le dices que sí. Aparece el icono verde de FutbolBase en tu móvil "
     "como una app más.", PURPLE),
    ("Paso 5 — Configura tus consentimientos",
     "La primera vez te pregunta qué consientes (uso de imagen del menor, "
     "comunicaciones, etc.). Tómate tiempo para leerlo. Cualquiera lo puedes "
     "cambiar después.", GOLD),
    ("Paso 6 — Configura las notificaciones",
     "Decide cuándo quieres que te avisemos. Por defecto: 1 h antes de "
     "entrenos, 24 h antes de partidos, horario silencioso 22:30-08:00. "
     "Cambiable.", GREEN),
    ("Paso 7 — Da acceso a otros familiares (opcional)",
     "Si quieres que tu pareja, o un abuelo, también accedan, los añades "
     "desde ‘Mi cuenta · Familiares’. A cada uno le llega su propio enlace.", CYAN),
    ("Paso 8 — Listo",
     "Ya está. Verás el calendario de tu hijo, los mensajes del club y, en "
     "los próximos días, las primeras fotos del partido si el delegado las "
     "sube. Cualquier duda, escríbenos.", PURPLE),
]
for ti, body, c in steps:
    box = Table([[Paragraph(f"<b>{ti}</b>", ParagraphStyle("st", parent=H3, textColor=c))],
                 [Paragraph(body, BODY)]],
                colWidths=[16.4*cm])
    box.setStyle(TableStyle([
        ("LINEBEFORE",(0,0),(0,-1),3,c),
        ("BACKGROUND",(0,0),(-1,-1),HexColor("#FAFCFE")),
        ("LEFTPADDING",(0,0),(-1,-1),12),
        ("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),5),
        ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    story.append(box)
    story.append(Spacer(1, 4))

story.append(Spacer(1, 8))
story.append(info_box("Si tu club no usa FutbolBase todavía",
    "Habla con el coordinador o con la junta y proponles que lo prueben. "
    "Tienen 30 días gratis para evaluarla, sin compromiso, y se les "
    "devuelven los datos en CSV abierto si no quieren continuar. Si te "
    "preguntan por dónde empezar, diles que escriban a "
    "<b>clubes@futbolbase.app</b> o que reserven una demo en "
    "<b>futbolbase.app/demo</b>.",
    GOLD, GOLD_LT))

story.append(PageBreak())

# 16. SOPORTE
story += section_header("16", "Soporte, contacto y ayuda", PURPLE)
story.append(Paragraph(
    "Si necesitas ayuda, no estás solo. Tienes 4 vías para contactarnos. "
    "Elige la que más cómoda te resulte.",
    BODY))

cont = [
    ("📧", "Email general",
     "<b>familias@futbolbase.app</b><br/>Respuesta en menos de 24 h "
     "(habitualmente en 2-3 horas durante días hábiles).", GREEN, GREEN_LT),
    ("📱", "WhatsApp soporte",
     "<b>+34 600 000 000</b><br/>Lunes a viernes 9-19h. Sábado 10-14h. "
     "Atendido por personas, no chatbots.", CYAN, CYAN_LT),
    ("🏢", "El propio club",
     "Para temas administrativos (cuotas, equipaciones, viajes) "
     "siempre es más rápido escribir directamente al tesorero o "
     "coordinador desde la app.", ORANGE, ORANGE_LT),
    ("🛡️", "Privacidad y datos",
     "<b>dpo@futbolbase.app</b><br/>Para ejercer tus derechos RGPD, "
     "pedir borrado de datos, o cualquier duda sobre privacidad. "
     "Respuesta en menos de 30 días por ley, normalmente en 2-3.", PURPLE, PURPLE_LT),
]
for icon, ti, body, c, bg in cont:
    title = f"<font size='14'>{icon}</font>  <b>{ti}</b>"
    story.append(info_box(title, body, c, bg))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 8))
story.append(Paragraph("Centro de ayuda online", H3))
story.append(Paragraph(
    "Si prefieres buscar tú la respuesta, tenemos guías en vídeo y artículos "
    "explicativos en <b>ayuda.futbolbase.app</b>. Búsqueda completa y temas "
    "ordenados por situación: primer acceso, cambiar contraseña, gestionar "
    "consentimientos, descargar recibos, etc.",
    BODY))

story.append(Spacer(1, 8))
story.append(Paragraph("Sugerencias y mejoras", H3))
story.append(Paragraph(
    "FutbolBase mejora porque las familias nos cuentan qué les falta. Si "
    "echas algo en falta, escríbenos. Tres veces al año publicamos las "
    "mejoras del trimestre con un ‘gracias a [tu nombre o tu club]’ cuando "
    "la idea ha sido tuya.",
    BODY))

story.append(Spacer(1, 16))
story.append(HRFlowable(width="100%", thickness=1.5, color=GREEN, spaceBefore=4, spaceAfter=10))
story.append(Paragraph(
    "Gracias por leer hasta aquí. Tu tiempo es lo más valioso que nos puedes dar.",
    ParagraphStyle("end", parent=BODY, alignment=TA_CENTER,
                   fontName="Helvetica-Oblique", textColor=GREY)))
story.append(Paragraph(
    "Disfruta de la temporada con tu hijo o hija. Nos vemos en el campo.",
    ParagraphStyle("end2", parent=BODY, alignment=TA_CENTER,
                   fontName="Helvetica-Bold", textColor=GREEN)))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "<b>El equipo de FutbolBase · Una solución Krujens</b>",
    BODY_C))

# BUILD
doc = SimpleDocTemplate(OUT, pagesize=A4,
    leftMargin=1.5*cm, rightMargin=1.5*cm,
    topMargin=1.6*cm, bottomMargin=1.6*cm,
    title="FutbolBase · Guia para familias y jugadores",
    author="Krujens Holding",
    subject="Guia de uso para familias, tutores y jugadores",
    keywords="futbolbase, familia, jugador, padres, tutor, app club futbol")

doc.build(story, onFirstPage=on_cover, onLaterPages=on_page)
print(f"OK · generado {OUT}")
