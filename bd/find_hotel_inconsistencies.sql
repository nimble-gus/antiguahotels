-- Encontrar datos inconsistentes para HOTEL en entity_amenities

-- 1. Ver qué entity_id de HOTEL no existen en la tabla hotels
SELECT 
    ea.entity_id as hotel_id_in_entity_amenities,
    h.id as actual_hotel_id,
    h.name as hotel_name,
    COUNT(*) as amenity_count
FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_id = h.id
WHERE ea.entity_type = 'HOTEL' AND h.id IS NULL
GROUP BY ea.entity_id
ORDER BY ea.entity_id;

-- 2. Ver todos los IDs de hoteles que SÍ existen
SELECT 'Hoteles que existen:' as info, GROUP_CONCAT(id ORDER BY id) as hotel_ids FROM hotels;

-- 3. Ver todos los entity_id de tipo HOTEL en entity_amenities
SELECT 'Entity IDs de HOTEL en entity_amenities:' as info, GROUP_CONCAT(DISTINCT entity_id ORDER BY entity_id) as entity_ids 
FROM entity_amenities 
WHERE entity_type = 'HOTEL';

-- 4. Ver detalles de los registros problemáticos
SELECT 
    ea.id,
    ea.entity_type,
    ea.entity_id,
    ea.amenity_id,
    a.name as amenity_name,
    ea.created_at
FROM entity_amenities ea
LEFT JOIN hotels h ON ea.entity_id = h.id
LEFT JOIN amenities a ON ea.amenity_id = a.id
WHERE ea.entity_type = 'HOTEL' AND h.id IS NULL
ORDER BY ea.entity_id, ea.amenity_id;
