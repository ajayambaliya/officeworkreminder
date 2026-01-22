import { createClient } from '@/utils/supabase/server';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Layers,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Basic stats
    const { count: pendingCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING')
        .is('deleted_at', null);

    const { count: inProgressCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'IN_PROGRESS')
        .is('deleted_at', null);

    const { count: completedCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'COMPLETED')
        .is('deleted_at', null);

    const { count: reminderCount } = await supabase
        .from('reminder_logs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'SENT');

    const stats = [
        { label: 'Pending Tasks', value: pendingCount || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'In Progress', value: inProgressCount || 0, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Completed', value: completedCount || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Reminders Sent', value: reminderCount || 0, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage government tasks and automated reminders.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} dark:bg-slate-800 flex items-center justify-center`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                        <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 text-center text-slate-400">
                            <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Activity log will automatically populate as tasks are managed.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Health</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Telegram Bot API</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md uppercase">Online</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Database Cluster</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md uppercase">Stable</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cron Scheduler</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md uppercase">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
