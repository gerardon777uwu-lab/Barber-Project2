#!/usr/bin/env powershell
# ⚡ CONFIGURADOR AUTOMÁTICO PARA RESEND
# Este script valida y configura el .env.local

param(
    [string]$ApiKey = "",
    [string]$ClientEmail = "",
    [string]$AdminEmail = "ricky@rickybarbershop.com"
)

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 CONFIGURADOR RESEND - ASISTENTE AUTO          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# PASO 1: Validar archivos
Write-Host "📋 PASO 1: VALIDANDO ARCHIVOS" -ForegroundColor Yellow
$files_ok = $true

if(Test-Path "js/resend/email.js") {
    Write-Host "  ✅ js/resend/email.js" -ForegroundColor Green
} else {
    Write-Host "  ❌ FALTA: js/resend/email.js" -ForegroundColor Red
    $files_ok = $false
}

if(Test-Path ".env.local") {
    Write-Host "  ✅ .env.local" -ForegroundColor Green
} else {
    Write-Host "  ❌ FALTA: .env.local" -ForegroundColor Red
    $files_ok = $false
}

if((Select-String ".env" .gitignore -ErrorAction SilentlyContinue)) {
    Write-Host "  ✅ .gitignore protege .env" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .gitignore no protege .env" -ForegroundColor Yellow
}

if(-not $files_ok) {
    Write-Host "`n❌ Faltan archivos. La migración no está completa." -ForegroundColor Red
    exit 1
}

# PASO 2: Mostrar estado actual
Write-Host "`n📝 PASO 2: ESTADO ACTUAL DE .env.local" -ForegroundColor Yellow

$env_content = @{
    "VITE_RESEND_API_KEY" = ""
    "VITE_CLIENT_EMAIL" = ""
    "VITE_ADMIN_EMAIL" = ""
    "VITE_EMAIL_FROM_DOMAIN" = ""
}

$envFile = Get-Content ".env.local"
foreach($line in $envFile) {
    if($line -match "^VITE_(\w+)=(.*)$") {
        $key = "VITE_$($matches[1])"
        $value = $matches[2]
        if($value) {
            $env_content[$key] = $value
            Write-Host "  $key = $value" -ForegroundColor Green
        } else {
            Write-Host "  $key = [VACÍO] ⚠️" -ForegroundColor Yellow
        }
    }
}

# PASO 3: Solicitar valores faltantes
Write-Host "`n⚙️  PASO 3: COMPLETAR CONFIGURACIÓN" -ForegroundColor Yellow

if(-not $env_content["VITE_RESEND_API_KEY"] -or $env_content["VITE_RESEND_API_KEY"] -eq "") {
    Write-Host "`n🔑 API Key de Resend:" -ForegroundColor Cyan
    Write-Host "  1. Ve a: https://resend.com/api-keys"
    Write-Host "  2. Elimina las keys viejas ⚠️"
    Write-Host "  3. Crea una NUEVA key"
    Write-Host "  4. Copia la key (comienza con 're_')"
    Write-Host "`nPega la API key aquí (o presiona ENTER para saltar): " -ForegroundColor White -NoNewline
    $ApiKey = Read-Host
}

if($ApiKey -and $ApiKey.StartsWith("re_")) {
    $env_content["VITE_RESEND_API_KEY"] = $ApiKey
    Write-Host "  ✅ API Key configurada" -ForegroundColor Green
} elseif($ApiKey) {
    Write-Host "  ⚠️  Advertencia: La key debe empezar con 're_'" -ForegroundColor Yellow
    Write-Host "  ⚠️  Se guardará de todas formas" -ForegroundColor Yellow
    if($ApiKey) { $env_content["VITE_RESEND_API_KEY"] = $ApiKey }
}

if(-not $env_content["VITE_CLIENT_EMAIL"] -or $env_content["VITE_CLIENT_EMAIL"] -eq "") {
    Write-Host "`n📧 Email del cliente (donde recibirá confirmaciones):" -ForegroundColor Cyan
    Write-Host "  Actual: [VACÍO]"
    Write-Host "  Sugerencia: $AdminEmail"
    Write-Host "Ingresa el email (o presiona ENTER para usar: $AdminEmail): " -ForegroundColor White -NoNewline
    $input_email = Read-Host
    if($input_email) {
        $env_content["VITE_CLIENT_EMAIL"] = $input_email
    } else {
        $env_content["VITE_CLIENT_EMAIL"] = $AdminEmail
    }
    Write-Host "  ✅ Email del cliente: $($env_content['VITE_CLIENT_EMAIL'])" -ForegroundColor Green
}

