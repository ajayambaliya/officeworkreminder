'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Save,
    Bell,
    Trash2,
    Plus,
    Loader2,
    Calendar,
    Building2,
    Tag,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { createTask } from '@/services/tasks';
import { type TaskType, type TaskStatus, type ReminderRules } from '@/types';
import { cn } from '@/lib/utils';

export default function NewTaskPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        task_type: 'OTHER' as TaskType,
        status: 'PENDING' as TaskStatus,
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        department: '',
        reference_no: '',
        vendor: '',
        amount: '',
    });

    const [reminderRules, setReminderRules] = useState<ReminderRules>({
        daily: true,
        before_days: [30, 21, 15, 7, 1],
        on_due_date: true,
        overdue: true,
        time_of_day: '09:00',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createTask({
                ...formData,
                amount: formData.amount ? parseFloat(formData.amount) : null,
                reminder_rules: reminderRules,
            });
            router.push('/tasks');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const toggleBeforeDay = (day: number) => {
        setReminderRules(prev => ({
            ...prev,
            before_days: prev.before_days.includes(day)
                ? prev.before_days.filter(d => d !== day)
                : [...prev.before_days, day].sort((a, b) => b - a),
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Link
                    href="/tasks"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Repository
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Official Task</h1>
                <div className="w-20" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Main Info */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                        <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Task Details
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="e.g. MRI Machine AMC Renewal"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Type</label>
                                    <select
                                        value={formData.task_type}
                                        onChange={e => setFormData({ ...formData, task_type: e.target.value as TaskType })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    >
                                        <option value="REPAIR">Repair</option>
                                        <option value="AMC">AMC</option>
                                        <option value="LETTER">Letter</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Initial Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                    placeholder="Official description of the task..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates & Reference */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Timeline & Department
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.due_date}
                                        onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Department</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                            placeholder="e.g. Radiology"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ref No.</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <input
                                            value={formData.reference_no}
                                            onChange={e => setFormData({ ...formData, reference_no: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                            placeholder="G-123/2026"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reminder Builder */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
                            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900 dark:text-white">
                                <Bell className="w-5 h-5 text-blue-500" />
                                Reminder Engine Rules
                            </h2>

                            <div className="space-y-6">
                                <div className="flex flex-wrap gap-2">
                                    {[30, 21, 15, 7, 3, 1].map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleBeforeDay(day)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                                reminderRules.before_days.includes(day)
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {day} Days Before
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily final week reminder</span>
                                    <input
                                        type="checkbox"
                                        checked={reminderRules.daily}
                                        onChange={e => setReminderRules({ ...reminderRules, daily: e.target.checked })}
                                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Notify on Due Date</span>
                                    <input
                                        type="checkbox"
                                        checked={reminderRules.on_due_date}
                                        onChange={e => setReminderRules({ ...reminderRules, on_due_date: e.target.checked })}
                                        className="w-5 h-5 rounded-md border-slate-300 text-blue-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <Save className="w-5 h-5" />
                                Preserve & Launch Task
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

