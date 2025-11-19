# Airbnb Project Backend

This folder contains the backend code for the Airbnb clone project.

## What the Code Does
- Handles user registration, authentication, and OTP verification
- Manages property listings, reservations, and user profiles
- Provides RESTful API endpoints for the frontend
- Uses Node.js, Express, and MySQL

## Important Notes
- **Do NOT change anything in the authentication, registration, or OTP logic unless you know exactly what you are doing.**
- Changing backend routes, models, or controllers may break the connection with the frontend.
- Database configuration is in `config/database.js`. Only update credentials if you change your database setup.
- Email sending logic is in `utils/emailService.js`. Do not modify unless updating email provider settings.

## Structure
- `controllers/` - API logic for users, properties, reservations
- `models/` - Database models
- `routes/` - API endpoints
- `middleware/` - Auth and validation logic
- `utils/` - Helper functions (OTP, email, etc.)
- `sql/` - SQL scripts for database setup

## How to Run
1. Install dependencies: `npm install`
2. Start server: `node server.js` or `npm start`

---
**Changing authentication, registration, or OTP logic may break the project.**
