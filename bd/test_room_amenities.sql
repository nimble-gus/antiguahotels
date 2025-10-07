-- Probar que las amenidades de habitaciones se cargan correctamente

-- 1. Ver todas las habitaciones y sus amenidades
SELECT 
    r.id as room_id,
    r.code as room_code,
    h.name as hotel_name,
    a.name as amenity_name,
    a.icon as amenity_icon,
    a.category as amenity_category
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
LEFT JOIN entity_amenities ea ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
LEFT JOIN amenities a ON ea.amenity_id = a.id
ORDER BY r.id, a.name;

-- 2. Ver específicamente la habitación 12 (que sabemos que tiene amenidades)
SELECT 
    r.id as room_id,
    r.code as room_code,
    h.name as hotel_name,
    a.name as amenity_name,
    a.icon as amenity_icon,
    a.category as amenity_category
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
LEFT JOIN entity_amenities ea ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
LEFT JOIN amenities a ON ea.amenity_id = a.id
WHERE r.id = 12
ORDER BY a.name;

-- 3. Contar amenidades por habitación
SELECT 
    r.id as room_id,
    r.code as room_code,
    h.name as hotel_name,
    COUNT(ea.amenity_id) as amenity_count
FROM rooms r
JOIN hotels h ON r.hotel_id = h.id
LEFT JOIN entity_amenities ea ON ea.entity_type = 'ROOM' AND ea.entity_id = r.id
GROUP BY r.id, r.code, h.name
ORDER BY r.id;
