-- Script para agregar aeropuertos de Guatemala y región
-- Ejecuta este script en tu base de datos para tener aeropuertos disponibles

INSERT INTO airports (iata, name, city, country, is_active) VALUES
('GUA', 'Aeropuerto Internacional La Aurora', 'Ciudad de Guatemala', 'Guatemala', 1),
('FRS', 'Mundo Maya International Airport', 'Flores', 'Guatemala', 1),
('SAL', 'Aeropuerto Internacional Monseñor Óscar Arnulfo Romero', 'San Salvador', 'El Salvador', 1),
('TGU', 'Aeropuerto Internacional Toncontín', 'Tegucigalpa', 'Honduras', 1),
('MGA', 'Aeropuerto Internacional Augusto C. Sandino', 'Managua', 'Nicaragua', 1),
('SJO', 'Aeropuerto Internacional Juan Santamaría', 'San José', 'Costa Rica', 1),
('PTY', 'Aeropuerto Internacional Tocumen', 'Ciudad de Panamá', 'Panamá', 1);

-- Verificar que se insertaron correctamente
SELECT iata, name, city, country FROM airports WHERE is_active = 1;



