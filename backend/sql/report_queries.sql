-- Airbnb System: Report Queries
-- This file contains example SQL queries for generating key reports from the project database.
-- 1. All Available Properties Report
SELECT property_id,
    title,
    location,
    price_per_night,
    bedrooms,
    bathrooms
FROM properties
WHERE is_available = TRUE;
-- 2. Reservations by Guest Report (example for guest_id = 1)
SELECT r.reservation_id,
    p.title AS property,
    r.check_in,
    r.check_out,
    r.status,
    r.total_price
FROM reservations r
    INNER JOIN properties p ON r.property_id = p.property_id
WHERE r.guest_id = 1;
-- 3. Host’s Properties and Reservation Count Report
SELECT u.username AS host,
    p.title AS property,
    COUNT(r.reservation_id) AS reservation_count
FROM users u
    INNER JOIN properties p ON u.user_id = p.host_id
    LEFT JOIN reservations r ON p.property_id = r.property_id
WHERE u.role = 'host'
GROUP BY p.property_id;
-- 4. Property Ratings and Reviews Report
SELECT p.title,
    AVG(r.rating) AS avg_rating,
    MAX(r.comment) AS latest_review
FROM properties p
    LEFT JOIN reviews r ON p.property_id = r.property_id
GROUP BY p.property_id;
-- 5. Popular Properties Report
SELECT p.property_id,
    p.title,
    p.location,
    p.price_per_night,
    COUNT(r.reservation_id) AS total_reservations
FROM properties p
    LEFT JOIN reservations r ON p.property_id = r.property_id
WHERE p.is_popular = TRUE
GROUP BY p.property_id;