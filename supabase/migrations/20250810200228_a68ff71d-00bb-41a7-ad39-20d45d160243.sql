-- Enable the pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cleanup function to run daily at midnight
SELECT cron.schedule(
  'cleanup-expired-parties-daily',
  '0 0 * * *', -- every day at midnight
  $$
  SELECT
    net.http_post(
        url:='https://lbetqwmrajuucthndinv.supabase.co/functions/v1/cleanup-expired-parties',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZXRxd21yYWp1dWN0aG5kaW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjU0MjIsImV4cCI6MjA2OTkwMTQyMn0.PyAL1Gl4Iqba3LlhfZAeCihgt8fRhuIYZwLTTMzw2oo"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);