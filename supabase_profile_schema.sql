-- =============================================
-- CUSTOMER PROFILE SCHEMA
-- Add this table to Supabase to support customer-specific data
-- =============================================

-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  location JSONB DEFAULT '{"city": "", "area": ""}',
  preferred_service_time TEXT DEFAULT 'ANYTIME',
  language TEXT DEFAULT 'English',
  notification_settings JSONB DEFAULT '{"pushEnabled": true, "smsEnabled": true, "emailEnabled": false, "marketingEnabled": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer profile" ON customer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own customer profile" ON customer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customer profile" ON customer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