if(-not $env_content["VITE_ADMIN_EMAIL"] -or $env_content["VITE_ADMIN_EMAIL"] -eq "") {
    Write-Host "`n👤 Email del admin (Ricky - nuevas reservas):" -ForegroundColor Cyan
    Write-Host "  Actual: $AdminEmail"
    Write-Host "Ingresa el email (o presiona ENTER para mantener): " -ForegroundColor White -NoNewline
    $input_admin = Read-Host
    if($input_admin) {
        $env_content["VITE_ADMIN_EMAIL"] = $input_admin
    } else {
        $env_content["VITE_ADMIN_EMAIL"] = $AdminEmail
    }
    Write-Host "  ✅ Email del admin: $($env_content['VITE_ADMIN_EMAIL'])" -ForegroundColor Green
}

# PASO 4: Guardar cambios
Write-Host "`n💾 PASO 4: GUARDANDO CAMBIOS" -ForegroundColor Yellow

$new_content = @()
$new_content += "# Created by Vercel CLI"
$new_content += Get-Content ".env.local" | Select-String "VERCEL_OIDC_TOKEN"
$new_content += ""
$new_content += "# ═══════════════════════════════════════════════════════════"
$new_content += "# RESEND EMAIL CONFIGURATION"
$new_content += "# ═══════════════════════════════════════════════════════════"
$new_content += ""
$new_content += "# API Key de Resend para enviar emails"
$new_content += "VITE_RESEND_API_KEY=$($env_content['VITE_RESEND_API_KEY'])"
$new_content += ""
$new_content += "# Email del cliente (para recibir confirmaciones)"
$new_content += "VITE_CLIENT_EMAIL=$($env_content['VITE_CLIENT_EMAIL'])"
$new_content += ""
$new_content += "# Email de Ricky (admin, recibe notificaciones)"
$new_content += "VITE_ADMIN_EMAIL=$($env_content['VITE_ADMIN_EMAIL'])"
$new_content += ""
$new_content += "# Dominio verificado en Resend"
$new_content += "VITE_EMAIL_FROM_DOMAIN=rickybarbershop.com"

$new_content | Set-Content ".env.local" -Encoding UTF8

Write-Host "  ✅ .env.local actualizado" -ForegroundColor Green

# PASO 5: Verificación final
Write-Host "`n✅ PASO 5: VERIFICACIÓN FINAL" -ForegroundColor Yellow

$verified = 0
$total = 4

if((Select-String "VITE_RESEND_API_KEY=re_" ".env.local" -ErrorAction SilentlyContinue)) {
    Write-Host "  ✅ API Key configurada" -ForegroundColor Green
    $verified++
} else {
    Write-Host "  ⚠️  API Key no configurada o inválida" -ForegroundColor Yellow
}
$total--

if((Select-String "VITE_CLIENT_EMAIL=.+@" ".env.local" -ErrorAction SilentlyContinue)) {
    Write-Host "  ✅ Email del cliente configurado" -ForegroundColor Green
    $verified++
}

if((Select-String "VITE_ADMIN_EMAIL=.+@" ".env.local" -ErrorAction SilentlyContinue)) {
    Write-Host "  ✅ Email del admin configurado" -ForegroundColor Green
    $verified++
}

if((Test-Path "js/resend/email.js") -and (Select-String "sendBookingEmails" "index.html")) {
    Write-Host "  ✅ Módulo Resend integrado" -ForegroundColor Green
    $verified++
}

# RESUMEN
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    📊 RESUMEN                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n✨ CONFIGURACIÓN COMPLETADA`n" -ForegroundColor Green
Write-Host "Verificaciones pasadas: $verified/4" -ForegroundColor Green

if($verified -eq 4) {
    Write-Host "`n✅ ¡LISTO PARA TESTEAR!" -ForegroundColor Green
    Write-Host "  1. npm run dev"
    Write-Host "  2. Abre http://localhost:3000"
    Write-Host "  3. F12 → Consola"
    Write-Host "  4. Llena formulario de reserva"
    Write-Host "  5. Busca: '✓ Emails enviados exitosamente'"
} else {
    Write-Host "`n⚠️  Algunas verificaciones fallaron" -ForegroundColor Yellow
    Write-Host "  Mira FAQ_RESEND.md para solucionar problemas" -ForegroundColor Yellow
}

Write-Host "`n📚 DOCUMENTACIÓN:" -ForegroundColor Yellow
Write-Host "  • 00_COMIENZA_AQUI.md"
Write-Host "  • FAQ_RESEND.md"
Write-Host "  • MIGRACION_RESEND.md"

Write-Host "`n═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
