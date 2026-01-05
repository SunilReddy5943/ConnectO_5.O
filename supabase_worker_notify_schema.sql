-- =============================================
-- ConnectO Worker Notifications Schema
-- Run this SQL in Supabase SQL Editor
-- =============================================

-- =============================================
-- WORKER NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS worker_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID,
  type TEXT DEFAULT 'manual_notify' CHECK (type IN ('manual_notify', 'auto_remind', 'system')),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'queued')),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_worker_notif_worker ON worker_notifications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_notif_customer ON worker_notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_worker_notif_triggered ON worker_notifications(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_worker_notif_status ON worker_notifications(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE worker_notifications ENABLE ROW LEVEL SECURITY;

-- Customers can view notifications they sent
CREATE POLICY "Customers can view own sent notifications" ON worker_notifications
  FOR SELECT USING (customer_id = auth.uid());

-- Workers can view notifications sent to them
CREATE POLICY "Workers can view received notifications" ON worker_notifications
  FOR SELECT USING (worker_id = auth.uid());

-- Customers can create notifications
CREATE POLICY "Customers can send notifications" ON worker_notifications
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Workers can update delivery status
CREATE POLICY "Workers can update notification status" ON worker_notifications
  FOR UPDATE USING (worker_id = auth.uid());

-- =============================================
-- RATE LIMITING FUNCTION (Optional Server-Side)
-- =============================================
-- This function can be used for server-side rate limiting
CREATE OR REPLACE FUNCTION check_notify_rate_limit(
  p_customer_id UUID,
  p_worker_id UUID,
  p_cooldown_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
  last_notify TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT triggered_at INTO last_notify
  FROM worker_notifications
  WHERE customer_id = p_customer_id 
    AND worker_id = p_worker_id
  ORDER BY triggered_at DESC
  LIMIT 1;
  
  IF last_notify IS NULL THEN
    RETURN TRUE; -- No previous notification
  END IF;
  
  RETURN NOW() > (last_notify + (p_cooldown_minutes || ' minutes')::INTERVAL);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify the table was created:
-- SELECT * FROM worker_notifications LIMIT 1;
