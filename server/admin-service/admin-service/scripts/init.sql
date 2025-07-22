-- Initialize database with default admin user
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default SuperAdmin user (password: Admin123!)
INSERT INTO admin_users (
    id,
    username,
    email,
    first_name,
    last_name,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at,
    created_by,
    updated_by,
    is_deleted
) VALUES (
    uuid_generate_v4(),
    'superadmin',
    'admin@otaservice.com',
    'Super',
    'Admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8GCG8.3sPW', -- Admin123!
    'SuperAdmin',
    true,
    NOW(),
    NOW(),
    'system',
    'system',
    false
);
