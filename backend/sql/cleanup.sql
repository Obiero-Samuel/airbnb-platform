-- Clean up existing database
DROP DATABASE IF EXISTS airbnb_system;
DROP USER IF EXISTS 'guest_user'@'localhost';
DROP USER IF EXISTS 'host_user'@'localhost';
DROP USER IF EXISTS 'admin_user'@'localhost';