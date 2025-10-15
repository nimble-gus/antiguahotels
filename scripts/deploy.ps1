# Script de despliegue para Vercel en PowerShell
Write-Host "🚀 Iniciando proceso de despliegue..." -ForegroundColor Green

# Verificar que las variables de entorno estén configuradas
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL no está configurada" -ForegroundColor Red
    exit 1
}

if (-not $env:NEXTAUTH_SECRET) {
    Write-Host "❌ Error: NEXTAUTH_SECRET no está configurada" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Variables de entorno verificadas" -ForegroundColor Green

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# Generar cliente Prisma
Write-Host "🔧 Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate

# Ejecutar migraciones de base de datos
Write-Host "🗄️ Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
npx prisma db push

# Build del proyecto
Write-Host "🏗️ Construyendo proyecto..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "🌐 Tu aplicación estará disponible en: https://tu-dominio.vercel.app" -ForegroundColor Cyan

