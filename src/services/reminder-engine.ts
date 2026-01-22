import { createServiceRoleClient } from '@/utils/supabase/server';
import { sendTelegramMessage, formatReminderMessage } from './telegram';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';
import { type Task, type ReminderRules } from '@/types';

export async function processReminders() {
    const supabase = await createServiceRoleClient();
    const today = startOfDay(new Date());

    // 1. Fetch active tasks
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .in('status', ['PENDING', 'IN_PROGRESS']);

    if (error) {
        console.error('Error fetching tasks for reminders:', error);
        return;
    }

    const results = {
        total: tasks.length,
        sent: 0,
        failed: 0,
        skipped: 0,
    };

    for (const task of (tasks as Task[])) {
        const rules = task.reminder_rules as ReminderRules;
        const dueDate = startOfDay(parseISO(task.due_date));
        const daysLeft = differenceInDays(dueDate, today);

        // Prevent duplicate notification on the same day
        if (task.last_notified_at === today.toISOString().split('T')[0]) {
            results.skipped++;
            continue;
        }

        let shouldNotify = false;

        // Check rules
        if (rules.on_due_date && daysLeft === 0) {
            shouldNotify = true;
        } else if (rules.overdue && daysLeft < 0) {
            // For overdue, maybe notify every few days or daily if specified
            shouldNotify = true;
        } else if (rules.before_days && rules.before_days.includes(daysLeft)) {
            shouldNotify = true;
        } else if (rules.daily && daysLeft > 0 && daysLeft <= 7) {
            // Example logic: if daily is true and it's within 7 days
            shouldNotify = true;
        }

        if (shouldNotify) {
            const message = formatReminderMessage(task, daysLeft);
            const { success, error: tgError } = await sendTelegramMessage(message);

            // Log the attempt
            await supabase.from('reminder_logs').insert({
                task_id: task.id,
                channel: 'telegram',
                status: success ? 'SENT' : 'FAILED',
                error_message: tgError || null,
            });

            if (success) {
                // Update last_notified_at
                await supabase
                    .from('tasks')
                    .update({ last_notified_at: today.toISOString().split('T')[0] })
                    .eq('id', task.id);

                results.sent++;
            } else {
                results.failed++;
            }
        } else {
            results.skipped++;
        }
    }

    return results;
}
