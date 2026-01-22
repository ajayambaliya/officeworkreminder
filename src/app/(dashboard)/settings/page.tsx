import { createClient } from '@/utils/supabase/server';
import {
    Settings,
    Shield,
    Mail,
    Key,
    Database,
    BellRing,
    ExternalLink
} from 'lucide-react';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const systems = [
        { name: 'Database Cluster', status: 'Active', icon: Database, color: 'text-emerald-500' },
        { name: 'Telegram Bot API', status: 'Connected', icon: BellRing, color: 'text-blue-500' },
        { name: 'Security Firewall', status: 'Strict', icon: Shield, color: 'text-purple-500' },
    ];

    return (
        <div className="max-w-4xl space-y-10">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="w-8 h-8 text-slate-400" />
                    System Settings
                </h1>
                <p className="text-slate-500">Configure administrative parameters and global system settings.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-500" />
                        Administrator Profile
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.email}</p>
                                <p className="text-xs text-slate-500">System Admin (Level 1)</p>
                            </div>
                        </div>
                        <button className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                            Change Password
                        </button>
                    </div>
                </section>

                {/* System Status */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        Infrastructure Status
                    </h2>
                    <div className="space-y-4">
                        {systems.map((s) => (
                            <div key={s.name} className="flex items-center justify-between p-3 border-b border-slate-50 dark:border-slate-800 last:border-none">
                                <div className="flex items-center gap-3">
                                    <s.icon className={`w-4 h-4 ${s.color}`} />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-500">{s.status}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* API Integrations */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">External Integrations</h2>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Environment Variables Only</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <BellRing className="w-4 h-4 text-blue-600" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Telegram Channel</h3>
                        </div>
                        <p className="text-xs text-slate-500">Target ID: {process.env.TELEGRAM_CHANNEL_ID?.replace(/.(?=.{4})/g, '*') || 'Not Configured'}</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic">Immutable: Change requires Vercel redeployment for security.</p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 text-purple-600" />
                            <h3 className="font-bold text-slate-900 dark:text-white">Cron Security</h3>
                        </div>
                        <p className="text-xs text-slate-500">Auth Secret: ••••••••••••••••</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic">Rotated: Ensure GitHub Secrets match Vercel Environment.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { Activity } from 'lucide-react';
