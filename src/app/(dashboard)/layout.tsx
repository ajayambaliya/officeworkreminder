import { Sidebar } from '@/components/layout/Sidebar';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Verify Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'ADMIN') {
        await supabase.auth.signOut();
        redirect('/login');
    }

    return (
        <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-10 min-h-screen">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
