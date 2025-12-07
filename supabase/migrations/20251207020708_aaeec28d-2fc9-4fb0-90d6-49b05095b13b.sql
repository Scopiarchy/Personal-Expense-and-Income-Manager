-- Enable leaked password protection in auth config
-- This is done through the auth.config but we need to use the Supabase dashboard or API
-- For now, we'll document this as a manual step

-- Note: Leaked password protection is configured through Supabase Auth settings
-- and cannot be enabled via SQL migration. This requires:
-- 1. Going to Authentication > Settings in Supabase Dashboard
-- 2. Enabling "Leaked Password Protection" under "Security" section

SELECT 1; -- Placeholder to acknowledge this security setting