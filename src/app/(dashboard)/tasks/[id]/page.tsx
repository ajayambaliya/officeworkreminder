import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Building2,
    Tag,
    FileText,
    Clock,
    History,
    User,
    Bell,
    CheckCircle2,
    AlertTriangle,
    RotateCcw
} from 'lucide-react';
import { TaskActions } from '@/components/tasks/TaskActions';
import Link from 'next/link';
import { format } from 'date-fns';
import { type Task, type AuditLog, type TaskVersion } from '@/types';
import { cn } from '@/lib/utils';

export default async function TaskDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const supabase = await createClient();

    const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!task) notFound();

    const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('record_id', params.id)
        .order('created_at', { ascending: false });

    const { data: versions } = await supabase
        .from('task_versions')
        .select('*')
        .eq('task_id', params.id)
        .order('version', { ascending: false });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to List
                </Link>
                <div className="flex gap-4">
                    <TaskActions taskId={params.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16" />

                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {task.task_type}
                                    </span>
                                    <span className={cn(
                                        "text-xs font-bold uppercase py-0.5 px-2 rounded",
                                        task.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                    )}>
                                        {task.status}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{task.title}</h1>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10 py-8 border-y border-slate-50 dark:border-slate-800">
                            <InfoItem icon={Calendar} label="Due Date" value={format(new Date(task.due_date), 'PPP')} />
                            <InfoItem icon={Building2} label="Department" value={task.department || 'N/A'} />
                            <InfoItem icon={Tag} label="Reference No" value={task.reference_no || 'N/A'} />
                            <InfoItem icon={User} label="Amount" value={task.amount ? `₹${task.amount.toLocaleString()}` : 'N/A'} />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" />
                                Official Description
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                                {task.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Audit Logs */}
                    <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <History className="w-6 h-6 text-blue-500" />
                                Audit Trail & History
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {auditLogs?.map((log: AuditLog) => (
                                <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {log.action.replace('_', ' ')}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {format(new Date(log.created_at), 'PPP p')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-500" />
                            Reminder Schedule
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Last Notified</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {task.last_notified_at ? format(new Date(task.last_notified_at), 'dd MMM yyyy') : 'Never'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Rules Applied</span>
                                <span className="font-bold text-blue-600">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-purple-500" />
                            Version History
                        </h2>
                        <div className="space-y-6">
                            {versions?.map((v: TaskVersion) => (
                                <div key={v.id} className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-500" />
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Version {v.version}</p>
                                    <p className="text-xs text-slate-500 mt-1">{format(new Date(v.changed_at), 'dd MMM yyyy')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{label}</p>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{value}</span>
            </div>
        </div>
    );
}

