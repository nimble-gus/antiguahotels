-- Script para verificar imágenes de hoteles en entity_images
USE antigua_hotels;

-- Verificar hoteles existentes
SELECT 
    h.id,
    h.name,
    h.logo_url,
    COUNT(ei.id) as image_count
FROM hotels h
LEFT JOIN entity_images ei ON h.id = ei.entity_id AND ei.entity_type = 'HOTEL'
WHERE h.is_active = 1
GROUP BY h.id, h.name, h.logo_url
ORDER BY h.name;

-- Verificar imágenes específicas de hoteles
SELECT 
    ei.id,
    ei.entity_id,
    h.name as hotel_name,
    ei.image_url,
    ei.is_primary,
    ei.display_order,
    ei.alt_text
FROM entity_images ei
JOIN hotels h ON ei.entity_id = h.id
WHERE ei.entity_type = 'HOTEL'
ORDER BY h.name, ei.is_primary DESC, ei.display_order;

-- Verificar si hay hoteles sin imágenes
SELECT 
    h.id,
    h.name,
    h.logo_url,
    'Sin imágenes en entity_images' as status
FROM hotels h
LEFT JOIN entity_images ei ON h.id = ei.entity_id AND ei.entity_type = 'HOTEL'
WHERE h.is_active = 1 AND ei.id IS NULL
ORDER BY h.name;

