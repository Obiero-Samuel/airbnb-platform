-- Airbnb System Database Initialization
-- Run this script to set up the complete database

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
    price_per_night DECIMAL(10,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    bedrooms INT DEFAULT 1,
    bathrooms INT DEFAULT 1,
    max_guests INT DEFAULT 2,
    amenities JSON,
    is_available BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.0,
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
    total_price DECIMAL(10,2) NOT NULL,
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
    rating INT CHECK (rating >= 1 AND rating <= 5),
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

-- ========== TRIGGERS ==========

-- AFTER INSERT trigger: Update property availability when reservation is confirmed
DELIMITER //
CREATE TRIGGER after_reservation_confirmed
AFTER UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE properties 
        SET is_available = FALSE 
        WHERE property_id = NEW.property_id;
        
        -- Log the action
        INSERT INTO reservation_audit (reservation_id, action, details)
        VALUES (NEW.reservation_id, 'CONFIRMED', 'Property marked as unavailable');
    END IF;
END//
DELIMITER ;

-- BEFORE UPDATE trigger: Validate reservation dates
DELIMITER //
CREATE TRIGGER before_reservation_update
BEFORE UPDATE ON reservations
FOR EACH ROW
BEGIN
    IF NEW.check_in >= NEW.check_out THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Check-out date must be after check-in date';
    END IF;
    
    IF NEW.guests_count <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Guests count must be at least 1';
    END IF;
END//
DELIMITER ;

-- AFTER DELETE trigger: Clean up related records
DELIMITER //
CREATE TRIGGER after_reservation_delete
AFTER DELETE ON reservations
FOR EACH ROW
BEGIN
    -- Update property availability when reservation is deleted
    UPDATE properties 
    SET is_available = TRUE 
    WHERE property_id = OLD.property_id;
    
    -- Insert into audit log
    INSERT INTO reservation_audit (reservation_id, action, details)
    VALUES (OLD.reservation_id, 'DELETED', 'Reservation deleted and property availability updated');
END//
DELIMITER ;

-- BEFORE INSERT trigger: Validate property data
DELIMITER //
CREATE TRIGGER before_property_insert
BEFORE INSERT ON properties
FOR EACH ROW
BEGIN
    IF NEW.price_per_night <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price per night must be greater than 0';
    END IF;
    
    IF NEW.bedrooms <= 0 OR NEW.bathrooms <= 0 OR NEW.max_guests <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Bedrooms, bathrooms, and max guests must be at least 1';
    END IF;
END//
DELIMITER ;

-- ========== STORED PROCEDURES ==========

-- Get available properties with filters
DELIMITER //
CREATE PROCEDURE GetAvailableProperties(
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_property_type VARCHAR(50),
    IN p_max_price DECIMAL(10,2),
    IN p_location VARCHAR(255)
)
BEGIN
    SELECT 
        p.*,
        u.username as host_name,
        u.email as host_email
    FROM properties p
    LEFT JOIN users u ON p.host_id = u.user_id
    WHERE p.is_available = TRUE
    AND (p_property_type IS NULL OR p.property_type = p_property_type)
    AND (p_max_price IS NULL OR p.price_per_night <= p_max_price)
    AND (p_location IS NULL OR p.location LIKE CONCAT('%', p_location, '%'))
    AND p.property_id NOT IN (
        SELECT property_id 
        FROM reservations 
        WHERE status IN ('confirmed', 'pending')
        AND (
            (check_in BETWEEN p_check_in AND p_check_out) OR
            (check_out BETWEEN p_check_in AND p_check_out) OR
            (p_check_in BETWEEN check_in AND check_out) OR
            (p_check_out BETWEEN check_in AND check_out)
        )
    )
    ORDER BY p.created_at DESC;
END//
DELIMITER ;

-- Get user reservation statistics
DELIMITER //
CREATE PROCEDURE GetUserReservationStats()
BEGIN
    SELECT 
        u.user_id,
        u.username,
        u.email,
        COUNT(r.reservation_id) as total_reservations,
        SUM(CASE WHEN r.status = 'confirmed' AND r.check_in > CURDATE() THEN 1 ELSE 0 END) as upcoming_stays,
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed_stays,
        SUM(CASE WHEN r.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_stays,
        SUM(r.total_price) as total_spent
    FROM users u
    LEFT JOIN reservations r ON u.user_id = r.guest_id
    GROUP BY u.user_id, u.username, u.email
    ORDER BY total_reservations DESC;
END//
DELIMITER ;

-- Calculate reservation total price
DELIMITER //
CREATE PROCEDURE CalculateReservationPrice(
    IN p_property_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_guests_count INT,
    OUT p_total_price DECIMAL(10,2)
)
BEGIN
    DECLARE v_price_per_night DECIMAL(10,2);
    DECLARE v_nights INT;
    
    -- Get property price
    SELECT price_per_night INTO v_price_per_night
    FROM properties 
    WHERE property_id = p_property_id;
    
    -- Calculate number of nights
    SET v_nights = DATEDIFF(p_check_out, p_check_in);
    
    -- Calculate total price
    SET p_total_price = v_price_per_night * v_nights;
END//
DELIMITER ;

-- ========== SAMPLE DATA ==========

-- Insert sample users (password is 'password123' hashed)
INSERT INTO users (username, email, password_hash, first_name, last_name, is_verified, role) VALUES
('john_doe', 'john@email.com', '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK', 'John', 'Doe', TRUE, 'guest'),
('jane_host', 'jane@email.com', '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK', 'Jane', 'Smith', TRUE, 'host'),
('bob_admin', 'admin@airbnb.com', '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK', 'Bob', 'Admin', TRUE, 'admin'),
('alice_travel', 'alice@email.com', '$2b$10$K9s5f.7F3Vv3vJ4k8M5pEeB8dQ2W6yL0zH8cV4nR7tY3qL2wX0jK', 'Alice', 'Johnson', TRUE, 'guest');

-- Insert sample properties
INSERT INTO properties (host_id, title, description, property_type, price_per_night, location, bedrooms, bathrooms, max_guests, is_popular, amenities, image_url) VALUES
(2, 'Luxury Beach Villa with Ocean View', 'Stunning beachfront villa with private pool, panoramic ocean views, and modern amenities. Perfect for family vacations or romantic getaways.', 'villa', 350.00, 'Malibu, California', 4, 3, 8, TRUE, '["WiFi", "Pool", "Air Conditioning", "Beach Access", "Kitchen", "Parking"]', 'villa1.jpg'),
(2, 'Cozy Downtown Apartment', 'Modern apartment in the heart of downtown with easy access to restaurants, shopping, and entertainment. Recently renovated with high-end finishes.', 'apartment', 120.00, 'New York, NY', 1, 1, 2, FALSE, '["WiFi", "Air Conditioning", "Kitchen", "Elevator", "Gym Access"]', 'apartment1.jpg'),
(2, 'Mountain Retreat Cabin', 'Peaceful cabin nestled in the mountains with breathtaking views. Perfect for nature lovers and those seeking tranquility away from the city.', 'house', 180.00, 'Aspen, Colorado', 2, 1, 4, TRUE, '["WiFi", "Fireplace", "Mountain View", "Kitchen", "Hot Tub"]', 'cabin1.jpg'),
(2, 'Modern City Studio', 'Compact and efficient studio apartment in the city center. Ideal for solo travelers or couples looking for a convenient urban stay.', 'studio', 85.00, 'Chicago, IL', 1, 1, 2, FALSE, '["WiFi", "Air Conditioning", "Kitchenette", "Laundry"]', 'studio1.jpg'),
(2, 'Luxury Penthouse Suite', 'Exclusive penthouse with rooftop terrace and city skyline views. Features high-end furnishings and premium amenities.', 'apartment', 500.00, 'Miami, Florida', 3, 2, 6, TRUE, '["WiFi", "Pool", "Gym", "Concierge", "Parking", "Terrace"]', 'penthouse1.jpg');

-- Insert sample reservations
INSERT INTO reservations (guest_id, property_id, check_in, check_out, total_price, guests_count, status, special_requests) VALUES
(1, 1, '2024-02-15', '2024-02-20', 1750.00, 4, 'completed', 'Early check-in requested if possible'),
(1, 2, '2024-03-10', '2024-03-12', 240.00, 2, 'confirmed', 'Quiet room preferred'),
(4, 3, '2024-04-05', '2024-04-10', 900.00, 2, 'pending', 'Hiking recommendations appreciated'),
(1, 4, '2024-01-15', '2024-01-17', 170.00, 1, 'completed', 'Business trip - need reliable WiFi');

-- Insert sample reviews
INSERT INTO reviews (reservation_id, guest_id, property_id, rating, comment) VALUES
(1, 1, 1, 5, 'Amazing villa with breathtaking views! The host was very responsive and the amenities were top-notch.'),
(4, 1, 4, 4, 'Great location and comfortable stay. Perfect for my business trip.');

-- ========== CREATE USERS AND GRANT PERMISSIONS ==========

-- Create guest user (read-only access to properties)
CREATE USER IF NOT EXISTS 'guest_user'@'localhost' IDENTIFIED BY 'guest123';
GRANT SELECT ON airbnb_system.properties TO 'guest_user'@'localhost';
GRANT SELECT ON airbnb_system.users TO 'guest_user'@'localhost';

-- Create host user (can manage properties and reservations)
CREATE USER IF NOT EXISTS 'host_user'@'localhost' IDENTIFIED BY 'host123';
GRANT SELECT, INSERT, UPDATE ON airbnb_system.properties TO 'host_user'@'localhost';
GRANT SELECT, UPDATE ON airbnb_system.reservations TO 'host_user'@'localhost';
GRANT SELECT ON airbnb_system.users TO 'host_user'@'localhost';

-- Create admin user (full access)
CREATE USER IF NOT EXISTS 'admin_user'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON airbnb_system.* TO 'admin_user'@'localhost';

FLUSH PRIVILEGES;

-- ========== CREATE VIEWS FOR USER GROUPS ==========

-- Guest View (Limited access)
CREATE OR REPLACE VIEW guest_property_view AS
SELECT property_id, title, description, property_type, price_per_night, 
       location, bedrooms, bathrooms, max_guests, amenities, image_url
FROM properties 
WHERE is_available = TRUE;

-- Host Management View
CREATE OR REPLACE VIEW host_management_view AS
SELECT p.property_id, p.title, p.location, p.price_per_night,
       COUNT(r.reservation_id) as total_bookings,
       SUM(CASE WHEN r.status = 'confirmed' THEN r.total_price ELSE 0 END) as total_revenue
FROM properties p
LEFT JOIN reservations r ON p.property_id = r.property_id
GROUP BY p.property_id;

-- ========== VERIFICATION QUERIES ==========

-- Verify tables were created
SHOW TABLES;

-- Verify triggers
SHOW TRIGGERS;

-- Verify stored procedures
SHOW PROCEDURE STATUS WHERE Db = 'airbnb_system';

-- Verify sample data
SELECT 'Users:' AS '';
SELECT user_id, username, email, role FROM users;

SELECT 'Properties:' AS '';
SELECT property_id, title, property_type, price_per_night, location FROM properties;

SELECT 'Reservations:' AS '';
SELECT reservation_id, guest_id, property_id, check_in, check_out, status FROM reservations;

SELECT 'Database initialization completed successfully!' AS '';