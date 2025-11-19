-- Stored Procedures for Airbnb System

-- Get available properties with filters (with parameters)
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

-- Get user reservation statistics (without parameters)
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

-- Update property popularity based on reservations
DELIMITER //
CREATE PROCEDURE UpdatePropertyPopularity()
BEGIN
    UPDATE properties p
    SET is_popular = (
        SELECT COUNT(*) 
        FROM reservations r 
        WHERE r.property_id = p.property_id 
        AND r.status = 'completed'
        AND r.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ) >= 3 OR p.rating >= 4.5;
END//
DELIMITER ;

-- Get monthly revenue report
DELIMITER //
CREATE PROCEDURE GetMonthlyRevenueReport(
    IN p_year INT,
    IN p_month INT
)
BEGIN
    SELECT 
        DATE_FORMAT(r.created_at, '%Y-%m') as month,
        COUNT(r.reservation_id) as total_reservations,
        SUM(r.total_price) as total_revenue,
        AVG(r.total_price) as average_booking_value,
        COUNT(DISTINCT r.guest_id) as unique_guests
    FROM reservations r
    WHERE YEAR(r.created_at) = p_year 
    AND MONTH(r.created_at) = p_month
    AND r.status IN ('confirmed', 'completed')
    GROUP BY DATE_FORMAT(r.created_at, '%Y-%m');
END//
DELIMITER ;