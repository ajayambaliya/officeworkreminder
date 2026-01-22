export type UserRole = 'ADMIN';

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export type TaskType = 'REPAIR' | 'AMC' | 'LETTER' | 'OTHER';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ReminderRules {
  daily: boolean;
  before_days: number[];
  on_due_date: boolean;
  overdue: boolean;
  time_of_day: string;
}

export interface Task {
  id: string;
  task_type: TaskType;
  title: string;
  description: string | null;
  status: TaskStatus;
  start_date: string;
  due_date: string;
  reminder_rules: ReminderRules;
  last_notified_at: string | null;
  reference_no: string | null;
  department: string | null;
  vendor: string | null;
  amount: number | null;
  assigned_to: string | null;
  created_by: string | null;
  completed_at: string | null;
  completed_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_data: any | null;
  new_data: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ReminderLog {
  id: string;
  task_id: string;
  sent_at: string;
  channel: 'telegram';
  status: 'SENT' | 'FAILED';
  error_message: string | null;
}

export interface TaskVersion {
  id: string;
  task_id: string;
  version: number;
  data: Partial<Task>;
  changed_by: string | null;
  changed_at: string;
}
