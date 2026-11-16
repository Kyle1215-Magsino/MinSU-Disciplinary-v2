-- MinSU Disciplinary System - MySQL Schema
-- Run this after creating the database:
--   CREATE DATABASE minsu_disciplinary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE minsu_disciplinary;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'officer', 'staff') DEFAULT 'officer',
  archived BOOLEAN DEFAULT FALSE,
  archived_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  course VARCHAR(255),
  year_level VARCHAR(50) DEFAULT '1st Year',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disciplinary_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  violation_type VARCHAR(255),
  description TEXT,
  date_of_incident DATE,
  location VARCHAR(255),
  reported_by VARCHAR(255),
  offense_count INT DEFAULT 1,
  status ENUM('pending', 'active', 'resolved') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_student_id (student_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS case_offenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  offense_level VARCHAR(255),
  description TEXT,
  date_of_incident DATE,
  location VARCHAR(255),
  reported_by VARCHAR(255),
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES disciplinary_cases(id) ON DELETE CASCADE
);

-- Default admin account
-- Email:    admin@minsu.edu.ph
-- Password: admin123
INSERT INTO users (email, password, full_name, role) VALUES
('admin@minsu.edu.ph', '$2a$10$o3THUHs0jtOSds64KhnARee2ktExCsdjLDp1gIQifGqA8MYVHHrKq', 'System Admin', 'admin')
ON DUPLICATE KEY UPDATE email = email;
