-- Initialize the hotel database
-- This script will be run automatically when the postgres container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database is already created by the postgres container
-- Just ensure we have the right permissions

GRANT ALL PRIVILEGES ON DATABASE hotel_db TO hotel_user;