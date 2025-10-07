# 🚨 FIX PARA CONEXIÓN RDS INTERMITENTE

## Problema Identificado:
```
Error: Can't reach database server at aht.cw3ceeaw6xqk.us-east-1.rds.amazonaws.com:3306
Code: P1001
```

## ✅ Solución 1: Actualizar DATABASE_URL

Reemplaza tu `DATABASE_URL` en el archivo `.env` con esta versión optimizada:

```env
DATABASE_URL="mysql://tu_usuario:tu_password@aht.cw3ceeaw6xqk.us-east-1.rds.amazonaws.com:3306/antigua_hotels?connection_limit=5&pool_timeout=20&connect_timeout=30&socket_timeout=30"
```

**Parámetros agregados:**
- `connection_limit=5` - Limita conexiones simultáneas
- `pool_timeout=20` - Timeout del pool (20 segundos)
- `connect_timeout=30` - Timeout de conexión (30 segundos)  
- `socket_timeout=30` - Timeout de socket (30 segundos)

## ✅ Solución 2: Verificar RDS en AWS Console

1. Ve a **AWS RDS Console**
2. Busca tu instancia: `aht.cw3ceeaw6xqk.us-east-1.rds.amazonaws.com`
3. Verifica que el estado sea **"Available"**
4. Si está "Stopped", iníciala manualmente

## ✅ Solución 3: Restart del Servidor

Después de actualizar el `.env`:

```bash
# Detener el servidor
Ctrl+C

# Reiniciar
npm run dev
```

## 🔍 Verificación

Si funciona, deberías ver en los logs:
```
GET /api/guests?limit=50 200 in <3000ms
GET /api/reservations?page=1&limit=10 200 in <3000ms
```

En lugar de:
```
GET /api/guests?limit=50 500 in 5000ms+ (timeout)
```

## ⚠️ Si Persiste el Problema

Posibles causas adicionales:
1. **RDS Pausado** - AWS puede pausar RDS automáticamente
2. **Límites de AWS** - Verificar límites de la cuenta
3. **Red Local** - Problemas de conectividad a internet
4. **Configuración de Seguridad** - Security Groups de AWS

---
**Nota:** Los cambios en Prisma ya fueron aplicados automáticamente.



