-- =========================================================
-- ANTIGUA HOTELS - DATABASE INTEGRATED DESIGN
-- Arquitectura base del usuario + Mejoras complementarias
-- Sistema completo para reservaciones de hoteles, paquetes, actividades y shuttle
-- =========================================================

CREATE DATABASE IF NOT EXISTS antigua_hotels;
USE antigua_hotels;

-- =========================================================
-- 1) USUARIOS Y ADMINISTRADORES
-- =========================================================

-- Administradores del sistema (para el dashboard)
CREATE TABLE admin_users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  role ENUM('ADMIN','SUPER_ADMIN') DEFAULT 'ADMIN',
  is_active TINYINT(1) DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_admin_users_email (email),
  KEY idx_admin_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 2) SISTEMA DE AMENIDADES
-- =========================================================

-- Catálogo de amenidades reutilizable
CREATE TABLE amenities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- Para iconos de UI (ej: "wifi", "pool", "gym")
  category ENUM('HOTEL','ROOM','ACTIVITY','GENERAL') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_amenities_category (category),
  KEY idx_amenities_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla polimórfica para amenidades (flexibilidad máxima)
CREATE TABLE entity_amenities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('HOTEL','ROOM_TYPE','ACTIVITY','PACKAGE') NOT NULL,
  entity_id BIGINT NOT NULL,
  amenity_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_entity_amenities (entity_type, entity_id, amenity_id),
  KEY idx_entity_amenities_entity (entity_type, entity_id),
  KEY idx_entity_amenities_amenity (amenity_id),
  CONSTRAINT fk_entity_amenities_amenity
    FOREIGN KEY (amenity_id) REFERENCES amenities(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 3) SISTEMA DE IMÁGENES (CLOUDINARY)
-- =========================================================

-- Tabla polimórfica para imágenes
CREATE TABLE entity_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('HOTEL','ROOM_TYPE','PACKAGE','ACTIVITY') NOT NULL,
  entity_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL, -- URL de Cloudinary
  cloudinary_public_id VARCHAR(255), -- Para gestión en Cloudinary
  alt_text VARCHAR(255),
  is_primary TINYINT(1) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_entity_images_entity (entity_type, entity_id),
  KEY idx_entity_images_primary (entity_type, entity_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 4) CATÁLOGOS DE HOTELERÍA (TU ARQUITECTURA BASE)
-- =========================================================

