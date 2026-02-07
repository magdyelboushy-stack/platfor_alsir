import { useState, useEffect } from 'react';
import {
    RefreshCcw,
    UserPlus,
    Filter
} from 'lucide-react';
import { requestsService, RegistrationRequest } from '../services/RequestsService';
import { RequestsStats } from '../components/requests/RequestsStats';
import { RequestsList } from '../components/requests/RequestsList';
import { useUIStore } from '@/store/uiStore';

export function RequestsManagerPage() {
    const [requests, setRequests] = useState<RegistrationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const { showToast } = useUIStore();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await requestsService.getPendingRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            showToast({
                type: 'error',
                title: 'خطأ',
                message: 'فشل تحميل طلبات التسجيل'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await requestsService.approveRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
            showToast({
                type: 'success',
                title: 'تم القبول',
                message: 'تم تفعيل حساب الطالب بنجاح'
            });
        } catch (error) {
            console.error(error);
            showToast({
                type: 'error',
                title: 'خطأ',
                message: 'حدث خطأ أثناء قبول الطلب'
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من رفض هذا الطلب وحذف البيانات؟')) return;

        setProcessingId(id);
        try {
            await requestsService.rejectRequest(id);
            setRequests(prev => prev.filter(r => r.id !== id));
            showToast({
                type: 'info',
                title: 'تم الرفض',
                message: 'تم رفض الطلب وحذف البيانات'
            });
        } catch (error) {
            console.error(error);
            showToast({
                type: 'error',
                title: 'خطأ',
                message: 'حدث خطأ أثناء رفض الطلب'
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] font-display flex items-center gap-3">
                        <UserPlus className="w-8 h-8 text-amber-500" />
                        طلبات التسجيل
                    </h1>
                    <p className="text-[var(--text-secondary)] opacity-70 mt-2 font-medium">
                        إدارة ومراجعة طلبات تسجيل الطلاب الجدد
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchRequests}
                        className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500/30 transition-all hover:rotate-180 active:scale-95 duration-500"
                        title="تحديث البيانات"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold hover:bg-[var(--bg-main)] transition-all">
                        <Filter className="w-4 h-4" />
                        <span>تصفية</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <RequestsStats count={requests.length} />

            {/* List */}
            <div className="space-y-4">
                <RequestsList
                    requests={requests}
                    loading={loading}
                    processingId={processingId}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </div>
        </div>
    );
}
