-- Verificar amenidades de tipo ROOM
SELECT 
    id,
    name,
    description,
    icon,
    category,
    isActive,
    createdAt
FROM amenities 
WHERE category = 'ROOM' 
ORDER BY name;

-- Contar amenidades por categoría
SELECT 
    category,
    COUNT(*) as total,
    SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activas
FROM amenities 
GROUP BY category;
