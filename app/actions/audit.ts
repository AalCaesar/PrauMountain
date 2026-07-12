'use server';

import { createClient } from '@/utils/supabase/server';

export interface AuditLogEntry {
  id: string;
  waktu: string;
  aksi: string;
  pelaku: string;
  basecamp: string;
}

export async function getRecentAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const supabase = await createClient();

    // Query 10 latest audit logs
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        created_at,
        action,
        users (nama_lengkap),
        basecamps (nama_basecamp)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }

    if (!data) return [];

    return data.map((log: any) => {
      // Format date
      const dateObj = new Date(log.created_at);
      const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
      const formattedTime = formatter.format(dateObj);

      return {
        id: log.id,
        waktu: formattedTime,
        aksi: log.action || 'Unknown Action',
        pelaku: log.users?.nama_lengkap || 'Sistem',
        basecamp: log.basecamps?.nama_basecamp || 'Semua Basecamp',
      };
    });
  } catch (error) {
    console.error('Unexpected error fetching audit logs:', error);
    return [];
  }
}

export async function insertAuditLog({
  user_id,
  action,
  entity_type,
  entity_id,
  basecamp_id
}: {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  basecamp_id: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('audit_logs').insert({
      user_id,
      action,
      entity_type,
      entity_id,
      basecamp_id
    });
    
    if (error) {
      console.error('Failed to insert audit log:', error);
    }
  } catch (error) {
    console.error('Unexpected error inserting audit log:', error);
  }
}
