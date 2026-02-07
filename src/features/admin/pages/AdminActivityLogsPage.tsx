import { useState, useEffect } from 'react';
import { ActivityLog, activityLogService } from '../services/ActivityLogService';
import { ActivityLogsList } from '../components/logs/ActivityLogsList';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export function AdminActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const response = await activityLogService.getLogs(page);

            if (response && response.data) {
                setLogs(response.data);
                setTotalPages(response.meta?.last_page || 1);
            } else {
                console.error('Invalid response structure', response);
                setLogs([]);
            }
        } catch (error) {
            console.error(error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-slide-up max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-brand-500" />
                        سجل النشاط والأمان
                    </h1>
                    <p className="text-[var(--text-secondary)] opacity-80 font-medium max-w-xl leading-relaxed">
                        تتبع جميع العمليات التي تحدث في النظام أولاً بأول لضمان الأمان والشفافية.
                    </p>
                </div>

                <button
                    onClick={loadLogs}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] transition-all"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    تحديث السجل
                </button>
            </div>

            {/* List */}
            <ActivityLogsList logs={logs} loading={loading} />

            {/* Pagination (Simple) */}
            <div className="flex justify-center gap-2 pt-8">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    السابق
                </button>
                <span className="px-4 py-2 text-sm font-bold">{page} / {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-[var(--bg-secondary)] rounded-lg text-sm font-bold disabled:opacity-50"
                >
                    التالي
                </button>
            </div>
        </div>
    );
}
