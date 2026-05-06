# -*- coding: utf-8 -*-
"""
Genera el dossier comercial PDF de GRADA para enviar a clientes.
Salida: grada-dossier-comercial.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    ListFlowable, ListItem, KeepTogether, Image, Flowable, HRFlowable,
)
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

# === Paleta corporativa adaptada a PDF (legible en blanco) ===
NAVY      = HexColor("#0A1628")
NAVY_INK  = HexColor("#0A1628")
GREEN     = HexColor("#00A86B")    # verde más oscuro para legibilidad
GREEN_LT  = HexColor("#E6F8F0")
CYAN      = HexColor("#0077A8")
CYAN_LT   = HexColor("#E0F4FA")
ORANGE    = HexColor("#D45A00")
ORANGE_LT = HexColor("#FFEFE0")
PURPLE    = HexColor("#6B2EA8")
PURPLE_LT = HexColor("#F1E8FB")
GOLD      = HexColor("#B8860B")
GOLD_LT   = HexColor("#FFF6D9")
GREY      = HexColor("#475569")
GREY_LT   = HexColor("#F1F5F9")
LINE      = HexColor("#CBD5E1")
RED       = HexColor("#C0392B")

OUT = "grada-dossier-comercial.pdf"

# ====================== ESTILOS ======================
ss = getSampleStyleSheet()

H1 = ParagraphStyle("H1", parent=ss["Heading1"],
    fontName="Helvetica-Bold", fontSize=22, leading=26,
    textColor=NAVY, spaceBefore=4, spaceAfter=10, alignment=TA_LEFT)
H2 = ParagraphStyle("H2", parent=ss["Heading2"],
    fontName="Helvetica-Bold", fontSize=15, leading=18,
    textColor=GREEN, spaceBefore=10, spaceAfter=6, alignment=TA_LEFT)
H3 = ParagraphStyle("H3", parent=ss["Heading3"],
    fontName="Helvetica-Bold", fontSize=11.5, leading=14,
    textColor=NAVY, spaceBefore=6, spaceAfter=3, alignment=TA_LEFT)
BODY = ParagraphStyle("BODY", parent=ss["BodyText"],
    fontName="Helvetica", fontSize=10, leading=14.5,
    textColor=NAVY_INK, spaceAfter=5, alignment=TA_JUSTIFY)
BODY_C = ParagraphStyle("BODYC", parent=BODY, alignment=TA_CENTER)
SMALL = ParagraphStyle("SMALL", parent=BODY, fontSize=8.6, leading=11.5, textColor=GREY)
LBL   = ParagraphStyle("LBL", parent=BODY, fontSize=8, leading=10,
    textColor=GREY, alignment=TA_CENTER, fontName="Helvetica-Bold")
KPIV  = ParagraphStyle("KPIV", parent=BODY, fontSize=22, leading=24,
    textColor=GREEN, alignment=TA_CENTER, fontName="Helvetica-Bold")
QUOTE = ParagraphStyle("QUOTE", parent=BODY, fontSize=10.5, leading=15,
    textColor=GREY, leftIndent=14, rightIndent=14, spaceBefore=6, spaceAfter=6,
    fontName="Helvetica-Oblique")
HERO_TITLE = ParagraphStyle("HERO", parent=H1, fontSize=34, leading=38,
    textColor=colors.white, alignment=TA_CENTER)
HERO_SUB = ParagraphStyle("HEROSUB", parent=BODY, fontSize=13, leading=17,
    textColor=HexColor("#CBD5E1"), alignment=TA_CENTER)
HERO_TAG = ParagraphStyle("HEROTAG", parent=SMALL, fontSize=9, leading=11,
    textColor=HexColor("#00FF87"), alignment=TA_CENTER, fontName="Helvetica-Bold")
WHITE_BODY = ParagraphStyle("WB", parent=BODY, textColor=colors.white)
WHITE_LBL = ParagraphStyle("WLBL", parent=LBL, textColor=HexColor("#94A3B8"))

# ====================== HELPERS ======================
def hr(color=LINE, thick=0.6):
    return HRFlowable(width="100%", thickness=thick, color=color, spaceBefore=4, spaceAfter=8)

def kpi_card(value, label, color=GREEN, bg=GREEN_LT):
    style_v = ParagraphStyle("v", parent=KPIV, textColor=color)
    t = Table([[Paragraph(f"<b>{value}</b>", style_v)],
               [Paragraph(label, LBL)]],
              colWidths=[4.5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),bg),
        ("BOX",(0,0),(-1,-1),0.6,color),
        ("TOPPADDING",(0,0),(-1,-1),8),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
        ("LEFTPADDING",(0,0),(-1,-1),4),
        ("RIGHTPADDING",(0,0),(-1,-1),4),
    ]))
    return t

def info_box(title, body_html, color=GREEN, bg=GREEN_LT):
    title_style = ParagraphStyle("ibt", parent=H3, textColor=color, spaceAfter=4)
    body_style  = ParagraphStyle("ibb", parent=BODY, fontSize=9.5, leading=13)
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

def section_header(num, title, color=GREEN):
    h = ParagraphStyle("sh", parent=H1, textColor=color)
    sub = ParagraphStyle("shn", parent=SMALL, textColor=GREY,
        fontName="Helvetica-Bold", spaceAfter=2)
    return [Paragraph(f"SECCIÓN {num}", sub),
            Paragraph(title, h),
            HRFlowable(width="100%", thickness=2, color=color,
                       spaceBefore=2, spaceAfter=12)]

# ====================== PÁGINA DE PORTADA (dibujada en canvas) ======================
def draw_cover(c):
    w, h = A4
    c.setFillColor(NAVY)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(HexColor("#00FF87"))
    c.rect(0, h-0.6*cm, w, 0.6*cm, fill=1, stroke=0)
    c.setFillColor(HexColor("#00D4FF"))
    c.rect(0, 0, w, 0.4*cm, fill=1, stroke=0)
    c.setFillColor(HexColor("#00FF87"))
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(w/2, h-3*cm, "DOSSIER COMERCIAL · 2026 · CONFIDENCIAL")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 44)
    c.drawCentredString(w/2, h-6*cm, "GRADA")
    c.setFont("Helvetica", 16)
    c.setFillColor(HexColor("#CBD5E1"))
    c.drawCentredString(w/2, h-7*cm, "El sistema operativo del futbol base espanol")
    c.setStrokeColor(HexColor("#00FF87"))
    c.setLineWidth(1)
    c.line(w/2-3*cm, h-7.6*cm, w/2+3*cm, h-7.6*cm)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(w/2, h-10*cm, "Propuesta para clubes y academias")
    c.setFont("Helvetica", 13)
    c.setFillColor(HexColor("#94A3B8"))
    c.drawCentredString(w/2, h-11*cm,
        "Gestion integral  -  Cobros  -  Comunicacion  -  Scouting con IA")
    c.setStrokeColor(HexColor("#00FF87"))
    c.setLineWidth(0.8)
    c.roundRect(w/2-7*cm, h-15.2*cm, 14*cm, 3.4*cm, 12, stroke=1, fill=0)
    c.setFillColor(HexColor("#00FF87"))
    c.setFont("Helvetica-Bold", 10)
    c.drawCentredString(w/2, h-13.4*cm, "PRESENTADO A")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(w/2, h-14.2*cm, "[Nombre del club o academia]")
    c.setFillColor(HexColor("#94A3B8"))
    c.setFont("Helvetica", 10)
    c.drawCentredString(w/2, h-14.8*cm,
        "Documento personalizable  -  30 dias de prueba sin compromiso")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(w/2, 2.6*cm, "UNA SOLUCION KRUJENS")
    c.setFillColor(HexColor("#94A3B8"))
    c.setFont("Helvetica", 8.5)
    c.drawCentredString(w/2, 2.0*cm,
        "grada.app  -  hola@grada.app  -  +34 600 000 000")
    c.drawCentredString(w/2, 1.5*cm, "Pedro Paredes - Founder & CEO - Krujens Holding")
    c.drawCentredString(w/2, 1.0*cm, "Dossier v1.0 - Abril 2026")

# ====================== HEADER/FOOTER ======================
def on_page(canv, doc):
    canv.saveState()
    w, h = A4
    # Header
    canv.setFillColor(NAVY)
    canv.rect(0, h-1.1*cm, w, 1.1*cm, fill=1, stroke=0)
    canv.setFillColor(HexColor("#00FF87"))
    canv.rect(0, h-1.15*cm, w, 0.05*cm, fill=1, stroke=0)
    canv.setFillColor(colors.white)
    canv.setFont("Helvetica-Bold", 9)
    canv.drawString(1.5*cm, h-0.75*cm, "GRADA · Dossier Comercial 2026")
    canv.setFillColor(HexColor("#94A3B8"))
    canv.setFont("Helvetica", 8)
    canv.drawRightString(w-1.5*cm, h-0.75*cm, "Una solución Krujens")
    # Footer
    canv.setStrokeColor(LINE)
    canv.setLineWidth(0.4)
    canv.line(1.5*cm, 1.2*cm, w-1.5*cm, 1.2*cm)
    canv.setFillColor(GREY)
    canv.setFont("Helvetica", 7.8)
    canv.drawString(1.5*cm, 0.7*cm, "grada.app · hola@grada.app · +34 600 000 000")
    canv.drawCentredString(w/2, 0.7*cm, "Confidencial · Uso exclusivo del destinatario")
    canv.drawRightString(w-1.5*cm, 0.7*cm, f"Página {doc.page}")
    canv.restoreState()

def on_cover(canv, doc):
    canv.saveState()
    draw_cover(canv)
    canv.restoreState()

# ====================== CONTENIDO ======================
story = []

# --- COVER --- (se dibuja vía on_cover en canvas; aquí solo forzamos page break)
story.append(Spacer(1, 1))
story.append(PageBreak())

# ===================== ÍNDICE =====================
story += section_header("00", "Índice del documento", GREEN)
toc_data = [
    ["1.", "Carta del fundador",                                "3"],
    ["2.", "Resumen ejecutivo (1 página, lectura 90 seg)",      "4"],
    ["3.", "El problema real del fútbol base",                  "5"],
    ["4.", "La solución GRADA",                            "6"],
    ["5.", "Módulos y funcionalidades en detalle",              "7"],
    ["6.", "Casos de uso por persona del club",                 "10"],
    ["7.", "ROI y caso económico (con números)",                "12"],
    ["8.", "Planes y precios",                                  "13"],
    ["9.", "Onboarding paso a paso (30 días)",                  "14"],
    ["10.", "Seguridad, RGPD y cumplimiento",                   "15"],
    ["11.", "Análisis competitivo exhaustivo (8 sub-secciones)","16"],
    ["12.", "Roadmap de producto 2026-2027",                    "22"],
    ["13.", "Sobre Krujens y GRADA",                       "23"],
    ["14.", "Preguntas frecuentes",                             "24"],
    ["15.", "Próximos pasos y contacto",                        "25"],
]
t = Table(toc_data, colWidths=[1.2*cm, 13.6*cm, 1.6*cm])
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

# ===================== 1. CARTA DEL FUNDADOR =====================
story += section_header("01", "Carta del fundador", GREEN)
story.append(Paragraph("Estimado equipo directivo,", BODY))
story.append(Paragraph(
    "Llevo años viendo cómo los clubes de fútbol base —los que verdaderamente sostienen "
    "el deporte en España— gestionan a cientos de jugadores con herramientas que nunca "
    "fueron pensadas para ellos: hojas de Excel que se rompen, grupos de WhatsApp que "
    "explotan cada semana, recibos en papel que se pierden y plantillas de scouting "
    "anotadas a mano. Todo esto mientras compiten con academias privadas con presupuestos "
    "que no son comparables.",
    BODY))
story.append(Paragraph(
    "<b>GRADA</b> nace para nivelar esa cancha. Hemos construido una plataforma "
    "diseñada en España, para la realidad española del fútbol base: misma terminología "
    "(fichas, mutualidad, categorías por edad real), mismas necesidades fiscales (IRPF, "
    "factura electrónica, modelos 130/303), y mismos circuitos federativos.",
    BODY))
story.append(Paragraph(
    "No vendemos otra app de mensajería con escudo. Vendemos un sistema operativo "
    "completo: gestión de fichas, cobros automáticos por SEPA y tarjeta, comunicación "
    "estructurada con familias, scouting con inteligencia artificial, y una app para "
    "el jugador que le hace orgulloso pertenecer a su club.",
    BODY))
story.append(Paragraph(
    "Queremos demostrárselo, no contárselo. Por eso le ofrecemos <b>30 días de prueba "
    "completos sin compromiso</b>, con onboarding gratuito y nuestro equipo a su lado. "
    "Si en 30 días no nota el cambio, no paga nada y le devolvemos sus datos en CSV "
    "limpio. Ese compromiso es nuestra manera de empezar la conversación.",
    BODY))
story.append(Spacer(1, 12))
story.append(Paragraph("Un saludo y gracias por su tiempo,", BODY))
story.append(Spacer(1, 18))
story.append(Paragraph("<b>Pedro Paredes</b>", BODY))
story.append(Paragraph("Founder &amp; CEO · Krujens Holding", SMALL))
story.append(Paragraph("pedro@grada.app · LinkedIn /in/pedroparedes", SMALL))
story.append(PageBreak())

# ===================== 2. RESUMEN EJECUTIVO =====================
story += section_header("02", "Resumen ejecutivo", CYAN)
story.append(Paragraph(
    "<b>Qué es GRADA.</b> Plataforma web + app (PWA instalable) que centraliza "
    "la gestión deportiva, administrativa y de comunicación de un club o academia "
    "de fútbol base.",
    BODY))
story.append(Paragraph(
    "<b>A quién va dirigido.</b> Clubes con cantera (50–2.000 fichas), academias "
    "privadas residenciales, escuelas municipales y campus de verano.",
    BODY))
story.append(Paragraph(
    "<b>Qué resuelve.</b> Sustituye Excel + WhatsApp + recibos manuales + plantillas "
    "de scouting en papel por un único panel con datos en tiempo real.",
    BODY))

story.append(Spacer(1, 8))
story.append(Paragraph("Cifras clave del cambio (caso medio 400 fichas)", H3))
kpis = Table([[
    kpi_card("-8 h", "ahorradas/sem coordinador", GREEN, GREEN_LT),
    kpi_card("+12%", "retención cuotas", CYAN, CYAN_LT),
    kpi_card("&lt;2 m", "payback de la inversión", ORANGE, ORANGE_LT),
    kpi_card("100%", "datos centralizados", PURPLE, PURPLE_LT),
]], colWidths=[4.5*cm]*4)
kpis.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
story.append(kpis)
story.append(Spacer(1, 10))

story.append(Paragraph("Por qué nosotros y no otra herramienta", H3))
why = [
    ["✓", "Diseñado en España para la federación española (categorías, mutualidad, IRPF)"],
    ["✓", "Cobros SEPA + tarjeta integrados (no hace falta contratar Stripe aparte)"],
    ["✓", "Scouting con IA basado en patrones PHV (madurez biológica) — único en el sector"],
    ["✓", "30 días de prueba sin compromiso · onboarding incluido · cancelación 1 click"],
    ["✓", "RGPD nativo, datos alojados en la UE, ISO 27001 de proveedor en proceso"],
    ["✓", "Soporte en español por personas (no chatbots) · respuesta &lt; 2 h en horario hábil"],
]
t = Table(why, colWidths=[0.8*cm, 15.6*cm])
t.setStyle(TableStyle([
    ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,0),(0,-1),GREEN),
    ("FONTSIZE",(0,0),(-1,-1),10),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
]))
story.append(t)

story.append(Spacer(1, 10))
story.append(info_box(
    "Inversión total año 1 — caso 400 fichas",
    "Plan Pro <b>149 €/mes</b> × 12 = <b>1.788 €/año</b>. Ahorro de tiempo equivalente "
    "valorado en <b>4.800 €/año</b>. Aumento de cobros recuperados estimado <b>+5.200 €/año</b>. "
    "<b>ROI neto año 1 ≈ +8.200 €</b> (4,6×).",
    GREEN, GREEN_LT))
story.append(PageBreak())

# ===================== 3. EL PROBLEMA =====================
story += section_header("03", "El problema real del fútbol base", ORANGE)
story.append(Paragraph(
    "Hemos hablado con más de 60 clubes españoles entre 2024 y 2026. Estos son los "
    "patrones que se repiten — independientemente de la categoría o la región.",
    BODY))

story.append(Paragraph("Síntomas que probablemente reconoce", H3))
problems = [
    ("La hoja de fichas",
     "Un Excel maestro mantenido por 1-2 personas. Cuando se rompe (fórmula que "
     "alguien borra, fichero corrupto, conflicto de versiones), el club pierde "
     "horas de trabajo y a veces datos críticos."),
    ("Catorce grupos de WhatsApp",
     "Uno por equipo, otro de coordinadores, otro de padres delegados, otro de "
     "convocatorias... La información importante se diluye entre stickers y "
     "audios de 4 minutos."),
    ("Cuotas en pizarra mental",
     "Quién pagó, quién no, quién pidió fraccionar. Suele resolverse a final de "
     "mes con conversaciones incómodas y un 15-25% de retraso medio."),
    ("Scouting en libreta",
     "Las observaciones del coordinador deportivo viven en una libreta o un Word. "
     "Cuando ese coordinador se va, el conocimiento sale del club con él."),
    ("Inscripción federativa anual",
     "Recopilar DNIs, fotos, autorizaciones y certificados médicos en septiembre "
     "es un mes de caos para la junta directiva."),
    ("Padres descontentos sin saber por qué",
     "El club no tiene un canal estructurado para darles visibilidad sobre el "
     "progreso de sus hijos. Resultado: bajas a final de temporada inesperadas."),
]
for title, body in problems:
    story.append(Paragraph(f"<b>· {title}.</b> {body}", BODY))

story.append(Spacer(1, 6))
story.append(QUOTE_PAR := Paragraph(
    "“En septiembre yo dejo de tener vida personal. Entre cargar las fichas en el "
    "sistema federativo, perseguir a los padres con el certificado médico y cuadrar "
    "las cuotas, no salgo de la oficina del club hasta las 23 h.” — Coordinador "
    "técnico, club Preferente Valencia, 480 fichas.",
    QUOTE))
story.append(Spacer(1, 8))

story.append(Paragraph("Coste oculto de no resolverlo", H3))
costs = [
    ["Concepto", "Cuantificación anual", "Para club de 400 fichas"],
    ["Horas de coordinación duplicadas", "8 h/sem × 40 sem × 15 €/h", "≈ 4.800 €"],
    ["Cuotas no cobradas o tarde",       "12 % de la facturación", "≈ 5.200 €"],
    ["Bajas no detectadas a tiempo",     "5-7 fichas/temporada × 350 €", "≈ 2.100 €"],
    ["Errores en inscripción federativa","Multas + reinscripciones",     "≈ 600 €"],
    ["Total impacto anual estimado",     "",                            "≈ 12.700 €"],
]
t = Table(costs, colWidths=[6.5*cm, 5.5*cm, 4.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9.5),
    ("BACKGROUND",(0,-1),(-1,-1),GREEN_LT),
    ("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,-1),(-1,-1),GREEN),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("ALIGN",(2,1),(2,-1),"RIGHT"),
]))
story.append(t)
story.append(PageBreak())

# ===================== 4. LA SOLUCIÓN =====================
story += section_header("04", "La solución GRADA", GREEN)
story.append(Paragraph(
    "Una única plataforma con 6 módulos integrados. Todos los datos se cruzan "
    "automáticamente: cuando un coordinador ficha a un jugador, sus padres "
    "reciben acceso a la app, su domiciliación se prepara, su licencia "
    "federativa se pre-rellena y sus métricas deportivas empiezan a registrarse. "
    "Cero re-tecleos, cero errores de copia.",
    BODY))

mods = [
    ("🟢", "GESTIÓN DEPORTIVA",
     "Fichas, equipos por categoría real (Prebenjamín → Juvenil), convocatorias, "
     "asistencias, sanciones, lesiones, control de minutos jugados, fixture "
     "automático con la federación.", GREEN, GREEN_LT),
    ("🟦", "COMUNICACIÓN",
     "Canales por equipo, anuncios oficiales con confirmación de lectura, "
     "encuestas, mensajería 1-a-1 entrenador-padre, calendario sincronizable "
     "con Google/Apple, push nativo a la app.", CYAN, CYAN_LT),
    ("🟧", "COBROS",
     "SEPA B2B y B2C, Bizum, tarjeta vía Stripe Connect (incluido), "
     "fraccionamientos, recordatorios automáticos, factura electrónica "
     "homologada (Veri*Factu compatible), reconciliación contable CSV/Excel.",
     ORANGE, ORANGE_LT),
    ("🟪", "SCOUTING + IA",
     "Fichas técnicas, métricas físicas (sprint 30 m, salto, agilidad), "
     "análisis PHV de madurez biológica, ranking algorítmico de talento, "
     "informes exportables a PDF para reuniones con familias o agencias.",
     PURPLE, PURPLE_LT),
    ("🟨", "FAMILIA &amp; JUGADOR",
     "App PWA con calendario del hijo, evolución, fotos del partido, ranking "
     "anonimizado del equipo, tarjeta tipo FIFA personalizable, gamificación "
     "(badges, rachas, streaks de asistencia).", GOLD, GOLD_LT),
    ("⬜", "ADMIN &amp; CUMPLIMIENTO",
     "Roles y permisos granulares, registro de actividad (audit log), gestión "
     "de consentimientos RGPD, integración con asesoría laboral, exportación "
     "anual para inspección o auditoría.", GREY, GREY_LT),
]
for icon, name, body, color, bg in mods:
    title = f"<font color='{color.hexval()[0:7]}'>■</font>  <b>{name}</b>"
    story.append(info_box(title, body, color, bg))
    story.append(Spacer(1, 4))

story.append(PageBreak())

# ===================== 5. MÓDULOS EN DETALLE =====================
story += section_header("05", "Módulos y funcionalidades", PURPLE)
story.append(Paragraph(
    "Listado funcional exhaustivo. Lo que hoy puede hacer un usuario "
    "el primer día tras el onboarding.",
    BODY))

def feature_table(title, color, rows):
    story.append(Paragraph(title, ParagraphStyle("ft", parent=H3, textColor=color)))
    data = [["Funcionalidad", "Detalle operativo"]]
    data += rows
    t = Table(data, colWidths=[5.2*cm, 11.2*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0), color),
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
    story.append(Spacer(1, 8))

feature_table("5.1 · Gestión deportiva", GREEN, [
    ["Alta de fichas masiva",  "Carga de CSV con 500+ fichas en menos de 1 minuto. Validación automática de DNIs, fechas y categorías por edad."],
    ["Equipos y categorías",   "Estructura por categorías reales españolas (Prebenjamín, Benjamín, Alevín, Infantil, Cadete, Juvenil, Senior, Veteranos)."],
    ["Convocatorias",          "Plantilla seleccionable, push automático a familias, confirmación 1-click, gestión de bajas y sustituciones."],
    ["Control asistencia",     "Pase de lista digital en 20 seg desde el móvil. Métricas de constancia por jugador exportables al final del mes."],
    ["Sanciones y lesiones",   "Registro con fechas, parte médico opcional adjunto (cifrado), bloqueo automático de convocatorias durante baja."],
    ["Minutos jugados",        "Para asegurar reparto en categorías con normativa federativa de minutos mínimos. Alertas si un jugador queda fuera del umbral."],
    ["Estadísticas equipo",    "Goles, asistencias, tarjetas, porterías a cero, posesión estimada por entrenador."],
    ["Fixture federativo",     "Importación automática del calendario oficial FFCV/FCF/RFFM/etc. cuando lo publican las federaciones."],
])

feature_table("5.2 · Comunicación", CYAN, [
    ["Canales por equipo",     "Cada equipo tiene su canal cerrado. Solo escriben entrenador y delegado por defecto, padres como lectores."],
    ["Anuncios oficiales",     "Comunicación de la junta a todo el club con confirmación de lectura y firma electrónica si aplica."],
    ["Encuestas",              "Para confirmar asistencia a actos, decidir colores de equipación, votar premios, etc. Resultados anónimos opcionales."],
    ["Mensajería 1-a-1",       "Padre ↔ entrenador con horario configurable (por defecto 9-21h, fuera de eso queda en cola)."],
    ["Push nativo",            "Notificaciones nativas iOS/Android vía PWA, sin necesidad de descargar app de tienda."],
    ["Calendario integrado",   "Suscripción ICS exportable a Google Calendar, Apple Calendar, Outlook. Refresco automático cuando el club cambia algo."],
    ["Plantillas de mensaje",  "Banco de mensajes predefinidos: bienvenida, cobro, convocatoria, ausencia justificada... Adaptables al tono del club."],
])

story.append(PageBreak())

feature_table("5.3 · Cobros", ORANGE, [
    ["Domiciliación SEPA",     "Mandato firmado digitalmente por la familia. Carga al banco automática mensual o trimestral."],
    ["Bizum y tarjeta",        "Pasarela Stripe incluida. La familia puede elegir entre 3 métodos. Comisiones desde 1,4% + 0,25 €."],
    ["Fraccionamientos",       "Cuotas en 3, 6, 9 o 10 plazos. Calendarización automática y notificación previa a cada cargo."],
    ["Recordatorios",          "Email + push 7 y 2 días antes del vencimiento. Tras impago, escalado configurable (mensaje suave → urgente)."],
    ["Factura electrónica",    "Emisión automática conforme a normativa Veri*Factu / Anti-Fraude (Ley 11/2021). Archivo legal 6 años."],
    ["Reconciliación",         "Exportable a Excel, A3, ContaPlus, Holded, Quipu. Conciliación bancaria semi-automática con Norma 43."],
    ["Becas y descuentos",     "Reglas por familia (hermano = -10%, social = -50%, etc.) aplicadas automáticamente."],
    ["Cuotas extraordinarias", "Equipaciones, viajes, torneos. Opt-in por familia con cobro independiente."],
])

feature_table("5.4 · Scouting con IA", PURPLE, [
    ["Ficha técnica jugador",  "12 atributos físicos, 18 técnicos, 8 tácticos, 6 mentales. Editable por entrenador y coordinador."],
    ["Test físicos",           "Captura desde móvil de sprint 30m, salto vertical (Counter Movement Jump), agilidad T-test, Yo-Yo IR1."],
    ["Análisis PHV",           "Calculo de Peak Height Velocity para identificar madurez biológica. Evita descartar jugadores tardíos."],
    ["Ranking algorítmico",    "Top-X dentro del club, dentro de la categoría y benchmark contra base de datos anónima del sector."],
    ["Comparador",             "Side-by-side de hasta 4 jugadores con radar charts y evolución temporal."],
    ["Informe PDF auto",       "Generación de dossier para reuniones con familias, agencias o pruebas en clubes superiores."],
    ["Histórico temporal",     "Curva de progreso visual mes a mes. Alertas si un jugador rompe su tendencia (positiva o negativa)."],
    ["Etiquetas custom",       "Categorías propias del club (líder vestuario, mentalidad ganadora, polivalente...) consultables y filtrables."],
])

feature_table("5.5 · App familia y jugador", GOLD, [
    ["Calendario hijo",        "Vista solo de los entrenamientos y partidos del jugador del usuario. Sin ruido del resto del club."],
    ["Tarjeta FIFA",           "Personalización del avatar, dorsal, posición. Atributos visibles solo para el jugador y sus padres."],
    ["Galería partido",        "Fotos y vídeos cortos del partido subidos por el delegado. Borrado automático a 90 días por RGPD."],
    ["Ranking equipo",         "Anonimizado por defecto. Cada jugador ve su posición vs. la media del equipo."],
    ["Badges y rachas",        "Streak de asistencia, partido del mes, MVP, hat-trick, portería a cero. Notificaciones cuando se desbloquean."],
    ["Mensajes club",          "Filtrado solo a lo que afecta al hijo. Push silencioso fuera de horario."],
    ["Documentos",             "Recibos descargables, certificados de pertenencia al club, autorizaciones... todo en una pestaña."],
    ["Modo abuelo",            "Vista simplificada con letra grande y solo calendario + fotos. Pensado para abuelos."],
])

feature_table("5.6 · Administración y cumplimiento", GREY, [
    ["Roles granulares",       "Presi, secretario, tesorero, coordinador, entrenador, delegado, padre, jugador. Permisos por módulo y por equipo."],
    ["Audit log",              "Registro inmutable de quién hizo qué y cuándo. Exportable para auditorías o disputas legales."],
    ["Consentimientos RGPD",   "Captura, almacenamiento y revocación. Cada uso de imagen ligado al consentimiento original."],
    ["Multi-temporada",        "Histórico ilimitado. Acceso a temporadas anteriores con un click. Cierre formal de temporada con archivo."],
    ["Exportación total",      "En cualquier momento, descarga ZIP con todos los datos del club en CSV abierto. Sin lock-in."],
    ["Backups",                "Copia diaria automática a 3 ubicaciones UE. Retención 30 días. Restauración granular hasta 1 hora antes."],
    ["Soporte humano",         "Chat con persona en español, lun-vie 9-19h. Respuesta media &lt; 35 min. Telefónico en plan Elite."],
])

story.append(PageBreak())

# ===================== 6. CASOS DE USO =====================
story += section_header("06", "Casos de uso por persona del club", CYAN)
story.append(Paragraph(
    "Cada perfil del club tiene una experiencia adaptada. Cuatro fotos reales del día a día.",
    BODY))

personas = [
    ("PRESIDENTE / DIRECTIVA", GREEN, GREEN_LT,
     "Su problema:", "No tiene en tiempo real cuántos socios pagan, qué equipos están "
     "rentables ni si la temporada llegará a equilibrio en abril.",
     "Lo que ve en GRADA:", "Dashboard ejecutivo con MRR del club, tasa de morosidad, "
     "fichas en activo vs. previsto, comparativa con temporada anterior. Alertas si "
     "algún equipo está descuadrado (fichas pagadas vs. fichas activas).",
     "Cuánto tiempo le ahorra:", "2-3 horas semanales de cuadres con tesorería + decisiones "
     "informadas en lugar de intuición."),
    ("COORDINADOR / DIR. DEPORTIVO", CYAN, CYAN_LT,
     "Su problema:", "Tiene que mantener la coherencia técnica entre 8 entrenadores, "
     "controlar minutos jugados, planificar tecnificación y reportar a la junta.",
     "Lo que ve en GRADA:", "Mapa global de la cantera con métricas por categoría, "
     "informe semanal automático del estado de los equipos, ranking de progreso "
     "individual, planificador de pruebas físicas trimestrales.",
     "Cuánto tiempo le ahorra:", "5-6 horas semanales de coordinación + visibilidad "
     "que antes simplemente no tenía."),
    ("ENTRENADOR / DELEGADO", ORANGE, ORANGE_LT,
     "Su problema:", "Pase de lista, convocatoria por WhatsApp, anotar goles en el bloc, "
     "subir fotos a 3 grupos distintos, contestar dudas de padres sobre horarios.",
     "Lo que ve en GRADA:", "Una pantalla con su equipo: convocatoria 2-clicks, "
     "asistencia 20 segundos, estadísticas del partido en directo, fotos al canal "
     "del equipo automáticamente.",
     "Cuánto tiempo le ahorra:", "1,5-2 horas a la semana + tranquilidad de haber "
     "informado sin el caos de los grupos."),
]
for name, c, bg, p1, t1, p2, t2, p3, t3 in personas:
    body_html = (f"<b>{p1}</b> {t1}<br/><br/>"
                 f"<b>{p2}</b> {t2}<br/><br/>"
                 f"<b>{p3}</b> {t3}")
    story.append(info_box(name, body_html, c, bg))
    story.append(Spacer(1, 6))

story.append(PageBreak())

# ===================== 6.A · EXPERIENCIA FAMILIAS =====================
story.append(Paragraph("6.A · Experiencia detallada para FAMILIAS",
    ParagraphStyle("h6a", parent=H1, textColor=PURPLE, fontSize=18)))
story.append(HRFlowable(width="100%", thickness=2, color=PURPLE, spaceBefore=2, spaceAfter=10))
story.append(Paragraph(
    "GRADA no es solo una herramienta para el club. Es la app que <b>la familia</b> "
    "abre 4-5 veces a la semana para saber qué pasa con su hijo en el club. Esta "
    "página describe en detalle qué encuentran los padres y madres dentro.",
    BODY))

story.append(Paragraph("Lo que un padre/madre encuentra al abrir la app", H3))
fam_features = [
    ["Pantalla", "Qué muestra exactamente", "Beneficio para la familia"],
    ["Inicio", "Próximo entrenamiento + próximo partido del hijo, mensajes sin leer del club, alertas (ej. cuota próxima a vencer).", "En 5 segundos sabe lo importante de la semana."],
    ["Calendario hijo", "Solo eventos del hijo (sin ruido del resto del club). Direcciones con mapa, hora exacta, indumentaria, transporte si lo coordina el club.", "Adiós a preguntar por WhatsApp ‘¿a qué hora es el sábado?’"],
    ["Tarjeta del jugador", "Tarjeta tipo FIFA con foto, dorsal, posición, atributos, evolución en gráfica del trimestre. Sólo visible para el padre y el hijo.", "Visibilidad real del progreso, no solo opiniones del entrenador."],
    ["Fotos y vídeos", "Galería del último partido y entrenamiento, subida por el delegado. Descargable en alta. Borrado automático a 90 días por RGPD.", "Recuerdos sin tener que pedirlos por chat."],
    ["Mensajes", "Buzón único: comunicados oficiales del club, mensajes del entrenador y notificaciones de cobros. Marcado de leído.", "Cero info perdida. Cero ruido de stickers."],
    ["Cuotas y recibos", "Estado de cuotas pagadas/pendientes, próximo cargo, descarga de recibos en PDF, cambio de domiciliación 1-click.", "Transparencia total con el dinero del club."],
    ["Documentos", "Certificado de pertenencia, autorizaciones firmadas, consentimientos de imagen, ficha federativa.", "Todo en un sitio cuando lo necesite (becas, IRPF…)."],
    ["Encuestas", "Votaciones del club: equipación nueva, fechas de cena fin de temporada, opinión sobre la planificación.", "Sentirse escuchado y participar en el club."],
    ["Mensajería entrenador", "Chat 1-a-1 con el entrenador del hijo, con horario configurable (no se reciben fuera de 9-21h).", "Tranquilidad de poder escribir sin saturar al técnico."],
    ["Modo abuelo", "Vista simplificada con letra grande y solo calendario + fotos. Sin notificaciones intrusivas.", "Los abuelos también pueden seguir al nieto."],
]
t = Table(fam_features, colWidths=[3.4*cm, 7*cm, 6*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), PURPLE),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.6),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
]))
story.append(t)
story.append(Spacer(1, 8))

story.append(Paragraph("Tres preocupaciones de las familias y cómo las resolvemos", H3))
fam_concerns = [
    ("‘No sé cómo va mi hijo’ →",
     "Tarjeta FIFA con evolución mensual + comentarios del entrenador trimestrales + "
     "informe físico semestral (Elite). Por primera vez, datos objetivos en lugar de intuición.",
     PURPLE, PURPLE_LT),
    ("‘No quiero que mi hijo aparezca en redes’ →",
     "Consentimiento granular de imagen por uso (fotos internas / web del club / "
     "redes sociales). Revocable en cualquier momento. Cada foto subida queda "
     "etiquetada con el consentimiento vigente; si revoca, desaparece.",
     CYAN, CYAN_LT),
    ("‘No sé en qué se gasta mi cuota’ →",
     "Pantalla de transparencia con desglose por trimestre: % a entrenadores, "
     "instalaciones, federación, equipaciones, eventos. Aplicable cuando el club "
     "decide compartirlo (configurable por la junta).",
     ORANGE, ORANGE_LT),
]
for title, body, c, bg in fam_concerns:
    story.append(info_box(title, body, c, bg))
    story.append(Spacer(1, 4))

story.append(Spacer(1, 4))
story.append(Paragraph(
    "<b>Resultado medible.</b> En pilotos comparados, el uso de GRADA reduce "
    "<b>-43 % los mensajes que las familias envían al entrenador</b> (porque la información "
    "ya está en la app), aumenta <b>+27 % la satisfacción NPS familia</b> y reduce "
    "<b>-18 % las bajas no anticipadas a final de temporada</b>.",
    BODY))
story.append(PageBreak())

# ===================== 6.B · EXPERIENCIA JUGADORES =====================
story.append(Paragraph("6.B · Experiencia detallada para JUGADORES",
    ParagraphStyle("h6b", parent=H1, textColor=GOLD, fontSize=18)))
story.append(HRFlowable(width="100%", thickness=2, color=GOLD, spaceBefore=2, spaceAfter=10))
story.append(Paragraph(
    "El jugador no firma el contrato — pero si la app no le engancha, el club no la "
    "renueva. Por eso hemos construido una experiencia pensada como un videojuego "
    "ligero: el chaval entra a verse a sí mismo, no a hacer trámites.",
    BODY))

story.append(Paragraph("Qué hace un jugador de 12 años con GRADA", H3))
player_features = [
    ["Funcionalidad", "Cómo lo experimenta el jugador"],
    ["Tarjeta tipo FIFA",
     "Su perfil personalizable: avatar, dorsal, foto de portada, equipación. Sus atributos (físico, técnico, mental) suben con los entrenamientos. Comparte la tarjeta con sus amigos."],
    ["Estadísticas propias",
     "Goles, asistencias, partidos jugados, racha de asistencia. Récord de la temporada vs. su mejor temporada anterior. Le motiva superarse."],
    ["Badges y logros",
     "Sistema de medallas desbloqueables: ‘primera asistencia’, ‘portería a cero’, ‘racha 10 entrenos’, ‘MVP del mes’, ‘hat-trick’. Notificación push cuando desbloquea."],
    ["Ranking del equipo",
     "Anonimizado: ve su posición vs. la media del equipo en cada métrica. Saber dónde está sin presión social tóxica."],
    ["Vídeos y momentos",
     "Sus clips destacados del partido (cuando el delegado los etiqueta). Botón ‘compartir con familia’ — cifrado, no a redes públicas."],
    ["Calendario propio",
     "Sus partidos y entrenos sincronizados con Google/Apple Calendar. Recordatorios 1 h antes."],
    ["Reto semanal",
     "Cada lunes, el entrenador puede asignarle un reto personalizado (5 toques continuos, técnica de zurda, etc.). El jugador marca cumplido cuando lo logra."],
    ["Diario del jugador",
     "Espacio privado donde anota cómo se sintió en cada entreno (1-5). Solo el coordinador lo ve agregado, jamás individualmente sin permiso. Útil para detectar bajones anímicos."],
    ["Pertenencia al club",
     "Carnet digital del club con fondo dinámico, escudo y lema. Se puede mostrar para acceder a instalaciones, descuentos en patrocinadores."],
]
t = Table(player_features, colWidths=[4*cm, 12.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), GOLD),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.8),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
]))
story.append(t)
story.append(Spacer(1, 8))

story.append(Paragraph("Por edades — qué activamos según el jugador", H3))
ages = [
    ["Edad", "Qué activamos por defecto", "Qué bloqueamos por seguridad"],
    ["6-9 años",   "Solo calendario y fotos. Padre dueño total de la cuenta.", "Chat, ranking público, datos físicos."],
    ["10-12 años", "Tarjeta FIFA básica, badges, calendario. Stats simples.", "Chat 1-a-1 fuera del club, fotos a redes externas."],
    ["13-15 años", "Tarjeta completa, ranking del equipo, retos, diario.",     "Acceso a datos físicos sensibles sin tutor."],
    ["16+ años",   "Experiencia completa, scouting compartible con agencias autorizadas.", "Solo bloqueos a petición de tutor o club."],
]
t = Table(ages, colWidths=[2.8*cm, 7.6*cm, 6*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0), NAVY),
    ("TEXTCOLOR",(0,0),(-1,0), colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.8),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("GRID",(0,0),(-1,-1),0.3, LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("ALIGN",(0,0),(0,-1),"CENTER"),
]))
story.append(t)
story.append(Spacer(1, 8))

story.append(info_box("Diseñado para no ser adictivo",
    "A diferencia de las redes sociales, GRADA <b>no tiene scroll infinito, "
    "no tiene likes públicos, no tiene comentarios libres entre jugadores</b>. "
    "Los badges son finitos, el ranking es anonimizado, el chat solo opera con "
    "personas autorizadas del club. Queremos engancharle al fútbol, no a la pantalla.",
    GREEN, GREEN_LT))

story.append(Spacer(1, 6))
story.append(QUOTE_PAR2 := Paragraph(
    "“Mi hijo abre la app antes de cada entreno para ver si su asistencia perfecta "
    "sigue intacta. Antes ni recordaba si tenía que ir.” — Madre de jugador alevín, "
    "club piloto Valencia.",
    QUOTE))
story.append(PageBreak())

# ===================== 7. ROI =====================
story += section_header("07", "ROI y caso económico", GREEN)
story.append(Paragraph(
    "Hagamos el cálculo con números reales para tres tamaños de club. Si el suyo no "
    "encaja exactamente, le preparamos uno personalizado en 24 h.",
    BODY))

roi_table = [
    ["Tamaño del club", "150 fichas", "400 fichas", "1.000 fichas"],
    ["Plan recomendado", "Starter 49 €/mes", "Pro 149 €/mes", "Elite 349 €/mes"],
    ["Inversión anual GRADA", "588 €", "1.788 €", "4.188 €"],
    ["Horas ahorradas coord./año", "180 h", "320 h", "640 h"],
    ["Valor monetario ahorro tiempo (15 €/h)", "2.700 €", "4.800 €", "9.600 €"],
    ["Recuperación cuotas atrasadas (+12%)", "1.800 €", "5.200 €", "13.200 €"],
    ["Reducción bajas no detectadas", "700 €", "2.100 €", "5.500 €"],
    ["Beneficio bruto anual estimado", "5.200 €", "12.100 €", "28.300 €"],
    ["ROI neto (beneficio − inversión)", "+4.612 €", "+10.312 €", "+24.112 €"],
    ["Múltiplo retorno", "8,8×", "6,8×", "6,8×"],
    ["Payback", "&lt; 2 meses", "&lt; 2 meses", "&lt; 2 meses"],
]
t = Table(roi_table, colWidths=[5.6*cm, 3.6*cm, 3.6*cm, 3.6*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9.2),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("ALIGN",(1,0),(-1,-1),"CENTER"),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("BACKGROUND",(0,-3),(-1,-3),GREEN_LT),
    ("FONTNAME",(0,-3),(-1,-1),"Helvetica-Bold"),
    ("BACKGROUND",(0,-2),(-1,-2),GREEN_LT),
    ("BACKGROUND",(0,-1),(-1,-1),GREEN_LT),
    ("TEXTCOLOR",(0,-3),(-1,-1),GREEN),
]))
story.append(t)
story.append(Spacer(1, 8))
story.append(Paragraph(
    "<b>Notas metodológicas.</b> (1) Tarifa hora coordinador 15 €/h basada en convenio "
    "del personal técnico-deportivo. (2) Recuperación de cuotas modelizada sobre la base "
    "de impagos típicos del 15-20 % en clubes que solo usan Excel + transferencia. "
    "(3) Reducción de bajas: 1,5-2 % menos de pérdida de fichas a final de temporada "
    "según pilotos comparables del sector. (4) No se incluyen ingresos nuevos por "
    "ampliación de cantera, que en pilotos van del +5 % al +12 % en año 1.",
    SMALL))
story.append(PageBreak())

# ===================== 8. PRICING =====================
story += section_header("08", "Planes y precios", ORANGE)
story.append(Paragraph(
    "Tres planes claros, sin letra pequeña. Sin coste de setup. Sin permanencia. "
    "Cancelación con 1 click desde el panel. IVA no incluido.",
    BODY))
story.append(Spacer(1, 6))

plans = [
    [Paragraph("<b>STARTER</b>", ParagraphStyle("p", parent=H2, textColor=GREEN, alignment=TA_CENTER)),
     Paragraph("<b>PRO</b>", ParagraphStyle("p", parent=H2, textColor=CYAN, alignment=TA_CENTER)),
     Paragraph("<b>ELITE</b>", ParagraphStyle("p", parent=H2, textColor=GOLD, alignment=TA_CENTER))],
    [Paragraph("<b>49 €</b><font size='9'>/mes</font>", ParagraphStyle("p", parent=BODY, fontSize=24, textColor=GREEN, alignment=TA_CENTER, leading=26, fontName="Helvetica-Bold")),
     Paragraph("<b>149 €</b><font size='9'>/mes</font>", ParagraphStyle("p", parent=BODY, fontSize=24, textColor=CYAN, alignment=TA_CENTER, leading=26, fontName="Helvetica-Bold")),
     Paragraph("<b>349 €</b><font size='9'>/mes</font>", ParagraphStyle("p", parent=BODY, fontSize=24, textColor=GOLD, alignment=TA_CENTER, leading=26, fontName="Helvetica-Bold"))],
    [Paragraph("Hasta <b>150 fichas</b>", BODY_C),
     Paragraph("Hasta <b>600 fichas</b>", BODY_C),
     Paragraph("<b>Fichas ilimitadas</b>", BODY_C)],
    [Paragraph("Para clubes pequeños y escuelas en arranque", SMALL),
     Paragraph("El más popular. Cubre el 70 % de clubes españoles", SMALL),
     Paragraph("Para academias premium y clubes con cantera DH", SMALL)],
    [Paragraph(
        "✓ Gestión deportiva completa<br/>"
        "✓ Comunicación + push<br/>"
        "✓ Cobros SEPA<br/>"
        "✓ App familia<br/>"
        "✓ Soporte por chat<br/>"
        "✓ 30 días de prueba<br/>"
        "<font color='#94A3B8'>· Sin scouting IA<br/>· Sin Bizum/tarjeta<br/>· Sin multi-equipo cruzado</font>",
        BODY),
     Paragraph(
        "<b>Todo lo de Starter +</b><br/>"
        "✓ Cobros Bizum + tarjeta<br/>"
        "✓ Factura electrónica<br/>"
        "✓ Multi-equipo y categorías<br/>"
        "✓ Audit log<br/>"
        "✓ Encuestas y plantillas<br/>"
        "✓ Soporte chat &lt; 35 min<br/>"
        "✓ Onboarding guiado",
        BODY),
     Paragraph(
        "<b>Todo lo de Pro +</b><br/>"
        "✓ <b>Scouting con IA</b><br/>"
        "✓ Análisis PHV<br/>"
        "✓ Informes PDF auto<br/>"
        "✓ Multi-temporada ilimitada<br/>"
        "✓ API y exportaciones<br/>"
        "✓ Soporte telefónico dedicado<br/>"
        "✓ Customer Success asignado",
        BODY)],
    [Paragraph("<b>Sin permanencia</b>", BODY_C),
     Paragraph("<b>Sin permanencia</b>", BODY_C),
     Paragraph("<b>Sin permanencia</b>", BODY_C)],
]
t = Table(plans, colWidths=[5.4*cm]*3)
t.setStyle(TableStyle([
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("BACKGROUND",(0,0),(0,-1),GREEN_LT),
    ("BACKGROUND",(1,0),(1,-1),CYAN_LT),
    ("BACKGROUND",(2,0),(2,-1),GOLD_LT),
    ("LINEBEFORE",(0,0),(0,-1),3,GREEN),
    ("LINEBEFORE",(1,0),(1,-1),3,CYAN),
    ("LINEBEFORE",(2,0),(2,-1),3,GOLD),
    ("BOTTOMPADDING",(0,0),(-1,-1),10),
    ("TOPPADDING",(0,0),(-1,-1),10),
    ("LEFTPADDING",(0,0),(-1,-1),12),
    ("RIGHTPADDING",(0,0),(-1,-1),12),
]))
story.append(t)
story.append(Spacer(1, 10))

story.append(Paragraph("Add-ons opcionales", H3))
addons = [
    ["Migración asistida desde Excel/Clupik/Competify", "150 € pago único"],
    ["Web pública del club con calendario embebido",    "29 €/mes"],
    ["Módulo torneos puntuales (campus de verano)",     "299 €/evento"],
    ["Capacitación in-situ media jornada",              "390 € por sesión"],
    ["Pasarela de fichajes cantera (marketplace)",      "5 % sobre derechos"],
    ["Seat adicional para agencia / scout externo",     "29 €/usuario/mes"],
]
t = Table(addons, colWidths=[11*cm, 5.4*cm])
t.setStyle(TableStyle([
    ("FONTSIZE",(0,0),(-1,-1),9.5),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("LINEBELOW",(0,0),(-1,-1),0.3,LINE),
    ("ALIGN",(1,0),(1,-1),"RIGHT"),
    ("FONTNAME",(1,0),(1,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(1,0),(1,-1),ORANGE),
]))
story.append(t)

story.append(Spacer(1, 8))
story.append(info_box("Política de descuentos por compromiso",
    "<b>Pago anual adelantado: -15 %</b> (equivale a 2 meses gratis).<br/>"
    "<b>Multi-club / federación: -25 %</b> a partir de 5 entidades.<br/>"
    "<b>Programa referral: 1 mes gratis</b> por cada club referido que cierre piloto.",
    GREEN, GREEN_LT))
story.append(PageBreak())

# ===================== 9. ONBOARDING =====================
story += section_header("09", "Onboarding paso a paso (30 días)", PURPLE)
story.append(Paragraph(
    "Nuestra promesa: en 30 días el club opera 100 % en GRADA, sin volver al "
    "Excel. Le acompañamos día a día con un Customer Success Manager dedicado.",
    BODY))

steps = [
    ("Día 1 – Kick-off", GREEN,
     "Reunión 60 min con el coordinador: revisión del estado actual, decisión de "
     "alcance del piloto (¿toda la cantera o 1 categoría?), recogida de Excel/CSV "
     "actuales, configuración del subdominio del club (clubX.grada.app)."),
    ("Días 2-3 – Carga de datos", CYAN,
     "Migración asistida: importamos sus fichas, creamos los equipos por categoría, "
     "subimos el calendario federativo, configuramos los roles del personal. "
     "Validamos un equipo piloto antes de extender al resto."),
    ("Días 4-7 – Familias dentro", ORANGE,
     "Email de bienvenida personalizado a las familias con tutorial de 2 minutos. "
     "Soporte WhatsApp dedicado las primeras 72 h. Objetivo: 80 % de familias "
     "logueadas al final de la semana."),
    ("Días 8-14 – Operación deportiva", PURPLE,
     "Primeras convocatorias por la app, primeros pase de lista digital, "
     "primer comunicado oficial con confirmación de lectura. Revisión de "
     "métricas con el Customer Success y ajuste fino."),
    ("Días 15-21 – Cobros", GOLD,
     "Activación de SEPA. Generación de mandatos firmados digitalmente. "
     "Primera remesa de prueba con un equipo piloto. Ajuste de calendario "
     "de cobros y comunicación a familias."),
    ("Días 22-28 – Scouting (Elite)", GREEN,
     "Carga de fichas técnicas, primer test físico digital, generación del "
     "primer informe PDF de jugador, formación al cuerpo técnico (60 min)."),
    ("Día 30 – Revisión formal", CYAN,
     "Reunión con la junta: dashboard de adopción, ROI proyectado real vs. "
     "estimado, plan de la temporada completa. Decisión de continuidad "
     "(que es no hacer nada — sigue activo automáticamente)."),
]
for title, color, body in steps:
    box = Table([[Paragraph(f"<b>{title}</b>", ParagraphStyle("st", parent=H3, textColor=color))],
                 [Paragraph(body, BODY)]],
                colWidths=[16.4*cm])
    box.setStyle(TableStyle([
        ("LINEBEFORE",(0,0),(0,-1),3,color),
        ("BACKGROUND",(0,0),(-1,-1),HexColor("#FAFCFE")),
        ("LEFTPADDING",(0,0),(-1,-1),12),
        ("RIGHTPADDING",(0,0),(-1,-1),12),
        ("TOPPADDING",(0,0),(-1,-1),6),
        ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ]))
    story.append(box)
    story.append(Spacer(1, 5))

story.append(Spacer(1, 6))
story.append(info_box("Garantía de devolución total",
    "Si al día 30 no quiere continuar, le devolvemos sus datos en CSV abierto, "
    "borramos su entorno de nuestros servidores y no le facturamos nada. "
    "Cero preguntas, cero papeleo.",
    GREEN, GREEN_LT))
story.append(PageBreak())

# ===================== 10. SEGURIDAD / RGPD =====================
story += section_header("10", "Seguridad, RGPD y cumplimiento", CYAN)
story.append(Paragraph(
    "Tratamos datos de menores. Eso eleva nuestro estándar — y debe elevar el suyo "
    "al elegir proveedor. Aquí está, sin marketing, lo que hacemos.",
    BODY))

sec = [
    ("Localización de datos", "Servidores en la UE (Frankfurt y Madrid, AWS eu-central-1 y eu-south-2). Cero transferencias a EE.UU. salvo proveedores con SCC firmados (Stripe — encargado para pagos)."),
    ("Cifrado",                "TLS 1.3 en tránsito. AES-256 en reposo para base de datos y backups. Claves gestionadas en AWS KMS con rotación 90 días."),
    ("Gestión de identidades", "MFA obligatorio para roles directivos y financieros. Single Sign-On (Google Workspace, Microsoft 365) opcional en plan Elite."),
    ("RGPD",                   "Encargado del tratamiento (Art. 28). Contrato DPA firmable digitalmente desde el panel del club. DPO externo certificado (AEPD)."),
    ("Consentimientos",        "Captura granular por uso (imagen, comunicación, terceros). Revocación 1-click por la familia. Histórico inmutable de consentimientos."),
    ("Menores",                "Doble consentimiento: el del progenitor para crear la ficha y el del menor a partir de 14 años para el uso de su imagen pública."),
    ("Backups y recuperación", "Copia diaria a 3 zonas UE. Retención 30 días. RTO &lt; 4 h, RPO &lt; 1 h en plan Pro. SLA 99,9 % uptime."),
    ("Auditorías",              "Penetration test anual por tercero independiente. ISO 27001 en proceso (cierre previsto Q4 2026). SOC 2 Type II planificado 2027."),
    ("Borrado garantizado",    "Cancelación: borrado lógico inmediato + físico a 30 días. Certificado de destrucción enviable a la junta del club."),
    ("Cumplimiento fiscal",    "Veri*Factu compatible (Real Decreto 1007/2023). Conservación de facturas 6 años conforme a Ley General Tributaria."),
]
data = [["Aspecto", "Cómo lo cumplimos"]]
data += sec
t = Table(data, colWidths=[4.6*cm, 11.8*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),CYAN),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
]))
story.append(t)
story.append(Spacer(1, 10))
story.append(info_box("Documentos disponibles bajo NDA",
    "Política de seguridad ISO 27002 · Plan de continuidad de negocio (BCP) · "
    "Análisis de riesgos LOPDGDD · Resultados último pentest · "
    "DPA firmable · Lista de subencargados.",
    CYAN, CYAN_LT))
story.append(PageBreak())

# ===================== 11. COMPETENCIA (ANÁLISIS EXHAUSTIVO) =====================
story += section_header("11", "Análisis competitivo exhaustivo", GREEN)
story.append(Paragraph(
    "Comparativa honesta y detallada. En esta sección desmontamos a cada competidor "
    "con sus fortalezas, sus debilidades y los escenarios en los que ganan o pierden "
    "frente a GRADA. No vendemos humo: si no encajamos, lo decimos.",
    BODY))

# 11.1 Mapa del mercado
story.append(Spacer(1, 6))
story.append(Paragraph("11.1 · Mapa del mercado del software para clubes de base", H3))
story.append(Paragraph(
    "Hemos identificado <b>4 categorías</b> de soluciones que hoy compiten por el "
    "mismo presupuesto del club. Cada una resuelve una parte del problema, pero "
    "ninguna lo cubre por completo — y ahí entra GRADA.",
    BODY))

cat_data = [
    ["Categoría", "Players representativos", "Qué cubren", "Qué dejan fuera"],
    ["A · DIY / Tradicional", "Excel, Google Sheets, WhatsApp, recibos manuales",
     "Coste cero, control total, flexibilidad",
     "Escalabilidad, RGPD, cobros, scouting, datos en silos"],
    ["B · Gestión club generalista", "Clupik, Competify, Playoff, Sportup",
     "Fichas, cuotas básicas, comunicación, web pública",
     "Scouting profesional, IA, factura electrónica completa, app familia premium"],
    ["C · Resultados y competición", "Matchapp, ResultadosFutbol, GroundFootball",
     "Calendario, resultados, estadísticas básicas, push",
     "Cobros, gestión administrativa, RGPD, fichas, multi-rol"],
    ["D · Scouting profesional", "Wyscout, InStat, TransferRoom, Driblab",
     "Datos de jugadores profesionales, scouting internacional",
     "Gestión club, cobros, comunicación familias, base/cantera real"],
    ["E · Vertical fútbol base", "GRADA",
     "Todo lo anterior unificado en una plataforma",
     "Reportes ejecutivos avanzados (en roadmap Q3 2026)"],
]
t = Table(cat_data, colWidths=[3.4*cm, 4*cm, 4.2*cm, 4.8*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.4),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("BACKGROUND",(0,-1),(-1,-1),GREEN_LT),
    ("TEXTCOLOR",(0,-1),(-1,-1),GREEN),
    ("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),
]))
story.append(t)
story.append(PageBreak())

# 11.2 Tabla comparativa funcional ampliada
story.append(Paragraph("11.2 · Comparativa funcional detallada (32 criterios)", H3))
story.append(Paragraph(
    "Evaluación criterio a criterio. Verde = lo cubre completo · Amarillo = parcial · "
    "Rojo = no lo cubre. Datos basados en webs oficiales y demos efectuadas en "
    "Q1 2026; las funcionalidades de los competidores pueden haber evolucionado.",
    SMALL))
story.append(Spacer(1, 4))

# Símbolos: ✓ = full · ~ = parcial · — = no
def cmp_cell(val):
    if val == "✓":
        return ("✓", colors.white, GREEN)
    if val == "~":
        return ("~", NAVY, GOLD_LT)
    if val == "—":
        return ("—", colors.white, RED)
    return (val, NAVY, colors.white)

cmp_rows = [
    # Categoría: Gestión deportiva
    ("GESTIÓN DEPORTIVA",                "✓","~","✓","✓","~","—"),
    ("Multi-equipo / multi-categoría",   "✓","—","✓","✓","✓","—"),
    ("Convocatorias 1-click",            "✓","—","✓","~","✓","—"),
    ("Asistencia digital móvil",         "✓","—","~","~","✓","—"),
    ("Control minutos federativos",      "✓","—","—","—","—","—"),
    ("Estadísticas equipo en directo",   "✓","—","~","~","✓","—"),
    # Categoría: Comunicación
    ("COMUNICACIÓN",                     "✓","~","✓","✓","✓","—"),
    ("Push nativo PWA",                  "✓","—","✓","✓","✓","—"),
    ("Confirm. lectura anuncios",        "✓","—","~","~","—","—"),
    ("Encuestas integradas",             "✓","—","~","~","—","—"),
    ("Chat horario configurable",        "✓","—","—","—","—","—"),
    # Categoría: Cobros
    ("COBROS Y FACTURACIÓN",             "✓","—","✓","✓","—","—"),
    ("SEPA con mandato digital",         "✓","—","✓","✓","—","—"),
    ("Bizum + tarjeta integrados",       "✓","—","€","€","—","—"),
    ("Fraccionamientos automáticos",     "✓","—","~","~","—","—"),
    ("Factura electrónica Veri*Factu",   "✓","—","—","—","—","—"),
    ("Reconciliación bancaria N43",      "✓","—","~","~","—","—"),
    # Categoría: Scouting
    ("SCOUTING Y TALENTO",               "✓","—","—","—","—","✓"),
    ("Test físicos digitales",           "✓","—","—","—","—","~"),
    ("Análisis PHV (madurez biológica)", "✓","—","—","—","—","—"),
    ("IA · ranking algorítmico",         "✓","—","—","—","—","~"),
    ("Informe PDF jugador auto",         "✓","—","—","—","—","✓"),
    # Categoría: Familia
    ("APP FAMILIA / JUGADOR",            "✓","—","~","~","✓","—"),
    ("Tarjeta tipo FIFA",                "✓","—","—","—","—","—"),
    ("Galería partido con RGPD",         "✓","—","~","~","✓","—"),
    ("Gamificación (badges)",            "✓","—","—","—","✓","—"),
    # Categoría: Compliance
    ("RGPD / SEGURIDAD",                 "✓","—","~","~","~","~"),
    ("DPA encargado tratamiento",        "✓","—","✓","✓","✓","✓"),
    ("Datos en UE garantizados",         "✓","—","✓","✓","~","~"),
    ("Audit log completo",               "✓","—","—","—","—","—"),
    ("ISO 27001 (en curso)",             "✓","—","—","—","—","✓"),
    # Categoría: Soporte
    ("SOPORTE",                          "✓","—","~","~","~","—"),
    ("Soporte humano ES &lt; 35 min",    "✓","—","—","—","—","—"),
    ("Onboarding guiado 30 días",        "✓","—","~","~","—","—"),
    ("Customer Success dedicado",        "✓","—","—","—","—","✓"),
]

# Construyo tabla con celdas coloreadas
header_row = [["Criterio", "GRADA", "Excel+WA", "Clupik", "Competify", "Matchapp", "Wyscout"]]
body_rows = []
section_indices = []  # filas que son cabecera de subgrupo
for i, row in enumerate(cmp_rows):
    label = row[0]
    if label.isupper():
        section_indices.append(i)
    body_rows.append(list(row))

table_data = header_row + body_rows
t = Table(table_data, colWidths=[5.0*cm, 2.0*cm, 1.7*cm, 1.7*cm, 2.0*cm, 1.9*cm, 2.0*cm], repeatRows=1)
ts = [
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),7.6),
    ("GRID",(0,0),(-1,-1),0.25,LINE),
    ("ALIGN",(1,0),(-1,-1),"CENTER"),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("BOTTOMPADDING",(0,0),(-1,-1),3),
    ("TOPPADDING",(0,0),(-1,-1),3),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BACKGROUND",(1,1),(1,-1),GREEN_LT),
]
# Color de cada celda según valor
for ri, row in enumerate(body_rows, start=1):
    for ci, val in enumerate(row[1:], start=1):
        if val == "✓":
            ts.append(("BACKGROUND",(ci,ri),(ci,ri),GREEN))
            ts.append(("TEXTCOLOR",(ci,ri),(ci,ri),colors.white))
        elif val == "~":
            ts.append(("BACKGROUND",(ci,ri),(ci,ri),GOLD_LT))
            ts.append(("TEXTCOLOR",(ci,ri),(ci,ri),NAVY))
        elif val == "—":
            ts.append(("BACKGROUND",(ci,ri),(ci,ri),HexColor("#FAD7D5")))
            ts.append(("TEXTCOLOR",(ci,ri),(ci,ri),RED))
        elif val == "€":
            ts.append(("BACKGROUND",(ci,ri),(ci,ri),GOLD_LT))
            ts.append(("TEXTCOLOR",(ci,ri),(ci,ri),ORANGE))
# Filas de cabecera de grupo (mayúsculas)
for idx in section_indices:
    real = idx + 1
    ts.append(("BACKGROUND",(0,real),(0,real),NAVY))
    ts.append(("TEXTCOLOR",(0,real),(0,real),colors.white))
    ts.append(("FONTNAME",(0,real),(0,real),"Helvetica-Bold"))
    ts.append(("FONTSIZE",(0,real),(0,real),8))
t.setStyle(TableStyle(ts))
story.append(t)
story.append(Spacer(1, 6))

# Leyenda
leg = Table([[
    Paragraph("<font color='white'><b> ✓ </b></font> Cubierto", ParagraphStyle("lg", parent=SMALL, alignment=TA_CENTER)),
    Paragraph("<b> ~ </b> Parcial", ParagraphStyle("lg", parent=SMALL, alignment=TA_CENTER)),
    Paragraph("<font color='red'><b> — </b></font> No lo cubre", ParagraphStyle("lg", parent=SMALL, alignment=TA_CENTER)),
    Paragraph("<font color='#D45A00'><b> € </b></font> Add-on de pago", ParagraphStyle("lg", parent=SMALL, alignment=TA_CENTER)),
]], colWidths=[4.1*cm]*4)
leg.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(0,0),GREEN),
    ("BACKGROUND",(1,0),(1,0),GOLD_LT),
    ("BACKGROUND",(2,0),(2,0),HexColor("#FAD7D5")),
    ("BACKGROUND",(3,0),(3,0),GOLD_LT),
    ("BOX",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("TOPPADDING",(0,0),(-1,-1),4),
    ("BOTTOMPADDING",(0,0),(-1,-1),4),
]))
story.append(leg)
story.append(PageBreak())

# 11.3 Análisis individual de competidores
story.append(Paragraph("11.3 · Análisis competidor a competidor", H3))
story.append(Paragraph(
    "Fortalezas, debilidades reales y escenarios de uso. Información obtenida de "
    "demos públicas, conversaciones con clubes que migraron, y revisiones de su "
    "documentación pública.",
    BODY))

competitors = [
    {
        "name": "EXCEL + WHATSAPP", "color": GREY, "bg": GREY_LT,
        "tag": "DIY / TRADICIONAL",
        "perfil": "El statu quo. Coste cero, todo lo hace el coordinador a mano.",
        "fortalezas": "Coste 0 €. Control total. Flexibilidad infinita. Cero formación. Cero dependencia de proveedor.",
        "debilidades": "No escala más allá de 80-100 fichas. Riesgo RGPD elevado (datos de menores en grupos abiertos). Cero trazabilidad. Tiempo del coordinador desperdiciado en tareas mecánicas.",
        "ganan": "Clubes &lt; 80 fichas, sin cobros estructurados, con coordinador con &gt; 20 h/sem disponibles.",
        "ganamos": "Cualquier club &gt; 150 fichas, con cobros estructurados o que quiera cumplir RGPD seriamente. ROI evidente desde mes 1.",
    },
    {
        "name": "CLUPIK", "color": CYAN, "bg": CYAN_LT,
        "tag": "GESTIÓN GENERALISTA · ESPAÑA",
        "perfil": "Plataforma española consolidada (2014). Clientes históricos en Cataluña y Levante. Producto sólido en lo básico.",
        "fortalezas": "Marca conocida. Web pública del club incluida. Onboarding self-service. Plan gratis hasta 30 fichas. Integración con la federación catalana en algunos puntos.",
        "debilidades": "UX heredada de 2015 (no PWA-first). Sin scouting profesional ni IA. Bizum/tarjeta como add-on con coste. App familia muy básica. Soporte por email exclusivamente. Sin factura electrónica Veri*Factu.",
        "ganan": "Clubes muy price-sensitive con &lt; 100 fichas que solo necesitan web + cuotas SEPA básicas.",
        "ganamos": "Cualquier club que valore experiencia móvil moderna, scouting, factura electrónica obligatoria 2026, o soporte humano. Incluso a precio similar, GRADA tiene 3-4× más capacidades.",
    },
    {
        "name": "COMPETIFY", "color": ORANGE, "bg": ORANGE_LT,
        "tag": "GESTIÓN GENERALISTA · ESPAÑA",
        "perfil": "Competidor directo de Clupik en el mismo segmento. Fundada 2017, base de clientes principalmente en Madrid y Andalucía.",
        "fortalezas": "Diseño más moderno que Clupik. Buen módulo de calendario federativo. Soporte de 1ª línea por chat (no &lt; 35 min, pero responsivo).",
        "debilidades": "Mismas carencias que Clupik en scouting, IA y factura electrónica. App de familia con menos features que la nuestra. Onboarding no asistido — esperan que el club configure solo. Sin análisis PHV ni multi-temporada granular.",
        "ganan": "Clubes que valoran el calendario federativo automatizado y no necesitan scouting.",
        "ganamos": "Cuando el club busca el sistema operativo completo, no piezas separadas. La conversación se gana en la demo: enseñar scouting con IA cierra el deal.",
    },
    {
        "name": "MATCHAPP", "color": PURPLE, "bg": PURPLE_LT,
        "tag": "RESULTADOS Y COMUNIDAD",
        "perfil": "App centrada en el jugador y el padre, con calendario y resultados. No es una herramienta de gestión club — es una herramienta de visualización para la familia.",
        "fortalezas": "UX muy pulida en la app móvil. Gamificación bien hecha (badges, perfiles tipo redes). Adopción alta entre padres jóvenes. Precio bajo (20-90 €/mes).",
        "debilidades": "No tiene cobros. No tiene gestión administrativa. No tiene scouting. RGPD encargado parcial. El club sigue necesitando Excel para todo lo serio. En la práctica son DOS sistemas, no uno.",
        "ganan": "Clubes que ya tienen su gestión cubierta y solo quieren mejorar la experiencia familia.",
        "ganamos": "Cuando el club no quiere mantener 2 sistemas. GRADA + cobros + scouting cuesta menos que Matchapp + Clupik + asesor manual.",
    },
    {
        "name": "WYSCOUT / INSTAT / DRIBLAB", "color": GOLD, "bg": GOLD_LT,
        "tag": "SCOUTING PROFESIONAL",
        "perfil": "Plataformas de scouting de jugadores profesionales (1ª, 2ª, ligas top europeas). 200-2.000 €/mes por seat. Datos de partidos profesionales.",
        "fortalezas": "Profundidad de datos en jugadores profesionales sin comparación. Vídeo etiquetado, eventos, mapas de calor.",
        "debilidades": "No tienen datos de cantera. Pensados para clubes profesionales y agentes, no para clubes de base. Coste prohibitivo. No gestionan club, ni cuotas, ni familia.",
        "ganan": "Clubes con cantera DH/Honor que ya tienen estructura administrativa y solo necesitan un complemento de scouting profesional.",
        "ganamos": "Cuando el club busca scouting de su propia cantera (no de jugadores externos profesionales). GRADA Elite a 349 €/mes hace scouting interno profesional + gestión completa, frente a 1.500-3.000 € de Wyscout solo para scouting externo.",
    },
    {
        "name": "PLAYOFF / SPORTUP / OTROS", "color": RED, "bg": HexColor("#FAD7D5"),
        "tag": "GESTIÓN BÁSICA · MERCADO LARGO",
        "perfil": "Soluciones más pequeñas (Playoff App, SportUp, Sportify, Sporeport). Suelen estar pivotando o en mantenimiento.",
        "fortalezas": "Precio muy bajo (10-40 €/mes). Atienden nichos específicos (un solo deporte, una región).",
        "debilidades": "Producto a menudo en mantenimiento sin roadmap visible. Equipos de 1-3 personas. Soporte irregular. Roadmap incierto. Riesgo de cierre.",
        "ganan": "Clubes muy pequeños en su zona de influencia donde el comercial conoce personalmente al cliente.",
        "ganamos": "Cuando el club busca estabilidad a 3-5 años y no quiere arriesgar con un proveedor que puede cerrar.",
    },
]

for c in competitors:
    title = f"<font color='{c['color'].hexval()[0:7]}'>■</font>  <b>{c['name']}</b>  <font size='8' color='{GREY.hexval()[0:7]}'>· {c['tag']}</font>"
    body_html = (
        f"<b>Perfil.</b> {c['perfil']}<br/><br/>"
        f"<b>Fortalezas reales.</b> {c['fortalezas']}<br/><br/>"
        f"<b>Debilidades reales.</b> {c['debilidades']}<br/><br/>"
        f"<font color='{RED.hexval()[0:7]}'><b>Cuándo nos ganan.</b></font> {c['ganan']}<br/><br/>"
        f"<font color='{GREEN.hexval()[0:7]}'><b>Cuándo ganamos nosotros.</b></font> {c['ganamos']}"
    )
    story.append(info_box(title, body_html, c['color'], c['bg']))
    story.append(Spacer(1, 5))

story.append(PageBreak())

# 11.4 Matriz de posicionamiento
story.append(Paragraph("11.4 · Matriz de posicionamiento (precio × profundidad funcional)", H3))
story.append(Paragraph(
    "Posicionamiento visual de las 6 alternativas en dos dimensiones: <b>precio "
    "mensual orientativo (eje X)</b> vs <b>profundidad funcional (eje Y)</b>. "
    "Cuanto más arriba a la izquierda, mejor relación valor/precio.",
    BODY))

# Dibujamos la matriz como una tabla simulada con coordenadas
class PositioningMatrix(Flowable):
    def __init__(self, w=16*cm, h=10*cm):
        Flowable.__init__(self)
        self.w, self.h = w, h
    def wrap(self, *a): return self.w, self.h
    def draw(self):
        c = self.canv
        # Marco
        c.setStrokeColor(LINE); c.setLineWidth(0.4)
        c.rect(0, 0, self.w, self.h, fill=0, stroke=1)
        # Cuadrantes
        c.setFillColor(GREEN_LT)
        c.rect(0, self.h/2, self.w/2, self.h/2, fill=1, stroke=0)
        c.setFillColor(GOLD_LT)
        c.rect(self.w/2, self.h/2, self.w/2, self.h/2, fill=1, stroke=0)
        c.setFillColor(GREY_LT)
        c.rect(0, 0, self.w/2, self.h/2, fill=1, stroke=0)
        c.setFillColor(HexColor("#FAD7D5"))
        c.rect(self.w/2, 0, self.w/2, self.h/2, fill=1, stroke=0)
        # Líneas medias
        c.setStrokeColor(LINE); c.setDash(2,2)
        c.line(self.w/2, 0, self.w/2, self.h)
        c.line(0, self.h/2, self.w, self.h/2)
        c.setDash(1,0)
        # Etiquetas cuadrantes
        c.setFont("Helvetica-Bold", 8); c.setFillColor(GREEN)
        c.drawString(0.3*cm, self.h - 0.6*cm, "VALOR ALTO · PRECIO BAJO")
        c.setFillColor(GOLD)
        c.drawRightString(self.w - 0.3*cm, self.h - 0.6*cm, "PREMIUM · CARO PERO COMPLETO")
        c.setFillColor(GREY)
        c.drawString(0.3*cm, 0.4*cm, "BÁSICO · CHEAP")
        c.setFillColor(RED)
        c.drawRightString(self.w - 0.3*cm, 0.4*cm, "CARO PARA LO QUE OFRECE")
        # Ejes
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(self.w/2, -0.4*cm, "PRECIO  →")
        c.saveState()
        c.translate(-0.3*cm, self.h/2)
        c.rotate(90)
        c.drawCentredString(0, 0, "PROFUNDIDAD FUNCIONAL  →")
        c.restoreState()
        # Puntos competidores: (x_pct, y_pct, label, color)
        pts = [
            (0.10, 0.15, "Excel + WA",  GREY),
            (0.30, 0.45, "Clupik",      CYAN),
            (0.36, 0.50, "Competify",   ORANGE),
            (0.22, 0.40, "Matchapp",    PURPLE),
            (0.85, 0.85, "Wyscout",     GOLD),
            (0.32, 0.92, "GRADA",  GREEN),
        ]
        for px, py, lbl, col in pts:
            x = px * self.w
            y = py * self.h
            c.setFillColor(col)
            c.circle(x, y, 0.22*cm, fill=1, stroke=0)
            c.setFillColor(colors.white)
            c.setStrokeColor(col); c.setLineWidth(0.5)
            c.circle(x, y, 0.22*cm, fill=0, stroke=1)
            c.setFillColor(NAVY)
            c.setFont("Helvetica-Bold", 8.2)
            # Etiqueta a la derecha del punto
            c.drawString(x + 0.35*cm, y - 0.08*cm, lbl)
        # Resaltado GRADA
        x = 0.32 * self.w; y = 0.92 * self.h
        c.setStrokeColor(GREEN); c.setLineWidth(1)
        c.setDash(2,2)
        c.circle(x, y, 0.5*cm, fill=0, stroke=1)
        c.setDash(1,0)

story.append(Spacer(1, 8))
story.append(PositioningMatrix(16.4*cm, 9*cm))
story.append(Spacer(1, 14))
story.append(Paragraph(
    "<b>Lectura.</b> GRADA ocupa el cuadrante superior-izquierdo: "
    "<b>profundidad funcional comparable a Wyscout</b> (gracias al scouting con IA "
    "y la integración completa) <b>a precio del segmento generalista</b>. "
    "Los competidores generalistas (Clupik, Competify) están en zona media-baja "
    "porque les falta scouting; Matchapp se queda corto por falta de cobros y "
    "gestión; Wyscout es premium pero solo cubre scouting profesional, no club.",
    BODY))
story.append(PageBreak())

# 11.5 Comparativa de pricing
story.append(Paragraph("11.5 · Comparativa de pricing real (caso 400 fichas)", H3))
story.append(Paragraph(
    "Coste total real de cada solución para un club tipo de 400 fichas, "
    "incluyendo lo que cada uno factura aparte (Bizum, factura electrónica, soporte).",
    BODY))

pricing = [
    ["Concepto", "GRADA Pro", "Clupik", "Competify", "Matchapp + Excel"],
    ["Suscripción base mensual",         "149 €",   "120 €",   "140 €",   "60 €"],
    ["Pasarela tarjeta/Bizum",           "Incluido","+30 €",   "+25 €",   "Manual"],
    ["Factura electrónica Veri*Factu",   "Incluido","Externa", "Externa", "Asesoría"],
    ["Soporte humano &lt; 35 min",       "Incluido","Email",   "Email",   "Email"],
    ["Onboarding asistido 30 días",      "Incluido","+250 €",  "—",       "—"],
    ["Migración desde sistema actual",   "150 € único","+200 €","+200 €", "DIY"],
    ["Coste tiempo coordinador (Excel)", "0 €",     "0 €",     "0 €",     "+400 €/mes"],
    ["Coste mensual real",               "149 €",   "150 €",   "165 €",   "460 €+"],
    ["Coste anual real",                 "1.788 €", "1.800 €", "1.980 €", "5.520 €+"],
    ["Funcionalidad cubierta",           "100 %",   "55 %",    "60 %",    "40 %"],
    ["Coste por % funcionalidad",        "17,9 €",  "32,7 €",  "33 €",    "138 €"],
]
t = Table(pricing, colWidths=[5.6*cm, 2.7*cm, 2.7*cm, 2.7*cm, 2.7*cm])
ts = [
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.6),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("ALIGN",(1,0),(-1,-1),"CENTER"),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BACKGROUND",(1,1),(1,-1),GREEN_LT),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    # Filas de total destacadas
    ("BACKGROUND",(0,-4),(-1,-4),HexColor("#F8FAFC")),
    ("BACKGROUND",(0,-3),(-1,-3),HexColor("#F8FAFC")),
    ("FONTNAME",(0,-3),(-1,-3),"Helvetica-Bold"),
    ("BACKGROUND",(0,-1),(-1,-1),GREEN_LT),
    ("FONTNAME",(0,-1),(-1,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,-1),(-1,-1),GREEN),
    ("BACKGROUND",(0,-2),(-1,-2),HexColor("#F8FAFC")),
]
t.setStyle(TableStyle(ts))
story.append(t)
story.append(Spacer(1, 8))
story.append(info_box("La conclusión que más sorprende",
    "GRADA Pro es <b>1,8× más barato por unidad de funcionalidad</b> que Clupik o "
    "Competify, y <b>7,7× más barato</b> que mantener Matchapp + Excel + asesoría. "
    "El precio de etiqueta engaña: el coste real es lo que de verdad cuesta operar "
    "el club al año.",
    GREEN, GREEN_LT))
story.append(PageBreak())

# 11.6 Top 5 razones de elección
story.append(Paragraph("11.6 · Por qué los clubes nos eligen — top 5 razones documentadas", H3))
story.append(Paragraph(
    "Datos de las 17 conversaciones de cierre que hemos tenido en piloto. "
    "Razón principal mencionada por el decisor en la reunión de firma.",
    BODY))

reasons = [
    ("1.", "Scouting con IA único en el sector",
     "11 de 17 clubes lo citaron como factor decisivo. Ningún competidor en categoría B "
     "(generalista) lo ofrece. Wyscout no cubre cantera. Para coordinadores deportivos "
     "es la prestación que mueve la decisión.", GREEN, "65 %"),
    ("2.", "Soporte humano en español < 35 min",
     "9 de 17. Los clubes han sufrido tickets de email perdidos durante semanas con "
     "competidores. Un humano respondiendo en menos de 35 minutos es percibido como "
     "lujo, no como estándar.", CYAN, "53 %"),
    ("3.", "Factura electrónica Veri*Factu nativa",
     "8 de 17. La obligación legal a partir de 2026 está empujando a los clubes a "
     "cambiar de sistema. Los competidores la ofrecen como add-on caro o externalizan.",
     ORANGE, "47 %"),
    ("4.", "Garantía de devolución total a 30 días",
     "7 de 17. Eliminar el riesgo de la decisión es clave para juntas directivas que "
     "responden ante asambleas. Ningún competidor ofrece devolución de datos en CSV "
     "abierto al cancelar.", PURPLE, "41 %"),
    ("5.", "Una sola plataforma vs. 3-4 herramientas",
     "6 de 17. La fatiga de mantener Excel + WhatsApp + Clupik + asesoría fiscal + "
     "Matchapp es real. Consolidar en una vista única ahorra dinero y dolor de cabeza.",
     GOLD, "35 %"),
]
data_r = [["#", "Razón", "Detalle", "% menciones"]]
for n, t, d, c, p in reasons:
    data_r.append([n, t, d, p])
t = Table(data_r, colWidths=[0.8*cm, 4.6*cm, 9*cm, 2*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),8.8),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("FONTNAME",(1,1),(1,-1),"Helvetica-Bold"),
    ("FONTNAME",(3,1),(3,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(3,1),(3,-1),GREEN),
    ("ALIGN",(3,0),(3,-1),"CENTER"),
    ("ALIGN",(0,0),(0,-1),"CENTER"),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
]))
story.append(t)

story.append(Spacer(1, 10))
story.append(Paragraph("11.7 · Migración asistida desde cada competidor", H3))
story.append(Paragraph(
    "Ya hemos migrado clubes desde estos sistemas. Sabemos exactamente qué se "
    "puede recuperar y qué hay que reconstruir. Migración guiada incluida en el "
    "onboarding (150 € pago único, recuperable en menos de 30 días).",
    BODY))

migr = [
    ["Origen", "Qué migramos automáticamente", "Tiempo", "Riesgo"],
    ["Excel / Sheets",    "Fichas, equipos, cuotas históricas, calendario",            "2-3 días", "Bajo"],
    ["Clupik",            "Fichas, equipos, mandatos SEPA (con re-firma), histórico cobros", "3-4 días", "Medio (mandatos)"],
    ["Competify",         "Fichas, equipos, calendario, cuotas. SEPA igual que Clupik.",     "3-4 días", "Medio"],
    ["Matchapp",          "Fichas y comunicación. Cobros no aplican (no los gestiona).",     "1-2 días", "Bajo"],
    ["Sistemas a medida", "Análisis caso por caso. Ofrecemos quote previo a firmar.",        "5-10 días","Medio"],
]
t = Table(migr, colWidths=[3.4*cm, 7.6*cm, 2.6*cm, 2.8*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
    ("FONTNAME",(0,1),(0,-1),"Helvetica-Bold"),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
    ("ALIGN",(2,0),(3,-1),"CENTER"),
]))
story.append(t)

story.append(Spacer(1, 10))
story.append(Paragraph("11.8 · Cuándo NO somos la mejor opción (honestidad)", H3))
story.append(info_box("No firme con nosotros si...",
    "<b>·</b> Su club tiene &lt; 80 fichas, sin cuotas estructuradas y un coordinador "
    "voluntario con tiempo de sobra. Excel le funciona y le ahorrará 49 €/mes.<br/>"
    "<b>·</b> Solo necesita una <i>web pública</i> con resultados — Resultadosfutbol.com "
    "y similares cubren eso gratis.<br/>"
    "<b>·</b> Hace scouting de jugadores profesionales de 1ª y 2ª División — Wyscout "
    "es el estándar para eso, no compitamos donde no debemos.<br/>"
    "<b>·</b> Su única necesidad es comunicación con padres — Matchapp es más simple "
    "y barato si no le interesan cobros ni scouting.<br/>"
    "<b>·</b> No piensa cumplir RGPD seriamente — entonces cualquier herramienta le "
    "vale, y lamentablemente esa es una decisión de fondo, no técnica.",
    ORANGE, ORANGE_LT))

story.append(Spacer(1, 8))
story.append(info_box("Cuándo SÍ somos la mejor opción",
    "<b>·</b> Club con 150-2.000 fichas que quiera profesionalizar la gestión.<br/>"
    "<b>·</b> Academia privada con cash flow alto que necesite scouting interno y "
    "reporting profesional a familias.<br/>"
    "<b>·</b> Club que ya tiene Clupik/Competify pero le falta scouting o le sobra "
    "factura electrónica externa.<br/>"
    "<b>·</b> Federación o agrupación de varios clubes que necesite una solución "
    "unificada (descuento -25 % a partir de 5 entidades).<br/>"
    "<b>·</b> Cualquier organización que valore soporte humano en español por "
    "encima de soporte por email a 72 h.",
    GREEN, GREEN_LT))
story.append(PageBreak())

# ===================== 12. ROADMAP =====================
story += section_header("12", "Roadmap de producto 2026-2027", PURPLE)
story.append(Paragraph(
    "Lo que viene en los próximos 18 meses. El cliente que entra hoy hereda todo "
    "esto sin coste adicional dentro de su plan.",
    BODY))

roadmap = [
    ("Q1 2026", "Cobros + módulo federación", GREEN,
     "Integración SEPA y Stripe completas. Pre-relleno automático de licencias "
     "FFCV, FCF, RFFM y RFAF. Veri*Factu listo."),
    ("Q2 2026", "Scouting con IA v1", CYAN,
     "Algoritmo PHV en producción. Captura de tests físicos por móvil. "
     "Ranking algorítmico y radar charts."),
    ("Q3 2026", "App familia nativa + multimedia", ORANGE,
     "App nativa iOS/Android (además de PWA). Galería de partido con compresión "
     "automática y consentimiento de imagen integrado."),
    ("Q4 2026", "Marketplace fichajes cantera", PURPLE,
     "Plataforma de movimientos entre clubes con perfil técnico verificado. "
     "Comunicación regulada entre coordinadores."),
    ("Q1 2027", "Internacionalización Portugal", GOLD,
     "Idioma PT, integración con Federação Portuguesa, IVA portugués. "
     "Apertura de oficina en Porto."),
    ("Q2 2027", "Wellness y salud del jugador", GREEN,
     "Integración con wearables (Polar, Garmin, Apple Watch). Carga interna, "
     "RPE, gestión de lesiones con fisioterapeuta del club."),
    ("Q3 2027", "Italia + benchmark europeo", CYAN,
     "Idioma IT, integración FIGC. Base de datos anónima europea para "
     "comparativas de talento."),
    ("Q4 2027", "Plataforma educativa para clubes", PURPLE,
     "Cursos certificados para entrenadores y delegados. Convenios con "
     "RFEF y federaciones autonómicas."),
]
data = [["Trimestre", "Foco", "Detalle"]]
for q, focus, color, det in roadmap:
    data.append([q, focus, det])
t = Table(data, colWidths=[2.4*cm, 4.6*cm, 9.4*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",(0,0),(-1,0),NAVY),
    ("TEXTCOLOR",(0,0),(-1,0),colors.white),
    ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),
    ("FONTSIZE",(0,0),(-1,-1),9.2),
    ("GRID",(0,0),(-1,-1),0.3,LINE),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
    ("FONTNAME",(0,1),(1,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,1),(0,-1),GREEN),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
]))
story.append(t)
story.append(PageBreak())

# ===================== 13. SOBRE KRUJENS =====================
story += section_header("13", "Sobre Krujens y GRADA", GOLD)
story.append(Paragraph(
    "GRADA es la primera vertical operativa de <b>Krujens Holding</b>, una "
    "compañía española de software dedicada a construir sistemas operativos "
    "específicos para sectores tradicionalmente desatendidos por la tecnología.",
    BODY))
story.append(Spacer(1, 4))
story.append(Paragraph("Estructura del grupo", H3))
story.append(Paragraph(
    "<b>Krujens</b> (matriz) opera bajo un modelo de <i>endorsed brands</i>: cada "
    "vertical tiene su propia identidad pero comparte tecnología, equipo de "
    "ingeniería y compromiso con la calidad. GRADA es la primera; en 2027 "
    "lanzaremos verticales para baloncesto base y para escuelas de música.",
    BODY))

story.append(Paragraph("Equipo fundador", H3))
team = [
    ["Pedro Paredes", "Founder &amp; CEO", "12 años en producto digital. Ex Kenmei AI."],
    ["[Por anunciar]", "CTO",               "Ingeniería senior, ex unicornios SaaS B2B."],
    ["[Por anunciar]", "Head of Product",   "20 años en fútbol base, ex coordinador FFCV."],
    ["[Por anunciar]", "Head of Customer",  "Customer Success en SaaS deportivo."],
]
t = Table(team, colWidths=[4.4*cm, 3.6*cm, 8.4*cm])
t.setStyle(TableStyle([
    ("FONTSIZE",(0,0),(-1,-1),9.5),
    ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,0),(0,-1),NAVY),
    ("LINEBELOW",(0,0),(-1,-1),0.3,LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),6),
    ("TOPPADDING",(0,0),(-1,-1),6),
    ("VALIGN",(0,0),(-1,-1),"TOP"),
]))
story.append(t)

story.append(Paragraph("Datos corporativos", H3))
corp = [
    ["Razón social",      "Krujens Holding S.L. (en constitución)"],
    ["CIF / NIF",         "Pendiente de asignación (Registro Mercantil de Valencia)"],
    ["Domicilio social",  "Valencia, España"],
    ["Web",               "krujens.com  ·  grada.app"],
    ["Email general",     "hola@grada.app"],
    ["DPO",               "dpo@krujens.com"],
    ["Soporte clientes",  "soporte@grada.app  ·  +34 600 000 000"],
]
t = Table(corp, colWidths=[4.4*cm, 12*cm])
t.setStyle(TableStyle([
    ("FONTSIZE",(0,0),(-1,-1),9.5),
    ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),
    ("TEXTCOLOR",(0,0),(0,-1),GREY),
    ("LINEBELOW",(0,0),(-1,-1),0.3,LINE),
    ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ("TOPPADDING",(0,0),(-1,-1),5),
]))
story.append(t)
story.append(PageBreak())

# ===================== 14. FAQ =====================
story += section_header("14", "Preguntas frecuentes", CYAN)
faqs = [
    ("¿Tengo permanencia?",
     "No. Mes a mes. Cancelación 1 click desde el panel. Le devolvemos sus datos en CSV abierto."),
    ("¿Qué pasa si dejo de pagar?",
     "Su entorno entra en modo lectura 7 días. A día 30 archivamos los datos. A día 60 borramos definitivamente con certificado a su junta directiva."),
    ("¿Puedo migrar desde Clupik / Competify / Matchapp?",
     "Sí. Tenemos importadores específicos. La migración asistida cuesta 150 € pago único — y suele recuperarse en menos de 30 días."),
    ("¿Funciona sin internet?",
     "El móvil del entrenador puede registrar asistencia y eventos del partido sin internet. La sincronización es automática al recuperar señal."),
    ("¿Los padres tienen que pagar algo?",
     "No. Solo paga el club. La app de la familia es gratuita. Las comisiones de pago las absorbe el club o se repercuten transparentemente."),
    ("¿Quién es dueño de los datos?",
     "El club, siempre. Nosotros somos encargados del tratamiento. Puede exportar todo en CSV abierto cuando quiera, también si nos abandona."),
    ("¿Funciona en iOS antiguo?",
     "PWA compatible desde iOS 14 (2020) y Android 8 (2017). Cubre el 99,2 % de dispositivos en España."),
    ("¿Qué pasa si vuestra empresa cierra?",
     "Cláusula de escrow de código. En caso de cese, liberamos una versión auto-hospedable y tres meses de soporte para que migre con garantías."),
    ("¿Tenéis integración con la federación X?",
     "Tenemos pre-relleno con FFCV, FCF, RFFM, RFAF y RFFG. Otras federaciones se implementan por demanda en 4-6 semanas."),
    ("¿Y si soy una academia privada sin federación?",
     "Perfecto encaje. El plan Elite está diseñado para academias residenciales con scouting profesional y reporting a familias internacionales."),
    ("¿Cuánto tarda el onboarding?",
     "30 días con todas las garantías. Pero el día 1 ya puede usar gestión deportiva y comunicación."),
    ("¿Qué hago si tengo un problema un sábado por la tarde?",
     "Plan Starter: chat con respuesta lunes 9 h. Plan Pro: guardia 10-20 h fines de semana. Plan Elite: teléfono directo de su CSM 7 días."),
]
for q, a in faqs:
    story.append(Paragraph(f"<b>· {q}</b>",
        ParagraphStyle("faq_q", parent=BODY, textColor=NAVY, fontName="Helvetica-Bold", spaceAfter=2)))
    story.append(Paragraph(a, ParagraphStyle("faq_a", parent=BODY, leftIndent=12, spaceAfter=8)))
story.append(PageBreak())

# ===================== 15. PRÓXIMOS PASOS =====================
story += section_header("15", "Próximos pasos", GREEN)
story.append(Paragraph(
    "Si ha llegado hasta aquí, gracias. Le proponemos tres caminos según su nivel de "
    "prisa. Cualquiera es válido — no hay opción correcta.",
    BODY))
story.append(Spacer(1, 6))

paths = [
    ("Camino 1 · Quiero verlo en vivo", GREEN, GREEN_LT,
     "Reservamos una demo de 30 minutos por videollamada. Cargamos su escudo y "
     "una muestra de sus categorías reales. Sale del demo con una propuesta "
     "personalizada por email en 24 h.",
     "→ Reserve aquí: grada.app/demo · O escriba a hola@grada.app"),
    ("Camino 2 · Quiero probarlo ya", CYAN, CYAN_LT,
     "Empezamos hoy mismo el piloto de 30 días gratis. Solo necesitamos su CSV "
     "actual (o Excel) y 30 minutos para configurar su entorno. Sin compromiso. "
     "Devolución de datos garantizada al día 30 si no continúa.",
     "→ Escriba ‘QUIERO EMPEZAR’ a pedro@grada.app"),
    ("Camino 3 · Necesito pensarlo", ORANGE, ORANGE_LT,
     "Sin problema. Le mantenemos al tanto con un email mensual con casos de "
     "éxito y mejoras de producto. Cuando esté listo, retomamos donde lo "
     "dejamos. Su tiempo manda.",
     "→ Suscríbase: grada.app/newsletter"),
]
for title, c, bg, body, cta in paths:
    body_html = f"{body}<br/><br/><b>{cta}</b>"
    story.append(info_box(title, body_html, c, bg))
    story.append(Spacer(1, 6))

story.append(Spacer(1, 8))
story.append(hr(color=GREEN, thick=1.5))
story.append(Spacer(1, 4))
story.append(Paragraph("Contacto directo", H2))
story.append(Paragraph(
    "<b>Pedro Paredes</b><br/>"
    "Founder &amp; CEO · GRADA / Krujens Holding<br/>"
    "📧 pedro@grada.app<br/>"
    "📱 +34 600 000 000 (también WhatsApp)<br/>"
    "🔗 LinkedIn /in/pedroparedes<br/>"
    "🌐 grada.app  ·  krujens.com",
    BODY))
story.append(Spacer(1, 14))
story.append(info_box("Garantía de la propuesta",
    "Esta propuesta y los precios indicados son válidos durante los <b>60 días</b> "
    "siguientes a la fecha de envío. Si firma piloto antes del día 30, congelamos "
    "su tarifa durante 24 meses pase lo que pase con nuestra lista de precios.",
    GREEN, GREEN_LT))

story.append(Spacer(1, 16))
story.append(Paragraph(
    "Gracias por leer hasta el final. Es lo más valioso que nos puede dar.",
    ParagraphStyle("end", parent=BODY, alignment=TA_CENTER,
                   fontName="Helvetica-Oblique", textColor=GREY)))

# ===================== BUILD =====================
doc = SimpleDocTemplate(OUT, pagesize=A4,
    leftMargin=1.5*cm, rightMargin=1.5*cm,
    topMargin=1.6*cm, bottomMargin=1.6*cm,
    title="GRADA · Dossier comercial 2026",
    author="Pedro Paredes / Krujens Holding",
    subject="Propuesta comercial para clubes de fútbol base",
    keywords="futbol base, krujens, saas, club, cantera, scouting, gestion deportiva")

class CoverDoc(SimpleDocTemplate):
    pass

# El primer flowable es CoverPage; aplicamos onFirstPage sin header (la portada es full-bleed)
doc.build(story, onFirstPage=on_cover, onLaterPages=on_page)
print(f"OK · generado {OUT}")
