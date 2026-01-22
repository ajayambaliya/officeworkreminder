import { NextRequest, NextResponse } from 'next/server';
import { processReminders } from '@/services/reminder-engine';

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    // Verify Cron Secret
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const results = await processReminders();
        return NextResponse.json({
            success: true,
            message: 'Reminders processed',
            results,
        });
    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}

// Support POST as well for convenience
export async function POST(request: NextRequest) {
    return GET(request);
}
