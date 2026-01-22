-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type TEXT NOT NULL CHECK (task_type IN ('REPAIR','AMC','LETTER','OTHER')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','CANCELLED')) DEFAULT 'PENDING',
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  reminder_rules JSONB NOT NULL DEFAULT '{"daily": true, "before_days": [30, 21, 15, 7, 1], "on_due_date": true, "overdue": true, "time_of_day": "09:00"}'::jsonb,
  last_notified_at DATE,
  reference_no TEXT,
  department TEXT,
  vendor TEXT,
  amount NUMERIC,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reminder Logs Table
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  channel TEXT CHECK (channel IN ('telegram')),
  status TEXT CHECK (status IN ('SENT','FAILED')),
  error_message TEXT
);

-- 5. Task Versions Table
CREATE TABLE task_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  version INT NOT NULL,
  data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- RLS SETTINGS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_versions ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin (prevents recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES

-- Profiles: Users can see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Profiles: Admins can do everything
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (is_admin());

-- Tasks: Admin can see non-deleted tasks
CREATE POLICY "Admin access to tasks" ON tasks
  FOR ALL TO authenticated
  USING (
    deleted_at IS NULL AND is_admin()
  );

-- Audit Logs: Admin can see all
CREATE POLICY "Admin access to audit_logs" ON audit_logs
  FOR ALL TO authenticated
  USING (is_admin());

-- Reminder Logs: Admin can see all
CREATE POLICY "Admin access to reminder_logs" ON reminder_logs
  FOR ALL TO authenticated
  USING (is_admin());

-- Task Versions: Admin can see all
CREATE POLICY "Admin access to task_versions" ON task_versions
  FOR ALL TO authenticated
  USING (is_admin());

-- Service Role Key (Cron) will bypass RLS by default or we can add specific policies if needed, 
-- but service_role always bypasses RLS in Supabase.
