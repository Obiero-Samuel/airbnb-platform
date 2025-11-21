-- Create database
CREATE DATABASE IF NOT EXISTS airbnb_system;
USE airbnb_system;
-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    role ENUM('guest', 'host', 'admin') DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- OTP table for email verification
CREATE TABLE IF NOT EXISTS otp_verification (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    otp_code VARCHAR(6) NOT NULL,
    email VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    property_id INT PRIMARY KEY AUTO_INCREMENT,
    host_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type ENUM('villa', 'apartment', 'house', 'condo', 'studio') DEFAULT 'apartment',
    price_per_night DECIMAL(10, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    max_guests INT DEFAULT 2,
    amenities JSON,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE
);
-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT PRIMARY KEY AUTO_INCREMENT,
    guest_id INT NOT NULL,
    property_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    guests_count INT DEFAULT 1,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);
-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT NOT NULL,
    guest_id INT NOT NULL,
    property_id INT NOT NULL,
    rating INT CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (guest_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id)
);
-- Insert sample data
INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        is_verified,
        role
    )
VALUES (
        'john_doe',
        'john@email.com',
        '$2a$10$example',
        'John',
        'Doe',
        TRUE,
        'guest'
    ),
    (
        'jane_host',
        'jane@email.com',
        '$2a$10$example',
        'Jane',
        'Smith',
        TRUE,
        'host'
    ),
    (
        'admin_user',
        'admin@airbnb.com',
        '$2a$10$example',
        'Admin',
        'User',
        TRUE,
        'admin'
    );
INSERT INTO properties (
        host_id,
        title,
        description,
        property_type,
        price_per_night,
        location,
        bedrooms,
        bathrooms,
        max_guests,
        is_popular,
        image_url
    )
VALUES (
        2,
        'Luxury Beach Villa',
        'Beautiful villa with ocean view',
        'villa',
        250.00,
        'Malibu, California',
        3,
        2,
        6,
        TRUE,
        'villa1.jpg'
    ),
    (
        2,
        'Cozy Downtown Apartment',
        'Modern apartment in city center',
        'apartment',
        120.00,
        'New York, NY',
        1,
        1,
        2,
        FALSE,
        'apartment1.jpg'
    ),
    (
        2,
        'Mountain Retreat Cabin',
        'Peaceful cabin with mountain views',
        'house',
        180.00,
        'Aspen, Colorado',
        2,
        1,
        4,
        TRUE,
        'cabin1.jpg'
    );
INSERT INTO reservations (
        guest_id,
        property_id,
        check_in,
        check_out,
        total_price,
        guests_count,
        status
    )
VALUES (
        1,
        1,
        '2024-02-15',
        '2024-02-20',
        1250.00,
        2,
        'confirmed'
    ),
    (
        1,
        2,
        '2024-03-01',
        '2024-03-05',
        480.00,
        1,
        'completed'
    );