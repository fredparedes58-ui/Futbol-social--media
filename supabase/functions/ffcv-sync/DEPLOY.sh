#!/bin/bash
# ============================================================
# DEPLOY: Edge Function ffcv-sync a Supabase
# ============================================================
# Este script sube la Edge Function al servidor de Supabase
# y configura las variables de entorno necesarias.
# 
# REQUISITOS:
#   1. Tener Supabase CLI instalado: npm install -g supabase
#   2. Estar logueado: supabase login
#   3. Tener el Project ID de tu proyecto Supabase
#   4. Tener la Server Key de Firebase Cloud Messaging (FCM)
#
# ¿Dónde encontrar el FCM Server Key?
#   → Firebase Console → Tu Proyecto → ⚙️ Configuración → 
#     Cloud Messaging → Server key (API tradicional)
# ============================================================

# 1. Enlazar con tu proyecto Supabase (pon tu Project ID aquí)
echo "🔗 Enlazando con Supabase..."
# supabase link --project-ref TU_PROJECT_ID_AQUI

# 2. Subir los secretos de entorno a la Edge Function
echo "🔑 Configurando variables de entorno..."
# supabase secrets set FCM_SERVER_KEY="AAAA...tu_clave_fcm_aqui"

# 3. Desplegar la función
echo "🚀 Desplegando ffcv-sync..."
supabase functions deploy ffcv-sync --no-verify-jwt

echo "✅ Edge Function desplegada!"
echo ""
echo "══════════════════════════════════════════════"
echo "SIGUIENTE PASO: Configurar el Cron Job"
echo "══════════════════════════════════════════════"
echo ""
echo "Ve a Supabase Dashboard → Edge Functions → ffcv-sync"
echo "→ Schedule → Añadir estas reglas:"
echo ""
echo "• Sábados (días de partido):"
echo "  Cron: 0 8-14 * * 6"
echo "  (cada hora de 08:00 a 14:00 los sábados)"
echo ""
echo "• Domingos (días de partido):"  
echo "  Cron: 0 8-14 * * 0"
echo "  (cada hora de 08:00 a 14:00 los domingos)"
echo ""
echo "• Entre semana (horarios especiales):"
echo "  Cron: 0 17-21 * * 1-5"
echo "  (cada hora de 17:00 a 21:00 de L-V)"
echo ""
echo "• Chequeo rápido post-partido (más frecuente):"
echo "  Cron: */15 10-14 * * 6,0"
echo "  (cada 15 min de 10:00-14:00 sábados y domingos)"
echo ""
echo "══════════════════════════════════════════════"
echo "Para probar la función manualmente:"
echo "supabase functions invoke ffcv-sync --body '{\"manual\":true}'"
echo "══════════════════════════════════════════════"
