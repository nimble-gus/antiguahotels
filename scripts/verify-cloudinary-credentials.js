// Script para verificar credenciales de Cloudinary
require('dotenv').config()

console.log('🔍 Verificando credenciales de Cloudinary...\n')

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

console.log('📋 Variables de entorno:')
console.log(`CLOUDINARY_CLOUD_NAME: ${cloudName ? '✅ Configurado' : '❌ Faltante'}`)
console.log(`CLOUDINARY_API_KEY: ${apiKey ? '✅ Configurado' : '❌ Faltante'}`)
console.log(`CLOUDINARY_API_SECRET: ${apiSecret ? '✅ Configurado' : '❌ Faltante'}`)

if (cloudName && apiKey && apiSecret) {
  console.log('\n✅ Todas las credenciales están configuradas')
  console.log(`Cloud Name: ${cloudName}`)
  console.log(`API Key: ${apiKey.substring(0, 8)}...`)
  console.log(`API Secret: ${apiSecret.substring(0, 8)}...`)
} else {
  console.log('\n❌ Faltan credenciales. Agrega las siguientes líneas a tu .env:')
  console.log('CLOUDINARY_CLOUD_NAME="dqayvgwhj"')
  console.log('CLOUDINARY_API_KEY="tu_api_key_aqui"')
  console.log('CLOUDINARY_API_SECRET="tu_api_secret_aqui"')
}

console.log('\n📖 Para obtener tus credenciales:')
console.log('1. Ve a https://cloudinary.com/console')
console.log('2. Settings → Security → API Keys')
console.log('3. Copia API Key y API Secret')



