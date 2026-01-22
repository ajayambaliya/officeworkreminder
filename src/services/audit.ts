'use server';

import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { type AuditLog } from '@/types';

export async function logAudit(params: {
    action: string;
    tableName?: string;
    recordId?: string;
    oldData?: any;
    newData?: any;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Use service role to ensure audit logs are always written even if user has restricted permissions
    const serviceSupabase = await createServiceRoleClient();

    const auditData = {
        user_id: user?.id || null,
        action: params.action,
        table_name: params.tableName,
        record_id: params.recordId,
        old_data: params.oldData,
        new_data: params.newData,
        // Note: IP and User Agent would ideally be passed from request headers if possible
    };

    const { error } = await serviceSupabase
        .from('audit_logs')
        .insert(auditData);

    if (error) {
        console.error('Audit Log Error:', error);
    }
}
