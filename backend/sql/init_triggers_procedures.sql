-- Airbnb System Database Initialization (Triggers & Procedures Only)
USE airbnb_system;
DELIMITER $$ -- ========== TRIGGERS ========== --
CREATE TRIGGER after_reservation_confirmed
AFTER
UPDATE ON reservations FOR EACH ROW BEGIN IF NEW.status = 'confirmed'
    AND OLD.status != 'confirmed' THEN
UPDATE properties
SET is_available = FALSE
WHERE property_id = NEW.property_id;
INSERT INTO reservation_audit (reservation_id, action, details)
VALUES (
        NEW.reservation_id,
        'CONFIRMED',
        'Property marked as unavailable'
    );
END IF;
END $$ CREATE TRIGGER before_reservation_update BEFORE
UPDATE ON reservations FOR EACH ROW BEGIN IF NEW.check_in >= NEW.check_out THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Check-out date must be after check-in date';
END IF;
IF NEW.guests_count <= 0 THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Guests count must be at least 1';
END IF;
END $$ CREATE TRIGGER after_reservation_delete
AFTER DELETE ON reservations FOR EACH ROW BEGIN
UPDATE properties
SET is_available = TRUE
WHERE property_id = OLD.property_id;
INSERT INTO reservation_audit (reservation_id, action, details)
VALUES (
        OLD.reservation_id,
        'DELETED',
        'Reservation deleted and property availability updated'
    );
END $$ CREATE TRIGGER before_property_insert BEFORE
INSERT ON properties FOR EACH ROW BEGIN IF NEW.price_per_night <= 0 THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Price per night must be greater than 0';
END IF;
IF NEW.bedrooms <= 0
OR NEW.bathrooms <= 0
OR NEW.max_guests <= 0 THEN SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Bedrooms, bathrooms, and max guests must be at least 1';
END IF;
END $$ -- ========== STORED PROCEDURES ========== --
CREATE PROCEDURE GetAvailableProperties(
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_property_type VARCHAR(50),
    IN p_max_price DECIMAL(10, 2),
    IN p_location VARCHAR(255)
) BEGIN
SELECT p.*,
    u.username as host_name,
    u.email as host_email
FROM properties p
    LEFT JOIN users u ON p.host_id = u.user_id
WHERE p.is_available = TRUE
    AND (
        p_property_type IS NULL
        OR p.property_type = p_property_type
    )
    AND (
        p_max_price IS NULL
        OR p.price_per_night <= p_max_price
    )
    AND (
        p_location IS NULL
        OR p.location LIKE CONCAT('%', p_location, '%')
    )
    AND p.property_id NOT IN (
        SELECT property_id
        FROM reservations
        WHERE status IN ('confirmed', 'pending')
            AND (
                (
                    check_in BETWEEN p_check_in AND p_check_out
                )
                OR (
                    check_out BETWEEN p_check_in AND p_check_out
                )
                OR (
                    p_check_in BETWEEN check_in AND check_out
                )
                OR (
                    p_check_out BETWEEN check_in AND check_out
                )
            )
    )
ORDER BY p.created_at DESC;
END $$ CREATE PROCEDURE GetUserReservationStats() BEGIN
SELECT u.user_id,
    u.username,
    u.email,
    COUNT(r.reservation_id) as total_reservations,
    SUM(
        CASE
            WHEN r.status = 'confirmed'
            AND r.check_in > CURDATE() THEN 1
            ELSE 0
        END
    ) as upcoming_stays,
    SUM(
        CASE
            WHEN r.status = 'completed' THEN 1
            ELSE 0
        END
    ) as completed_stays,
    SUM(
        CASE
            WHEN r.status = 'cancelled' THEN 1
            ELSE 0
        END
    ) as cancelled_stays,
    SUM(r.total_price) as total_spent
FROM users u
    LEFT JOIN reservations r ON u.user_id = r.guest_id
GROUP BY u.user_id,
    u.username,
    u.email
ORDER BY total_reservations DESC;
END $$ CREATE PROCEDURE CalculateReservationPrice(
    IN p_property_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_guests_count INT,
    OUT p_total_price DECIMAL(10, 2)
) BEGIN
DECLARE v_price_per_night DECIMAL(10, 2);
DECLARE v_nights INT;
SELECT price_per_night INTO v_price_per_night
FROM properties
WHERE property_id = p_property_id;
SET v_nights = DATEDIFF(p_check_out, p_check_in);
SET p_total_price = v_price_per_night * v_nights;
END $$ DELIMITER;