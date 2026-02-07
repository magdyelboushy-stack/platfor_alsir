// ============================================================
// Teacher Activation Codes - Premium Manager with API Integration
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { CodesHeader } from './components/CodesHeader';
import { CodesStats } from './components/CodesStats';
import { CodesToolbar } from './components/CodesToolbar';
import { GenerateCodesModal } from './components/GenerateCodesModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ticket, Copy, Check, User, Calendar, Banknote } from 'lucide-react';
import { CodesService, ActivationCode, CodeStats } from './services/CodesService';
import { useToast } from '@/store/uiStore';
import clsx from 'clsx';

export function CodesManagerPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [codes, setCodes] = useState<ActivationCode[]>([]);
    const [stats, setStats] = useState<CodeStats>({ total: 0, used: 0, active: 0, expired: 0, revenue: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showUsed, setShowUsed] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const { show } = useToast();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [codesData, statsData] = await Promise.all([
                CodesService.getCodes(showUsed),
                CodesService.getStats()
            ]);
            setCodes(codesData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch codes:', error);
            show({ type: 'error', title: 'خطأ', message: 'فشل في جلب الأكواد' });
        } finally {
            setIsLoading(false);
        }
    }, [show]);

    useEffect(() => {
        fetchData();
    }, [fetchData, showUsed]);

    const handleGenerate = async (data: any) => {
        try {
            const result = await CodesService.generateCodes({
                course_id: data.course_id,
                price: data.price,
                batch_name: data.batch_name,
                count: data.count,
                students: data.students
            });

            show({
                type: 'success',
                title: 'تم بنجاح',
                message: `تم إنشاء ${result.count} كود جديد`
            });

            // Refresh data
            fetchData();
        } catch (error: any) {
            show({
                type: 'error',
                title: 'خطأ',
                message: error?.response?.data?.error || 'فشل في إنشاء الأكواد'
            });
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const filteredCodes = codes.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.batch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.assigned_to_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'used': return 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20';
            case 'active': return 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/20';
            case 'expired': return 'bg-rose-500/10 text-rose-600 ring-rose-500/20';
            default: return 'bg-gray-500/10 text-gray-600 ring-gray-500/20';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'used': return 'مستخدم';
            case 'active': return 'نشط';
            case 'expired': return 'منتهي';
            default: return status;
        }
    };

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto py-8 animate-in fade-in duration-700">
            {/* 1. Header Section */}
            <CodesHeader onGenerate={() => setIsGenerating(true)} />

            {/* 2. Key Stats */}
            <CodesStats stats={{
                total: stats.total,
                used: stats.used,
                remaining: stats.active,
                expired: stats.expired
            }} />

            {/* Revenue Card */}
            <div className="px-2">
                <div className="bg-gradient-to-l from-brand-500/10 to-emerald-500/10 border border-brand-500/20 rounded-[2rem] p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-500 flex items-center justify-center">
                        <Banknote className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--text-secondary)] mb-1">إجمالي الإيرادات</p>
                        <h3 className="text-3xl font-black text-[var(--text-primary)]">
                            {(stats.revenue || 0).toLocaleString()} <span className="text-lg">ج.م</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* 3. Filtering Toolbar */}
            <CodesToolbar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showUsed={showUsed}
                setShowUsed={setShowUsed}
            />

            {/* 4. Codes Grid */}
            <div className="px-2">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredCodes.map((code) => (
                                <motion.div
                                    layout
                                    key={code.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 hover:border-brand-500/30 transition-all group"
                                >
                                    {/* Code Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                                <Ticket className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-[var(--text-primary)] font-mono tracking-wider">
                                                    {code.code}
                                                </p>
                                                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                                                    {code.course_title}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(code.code)}
                                            className="p-2.5 rounded-xl bg-[var(--bg-main)] hover:bg-brand-500 hover:text-white transition-all"
                                        >
                                            {copiedCode === code.code ? (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Code Details */}
                                    <div className="space-y-3 mb-4">
                                        {code.assigned_to_name && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <User className="w-4 h-4 text-[var(--text-secondary)]" />
                                                <span className="font-bold text-[var(--text-primary)]">
                                                    {code.assigned_to_name}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                                            <span className="text-[var(--text-secondary)]">
                                                {new Date(code.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Banknote className="w-4 h-4 text-[var(--text-secondary)]" />
                                            <span className="font-bold text-brand-500">
                                                {code.price} ج.م
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between">
                                        <span className={clsx(
                                            "px-3 py-1.5 rounded-xl text-xs font-black ring-1 ring-inset",
                                            getStatusColor(code.status)
                                        )}>
                                            {getStatusText(code.status)}
                                        </span>
                                        {code.batch_name && (
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--bg-main)] px-2 py-1 rounded-lg">
                                                {code.batch_name}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Empty State */}
                        {filteredCodes.length === 0 && !isLoading && (
                            <div className="col-span-full py-32 text-center">
                                <div className="w-28 h-28 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <Search className="w-12 h-12 text-[var(--text-secondary)] opacity-20" />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">لا توجد أكواد</h3>
                                <p className="text-[var(--text-secondary)] font-bold opacity-60 max-w-xs mx-auto leading-relaxed">
                                    {searchTerm
                                        ? 'جرب البحث بكلمات أخرى'
                                        : 'قم بتوليد أكواد جديدة للبدء'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 5. Generator Modal */}
            <GenerateCodesModal
                isOpen={isGenerating}
                onClose={() => setIsGenerating(false)}
                onSubmit={handleGenerate}
            />

            {/* Aesthetics Decor */}
            <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
