'use server';

import { createClient } from '@/utils/supabase/server';
import { logAudit } from './audit';
import { type Task } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

    if (error) throw error;
    return data as Task[];
}

export async function getTaskById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (error) throw error;
    return data as Task;
}

export async function createTask(taskData: Partial<Task>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...taskData,
            created_by: user?.id,
        })
        .select()
        .single();

    if (error) throw error;

    await logAudit({
        action: 'CREATE_TASK',
        tableName: 'tasks',
        recordId: data.id,
        newData: data,
    });

    // Initial version
    await saveTaskVersion(data.id, 1, data, user?.id);

    revalidatePath('/tasks');
    revalidatePath('/dashboard');

    return data as Task;
}

export async function updateTask(id: string, updates: Partial<Task>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get old data for audit and versioning
    const { data: oldTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

    const { data, error } = await supabase
        .from('tasks')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    await logAudit({
        action: 'UPDATE_TASK',
        tableName: 'tasks',
        recordId: id,
        oldData: oldTask,
        newData: data,
    });

    // Incremental versioning
    const { count } = await supabase
        .from('task_versions')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', id);

    await saveTaskVersion(id, (count || 0) + 1, data, user?.id);

    revalidatePath('/tasks');
    revalidatePath(`/tasks/${id}`);

    return data as Task;
}

export async function softDeleteTask(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('tasks')
        .update({
            deleted_at: new Date().toISOString(),
            deleted_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    await logAudit({
        action: 'DELETE_TASK',
        tableName: 'tasks',
        recordId: id,
        oldData: { id },
        newData: data,
    });

    revalidatePath('/tasks');

    return data;
}

async function saveTaskVersion(taskId: string, version: number, data: any, userId?: string) {
    const supabase = await createClient();
    await supabase.from('task_versions').insert({
        task_id: taskId,
        version,
        data,
        changed_by: userId,
    });
}

export async function sendManualReminder(taskId: string) {
    const supabase = await createClient();

    // 1. Fetch task
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (fetchError || !task) throw new Error('Task not found');

    // 2. Import engine and send
    const { sendTelegramMessage, formatReminderMessage } = await import('./telegram');

    // Calculate days left for the message
    const { differenceInDays, startOfDay, parseISO } = await import('date-fns');
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(task.due_date));
    const daysLeft = differenceInDays(dueDate, today);

    const message = formatReminderMessage(task, daysLeft);
    const result = await sendTelegramMessage(message);

    // 3. Log the manual attempt
    await supabase.from('reminder_logs').insert({
        task_id: taskId,
        channel: 'telegram',
        status: result.success ? 'SENT' : 'FAILED',
        error_message: result.error || 'Manual trigger',
    });

    if (result.success) {
        // Update last notified
        await supabase
            .from('tasks')
            .update({ last_notified_at: today.toISOString().split('T')[0] })
            .eq('id', taskId);

        revalidatePath(`/tasks/${taskId}`);
    }

    return result;
}
