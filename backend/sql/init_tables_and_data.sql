-- Airbnb System Database Initialization (Tables & Data Only)
-- Create database
DROP DATABASE IF EXISTS airbnb_system;
CREATE DATABASE airbnb_system;
USE airbnb_system;
-- Users table
CREATE TABLE users (
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
CREATE TABLE otp_verification (
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
CREATE TABLE properties (
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
CREATE TABLE reservations (
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
CREATE TABLE reviews (
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
-- Audit table for triggers
CREATE TABLE reservation_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    reservation_id INT,
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);
-- ========== SAMPLE DATA ========== --
-- Insert sample users (password is 'password123' hashed)
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
        '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK',
        'John',
        'Doe',
        TRUE,
        'guest'
    ),
    (
        'jane_host',
        'jane@email.com',
        '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK',
        'Jane',
        'Smith',
        TRUE,
        'host'
    ),
    (
        'bob_admin',
        'admin@airbnb.com',
        '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK',
        'Bob',
        'Admin',
        TRUE,
        'admin'
    ),
    (
        'alice_travel',
        'alice@email.com',
        '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK',
        'Alice',
        'Johnson',
        TRUE,
        'guest'
    );
-- Insert sample properties
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
        amenities,
        image_url
    )
VALUES (
        2,
        'Luxury Beach Villa with Ocean View',
        'Stunning beachfront villa with private pool, panoramic ocean views, and modern amenities. Perfect for family vacations or romantic getaways.',
        'villa',
        350.00,
        'Malibu, California',
        4,
        3,
        8,
        TRUE,
        '["WiFi", "Pool", "Air Conditioning", "Beach Access", "Kitchen", "Parking"]',
        'assets/images/beaches/beach 1.jpg'
    ),
    (
        2,
        'Cozy Downtown Apartment',
        'Modern apartment in the heart of downtown with easy access to restaurants, shopping, and entertainment. Recently renovated with high-end finishes.',
        'apartment',
        120.00,
        'New York, NY',
        1,
        1,
        2,
        FALSE,
        '["WiFi", "Air Conditioning", "Kitchen", "Elevator", "Gym Access"]',
        'apartment1.jpg'
    ),
    (
        2,
        'Mountain Retreat Cabin',
        'Peaceful cabin nestled in the mountains with breathtaking views. Perfect for nature lovers and those seeking tranquility away from the city.',
        'house',
        180.00,
        'Aspen, Colorado',
        2,
        1,
        4,
        TRUE,
        '["WiFi", "Fireplace", "Mountain View", "Kitchen", "Hot Tub"]',
        'cabin1.jpg'
    ),
    (
        2,
        'Modern City Studio',
        'Compact and efficient studio apartment in the city center. Ideal for solo travelers or couples looking for a convenient urban stay.',
        'studio',
        85.00,
        'Chicago, IL',
        1,
        1,
        2,
        FALSE,
        '["WiFi", "Air Conditioning", "Kitchenette", "Laundry"]',
        'studio1.jpg'
    ),
    (
        2,
        'Luxury Penthouse Suite',
        'Exclusive penthouse with rooftop terrace and city skyline views. Features high-end furnishings and premium amenities.',
        'apartment',
        500.00,
        'Miami, Florida',
        3,
        2,
        6,
        TRUE,
        '["WiFi", "Pool", "Gym", "Concierge", "Parking", "Terrace"]',
        'penthouse1.jpg'
    );
-- Insert sample reservations
INSERT INTO reservations (
        guest_id,
        property_id,
        check_in,
        check_out,
        total_price,
        guests_count,
        status,
        special_requests
    )
VALUES (
        1,
        1,
        '2024-02-15',
        '2024-02-20',
        1750.00,
        4,
        'completed',
        'Early check-in requested if possible'
    ),
    (
        1,
        2,
        '2024-03-10',
        '2024-03-12',
        240.00,
        2,
        'confirmed',
        'Quiet room preferred'
    ),
    (
        4,
        3,
        '2024-04-05',
        '2024-04-10',
        900.00,
        2,
        'pending',
        'Hiking recommendations appreciated'
    ),
    (
        1,
        4,
        '2024-01-15',
        '2024-01-17',
        170.00,
        1,
        'completed',
        'Business trip - need reliable WiFi'
    );
-- Insert sample reviews
INSERT INTO reviews (
        reservation_id,
        guest_id,
        property_id,
        rating,
        comment
    )
VALUES (
        1,
        1,
        1,
        5,
        'Amazing villa with breathtaking views! The host was very responsive and the amenities were top-notch.'
    ),
    (
        4,
        1,
        4,
        4,
        'Great location and comfortable stay. Perfect for my business trip.'
    );