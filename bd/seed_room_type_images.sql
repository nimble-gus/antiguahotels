-- Script para agregar imágenes de ejemplo a los tipos de habitación
-- Usando la tabla entity_images existente con entity_type = 'ROOM_TYPE'

-- Primero, vamos a ver qué tipos de habitación tenemos
SELECT 'Tipos de habitación existentes:' AS 'Información';
SELECT id, name, hotel_id FROM room_types ORDER BY hotel_id, id;

-- Agregar imágenes de ejemplo para cada tipo de habitación
-- (Estas son URLs de ejemplo de Unsplash, en producción serían de Cloudinary)

INSERT INTO entity_images (entity_type, entity_id, image_url, alt_text, is_primary, display_order, created_at) VALUES
-- Hotel 1 - Suite Presidencial
('ROOM_TYPE', 1, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop', 'Suite Presidencial - Vista principal', 1, 1, NOW()),
('ROOM_TYPE', 1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop', 'Suite Presidencial - Sala de estar', 0, 2, NOW()),
('ROOM_TYPE', 1, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop', 'Suite Presidencial - Baño de lujo', 0, 3, NOW()),

-- Hotel 1 - Habitación Estándar
('ROOM_TYPE', 2, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop', 'Habitación Estándar - Vista principal', 1, 1, NOW()),
('ROOM_TYPE', 2, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop', 'Habitación Estándar - Área de trabajo', 0, 2, NOW()),

-- Hotel 2 - Suite de Lujo
('ROOM_TYPE', 3, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop', 'Suite de Lujo - Vista principal', 1, 1, NOW()),
('ROOM_TYPE', 3, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop', 'Suite de Lujo - Terraza privada', 0, 2, NOW()),
('ROOM_TYPE', 3, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop', 'Suite de Lujo - Sala de estar', 0, 3, NOW()),

-- Hotel 2 - Habitación Deluxe
('ROOM_TYPE', 4, 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop', 'Habitación Deluxe - Vista principal', 1, 1, NOW()),
('ROOM_TYPE', 4, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop', 'Habitación Deluxe - Área de descanso', 0, 2, NOW());

-- Verificar que se insertaron correctamente
SELECT 'Imágenes agregadas:' AS 'Resultado';
SELECT 
    ei.id,
    ei.entity_type,
    ei.entity_id,
    rt.name as room_type_name,
    h.name as hotel_name,
    ei.image_url,
    ei.is_primary,
    ei.display_order
FROM entity_images ei
JOIN room_types rt ON ei.entity_id = rt.id
JOIN hotels h ON rt.hotel_id = h.id
WHERE ei.entity_type = 'ROOM_TYPE'
ORDER BY rt.hotel_id, rt.id, ei.is_primary DESC, ei.display_order;
