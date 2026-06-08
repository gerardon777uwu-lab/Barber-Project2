#!/usr/bin/env bash
# 📋 CHECKLIST: MIGRACIÓN EmailJS → RESEND
# Ejecuta este script o completa los pasos manualmente

echo "═══════════════════════════════════════════════════════"
echo "   RICKY BARBER - MIGRACIÓN DE EMAILS (EmailJS → Resend)"
echo "═══════════════════════════════════════════════════════"
echo ""

# PASO 1: Verificar archivos creados
echo "📂 PASO 1: Verificando archivos..."
echo ""

files=(
  "js/resend/email.js"
  ".env.local"
  ".gitignore"
  "MIGRACION_RESEND.md"
  "RESUMEN_MIGRACION_RESEND.md"
  "API_BACKEND_RESEND.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ FALTA: $file"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🔐 PASO 2: SEGURIDAD - INVALIDAR API KEYS ANTIGUAS"
echo "   ⚠️  LAS KEYS QUE COMPARTISTE ESTÁN COMPROMETIDAS"
echo ""
echo "   1. Ve a: https://resend.com/api-keys"
echo "   2. Elimina las keys actuales"
echo "   3. Crea una NUEVA key"
echo "   4. Copia la key (comienza con 're_')"
echo ""

# PASO 2: Configurar .env.local
echo "═══════════════════════════════════════════════════════"
echo ""
echo "⚙️  PASO 3: CONFIGURAR .env.local"
echo ""
echo "   Abre .env.local y completa:"
echo ""
echo "   VITE_RESEND_API_KEY=re_TU_NUEVA_API_KEY_AQUI"
echo "   VITE_CLIENT_EMAIL=ricky@rickybarbershop.com"
echo "   VITE_ADMIN_EMAIL=ricky@rickybarbershop.com"
echo "   VITE_EMAIL_FROM_DOMAIN=rickybarbershop.com"
echo ""

# PASO 3: Verificar configuración
echo "═══════════════════════════════════════════════════════"
echo ""
echo "✅ PASO 4: VERIFICAR CONFIGURACIÓN"
echo ""

# Verificar que .env.local tiene la key
if grep -q "VITE_RESEND_API_KEY" .env.local; then
  if grep -q "VITE_RESEND_API_KEY=re_" .env.local; then
    echo "  ✅ API Key configurada correctamente"
  else
    echo "  ⚠️  API Key no parece válida (debe empezar con 're_')"
  fi
else
  echo "  ❌ VITE_RESEND_API_KEY no encontrada en .env.local"
fi

# Verificar que .gitignore protege .env.local
if grep -q ".env.local" .gitignore; then
  echo "  ✅ .env.local protegido en .gitignore"
else
  echo "  ⚠️  .env.local NO está en .gitignore (RIESGO DE SEGURIDAD)"
fi

# Verificar que index.html importa Resend
if grep -q "sendBookingEmails" index.html; then
  echo "  ✅ index.html actualizado con Resend"
else
  echo "  ❌ index.html no tiene la importación de Resend"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "🧪 PASO 5: TESTING"
echo ""
echo "   1. Abre http://localhost:3000 (o tu URL local)"
echo "   2. Abre la consola (F12)"
echo "   3. Llena el formulario de reserva"
echo "   4. Busca en la consola:"
echo "      ✓ 'Resend cargado'"
echo "      ✓ 'Iniciando envío de emails con Resend'"
echo "      ✓ 'Emails enviados exitosamente'"
echo ""
echo "   Si ves errores sobre 'API key', revisa .env.local"
echo ""

echo "═══════════════════════════════════════════════════════"
echo ""
echo "🚀 PASO 6: PRODUCCIÓN (Si está en Vercel)"
echo ""
echo "   1. Ve a Vercel → Tu proyecto"
echo "   2. Settings → Environment Variables"
echo "   3. Agrega las mismas variables:"
echo "      VITE_RESEND_API_KEY=..."
echo "      VITE_CLIENT_EMAIL=..."
echo "      VITE_ADMIN_EMAIL=..."
echo "   4. Redeploy"
echo ""

echo "═══════════════════════════════════════════════════════"
echo ""
echo "📚 DOCUMENTACIÓN"
echo ""
echo "   • MIGRACION_RESEND.md"
echo "     └─ Guía completa de configuración"
echo ""
echo "   • RESUMEN_MIGRACION_RESEND.md"
echo "     └─ Resumen rápido de cambios"
echo ""
echo "   • API_BACKEND_RESEND.js"
echo "     └─ Backend seguro para producción (opcional)"
echo ""
echo "   • Resend Docs: https://resend.com/docs"
echo ""

echo "═══════════════════════════════════════════════════════"
echo ""
echo "✨ MIGRACIÓN COMPLETADA"
echo ""
echo "Próximos pasos:"
echo "  1. Invalidar API keys antiguas ⚠️"
echo "  2. Generar nuevas keys en Resend"
echo "  3. Configurar .env.local"
echo "  4. Testear en desarrollo"
echo "  5. Desplegar a producción"
echo ""
echo "═══════════════════════════════════════════════════════"
