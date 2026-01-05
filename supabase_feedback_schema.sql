-- =============================================
-- ConnectO Feedback System Schema
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- =============================================
-- FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('CUSTOMER', 'WORKER')),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug_report', 'feature_request', 'improvement', 'general')),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  screenshot_url TEXT,
  app_version TEXT NOT NULL,
  device_info JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'planned', 'resolved')),
  -- Future fields for upvoting and clustering
  upvotes INTEGER DEFAULT 0,
  cluster_id UUID,
  roadmap_item_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (user_id = auth.uid());

-- Users can submit feedback
CREATE POLICY "Users can submit feedback" ON feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin access (for future admin dashboard)
-- CREATE POLICY "Admins can view all feedback" ON feedback
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE id = auth.uid() 
--       AND 'ADMIN' = ANY(roles)
--     )
--   );

-- CREATE POLICY "Admins can update feedback status" ON feedback
--   FOR UPDATE USING (
--     EXISTS (
--       SELECT 1 FROM users 
--       WHERE id = auth.uid() 
--       AND 'ADMIN' = ANY(roles)
--     )
--   );

-- =============================================
-- TRIGGER FOR AUTO-UPDATE TIMESTAMP
-- =============================================
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKET FOR SCREENSHOTS
-- =============================================
-- Run this in Supabase Dashboard > Storage:
-- 1. Create bucket: feedback-screenshots
-- 2. Set to public (for read access)
-- 3. Add policy for authenticated uploads:
--
-- INSERT policy: (auth.role() = 'authenticated')
-- SELECT policy: true (public read)

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify the table was created:
-- SELECT * FROM feedback LIMIT 1;
