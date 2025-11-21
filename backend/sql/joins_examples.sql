-- Example: INNER JOIN (Show reservations with property details)
SELECT r.reservation_id,
    r.user_id,
    r.property_id,
    p.title,
    p.location,
    r.start_date,
    r.end_date
FROM reservations r
    INNER JOIN properties p ON r.property_id = p.property_id;
-- Example: LEFT JOIN (Show all properties and any reservations, including properties with no reservations)
SELECT p.property_id,
    p.title,
    p.location,
    r.reservation_id,
    r.user_id,
    r.start_date,
    r.end_date
FROM properties p
    LEFT JOIN reservations r ON p.property_id = r.property_id;
-- Example: RIGHT JOIN (Show all reservations and their property details, including reservations for properties that may not exist)
SELECT r.reservation_id,
    r.user_id,
    r.property_id,
    p.title,
    p.location,
    r.start_date,
    r.end_date
FROM reservations r
    RIGHT JOIN properties p ON r.property_id = p.property_id;