-- =========================================================
-- ANTIGUA HOTELS - RDS SETUP SCRIPT
-- Versión optimizada para DBeaver/RDS
-- =========================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS antigua_hotels;

-- Usar la base de datos
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
  icon VARCHAR(50),
  category ENUM('HOTEL','ROOM','ACTIVITY','GENERAL') NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_amenities_category (category),
  KEY idx_amenities_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 3) SISTEMA DE IMÁGENES (CLOUDINARY)
-- =========================================================

-- Tabla polimórfica para imágenes
CREATE TABLE entity_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM('HOTEL','ROOM_TYPE','PACKAGE','ACTIVITY') NOT NULL,
  entity_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(255),
  alt_text VARCHAR(255),
  is_primary TINYINT(1) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_entity_images_entity (entity_type, entity_id),
  KEY idx_entity_images_primary (entity_type, entity_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 4) HOTELES Y HABITACIONES
-- =========================================================

CREATE TABLE hotels (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(20) UNIQUE,
  brand VARCHAR(80),
  description TEXT,
  logo_url VARCHAR(500),
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
  bed_configuration VARCHAR(200),
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

-- =========================================================
-- 5) HUÉSPEDES Y RESERVACIONES (BÁSICO PARA PRUEBAS)
-- =========================================================

CREATE TABLE guests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160),
  phone VARCHAR(40),
  country VARCHAR(60),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_guests_name (last_name, first_name),
  KEY idx_guests_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reservations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  confirmation_number VARCHAR(20) UNIQUE NOT NULL,
  guest_id BIGINT NOT NULL,
  status ENUM('PENDING','CONFIRMED','CANCELLED','NO_SHOW','COMPLETED') NOT NULL DEFAULT 'PENDING',
  checkin DATE NULL,
  checkout DATE NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  payment_status ENUM('PENDING','PARTIAL','PAID','REFUNDED') DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_reservations_guest (guest_id),
  KEY idx_reservations_status (status),
  CONSTRAINT fk_reservations_guest
    FOREIGN KEY (guest_id) REFERENCES guests(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =========================================================
-- 6) DATOS INICIALES
-- =========================================================

-- Insertar usuario administrador inicial
INSERT INTO admin_users (username, email, password_hash, first_name, last_name, role) 
VALUES ('admin', 'admin@antiguahotels.com', '$2b$10$example_hash', 'Admin', 'System', 'SUPER_ADMIN');

-- Insertar amenidades básicas
INSERT INTO amenities (name, description, icon, category) VALUES
('Free WiFi', 'Complimentary wireless internet access', 'wifi', 'HOTEL'),
('Free Parking', 'Complimentary parking space', 'parking', 'HOTEL'),
('Swimming Pool', 'Outdoor or indoor swimming pool', 'pool', 'HOTEL'),
('Air Conditioning', 'Climate control in room', 'ac', 'ROOM'),
('Mini Bar', 'In-room refrigerated mini bar', 'minibar', 'ROOM');

-- Insertar hotel de ejemplo
INSERT INTO hotels (name, code, description, city, country) 
VALUES ('Hotel Casa Antigua', 'AH001', 'Beautiful colonial hotel in Antigua Guatemala', 'Antigua Guatemala', 'Guatemala');

-- Insertar huésped de ejemplo
INSERT INTO guests (first_name, last_name, email, phone, country) 
VALUES ('Juan', 'Pérez', 'juan.perez@email.com', '+502-1234-5678', 'Guatemala');



