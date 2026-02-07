// ============================================================
// Teacher Requests Manager - Login & Devices
// ============================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Search, Check, Loader2 } from 'lucide-react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useToast } from '@/store/uiStore';

// Components
import { RequestHeader } from '../components/requests/RequestHeader';
import { RequestCard } from '../components/requests/RequestCard';
import { RequestDetailsModal } from '../components/requests/RequestDetailsModal';

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export function RequestsManagerPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const toast = useToast();

    // Fetch Requests from Backend
    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get(ENDPOINTS.ADMIN.LIST_PENDING_REQUESTS);
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'حدث خطأ أثناء جلب الطلبات'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Filter logic
    useEffect(() => {
        if (!Array.isArray(requests)) return;
        const term = searchTerm.toLowerCase();
        const filtered = requests.filter(req =>
            req.student.toLowerCase().includes(term) ||
            req.details?.phone?.includes(term) ||
            req.details?.email?.toLowerCase().includes(term)
        );
        setFilteredRequests(filtered);
    }, [searchTerm, requests]);

    // Approve Request
    const handleApprove = async (id: string) => {
        try {
            await apiClient.post(ENDPOINTS.ADMIN.APPROVE_REQUEST(id));
            toast.show({
                type: 'success',
                title: 'تم بنجاح',
                message: 'تم قبول وتفعيل حساب الطالب بنجاح'
            });
            // Refresh list
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'فشل قبول الطلب، حاول مرة أخرى'
            });
        }
    };

    // Reject Request
    const handleReject = async (id: string) => {
        if (!confirm('هل أنت متأكد من رفض هذا الطلب؟')) return;
        try {
            await apiClient.post(ENDPOINTS.ADMIN.REJECT_REQUEST(id));
            toast.show({
                type: 'success',
                title: 'تم الرفض',
                message: 'تم رفض الطلب بنجاح'
            });
            // Refresh list
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'فشل رفض الطلب'
            });
        }
    };

    // Bulk Approve
    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        setIsBulkApproving(true);
        try {
            await Promise.all(selectedIds.map(id => apiClient.post(ENDPOINTS.ADMIN.APPROVE_REQUEST(id))));
            toast.show({
                type: 'success',
                title: 'تم بنجاح',
                message: `تم قبول ${selectedIds.length} طلب بنجاح`
            });
            setRequests(prev => prev.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
        } catch (error) {
            toast.show({
                type: 'error',
                title: 'خطأ',
                message: 'حدث خطأ أثناء القبول الجماعي'
            });
        } finally {
            setIsBulkApproving(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredRequests.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredRequests.map(r => r.id));
        }
    };

    const newRegistrations = Array.isArray(requests) ? requests.filter(r => r.type === 'new_registration').length : 0;
    const deviceResets = Array.isArray(requests) ? requests.filter(r => r.type === 'device_reset').length : 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 p-6 lg:p-8"
        >
            {/* Header Section */}
            <RequestHeader
                totalRequests={Array.isArray(requests) ? requests.length : 0}
                newRegistrations={newRegistrations}
                deviceResets={deviceResets}
            />

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 dark:bg-black/20 p-4 rounded-[2rem]">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500 opacity-50" />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pr-12 pl-4 rounded-2xl bg-[var(--bg-main)] text-sm font-bold focus:border-brand-500 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {selectedIds.length > 0 && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleBulkApprove}
                            disabled={isBulkApproving}
                            className="flex-1 md:flex-none h-12 px-6 bg-brand-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            {isBulkApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            قبول المحدد ({selectedIds.length})
                        </motion.button>
                    )}

                    <button
                        onClick={toggleSelectAll}
                        className="flex-1 md:flex-none h-12 px-6 bg-white/5 dark:bg-white/5 hover:bg-brand-500/10 text-[var(--text-secondary)] hover:text-brand-500 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2"
                    >
                        {selectedIds.length === filteredRequests.length && filteredRequests.length > 0 ? 'إلغاء التحديد' : 'تحديد الكل'}
                    </button>
                </div>
            </div>

            {/* Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="relative group">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(req.id)}
                                onChange={() => toggleSelection(req.id)}
                                className="absolute top-4 left-4 z-10 w-5 h-5 rounded-lg accent-brand-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <RequestCard
                                req={req}
                                onView={setSelectedRequest}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        </div>
                    ))
                ) : (
                    <div className="lg:col-span-3 border-2 border-dashed border-white/5 rounded-3xl p-16 flex flex-col items-center justify-center text-center text-slate-500">
                        <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-white/5">
                            <CheckCircle className="w-8 h-8 text-slate-700" />
                        </div>
                        <p className="font-bold text-lg text-white font-display">لا توجد نتائج مطابقة</p>
                        <p className="text-sm mt-1">حاول البحث بكلمات مختلفة أو راجع جميع الطلبات.</p>
                    </div>
                )}
            </div>

            {/* Registration Details Modal */}
            <RequestDetailsModal
                req={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </motion.div>
    );
}

function SkeletonCard() {
    return (
        <div className="p-6 rounded-[2.5rem] bg-white/20 dark:bg-white/5 border border-brand-500/5 h-[320px] animate-pulse">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2 opacity-50" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="flex gap-4">
                    <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
