#!/bin/bash

# Script de despliegue para Vercel
echo "🚀 Iniciando proceso de despliegue..."

# Verificar que las variables de entorno estén configuradas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Error: NEXTAUTH_SECRET no está configurada"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones de base de datos
echo "🗄️ Ejecutando migraciones de base de datos..."
npx prisma db push

# Build del proyecto
echo "🏗️ Construyendo proyecto..."
npm run build

echo "✅ Despliegue completado exitosamente!"
echo "🌐 Tu aplicación estará disponible en: https://tu-dominio.vercel.app"

