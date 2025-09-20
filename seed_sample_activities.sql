-- Script para agregar actividades de ejemplo
-- Ejecutar después de agregar los campos featured

USE antigua_hotels;

-- Insertar actividades de ejemplo
INSERT INTO activities (
  name, 
  description, 
  short_description,
  duration_hours,
  min_participants,
  max_participants,
  base_price,
  currency,
  age_restriction,
  difficulty_level,
  location,
  meeting_point,
  what_includes,
  what_to_bring,
  cancellation_policy,
  is_active,
  is_featured,
  featured_order
) VALUES 
(
  'Tour Volcán Pacaya',
  'Aventura única al volcán activo más accesible de Guatemala. Caminarás sobre lava solidificada reciente y podrás asar malvaviscos en las fumarolas naturales. Una experiencia inolvidable con vistas espectaculares.',
  'Aventura al volcán activo con guía experto y equipamiento incluido.',
  6.0,
  4,
  12,
  45.00,
  'USD',
  'Mínimo 12 años',
  'moderate',
  'Volcán Pacaya, Escuintla',
  'Hotel Casa Santo Domingo, Antigua Guatemala',
  'Transporte, guía certificado, equipamiento de seguridad, snacks',
  'Zapatos de hiking, ropa cómoda, chaqueta, agua',
  'Cancelación gratuita hasta 24 horas antes',
  TRUE,
  TRUE,
  1
),
(
  'City Tour Antigua Colonial',
  'Recorrido histórico por la ciudad colonial más hermosa de Guatemala. Visitarás iglesias, conventos, museos y aprenderás sobre la rica historia de Antigua Guatemala.',
  'Recorrido histórico por la ciudad colonial patrimonio de la humanidad.',
  4.0,
  2,
  15,
  25.00,
  'USD',
  'Todas las edades',
  'easy',
  'Antigua Guatemala',
  'Parque Central, Antigua Guatemala',
  'Guía local certificado, entradas a museos, degustación de café',
  'Zapatos cómodos, cámara, protector solar',
  'Cancelación gratuita hasta 2 horas antes',
  TRUE,
  TRUE,
  2
),
(
  'Experiencia Gastronómica Local',
  'Sumérgete en la cultura gastronómica guatemalteca con una visita al mercado local, clase de cocina tradicional y degustación de platillos auténticos.',
  'Clase de cocina tradicional con visita al mercado y degustación.',
  5.0,
  4,
  8,
  65.00,
  'USD',
  'Mínimo 8 años',
  'easy',
  'Antigua Guatemala',
  'Mercado de Antigua Guatemala',
  'Visita al mercado, ingredientes, clase de cocina, almuerzo completo',
  'Ropa cómoda, apetito, cámara',
  'Cancelación gratuita hasta 12 horas antes',
  TRUE,
  TRUE,
  3
),
(
  'Hiking Volcán de Agua',
  'Desafía tus límites con esta caminata al volcán más alto cerca de Antigua. Vistas panorámicas increíbles de toda la región y una experiencia de montañismo única.',
  'Caminata desafiante al volcán más alto con vistas panorámicas.',
  8.0,
  6,
  10,
  75.00,
  'USD',
  'Mínimo 16 años',
  'challenging',
  'Volcán de Agua, Sacatepéquez',
  'Santa María de Jesús',
  'Transporte, guía de montaña, equipo de seguridad, almuerzo',
  'Botas de hiking, ropa de montaña, mochila, agua',
  'Cancelación gratuita hasta 48 horas antes',
  TRUE,
  FALSE,
  NULL
);

-- Verificar las actividades insertadas
SELECT 
  id, 
  name, 
  base_price, 
  currency,
  difficulty_level,
  is_active,
  is_featured,
  featured_order
FROM activities 
ORDER BY featured_order ASC, id ASC;
