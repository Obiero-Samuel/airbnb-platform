# Airbnb Project Database & Backend Report

## 1. Project Overview
This project is an Airbnb-like platform with multi-user support (guests, hosts, admins), built using Node.js (Express) for the backend and MySQL/MariaDB for the database. The frontend is implemented with HTML, CSS, and JavaScript.

---

## 2. Database Structure
- **Database Name:** `airbnb-system`
- **Main Tables:**
  - `users`: Stores user information (guests, hosts, admins)
  - `properties`: Stores property listings
  - `reservations`: Stores booking information
  - `reviews`: Stores property reviews

---

## 3. User Views
- **Guest View (`guest_properties`):**
  - Shows available properties for booking.
  - SQL: Filters `properties` where `is_available = TRUE`.
- **Host View (`host_properties`):**
  - Shows properties owned by the host.
  - SQL: Filters `properties` by `owner_id`.
- **Admin View (`admin_properties`):**
  - Shows all properties and users.
  - SQL: No filter; full access.

**Relationship:** All views are derived from the `properties` table, filtered by user role and property attributes.

---

## 4. Triggers
Defined in `backend/sql/triggers.sql`:
- **AFTER INSERT:** E.g., log new reservation creation.
- **BEFORE UPDATE:** E.g., validate property status before update.
- **AFTER DELETE:** E.g., clean up related reviews after property deletion.

---

## 5. SQL Joins
Defined in `backend/sql/joins_examples.sql`:
- **INNER JOIN:** Reservations with property details.
- **LEFT JOIN:** All properties with any reservations (including properties with no reservations).
- **RIGHT JOIN:** All reservations and their property details (including reservations for properties that may not exist).

---

## 6. Stored Procedures
Defined in `backend/sql/stored_procedures.sql`:
- E.g., `get_user_reservations(user_id)`: Returns all reservations for a user.
- E.g., `get_available_properties()`: Returns all available properties.

---

## 7. Backend Structure
- **Main files:**
  - `server.js`: Entry point for backend server
  - `controllers/`: Logic for authentication, property, reservation, and user management
  - `models/`: Database models for each table
  - `routes/`: API endpoints for each resource
  - `middleware/`: Auth and validation logic
  - `utils/`: Helper functions and email service

---

## 8. Frontend Structure
- **Main files:**
  - `index.html`, `pages/`: User-facing pages
  - `js/`: API calls, property and reservation logic
  - `css/`: Stylesheets for each page

---

## 9. Configuration
- **Database config:** `backend/config/database.js` and `.env` file
- **Environment variables:**
  - `DB_NAME=airbnb-system`
  - `DB_USER=root`
  - `DB_PASSWORD=...`

---

## 10. Testing & Usage
- SQL features (views, triggers, joins, procedures) are tested in MySQL/MariaDB client.
- Backend API endpoints can be tested with Postman or frontend JS.

---

## 11. Assignment Requirements Coverage
- Multi-user management: Implemented via user views and role-based filtering.
- SQL features: Views, triggers, joins, and stored procedures are present and demonstrated.
- Frontend and backend integration: Complete, with sample data and navigation fixes.

---

## 12. File Locations for Key Features
| Feature         | File Location                        |
|-----------------|-------------------------------------|
| User Views      | `backend/sql/schema.sql`             |
| Triggers        | `backend/sql/triggers.sql`           |
| SQL Joins       | `backend/sql/joins_examples.sql`     |
| Stored Procedures| `backend/sql/stored_procedures.sql` |
| Backend Config  | `backend/config/database.js`, `.env` |
| Frontend Pages  | `frontend/pages/`                    |

---

## 13. Notes
- All SQL code should be run in the MySQL/MariaDB client, not in PowerShell.
- For any errors or further help, check the config files or ask for specific troubleshooting.

---

**End of Report**
