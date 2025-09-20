# 🚀 Configuración de Cloudinary para Uploads

## ⚠️ Problema Actual
El error de timeout indica que necesitas configurar un **Upload Preset** en tu cuenta de Cloudinary.

## 🔧 Solución Rápida

### 1. Ve a tu Dashboard de Cloudinary
- Accede a: https://cloudinary.com/console
- Inicia sesión con tu cuenta

### 2. Configurar Upload Preset
1. Ve a **Settings** → **Upload**
2. Busca la sección **Upload presets**
3. Haz clic en **Add upload preset**
4. Configura así:
   - **Preset name**: `ml_default` (o cualquier nombre)
   - **Signing Mode**: `Unsigned`
   - **Folder**: `website-images` (opcional)
   - **Resource Type**: `Image`
   - **Quality**: `Auto`
   - **Format**: `Auto`

### 3. Guardar y Activar
- Haz clic en **Save**
- Asegúrate de que esté **activo**

## 🎯 Variables de Entorno Necesarias

En tu archivo `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="dqayvgwhj"
CLOUDINARY_API_KEY="tu_api_key_aqui"
CLOUDINARY_API_SECRET="tu_api_secret_aqui"
```

## 🔍 Verificar Configuración

### Obtener tus credenciales:
1. En Cloudinary Dashboard → **Settings** → **Security**
2. Copia:
   - **Cloud name**: `dqayvgwhj` (ya lo tienes)
   - **API Key**: Cópiala de la sección API Keys
   - **API Secret**: Cópiala de la sección API Keys

## ✅ Probar la Configuración

Una vez configurado el preset:
1. Reinicia el servidor: `npm run dev`
2. Ve a `/dashboard/website-images`
3. Intenta subir una imagen pequeña (< 5MB)

## 🚨 Si Sigues Teniendo Problemas

### Alternativa 1: Usar Upload Preset Firmado
Si los uploads sin firmar no funcionan, puedes usar el endpoint original que maneja la firma en el servidor.

### Alternativa 2: Imágenes de Prueba
Para testing, puedes usar URLs de imágenes públicas temporalmente.

## 📞 Soporte

Si necesitas ayuda adicional, revisa:
- [Cloudinary Upload Presets Documentation](https://cloudinary.com/documentation/upload_presets)
- [Cloudinary Console](https://cloudinary.com/console)
