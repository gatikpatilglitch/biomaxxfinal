-- Database Schema for BioMaxxx Backend on Supabase
-- Compatible with PostgreSQL 15+

-- 1. Users table (Can also link with auth.users via auth.uid() if using Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    gender VARCHAR(20),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    activity_level VARCHAR(30) DEFAULT 'moderate',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Health Metrics (BMI, BMR, TDEE, Diet targets)
CREATE TABLE IF NOT EXISTS public.health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    bmi NUMERIC(4,2),
    bmr INT,
    tdee INT,
    target_calories INT,
    protein_g INT,
    carbs_g INT,
    fats_g INT,
    weight_goal VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. COPD & AQI Telemetry logs
CREATE TABLE IF NOT EXISTS public.copd_aqi_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    location VARCHAR(100),
    aqi INT NOT NULL,
    pm25 NUMERIC(6,2),
    pm10 NUMERIC(6,2),
    o3 NUMERIC(6,2),
    no2 NUMERIC(6,2),
    spo2_percentage INT,
    symptom_severity INT, -- Scale 1 to 10
    recorded_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. AI Vision Scans
CREATE TABLE IF NOT EXISTS public.vision_scans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    scan_type VARCHAR(30) NOT NULL, -- 'eye_dryness' or 'nail_deficiency'
    image_url VARCHAR(255),
    diagnostic_results JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Biofeedback Sessions
CREATE TABLE IF NOT EXISTS public.biofeedback_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES public.users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL, -- 'belly_breath', 'soundscape_garden', 'bubble_pop'
    duration_seconds INT,
    stress_level_before INT,
    stress_level_after INT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed default user for foreign key integrity
INSERT INTO public.users (id, name, email) 
VALUES (1, 'BioMaxxx User', 'user@biomaxxx.local') 
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) as per Supabase best practices
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copd_aqi_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biofeedback_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated read/write policies for development
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on users" ON public.users;
    CREATE POLICY "Allow anon all on users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on health_metrics" ON public.health_metrics;
    CREATE POLICY "Allow anon all on health_metrics" ON public.health_metrics FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on copd_aqi_logs" ON public.copd_aqi_logs;
    CREATE POLICY "Allow anon all on copd_aqi_logs" ON public.copd_aqi_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on vision_scans" ON public.vision_scans;
    CREATE POLICY "Allow anon all on vision_scans" ON public.vision_scans FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on biofeedback_sessions" ON public.biofeedback_sessions;
    CREATE POLICY "Allow anon all on biofeedback_sessions" ON public.biofeedback_sessions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;
