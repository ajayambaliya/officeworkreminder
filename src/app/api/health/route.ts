import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/utils/supabase/server';
import axios from 'axios';

export async function GET() {
    const health: any = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
            database: 'unknown',
            telegram: 'unknown',
        },
    };

    try {
        const supabase = await createServiceRoleClient();
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        health.checks.database = error ? 'error' : 'connected';
    } catch {
        health.checks.database = 'failed';
    }

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
            const tgRes = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
            health.checks.telegram = tgRes.data.ok ? 'connected' : 'auth_failed';
        } else {
            health.checks.telegram = 'config_missing';
        }
    } catch {
        health.checks.telegram = 'failed';
    }

    const isHealthy = Object.values(health.checks).every(v => v === 'connected');
    health.status = isHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(health, { status: isHealthy ? 200 : 503 });
}
