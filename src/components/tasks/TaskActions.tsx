'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle, CheckCircle } from 'lucide-react';
import { sendManualReminder, markTaskAsCompleted } from '@/services/tasks';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function TaskActions({ taskId, currentStatus }: { taskId: string, currentStatus?: string }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSendReminder = async () => {
        setLoading(true);
        setStatus('idle');
        setMessage(null);

        try {
            const result = await sendManualReminder(taskId);
            if (result.success) {
                setStatus('success');
                setMessage('Reminder sent to Telegram!');
            } else {
                setStatus('error');
                setMessage(result.error || 'Failed to send reminder');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleMarkCompleted = async () => {
        if (!confirm('Are you sure you want to mark this task as COMPLETED? Reminders will stop.')) return;

        setLoading(true);
        try {
            await markTaskAsCompleted(taskId);
            router.refresh();
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (currentStatus === 'COMPLETED') {
        return (
            <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold border border-emerald-100 italic">
                <CheckCircle className="w-5 h-5" />
                Task Completed
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
                <button
                    onClick={handleSendReminder}
                    disabled={loading}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50",
                        status === 'success' ? "bg-emerald-500 text-white" :
                            status === 'error' ? "bg-red-500 text-white" :
                                "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                    )}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                        status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                            status === 'error' ? <AlertCircle className="w-4 h-4" /> :
                                <Send className="w-4 h-4" />
                    }
                    {status === 'success' ? 'Sent!' : status === 'error' ? 'Failed' : 'Ping Telegram'}
                </button>
                {message && (
                    <p className={cn(
                        "text-[10px] font-bold text-center uppercase tracking-tighter",
                        status === 'success' ? "text-emerald-500" : "text-red-500"
                    )}>
                        {message}
                    </p>
                )}
            </div>

            <button
                onClick={handleMarkCompleted}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all shadow-sm active:scale-95"
            >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Mark as Completed
            </button>
        </div>
    );
}
