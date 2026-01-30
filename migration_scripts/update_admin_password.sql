-- Update password for admin@iaf.co.id
UPDATE "core"."users"
SET "password_hash" = '$2b$10$LaOreRwToYgP2xjLoP3lYepmCcyb3xUf4C/Xf7.kDtPFuRirMU6E.'
WHERE "email" = 'admin@iaf.co.id';
