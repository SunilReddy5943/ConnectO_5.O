-- =============================================
-- WORKER AVAILABILITY SCHEMA
-- Smart status system for worker online/busy/offline
-- =============================================

-- Create worker_availability table
CREATE TABLE IF NOT EXISTS worker_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Current status
  current_status TEXT NOT NULL DEFAULT 'OFFLINE', -- ONLINE | BUSY | OFFLINE
  manual_override BOOLEAN DEFAULT false,
  auto_mode_enabled BOOLEAN DEFAULT true,
  
  -- Activity tracking
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_status_change_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Working hours configuration
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "days": [1,2,3,4,5,6]}'::jsonb,
  
  -- Busy mode settings
  busy_until TIMESTAMP WITH TIME ZONE,
  busy_reason TEXT,
  
  -- Statistics
  total_online_minutes INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 100.0,
  missed_requests_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_user ON worker_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_availability_status ON worker_availability(current_status);
CREATE INDEX IF NOT EXISTS idx_availability_active ON worker_availability(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_availability_auto_mode ON worker_availability(auto_mode_enabled) WHERE auto_mode_enabled = true;

-- RLS Policies
ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own availability" ON worker_availability
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Workers can update own availability" ON worker_availability
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Workers can insert own availability" ON worker_availability
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Availability is publicly viewable" ON worker_availability
  FOR SELECT USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_worker_availability_updated_at
  BEFORE UPDATE ON worker_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_worker_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worker_active_timestamp
  BEFORE UPDATE ON worker_availability
  FOR EACH ROW
  WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status)
  EXECUTE FUNCTION update_worker_last_active();

-- Function to calculate if worker is within working hours
CREATE OR REPLACE FUNCTION is_within_working_hours(
  p_user_id UUID,
  p_check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS BOOLEAN AS $$
DECLARE
  v_hours JSONB;
  v_start_time TIME;
  v_end_time TIME;
  v_current_day INTEGER;
  v_current_time TIME;
BEGIN
  -- Get working hours
  SELECT working_hours INTO v_hours
  FROM worker_availability
  WHERE user_id = p_user_id;
  
  IF v_hours IS NULL THEN
    RETURN false;
  END IF;
  
  -- Extract day of week (0 = Sunday)
  v_current_day := EXTRACT(DOW FROM p_check_time);
  
  -- Check if current day is in working days
  IF NOT (v_hours->'days' ? v_current_day::TEXT) THEN
    RETURN false;
  END IF;
  
  -- Check time range
  v_start_time := (v_hours->>'start')::TIME;
  v_end_time := (v_hours->>'end')::TIME;
  v_current_time := p_check_time::TIME;
  
  RETURN v_current_time BETWEEN v_start_time AND v_end_time;
END;
$$ LANGUAGE plpgsql;
