# Airbnb System - Testing Guide

## Quick Setup Instructions

### 1. Database Setup
1. Open XAMPP and start Apache & MySQL
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create new database: `airbnb_system`
4. Import `backend/sql/init_database.sql`

### 2. Backend Setup
```bash
cd backend
npm install
npm start