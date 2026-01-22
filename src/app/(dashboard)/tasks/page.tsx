import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Tag,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { type Task } from '@/types';
import { cn } from '@/lib/utils';

export default async function TasksPage(props: {
    searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    let query = supabase
        .from('tasks')
        .select('*')
        .is('deleted_at', null)
        .order('due_date', { ascending: true });

    if (searchParams.q) {
        query = query.ilike('title', `%${searchParams.q}%`);
    }
    if (searchParams.status) {
        query = query.eq('status', searchParams.status);
    }
    if (searchParams.type) {
        query = query.eq('task_type', searchParams.type);
    }

    const { data: tasks, error } = await query;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Central Task Repository</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage, track and audit all official tasks.</p>
                </div>
                <Link
                    href="/tasks/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create Task
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title, reference no..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-4">
                    <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-6 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-blue-500/50 outline-none">
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                    <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-6 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-blue-500/50 outline-none">
                        <option value="">All Types</option>
                        <option value="REPAIR">Repair</option>
                        <option value="AMC">AMC</option>
                        <option value="LETTER">Letter</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task: Task) => (
                        <Link
                            key={task.id}
                            href={`/tasks/${task.id}`}
                            className="group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500/50 transition-all flex items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                task.status === 'COMPLETED' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" :
                                    task.status === 'IN_PROGRESS' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500" :
                                        "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                            )}>
                                {task.status === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                        {task.task_type}
                                    </span>
                                    {task.reference_no && (
                                        <span className="text-xs font-medium text-slate-500">Ref: {task.reference_no}</span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                    {task.title}
                                </h3>
                            </div>

                            <div className="flex items-center gap-10 shrink-0">
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Due Date</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {format(new Date(task.due_date), 'dd MMM yyyy')}
                                    </p>
                                </div>
                                <div className="text-right w-24">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                                        task.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                                            task.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700" :
                                                "bg-orange-100 text-orange-700"
                                    )}>
                                        {task.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <MoreVertical className="w-5 h-5 text-slate-300" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Tasks Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or create a new task to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

