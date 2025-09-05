-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  pin CHAR(4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Polls table
CREATE TABLE polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  am_spots INTEGER DEFAULT 0,
  pm_spots INTEGER DEFAULT 0,
  all_day_spots INTEGER DEFAULT 0,
  open_until TIMESTAMP WITH TIME ZONE NOT NULL,
  manager_id UUID NOT NULL,
  share_link VARCHAR(50) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  results_drawn BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll entries table
CREATE TABLE poll_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spot_type VARCHAR(10) CHECK (spot_type IN ('am', 'pm', 'all_day')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

-- Poll results table
CREATE TABLE poll_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  spot_type VARCHAR(10) CHECK (spot_type IN ('am', 'pm', 'all_day')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to draw poll results
CREATE OR REPLACE FUNCTION draw_poll_results(poll_uuid UUID)
RETURNS VOID AS $$
DECLARE
  poll_record polls%ROWTYPE;
  am_entries UUID[];
  pm_entries UUID[];
  all_day_entries UUID[];
  i INTEGER;
BEGIN
  -- Get poll details
  SELECT * INTO poll_record FROM polls WHERE id = poll_uuid AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Poll not found or inactive';
  END IF;
  
  -- Clear existing results
  DELETE FROM poll_results WHERE poll_id = poll_uuid;
  
  -- Get entries for each spot type
  SELECT ARRAY(SELECT user_id FROM poll_entries WHERE poll_id = poll_uuid AND spot_type = 'am' ORDER BY RANDOM()) INTO am_entries;
  SELECT ARRAY(SELECT user_id FROM poll_entries WHERE poll_id = poll_uuid AND spot_type = 'pm' ORDER BY RANDOM()) INTO pm_entries;
  SELECT ARRAY(SELECT user_id FROM poll_entries WHERE poll_id = poll_uuid AND spot_type = 'all_day' ORDER BY RANDOM()) INTO all_day_entries;
  
  -- Insert AM winners
  FOR i IN 1..LEAST(poll_record.am_spots, array_length(am_entries, 1)) LOOP
    INSERT INTO poll_results (poll_id, user_id, spot_type) 
    VALUES (poll_uuid, am_entries[i], 'am');
  END LOOP;
  
  -- Insert PM winners
  FOR i IN 1..LEAST(poll_record.pm_spots, array_length(pm_entries, 1)) LOOP
    INSERT INTO poll_results (poll_id, user_id, spot_type) 
    VALUES (poll_uuid, pm_entries[i], 'pm');
  END LOOP;
  
  -- Insert All Day winners
  FOR i IN 1..LEAST(poll_record.all_day_spots, array_length(all_day_entries, 1)) LOOP
    INSERT INTO poll_results (poll_id, user_id, spot_type) 
    VALUES (poll_uuid, all_day_entries[i], 'all_day');
  END LOOP;
  
  -- Mark poll as results drawn
  UPDATE polls SET results_drawn = TRUE WHERE id = poll_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_results ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (managers)
CREATE POLICY "Managers can manage users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Managers can manage polls" ON polls FOR ALL TO authenticated USING (true);
CREATE POLICY "Anyone can read poll entries" ON poll_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can insert poll entries" ON poll_entries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Managers can read poll entries" ON poll_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read poll results" ON poll_results FOR SELECT TO anon USING (true);
CREATE POLICY "Managers can manage poll results" ON poll_results FOR ALL TO authenticated USING (true);