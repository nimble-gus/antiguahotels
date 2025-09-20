-- Script para verificar actividades destacadas
-- Ejecutar en tu base de datos para ver el estado actual

USE antigua_hotels;

-- Verificar estructura de la tabla activities
DESCRIBE activities;

-- Ver todas las actividades y su estado destacado
SELECT 
    id,
    name,
    is_active,
    is_featured,
    featured_order,
    base_price,
    min_participants,
    max_participants,
    created_at
FROM activities
ORDER BY featured_order ASC, id ASC;

-- Ver específicamente las actividades destacadas
SELECT 
    id,
    name,
    is_featured,
    featured_order,
    is_active
FROM activities 
WHERE is_featured = TRUE
ORDER BY featured_order ASC;

-- Verificar si existen imágenes para las actividades
SELECT 
    a.id as activity_id,
    a.name,
    a.is_featured,
    ei.id as image_id,
    ei.image_url,
    ei.is_primary
FROM activities a
LEFT JOIN entity_images ei ON (ei.entity_type = 'ACTIVITY' AND ei.entity_id = a.id)
WHERE a.is_featured = TRUE
ORDER BY a.featured_order ASC;
