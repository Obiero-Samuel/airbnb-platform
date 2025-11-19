-- Triggers for Airbnb System

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
    
    -- Insert into audit log (if you have an audit table)
    INSERT INTO reservation_audit (reservation_id, action, timestamp)
    VALUES (OLD.reservation_id, 'DELETE', NOW());
END//
DELIMITER ;

-- BEFORE INSERT trigger: Validate property price
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