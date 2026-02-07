import { ActivityLog } from '../../services/ActivityLogService';
import { ActivityLogItem } from './ActivityLogItem';
import { ShieldAlert } from 'lucide-react';

interface Props {
    logs: ActivityLog[];
    loading: boolean;
}

export function ActivityLogsList({ logs = [], loading }: Props) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-32 bg-[var(--bg-secondary)] rounded-2xl animate-pulse border border-[var(--border-color)]" />
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-24 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-dashed">
                <div className="w-20 h-20 mx-auto bg-[var(--bg-main)] rounded-full flex items-center justify-center mb-6 ring-8 ring-[var(--bg-secondary)]">
                    <ShieldAlert className="w-10 h-10 text-[var(--text-secondary)] opacity-20" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 font-display">لا توجد سجلات</h3>
                <p className="text-sm text-[var(--text-secondary)] opacity-60 font-medium">لم يتم تسجيل أي عمليات حتى الآن</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {logs.map((log) => (
                <ActivityLogItem key={log.id} log={log} />
            ))}
        </div>
    );
}
