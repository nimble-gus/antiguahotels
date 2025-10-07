-- Script para agregar hoteles y actividades a paquetes existentes
-- Ejecuta este script en tu base de datos para que los paquetes tengan disponibilidad

-- Verificar paquetes existentes
SELECT id, name, duration_days, duration_nights FROM packages;

-- Verificar hoteles y room types disponibles
SELECT h.id as hotel_id, h.name as hotel_name, rt.id as room_type_id, rt.name as room_type_name 
FROM hotels h 
JOIN room_types rt ON h.id = rt.hotel_id 
WHERE h.is_active = 1 AND rt.is_active = 1;

-- Verificar actividades disponibles
SELECT id, name, min_participants, max_participants FROM activities WHERE is_active = 1;

-- AGREGAR HOTELES A PAQUETES (ajusta los IDs según tu base de datos)
-- Ejemplo: Paquete ID 1 incluye Hotel ID 1, Room Type ID 1, por 2 noches, check-in día 1
INSERT INTO package_hotels (package_id, hotel_id, room_type_id, nights, check_in_day) 
VALUES 
  (1, 1, 1, 2, 1),  -- Paquete 1: Hotel 1, Room Type 1, 2 noches, check-in día 1
  (2, 1, 2, 3, 1);  -- Paquete 2: Hotel 1, Room Type 2, 3 noches, check-in día 1

-- AGREGAR ACTIVIDADES A PAQUETES (ajusta los IDs según tu base de datos)
-- Ejemplo: Paquete ID 1 incluye Actividad ID 1 en el día 2
INSERT INTO package_activities (package_id, activity_id, day_number, participants_included) 
VALUES 
  (1, 1, 2, 4),  -- Paquete 1: Actividad 1 en día 2, para 4 participantes
  (2, 1, 3, 4);  -- Paquete 2: Actividad 1 en día 3, para 4 participantes

-- Verificar que se agregaron correctamente
SELECT 
  p.name as package_name,
  ph.hotel_id,
  h.name as hotel_name,
  rt.name as room_type_name,
  ph.nights,
  ph.check_in_day
FROM packages p
LEFT JOIN package_hotels ph ON p.id = ph.package_id
LEFT JOIN hotels h ON ph.hotel_id = h.id
LEFT JOIN room_types rt ON ph.room_type_id = rt.id;

SELECT 
  p.name as package_name,
  pa.activity_id,
  a.name as activity_name,
  pa.day_number,
  pa.participants_included
FROM packages p
LEFT JOIN package_activities pa ON p.id = pa.package_id
LEFT JOIN activities a ON pa.activity_id = a.id;



