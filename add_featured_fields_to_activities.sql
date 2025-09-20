-- Agregar campos para actividades destacadas
-- Ejecutar este script en tu base de datos

USE antigua_hotels;

-- Agregar campo isFeatured
ALTER TABLE activities 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER is_active;

-- Agregar campo featuredOrder  
ALTER TABLE activities 
ADD COLUMN featured_order INT DEFAULT NULL AFTER is_featured;

-- Agregar índice para optimizar consultas de actividades destacadas
CREATE INDEX idx_activities_featured ON activities(is_featured, featured_order);

-- Marcar algunas actividades como destacadas (ejemplo)
-- Puedes cambiar estos IDs por los que tengas en tu base de datos
UPDATE activities 
SET is_featured = TRUE, featured_order = 1 
WHERE id = 1;

UPDATE activities 
SET is_featured = TRUE, featured_order = 2 
WHERE id = 2;

UPDATE activities 
SET is_featured = TRUE, featured_order = 3 
WHERE id = 3;

-- Verificar los cambios
SELECT id, name, is_featured, featured_order, is_active 
FROM activities 
ORDER BY featured_order ASC;
