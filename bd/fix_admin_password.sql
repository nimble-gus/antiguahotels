-- =========================================================
-- ARREGLAR CONTRASEÑA DEL ADMIN CON HASH CORRECTO
-- Ejecutar en DBeaver
-- =========================================================

USE antigua_hotels;

-- Hash válido para la contraseña "admin123" generado con bcrypt
-- Este hash fue generado correctamente: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
UPDATE admin_users 
SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW()
WHERE email = 'admin@antiguahotels.com';

-- Verificar que se actualizó correctamente
SELECT id, username, email, first_name, last_name, role, is_active, 
       LENGTH(password_hash) as hash_length,
       created_at, updated_at 
FROM admin_users 
WHERE email = 'admin@antiguahotels.com';



