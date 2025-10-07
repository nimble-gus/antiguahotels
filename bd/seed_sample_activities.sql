-- Script para crear actividades de muestra
-- Asegúrate de que la tabla activities existe y tiene los campos correctos

-- Insertar actividades de muestra
INSERT INTO activities (
  name, 
  description, 
  short_description,
  base_price, 
  currency, 
  duration_hours, 
  min_participants, 
  max_participants, 
  location, 
  difficulty_level, 
  is_active, 
  is_featured,
  featured_order,
  created_at, 
  updated_at
) VALUES 
(
  'Tour Volcán Pacaya',
  'Una aventura única al volcán activo más accesible de Guatemala. Disfruta de vistas espectaculares y experimenta la fuerza de la naturaleza.',
  'Aventura al volcán activo con vistas espectaculares',
  45.00,
  'USD',
  4.00,
  2,
  12,
  'Volcán Pacaya, Escuintla',
  'moderate',
  1,
  1,
  1,
  NOW(),
  NOW()
),
(
  'City Tour Antigua Guatemala',
  'Recorrido histórico por la ciudad colonial más hermosa de Guatemala. Descubre la rica historia y arquitectura colonial.',
  'Recorrido histórico por la ciudad colonial',
  25.00,
  'USD',
  3.00,
  1,
  15,
  'Antigua Guatemala, Sacatepéquez',
  'easy',
  1,
  1,
  2,
  NOW(),
  NOW()
),
(
  'Mercado y Clase de Cocina Local',
  'Experiencia gastronómica auténtica visitando mercados locales y aprendiendo a cocinar platos tradicionales guatemaltecos.',
  'Experiencia gastronómica con cocina tradicional',
  35.00,
  'USD',
  3.50,
  2,
  8,
  'Antigua Guatemala, Sacatepéquez',
  'easy',
  1,
  0,
  NULL,
  NOW(),
  NOW()
),
(
  'Trekking a la Cima del Volcán Acatenango',
  'Desafiante caminata al volcán Acatenango con campamento nocturno y vistas del volcán Fuego en erupción.',
  'Caminata desafiante con campamento nocturno',
  85.00,
  'USD',
  24.00,
  2,
  8,
  'Volcán Acatenango, Sacatepéquez',
  'challenging',
  1,
  0,
  NULL,
  NOW(),
  NOW()
),
(
  'Tour de Café en Finca Local',
  'Visita a una finca de café tradicional donde aprenderás sobre el proceso de cultivo y producción del café guatemalteco.',
  'Visita educativa a finca de café tradicional',
  30.00,
  'USD',
  2.50,
  1,
  10,
  'Finca de Café, Antigua Guatemala',
  'easy',
  1,
  0,
  NULL,
  NOW(),
  NOW()
);

-- Insertar horarios de muestra para las actividades
INSERT INTO activity_schedules (
  activity_id,
  start_time,
  end_time,
  date,
  available_spots,
  total_spots,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  a.id,
  '06:00:00',
  '10:00:00',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  8,
  12,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Tour Volcán Pacaya'

UNION ALL

SELECT 
  a.id,
  '09:00:00',
  '12:00:00',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  10,
  15,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'City Tour Antigua Guatemala'

UNION ALL

SELECT 
  a.id,
  '08:00:00',
  '11:30:00',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  6,
  8,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Mercado y Clase de Cocina Local'

UNION ALL

SELECT 
  a.id,
  '14:00:00',
  '14:00:00',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  4,
  8,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Trekking a la Cima del Volcán Acatenango'

UNION ALL

SELECT 
  a.id,
  '10:00:00',
  '12:30:00',
  DATE_ADD(CURDATE(), INTERVAL 1 DAY),
  8,
  10,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Tour de Café en Finca Local';

-- Insertar más horarios para los próximos días
INSERT INTO activity_schedules (
  activity_id,
  start_time,
  end_time,
  date,
  available_spots,
  total_spots,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  a.id,
  '06:00:00',
  '10:00:00',
  DATE_ADD(CURDATE(), INTERVAL 2 DAY),
  8,
  12,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Tour Volcán Pacaya'

UNION ALL

SELECT 
  a.id,
  '09:00:00',
  '12:00:00',
  DATE_ADD(CURDATE(), INTERVAL 2 DAY),
  10,
  15,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'City Tour Antigua Guatemala'

UNION ALL

SELECT 
  a.id,
  '08:00:00',
  '11:30:00',
  DATE_ADD(CURDATE(), INTERVAL 2 DAY),
  6,
  8,
  true,
  NOW(),
  NOW()
FROM activities a 
WHERE a.name = 'Mercado y Clase de Cocina Local';

-- Verificar que se insertaron correctamente
SELECT 'Actividades creadas:' as 'Resultado';
SELECT id, name, difficulty_level, base_price, duration_hours, is_active, is_featured 
FROM activities 
ORDER BY created_at DESC;

SELECT 'Horarios creados:' as 'Resultado';
SELECT 
  a.name as actividad,
  as.start_time,
  as.end_time,
  as.date,
  as.available_spots,
  as.total_spots
FROM activity_schedules as
JOIN activities a ON as.activity_id = a.id
ORDER BY as.date, as.start_time;