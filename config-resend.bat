@echo off
REM ⚡ CONFIGURADOR RESEND - VERSION BATCH
REM Script simple para actualizar .env.local

setlocal enabledelayedexpansion

color 0a
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 CONFIGURADOR AUTOMÁTICO PARA RESEND                ║
echo ║                                                            ║
echo ║  Este script actualiza automáticamente .env.local         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar archivos
echo 📋 VERIFICANDO ARCHIVOS...
echo.

if exist "js\resend\email.js" (
    echo   [✓] js/resend/email.js existe
) else (
    echo   [X] FALTA: js/resend/email.js
    pause
    exit /b 1
)

if exist ".env.local" (
    echo   [✓] .env.local existe
) else (
    echo   [X] FALTA: .env.local
    pause
    exit /b 1
)

findstr /M ".env" .gitignore >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [✓] .gitignore protege .env
) else (
    echo   [!] .gitignore NO protege .env
)

findstr /M "sendBookingEmails" index.html >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [✓] index.html tiene Resend
) else (
    echo   [X] index.html NO tiene Resend
)

echo.
echo ════════════════════════════════════════════════════════════
echo.
echo ⚠️  PASO PREVIO - INVALIDAR KEYS ANTIGUAS
echo.
echo Debes eliminar las API keys viejas (ESTÁN COMPROMETIDAS):
echo.
echo 1. Abre: https://resend.com/api-keys
echo 2. Haz click en "Delete" para cada key:
echo    • re_4y8p96wm_QbHKoUskMKRLdzN5uQaLpVdF
echo    • re_QLzLGcSx_BB2jsrausPm8gPe5GnMFu9cP
echo 3. Crea una NUEVA key ("Create API Key")
echo 4. Copia la key completa (comienza con 're_')
echo.
echo Presiona ENTER cuando hayas completado estos pasos...
pause

echo.
echo 🔑 Ahora pega tu NUEVA API key de Resend:
echo (Debe empezar con 're_')
echo.
set /p API_KEY="API Key: "

if "%API_KEY%"=="" (
    echo.
    echo ❌ Error: No ingresaste una API key
    pause
    exit /b 1
)

if not "%API_KEY:~0,3%"=="re_" (
    echo.
    echo ⚠️  Advertencia: La key debe empezar con 're_'
    echo.
    echo ¿Deseas continuar de todas formas? (S/N)
    set /p CONTINUE="Continuar: "
    if /i not "%CONTINUE%"=="S" (
        echo Cancelado.
        pause
        exit /b 1
    )
)

echo.
echo 📧 Email del cliente (donde recibe confirmación de cita):
echo (Deja en blanco para usar: ricky@rickybarbershop.com)
set /p CLIENT_EMAIL="Email: "

if "%CLIENT_EMAIL%"=="" (
    set "CLIENT_EMAIL=ricky@rickybarbershop.com"
)

echo.
echo 👤 Email del admin (Ricky - nuevas reservas):
echo (Deja en blanco para usar: ricky@rickybarbershop.com)
set /p ADMIN_EMAIL="Email: "

if "%ADMIN_EMAIL%"=="" (
    set "ADMIN_EMAIL=ricky@rickybarbershop.com"
)

echo.
echo 💾 Actualizando .env.local...
echo.

(
    echo # Created by Vercel CLI
    findstr "VERCEL_OIDC_TOKEN" .env.local
    echo.
    echo # ═══════════════════════════════════════════════════════════
    echo # RESEND EMAIL CONFIGURATION
    echo # ═══════════════════════════════════════════════════════════
    echo.
    echo # API Key de Resend para enviar emails
    echo VITE_RESEND_API_KEY=%API_KEY%
    echo.
    echo # Email del cliente
    echo VITE_CLIENT_EMAIL=%CLIENT_EMAIL%
    echo.
    echo # Email de Ricky
    echo VITE_ADMIN_EMAIL=%ADMIN_EMAIL%
    echo.
    echo # Dominio verificado en Resend
    echo VITE_EMAIL_FROM_DOMAIN=rickybarbershop.com
) > .env.local.tmp

move /Y .env.local.tmp .env.local >nul 2>&1

echo   ✅ .env.local actualizado
echo.

echo ════════════════════════════════════════════════════════════
echo.
echo ✨ CONFIGURACIÓN COMPLETADA
echo.
echo Resumen:
echo   • API Key: %API_KEY:~0,10%... (oculta por seguridad)
echo   • Email cliente: %CLIENT_EMAIL%
echo   • Email admin: %ADMIN_EMAIL%
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo   1. Abre consola en VS Code
echo   2. Escribe: npm run dev
echo   3. Abre: http://localhost:3000
echo   4. Presiona F12 (consola)
echo   5. Llena y envía un formulario de prueba
echo   6. Busca en consola: "✓ Emails enviados exitosamente"
echo   7. Revisa tu email (debe recibir confirmación)
echo.
echo 📚 DOCUMENTACIÓN:
echo   • 00_COMIENZA_AQUI.md
echo   • FAQ_RESEND.md
echo   • MIGRACION_RESEND.md
echo.
echo ════════════════════════════════════════════════════════════
echo.

pause
