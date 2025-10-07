# 🔧 Configuración de Stripe para Guatemala

## 📋 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_... # Tu clave pública de Stripe
STRIPE_SECRET_KEY=sk_test_...      # Tu clave secreta de Stripe
STRIPE_WEBHOOK_SECRET=whsec_...    # Para webhooks (opcional por ahora)

# Para producción usar:
# STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
```

## 🌍 Configuración para Guatemala

### **1. Crear Cuenta Stripe**
1. Ve a [stripe.com](https://stripe.com)
2. Crea cuenta como **Guatemala** 
3. Verifica tu negocio
4. Activa procesamiento internacional

### **2. Configurar Monedas**
En tu dashboard de Stripe:
- ✅ **USD**: Habilitado por defecto
- ✅ **GTQ**: Solicitar activación (Quetzal Guatemalteco)

### **3. Métodos de Pago Recomendados**
- ✅ **Tarjetas**: Visa, Mastercard, Amex
- ✅ **Bancos Locales**: A través de tarjetas de débito
- ✅ **3D Secure**: Para seguridad adicional

### **4. Configuración de Webhook (Opcional)**
Para recibir notificaciones automáticas:
```
Endpoint: https://tudominio.com/api/payments/webhook
Eventos: payment_intent.succeeded, payment_intent.payment_failed
```

## 💳 Bancos Guatemaltecos Soportados

### **Principales Bancos (vía tarjetas)**
- 🏦 **Banco G&T Continental**
- 🏦 **Banco Industrial** 
- 🏦 **Banrural**
- 🏦 **BAM (Banco Agromercantil)**
- 🏦 **Banco de Antigua**
- 🏦 **Vivibanco**
- 🏦 **Banco de los Trabajadores**
- 🏦 **Banco CHN**

### **Tipos de Tarjeta Aceptadas**
- ✅ **Débito Local**: Tarjetas de bancos guatemaltecos
- ✅ **Crédito Local**: Visa/Mastercard emitidas localmente
- ✅ **Internacionales**: Visa, Mastercard, Amex de cualquier país
- ✅ **Prepagadas**: Tarjetas prepagadas válidas

## 🔒 Seguridad Implementada

- ✅ **PCI DSS Compliance**: Stripe maneja la seguridad
- ✅ **3D Secure 2.0**: Autenticación adicional automática
- ✅ **Encriptación SSL**: Todos los datos encriptados
- ✅ **Fraud Detection**: Detección automática de fraude
- ✅ **No Storage**: No almacenamos datos de tarjetas

## 📊 Tarifas Aproximadas (Verificar con Stripe)

### **Guatemala**
- **Tarjetas Locales**: ~3.5% + GTQ 2.50
- **Tarjetas Internacionales**: ~3.9% + GTQ 2.50
- **Disputas**: GTQ 120 por disputa

### **Conversión de Moneda**
- **USD → GTQ**: Tipo de cambio + 1% fee
- **GTQ → USD**: Tipo de cambio + 1% fee

## 🚀 Instalación

```bash
npm install stripe @stripe/stripe-js
```

## 🧪 Testing

### **Tarjetas de Prueba**
```
# Visa exitosa
4242424242424242

# Visa que requiere 3D Secure  
4000000000003220

# Mastercard exitosa
5555555555554444

# Amex exitosa
378282246310005

# Tarjeta declinada
4000000000000002
```

### **Monedas de Prueba**
- **USD**: Usar montos como 10.00, 25.50
- **GTQ**: Usar montos como 100.00, 250.75

## ⚠️ Importante

1. **Nunca commits** las claves secretas al repositorio
2. **Usa test keys** en desarrollo
3. **Verifica compliance** local en Guatemala
4. **Configura webhooks** para producción
5. **Prueba con tarjetas locales** antes de lanzar