CREATE TABLE hotels (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(20) UNIQUE,
  brand VARCHAR(80),
  description TEXT,
  logo_url VARCHAR(500), -- URL de Cloudinary
  address TEXT,
  city VARCHAR(80),
  country VARCHAR(60) DEFAULT 'Guatemala',
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  waze_link TEXT,
  google_maps_link TEXT,
  phone VARCHAR(40),
  email VARCHAR(160),
  website VARCHAR(255),
  check_in_time TIME DEFAULT '15:00:00',
  check_out_time TIME DEFAULT '11:00:00',
  rating DECIMAL(2,1) DEFAULT 0,
  total_rooms INT DEFAULT 0,
  timezone VARCHAR(40) NOT NULL DEFAULT 'America/Guatemala',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_hotels_name (name),
  KEY idx_hotels_city (city),
  KEY idx_hotels_active (is_active),
  KEY idx_hotels_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE room_types (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hotel_id BIGINT NOT NULL,
  name VARCHAR(80) NOT NULL,
  description TEXT,
  occupancy INT NOT NULL,
  max_adults INT NOT NULL,
  max_children INT DEFAULT 0,
  bed_configuration VARCHAR(200), -- "1 King Bed", "2 Queen Beds", etc.
  room_size_sqm INT,
  base_rate DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_room_types_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_room_types_hotel_name (hotel_id, name),
  KEY idx_room_types_hotel (hotel_id),
  KEY idx_room_types_rate (base_rate),
  KEY idx_room_types_occupancy (occupancy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  hotel_id BIGINT NOT NULL,
  room_type_id BIGINT NOT NULL,
  code VARCHAR(40) NOT NULL,  -- Ej: 204-B
  floor_number INT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rooms_hotel_code (hotel_id, code),
  KEY idx_rooms_hotel (hotel_id),
  KEY idx_rooms_room_type (room_type_id),
  KEY idx_rooms_active (is_active),
  CONSTRAINT fk_rooms_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rooms_room_type
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inventario por día (evita sobreventa) - TU GENIAL DISEÑO
CREATE TABLE room_inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT NOT NULL,
  stay_date DATE NOT NULL,
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  price_override DECIMAL(12,2) NULL, -- Precio especial para fechas específicas
  reservation_item_id BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_room_inventory (room_id, stay_date),
  KEY idx_room_inventory_date (stay_date),
  KEY idx_room_inventory_room_date (room_id, stay_date),
  KEY idx_room_inventory_resitem (reservation_item_id),
  CONSTRAINT fk_room_inventory_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE ON UPDATE CASCADE
  -- reservation_item_id FK se agrega después
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 5) ACTIVIDADES
-- =========================================================

CREATE TABLE activities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  duration_hours DECIMAL(4, 2), -- Duración en horas
  min_participants INT DEFAULT 1,
  max_participants INT,
  base_price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  age_restriction VARCHAR(100), -- "18+", "All ages", etc.
  difficulty_level ENUM('easy', 'moderate', 'challenging', 'extreme'),
  location VARCHAR(255),
  meeting_point TEXT,
  what_includes TEXT, -- Qué incluye la actividad
  what_to_bring TEXT, -- Qué debe traer el cliente
  cancellation_policy TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_activities_name (name),
  KEY idx_activities_price (base_price),
  KEY idx_activities_active (is_active),
  KEY idx_activities_difficulty (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Horarios específicos de actividades
CREATE TABLE activity_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_spots INT NOT NULL,
  price_override DECIMAL(12,2), -- Precio especial para horarios específicos
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_activity_schedules_activity (activity_id),
  KEY idx_activity_schedules_date (date),
  KEY idx_activity_schedules_datetime (date, start_time),
  CONSTRAINT fk_activity_schedules_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 6) PAQUETES Y SESIONES (TU ARQUITECTURA)
-- =========================================================

CREATE TABLE packages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  duration_days INT NOT NULL,
  duration_nights INT NOT NULL,
  min_participants INT DEFAULT 1,
  max_participants INT,
  base_price DECIMAL(12,2) NOT NULL,
  price_per_couple DECIMAL(12,2),
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  capacity INT NULL,
  what_includes TEXT,
  what_excludes TEXT,
  itinerary TEXT,
  cancellation_policy TEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_packages_name (name),
  KEY idx_packages_price (base_price),
  KEY idx_packages_active (active),
  KEY idx_packages_duration (duration_days)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE package_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  package_id BIGINT NOT NULL,
  start_ts DATETIME NOT NULL,
  end_ts DATETIME NOT NULL,
  capacity INT NULL,
  price_override DECIMAL(12,2),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_package_sessions (package_id, start_ts),
  KEY idx_package_sessions_pkg (package_id),
  KEY idx_package_sessions_time (start_ts),
  KEY idx_package_sessions_daterange (start_ts, end_ts),
  CONSTRAINT fk_package_sessions_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Relación de paquetes con hoteles (componentes del paquete)
CREATE TABLE package_hotels (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  package_id BIGINT NOT NULL,
  hotel_id BIGINT NOT NULL,
  room_type_id BIGINT NOT NULL,
  nights INT NOT NULL,
  check_in_day INT NOT NULL, -- Día del paquete en que se hace check-in
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_package_hotels_package (package_id),
  KEY idx_package_hotels_hotel (hotel_id),
  CONSTRAINT fk_package_hotels_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_package_hotels_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_package_hotels_roomtype
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Relación de paquetes con actividades
CREATE TABLE package_activities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  package_id BIGINT NOT NULL,
  activity_id BIGINT NOT NULL,
  day_number INT NOT NULL, -- En qué día del paquete se realiza
  participants_included INT, -- Cuántos participantes están incluidos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_package_activities_package (package_id),
  KEY idx_package_activities_activity (activity_id),
  CONSTRAINT fk_package_activities_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_package_activities_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 7) AEROPUERTOS Y RUTAS DE SHUTTLE (TU ARQUITECTURA)
-- =========================================================

CREATE TABLE airports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  iata CHAR(3) UNIQUE,
  name VARCHAR(120) NOT NULL,
  city VARCHAR(80),
  country VARCHAR(60),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_airports_name (name),
  KEY idx_airports_iata (iata),
  KEY idx_airports_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE shuttle_routes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  description TEXT,
  from_airport_id BIGINT NOT NULL,
  to_hotel_id BIGINT NOT NULL,
  direction ENUM('ARRIVAL','DEPARTURE','ROUNDTRIP') NOT NULL,
  distance_km DECIMAL(6, 2),
  estimated_duration_minutes INT,
  base_price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  is_shared TINYINT(1) NOT NULL DEFAULT 1,
  max_passengers INT NOT NULL DEFAULT 8,
  vehicle_type VARCHAR(100), -- Van, Bus, Car, etc.
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_shuttle_routes_airport (from_airport_id),
  KEY idx_shuttle_routes_hotel (to_hotel_id),
  KEY idx_shuttle_routes_direction (direction),
  KEY idx_shuttle_routes_active (is_active),
  CONSTRAINT fk_shuttle_routes_airport
    FOREIGN KEY (from_airport_id) REFERENCES airports(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_shuttle_routes_hotel
    FOREIGN KEY (to_hotel_id) REFERENCES hotels(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_shuttle_route (from_airport_id, to_hotel_id, direction, is_shared)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Horarios regulares de shuttle
CREATE TABLE shuttle_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  route_id BIGINT NOT NULL,
  departure_time TIME NOT NULL,
  days_of_week VARCHAR(20) NOT NULL, -- "1,2,3,4,5" para lunes a viernes
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_shuttle_schedules_route (route_id),
  KEY idx_shuttle_schedules_time (departure_time),
  CONSTRAINT fk_shuttle_schedules_route
    FOREIGN KEY (route_id) REFERENCES shuttle_routes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Disponibilidad específica de shuttle por fecha
CREATE TABLE shuttle_availability (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  route_id BIGINT NOT NULL,
  date DATE NOT NULL,
  departure_time TIME NOT NULL,
  available_seats INT NOT NULL,
  price_override DECIMAL(12,2), -- Precio especial para fechas específicas
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_shuttle_availability_route (route_id),
  KEY idx_shuttle_availability_date (date),
  KEY idx_shuttle_availability_datetime (date, departure_time),
  CONSTRAINT fk_shuttle_availability_route
    FOREIGN KEY (route_id) REFERENCES shuttle_routes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 8) HUÉSPEDES Y RESERVAS (TU ARQUITECTURA POLIMÓRFICA)
-- =========================================================

CREATE TABLE guests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(40),
  country VARCHAR(60),
  date_of_birth DATE,
  passport_number VARCHAR(50),
  nationality VARCHAR(60),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_guests_name (last_name, first_name),
  KEY idx_guests_email (email),
  KEY idx_guests_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reservations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  confirmation_number VARCHAR(20) UNIQUE NOT NULL, -- Número de confirmación único
  guest_id BIGINT NOT NULL,
  status ENUM('PENDING','CONFIRMED','CANCELLED','NO_SHOW','COMPLETED') NOT NULL DEFAULT 'PENDING',
  checkin DATE NULL,
  checkout DATE NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('PENDING','PARTIAL','PAID','REFUNDED') DEFAULT 'PENDING',
  special_requests TEXT,
  notes TEXT, -- Notas internas del admin
  source VARCHAR(50) DEFAULT 'WEBSITE', -- WEBSITE, PHONE, ADMIN, etc.
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_reservations_guest (guest_id),
  KEY idx_reservations_status (status),
  KEY idx_reservations_dates (checkin, checkout),
  KEY idx_reservations_confirmation (confirmation_number),
  KEY idx_reservations_created (created_at),
  CONSTRAINT fk_reservations_guest
    FOREIGN KEY (guest_id) REFERENCES guests(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 9) RESERVATION ITEMS (POLIMÓRFICO) - TU GENIAL ARQUITECTURA
-- =========================================================

CREATE TABLE reservation_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_id BIGINT NOT NULL,
  item_type ENUM('ACCOMMODATION','PACKAGE','SHUTTLE','ACTIVITY') NOT NULL,
  title VARCHAR(140) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  meta JSON NULL, -- Datos adicionales flexibles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_resitems_reservation (reservation_id),
  KEY idx_resitems_type (item_type),
  KEY idx_resitems_amount (amount),
  CONSTRAINT fk_resitems_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Ahora que existe reservation_items, conectamos su FK en room_inventory
ALTER TABLE room_inventory
  ADD CONSTRAINT fk_room_inventory_resitem
  FOREIGN KEY (reservation_item_id) REFERENCES reservation_items(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================
-- 10) DETALLES ESPECÍFICOS POR TIPO DE ITEM
-- =========================================================

-- Detalle de alojamiento
CREATE TABLE accommodation_stays (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_item_id BIGINT NOT NULL UNIQUE,
  hotel_id BIGINT NOT NULL,
  room_type_id BIGINT NOT NULL,
  assigned_room_id BIGINT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT NOT NULL,
  guest_name VARCHAR(160), -- Nombre del huésped principal
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_acc_stay_resitem
    FOREIGN KEY (reservation_item_id) REFERENCES reservation_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_acc_stay_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_acc_stay_roomtype
    FOREIGN KEY (room_type_id) REFERENCES room_types(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_acc_stay_room
    FOREIGN KEY (assigned_room_id) REFERENCES rooms(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_acc_stay_hotel (hotel_id),
  KEY idx_acc_stay_roomtype (room_type_id),
  KEY idx_acc_stay_room (assigned_room_id),
  KEY idx_acc_stay_dates (check_in_date, check_out_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Detalle de paquete
CREATE TABLE package_bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_item_id BIGINT NOT NULL UNIQUE,
  package_id BIGINT NOT NULL,
  session_id BIGINT NULL,
  start_ts DATETIME NULL,
  end_ts DATETIME NULL,
  pax INT NOT NULL DEFAULT 1,
  participant_names TEXT, -- JSON con nombres de participantes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pack_book_resitem
    FOREIGN KEY (reservation_item_id) REFERENCES reservation_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pack_book_package
    FOREIGN KEY (package_id) REFERENCES packages(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pack_book_session
    FOREIGN KEY (session_id) REFERENCES package_sessions(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_pack_book_pkg (package_id),
  KEY idx_pack_book_session (session_id),
  KEY idx_pack_book_dates (start_ts, end_ts)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Detalle de shuttle
CREATE TABLE shuttle_transfers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_item_id BIGINT NOT NULL UNIQUE,
  shuttle_route_id BIGINT NOT NULL,
  availability_id BIGINT NULL,
  transfer_ts DATETIME NOT NULL,
  passengers INT NOT NULL DEFAULT 1,
  passenger_names TEXT, -- JSON con nombres de pasajeros
  flight_number VARCHAR(20),
  pickup_location VARCHAR(255),
  dropoff_location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shuttle_trans_resitem
    FOREIGN KEY (reservation_item_id) REFERENCES reservation_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_shuttle_trans_route
    FOREIGN KEY (shuttle_route_id) REFERENCES shuttle_routes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_shuttle_trans_availability
    FOREIGN KEY (availability_id) REFERENCES shuttle_availability(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_shuttle_trans_route (shuttle_route_id),
  KEY idx_shuttle_trans_time (transfer_ts),
  KEY idx_shuttle_trans_availability (availability_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Detalle de actividad
CREATE TABLE activity_bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_item_id BIGINT NOT NULL UNIQUE,
  activity_id BIGINT NOT NULL,
  schedule_id BIGINT NULL,
  activity_date DATE NOT NULL,
  start_time TIME NOT NULL,
  participants INT NOT NULL,
  participant_names TEXT, -- JSON con nombres de participantes
  emergency_contact VARCHAR(200),
  emergency_phone VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activity_book_resitem
    FOREIGN KEY (reservation_item_id) REFERENCES reservation_items(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_activity_book_activity
    FOREIGN KEY (activity_id) REFERENCES activities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_activity_book_schedule
    FOREIGN KEY (schedule_id) REFERENCES activity_schedules(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_activity_book_activity (activity_id),
  KEY idx_activity_book_schedule (schedule_id),
  KEY idx_activity_book_date (activity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 11) PAGOS (MEJORADO)
-- =========================================================

CREATE TABLE payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_id BIGINT NOT NULL,
  payment_intent_id VARCHAR(120), -- Para Stripe, PayPal, etc.
  provider VARCHAR(30) NOT NULL, -- Stripe, PayPal, etc.
  status ENUM('INITIATED','PROCESSING','PAID','FAILED','REFUNDED','CANCELLED') NOT NULL,
  payment_method ENUM('CREDIT_CARD','DEBIT_CARD','PAYPAL','BANK_TRANSFER','CASH') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  txn_ref VARCHAR(120), -- Referencia de la transacción
  gateway_response JSON, -- Respuesta completa del gateway
  processed_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_reservation (reservation_id),
  KEY idx_payments_status (status),
  KEY idx_payments_amount (amount),
  KEY idx_payments_provider (provider),
  KEY idx_payments_processed (processed_at),
  CONSTRAINT fk_payments_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 12) CONFIGURACIÓN Y LOGS
-- =========================================================

-- Configuraciones del sistema
CREATE TABLE system_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  data_type ENUM('STRING','INTEGER','DECIMAL','BOOLEAN','JSON') DEFAULT 'STRING',
  description TEXT,
  is_public TINYINT(1) DEFAULT 0, -- Si se puede mostrar en frontend
  updated_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_system_settings_public (is_public),
  CONSTRAINT fk_system_settings_admin
    FOREIGN KEY (updated_by) REFERENCES admin_users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Log de actividades del sistema (para auditoría)
CREATE TABLE activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id BIGINT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_activity_logs_admin (admin_user_id),
  KEY idx_activity_logs_table (table_name),
  KEY idx_activity_logs_action (action),
  KEY idx_activity_logs_created (created_at),
  CONSTRAINT fk_activity_logs_admin
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 13) TRIGGERS (TUS GENIALES TRIGGERS + MEJORAS)
-- =========================================================

DELIMITER $$

-- Mantener reservations.total_amount actualizado
CREATE TRIGGER trg_resitems_ai_sum
AFTER INSERT ON reservation_items
FOR EACH ROW
BEGIN
  UPDATE reservations r
  SET r.total_amount = (
    SELECT IFNULL(SUM(amount),0) FROM reservation_items WHERE reservation_id = NEW.reservation_id
  )
  WHERE r.id = NEW.reservation_id;
END$$

CREATE TRIGGER trg_resitems_au_sum
AFTER UPDATE ON reservation_items
FOR EACH ROW
BEGIN
  UPDATE reservations r
  SET r.total_amount = (
    SELECT IFNULL(SUM(amount),0) FROM reservation_items WHERE reservation_id = NEW.reservation_id
  )
  WHERE r.id = NEW.reservation_id;
END$$

CREATE TRIGGER trg_resitems_ad_sum
AFTER DELETE ON reservation_items
FOR EACH ROW
BEGIN
  UPDATE reservations r
  SET r.total_amount = (
    SELECT IFNULL(SUM(amount),0) FROM reservation_items WHERE reservation_id = OLD.reservation_id
  )
  WHERE r.id = OLD.reservation_id;
END$$

-- Validar que SHUTTLE requiera ACCOMMODATION en la misma reserva
CREATE TRIGGER trg_resitems_bi_validate_shuttle
BEFORE INSERT ON reservation_items
FOR EACH ROW
BEGIN
  IF NEW.item_type = 'SHUTTLE' THEN
    IF (SELECT COUNT(*) FROM reservation_items
        WHERE reservation_id = NEW.reservation_id
          AND item_type = 'ACCOMMODATION') = 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A shuttle item requires an ACCOMMODATION item in the same reservation.';
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_resitems_bu_validate_shuttle
BEFORE UPDATE ON reservation_items
FOR EACH ROW
BEGIN
  IF NEW.item_type = 'SHUTTLE' AND (OLD.item_type <> 'SHUTTLE' OR NEW.reservation_id <> OLD.reservation_id) THEN
    IF (SELECT COUNT(*) FROM reservation_items
        WHERE reservation_id = NEW.reservation_id
          AND item_type = 'ACCOMMODATION') = 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A shuttle item requires an ACCOMMODATION item in the same reservation.';
    END IF;
  END IF;
END$$

-- Actualizar total_rooms en hotels cuando se agregan/quitan habitaciones
CREATE TRIGGER trg_rooms_ai_update_hotel_count
AFTER INSERT ON rooms
FOR EACH ROW
BEGIN
  UPDATE hotels 
  SET total_rooms = (
    SELECT COUNT(*) FROM rooms WHERE hotel_id = NEW.hotel_id AND is_active = 1
  )
  WHERE id = NEW.hotel_id;
END$$

CREATE TRIGGER trg_rooms_au_update_hotel_count
AFTER UPDATE ON rooms
FOR EACH ROW
BEGIN
  IF NEW.hotel_id != OLD.hotel_id OR NEW.is_active != OLD.is_active THEN
    UPDATE hotels 
    SET total_rooms = (
      SELECT COUNT(*) FROM rooms WHERE hotel_id = NEW.hotel_id AND is_active = 1
    )
    WHERE id = NEW.hotel_id;
    
    IF NEW.hotel_id != OLD.hotel_id THEN
      UPDATE hotels 
      SET total_rooms = (
        SELECT COUNT(*) FROM rooms WHERE hotel_id = OLD.hotel_id AND is_active = 1
      )
      WHERE id = OLD.hotel_id;
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_rooms_ad_update_hotel_count
AFTER DELETE ON rooms
FOR EACH ROW
BEGIN
  UPDATE hotels 
  SET total_rooms = (
    SELECT COUNT(*) FROM rooms WHERE hotel_id = OLD.hotel_id AND is_active = 1
  )
  WHERE id = OLD.hotel_id;
END$$

-- Generar confirmation_number automáticamente
CREATE TRIGGER trg_reservations_bi_generate_confirmation
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
  DECLARE conf_num VARCHAR(20);
  DECLARE counter INT DEFAULT 0;
  DECLARE today_str VARCHAR(8);
  
  IF NEW.confirmation_number IS NULL OR NEW.confirmation_number = '' THEN
    SET today_str = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(confirmation_number, 9) AS UNSIGNED)), 0) + 1
    INTO counter
    FROM reservations 
    WHERE confirmation_number LIKE CONCAT(today_str, '%')
    AND DATE(created_at) = CURDATE();
    
    SET conf_num = CONCAT('AH', today_str, LPAD(counter, 4, '0'));
    SET NEW.confirmation_number = conf_num;
  END IF;
END$$

DELIMITER ;

-- =========================================================
-- 14) ÍNDICES ADICIONALES PARA PERFORMANCE
-- =========================================================

-- Búsquedas frecuentes del dashboard
CREATE INDEX idx_reservations_status_created ON reservations (status, created_at);
CREATE INDEX idx_reservation_items_type_created ON reservation_items (item_type, created_at);
CREATE INDEX idx_payments_status_amount ON payments (status, amount);

-- Búsquedas de disponibilidad
CREATE INDEX idx_room_inventory_available ON room_inventory (stay_date, is_blocked);
CREATE INDEX idx_activity_schedules_available ON activity_schedules (date, available_spots);
CREATE INDEX idx_shuttle_availability_seats ON shuttle_availability (date, available_seats);

-- Búsquedas geográficas
CREATE INDEX idx_hotels_location ON hotels (city, country);

-- =========================================================
-- 15) DATOS INICIALES
-- =========================================================

-- Insertar usuario administrador inicial
INSERT INTO admin_users (username, email, password_hash, first_name, last_name, role) 
VALUES ('admin', 'admin@antiguahotels.com', '$2b$10$example_hash', 'Admin', 'System', 'SUPER_ADMIN');

-- Insertar amenidades básicas
INSERT INTO amenities (name, description, icon, category) VALUES
-- Amenidades de hotel
('Free WiFi', 'Complimentary wireless internet access', 'wifi', 'HOTEL'),
('Free Parking', 'Complimentary parking space', 'parking', 'HOTEL'),
('Swimming Pool', 'Outdoor or indoor swimming pool', 'pool', 'HOTEL'),
('Fitness Center', 'Gym with exercise equipment', 'gym', 'HOTEL'),
('Restaurant', 'On-site dining facility', 'restaurant', 'HOTEL'),
('Bar/Lounge', 'Bar or lounge area', 'bar', 'HOTEL'),
('Spa Services', 'Spa and wellness treatments', 'spa', 'HOTEL'),
('24/7 Front Desk', '24-hour reception service', 'reception', 'HOTEL'),
('Room Service', 'In-room dining service', 'room-service', 'HOTEL'),
('Business Center', 'Business facilities and services', 'business', 'HOTEL'),
('Pet Friendly', 'Pets allowed', 'pet', 'HOTEL'),
-- Amenidades de habitación
('Air Conditioning', 'Climate control in room', 'ac', 'ROOM'),
('Mini Bar', 'In-room refrigerated mini bar', 'minibar', 'ROOM'),
('Safe', 'In-room safety deposit box', 'safe', 'ROOM'),
('Balcony', 'Private balcony or terrace', 'balcony', 'ROOM'),
('Ocean View', 'Room with ocean view', 'ocean-view', 'ROOM'),
('City View', 'Room with city view', 'city-view', 'ROOM'),
('Kitchenette', 'Small kitchen facilities', 'kitchen', 'ROOM'),
('Jacuzzi', 'In-room or private jacuzzi', 'jacuzzi', 'ROOM'),
('Smart TV', 'Smart television with streaming', 'tv', 'ROOM'),
-- Amenidades de actividades
('Equipment Included', 'All necessary equipment provided', 'equipment', 'ACTIVITY'),
('Professional Guide', 'Expert guide included', 'guide', 'ACTIVITY'),
('Transportation', 'Transport to/from activity', 'transport', 'ACTIVITY'),
('Refreshments', 'Snacks and drinks included', 'food', 'ACTIVITY'),
('Photo Service', 'Professional photography', 'camera', 'ACTIVITY');

-- Insertar aeropuertos principales de Guatemala
INSERT INTO airports (iata, name, city, country) VALUES
('GUA', 'La Aurora International Airport', 'Guatemala City', 'Guatemala'),
('FRS', 'Mundo Maya International Airport', 'Flores', 'Guatemala'),
('AAZ', 'Quetzaltenango Airport', 'Quetzaltenango', 'Guatemala');

-- Insertar configuraciones del sistema
INSERT INTO system_settings (setting_key, setting_value, data_type, description, is_public) VALUES
('site_name', 'Antigua Hotels', 'STRING', 'Name of the website', 1),
('site_email', 'info@antiguahotels.com', 'STRING', 'Main contact email', 1),
('site_phone', '+502-1234-5678', 'STRING', 'Main contact phone', 1),
('default_currency', 'USD', 'STRING', 'Default currency', 0),
('default_timezone', 'America/Guatemala', 'STRING', 'Default timezone', 0),
('booking_cancellation_hours', '24', 'INTEGER', 'Hours before check-in to allow free cancellation', 0),
('max_booking_months_ahead', '12', 'INTEGER', 'Maximum months in advance for bookings', 0),
('stripe_publishable_key', '', 'STRING', 'Stripe publishable key', 1),
('paypal_client_id', '', 'STRING', 'PayPal client ID', 1),
('cloudinary_cloud_name', '', 'STRING', 'Cloudinary cloud name', 1),
('enable_websockets', 'true', 'BOOLEAN', 'Enable real-time websocket updates', 0),
('maintenance_mode', 'false', 'BOOLEAN', 'Enable maintenance mode', 0);

-- =========================================================
-- 16) PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =========================================================

DELIMITER $$

-- Obtener estadísticas del dashboard
CREATE PROCEDURE GetDashboardStats(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    -- Estadísticas generales
    SELECT 
        COUNT(*) as total_reservations,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_reservations,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_reservations,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_reservations,
        SUM(total_amount) as total_revenue,
        SUM(CASE WHEN status = 'CONFIRMED' THEN total_amount ELSE 0 END) as confirmed_revenue
    FROM reservations
    WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date;
    
    -- Estadísticas por tipo de item
    SELECT 
        ri.item_type,
        COUNT(*) as count,
        SUM(ri.amount) as revenue
    FROM reservation_items ri
    JOIN reservations r ON ri.reservation_id = r.id
    WHERE DATE(r.created_at) BETWEEN p_start_date AND p_end_date
    AND r.status IN ('CONFIRMED', 'PENDING')
    GROUP BY ri.item_type;
    
    -- Top 5 hoteles
    SELECT 
        h.name as hotel_name,
        COUNT(acs.id) as total_bookings,
        SUM(ri.amount) as total_revenue
    FROM accommodation_stays acs
    JOIN reservation_items ri ON acs.reservation_item_id = ri.id
    JOIN reservations r ON ri.reservation_id = r.id
    JOIN hotels h ON acs.hotel_id = h.id
    WHERE DATE(r.created_at) BETWEEN p_start_date AND p_end_date
    AND r.status IN ('CONFIRMED', 'PENDING')
    GROUP BY h.id, h.name
    ORDER BY total_bookings DESC
    LIMIT 5;
END$$

-- Verificar disponibilidad de habitación
CREATE PROCEDURE CheckRoomAvailability(
    IN p_hotel_id BIGINT,
    IN p_room_type_id BIGINT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_guests INT
)
BEGIN
    SELECT 
        r.id as room_id,
        r.code as room_code,
        rt.name as room_type,
        rt.base_rate,
        rt.occupancy,
        COUNT(ri.room_id) as blocked_nights
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    LEFT JOIN room_inventory ri ON r.id = ri.room_id 
        AND ri.stay_date >= p_check_in 
        AND ri.stay_date < p_check_out
        AND (ri.is_blocked = 1 OR ri.reservation_item_id IS NOT NULL)
    WHERE r.hotel_id = p_hotel_id
    AND r.room_type_id = p_room_type_id
    AND r.is_active = 1
    AND rt.occupancy >= p_guests
    GROUP BY r.id, r.code, rt.name, rt.base_rate, rt.occupancy
    HAVING blocked_nights = 0
    ORDER BY rt.base_rate ASC;
END$$

DELIMITER ;

-- =========================================================
-- FIN DEL SCRIPT INTEGRADO
-- =========================================================



