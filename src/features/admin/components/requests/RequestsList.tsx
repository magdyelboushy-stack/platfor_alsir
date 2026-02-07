import { RequestCard } from './RequestCard';
import { RegistrationRequest } from '../../services/RequestsService';
import { Inbox } from 'lucide-react';

interface RequestsListProps {
    requests: RegistrationRequest[];
    loading: boolean;
    processingId: string | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function RequestsList({ requests, loading, processingId, onApprove, onReject }: RequestsListProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-[var(--bg-secondary)] rounded-[2rem] border border-[var(--border-color)] h-[280px] animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--bg-main)]/30 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                    </div>
                ))}
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-color)] border-dashed text-center">
                <div className="w-20 h-20 rounded-3xl bg-[var(--bg-main)] flex items-center justify-center mb-6 shadow-sm rotate-3">
                    <Inbox className="w-10 h-10 text-[var(--text-secondary)] opacity-30" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display mb-2">لا توجد طلبات جديدة</h3>
                <p className="text-[var(--text-secondary)] opacity-60 font-medium max-w-xs mx-auto">
                    جميع طلبات التسجيل تم التعامل معها. سيظهر أي طلب جديد هنا فور وصوله.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up">
            {requests.map((req) => (
                <RequestCard
                    key={req.id}
                    request={req}
                    onApprove={onApprove}
                    onReject={onReject}
                    isProcessing={processingId === req.id}
                />
            ))}
        </div>
    );
}
