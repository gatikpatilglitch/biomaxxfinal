-- Database Schema for BioMaxxx Backend
-- Compatible with PostgreSQL 12+

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    age INT,
    gender VARCHAR(20),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    activity_level VARCHAR(30) DEFAULT 'moderate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_metrics (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    bmi NUMERIC(4,2),
    bmr INT,
    tdee INT,
    target_calories INT,
    protein_g INT,
    carbs_g INT,
    fats_g INT,
    weight_goal VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS copd_aqi_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    location VARCHAR(100),
    aqi INT NOT NULL,
    pm25 NUMERIC(6,2),
    pm10 NUMERIC(6,2),
    o3 NUMERIC(6,2),
    no2 NUMERIC(6,2),
    spo2_percentage INT,
    symptom_severity INT, -- Scale 1 to 10
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vision_scans (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    scan_type VARCHAR(30) NOT NULL, -- 'eye_dryness' or 'nail_deficiency'
    image_url VARCHAR(255),
    diagnostic_results JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biofeedback_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL, -- 'belly_breath', 'soundscape_garden', 'bubble_pop'
    duration_seconds INT,
    stress_level_before INT,
    stress_level_after INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default user for foreign key integrity
INSERT INTO users (id, name, email) 
VALUES (1, 'BioMaxxx User', 'user@biomaxxx.local') 
ON CONFLICT (id) DO NOTHING;

