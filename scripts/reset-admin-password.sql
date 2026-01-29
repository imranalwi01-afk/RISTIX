-- Reset admin password
-- Password: 1019181716
-- This is a bcrypt hash generated with cost=10

UPDATE core.users 
SET password_hash = '$2a$10$vI3kXkPCQMNqsVlXP5E9YOZYqC.EB8eYx3ZC4mWQqQKQj6qVE.mGS'
WHERE email = 'admin@iaf.co.id';

-- Verify update
SELECT 
    email, 
    username,
    is_active,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Password set'
        ELSE 'No password'
    END as password_status
FROM core.users 
WHERE email = 'admin@iaf.co.id';
