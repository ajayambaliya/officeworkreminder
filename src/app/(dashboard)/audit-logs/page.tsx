import { createClient } from '@/utils/supabase/server';
import {
    ShieldCheck,
    Clock,
    Terminal,
    User,
    Activity,
    ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { type AuditLog } from '@/types';
import { cn } from '@/lib/utils';

export default async function GlobalAuditLogsPage() {
    const supabase = await createClient();

    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Terminal className="w-8 h-8 text-blue-600" />
                    System Audit Trail
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Total transparency and accountability for every administrative action.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Timestamp</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Administrator</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Action</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Resource</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">ID</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {logs?.map((log: AuditLog) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                            {format(new Date(log.created_at), 'dd MMM hh:mm a')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                            <User className="w-3 h-3 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                            {log.user_id ? log.user_id.split('-')[0] : 'System'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase px-2 py-1 rounded-md",
                                        log.action.includes('CREATE') ? "bg-emerald-50 text-emerald-600" :
                                            log.action.includes('UPDATE') ? "bg-blue-50 text-blue-600" :
                                                log.action.includes('DELETE') ? "bg-red-50 text-red-600" :
                                                    "bg-slate-100 text-slate-600"
                                    )}>
                                        {log.action.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-xs font-bold text-slate-700 dark:text-slate-300">{log.table_name || '-'}</td>
                                <td className="px-6 py-5 text-[10px] font-mono text-slate-400">{log.record_id ? log.record_id.split('-')[0] : '-'}</td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-blue-600" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {(!logs || logs.length === 0) && (
                    <div className="p-20 text-center">
                        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No activity records found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

