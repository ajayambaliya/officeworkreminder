'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendManualReminder } from '@/services/tasks';
import { cn } from '@/lib/utils';

export function TaskActions({ taskId }: { taskId: string }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

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
            // Reset status after 3 seconds
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="flex flex-col gap-2">
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
    );
}
