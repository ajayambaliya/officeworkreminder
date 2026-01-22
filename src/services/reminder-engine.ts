import { createServiceRoleClient } from '@/utils/supabase/server';
import { sendTelegramMessage, formatConsolidatedReminder } from './telegram';
import { startOfDay } from 'date-fns';
import { type Task } from '@/types';

export async function processReminders() {
    const supabase = await createServiceRoleClient();
    const today = startOfDay(new Date());

    // 1. Fetch all active tasks (Pending or In Progress)
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .in('status', ['PENDING', 'IN_PROGRESS']);

    if (error) {
        console.error('Error fetching tasks for reminders:', error);
        return { success: false, error: error.message };
    }

    if (!tasks || tasks.length === 0) {
        return { success: true, message: 'No active tasks found.', sent: false };
    }

    // 2. Format one consolidated message
    const message = formatConsolidatedReminder(tasks);

    // 3. Send to Telegram
    const { success, error: tgError } = await sendTelegramMessage(message);

    // 4. Log the global reminder run
    await supabase.from('reminder_logs').insert({
        channel: 'telegram',
        status: success ? 'SENT' : 'FAILED',
        error_message: success ? `Summary of ${tasks.length} tasks` : tgError,
    });

    if (success) {
        // Update last_notified_at for all processed tasks
        const taskIds = tasks.map(t => t.id);
        await supabase
            .from('tasks')
            .update({ last_notified_at: today.toISOString().split('T')[0] })
            .in('id', taskIds);
    }

    return {
        success,
        sent: true,
        taskCount: tasks.length,
        error: tgError
    };
}
