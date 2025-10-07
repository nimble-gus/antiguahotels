-- =========================================================
-- AGREGAR NUEVO USUARIO ADMINISTRADOR
-- Ejecutar en DBeaver - Cambiar los valores según necesites
-- =========================================================

USE antigua_hotels;

-- Generar hash para contraseña usando bcrypt online o código
-- Hash para "nuevapassword123": $2b$10$N9qo8uLOickgx2ZMRjKHXe.E7eSp.OWGh2b7xoNq.8Eo7VgZX.1.i

INSERT INTO admin_users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at, 
    updated_at
) VALUES (
    'manager',                    -- Cambiar username
    'manager@antiguahotels.com',  -- Cambiar email
    '$2b$10$N9qo8uLOickgx2ZMRjKHXe.E7eSp.OWGh2b7xoNq.8Eo7VgZX.1.i', -- Hash de "nuevapassword123"
    'Manager',                    -- Cambiar nombre
    'Hotel',                      -- Cambiar apellido
    'ADMIN',                      -- Rol: ADMIN o SUPER_ADMIN
    1,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT 
    id, 
    username, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
FROM admin_users 
ORDER BY created_at DESC;



