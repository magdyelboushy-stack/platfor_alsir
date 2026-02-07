// ============================================================
// Student Dashboard - Redeem Activation Code Section
// ============================================================

import { useState } from 'react';
import { Ticket, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CodesService } from '../../teacher/codes/services/CodesService';
import { useToast } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';

interface RedeemCodeSectionProps {
    onSuccess?: () => void;
}

export function RedeemCodeSection({ onSuccess }: RedeemCodeSectionProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; course?: { id: string; title: string } } | null>(null);
    const { show } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedCode = code.trim().toUpperCase();
        if (!trimmedCode) {
            show({ type: 'error', title: 'خطأ', message: 'يجب إدخال الكود' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await CodesService.redeemCode(trimmedCode);
            setResult({
                success: true,
                message: response.message,
                course: response.course
            });
            setCode('');
            show({ type: 'success', title: 'تم بنجاح', message: response.message });
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const errorData = error?.response?.data;
            const errorMessage = errorData?.error || 'حدث خطأ في تفعيل الكود';

            setResult({
                success: false,
                message: errorMessage,
                course: errorData?.course // This will allow showing the link even on "already enrolled"
            });
            show({
                type: errorData?.already_enrolled ? 'info' : 'error',
                title: errorData?.already_enrolled ? 'تنبيه' : 'خطأ',
                message: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                    <Ticket className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[var(--text-primary)]">تفعيل كود الاشتراك</h2>
                    <p className="text-sm font-bold text-[var(--text-secondary)] opacity-60">أدخل كود التفعيل للاشتراك في الكورس</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="أدخل كود التفعيل هنا..."
                        maxLength={12}
                        className="flex-1 h-16 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-lg tracking-widest text-center uppercase outline-none focus:border-brand-500 transition-all placeholder:text-sm placeholder:tracking-normal"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !code.trim()}
                        className="h-16 px-8 rounded-2xl bg-brand-500 text-white font-black shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>تفعيل</span>
                                <ArrowLeft className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Result Feedback */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mt-6 p-4 rounded-2xl flex items-center gap-4 ${result.success
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.success ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                            }`}>
                            {result.success ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <AlertCircle className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`font-black ${result.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                {result.success ? 'تم التفعيل بنجاح!' : 'فشل التفعيل'}
                            </p>
                            <p className="text-sm font-bold text-[var(--text-secondary)]">
                                {result.message}
                            </p>
                            {result.course && (
                                <a
                                    href={`/courses/${result.course.id}`}
                                    className="inline-flex items-center gap-2 mt-2 text-brand-500 font-black text-sm hover:underline"
                                >
                                    <span>الذهاب للكورس: {result.course.title}</span>
                                    <ArrowLeft className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Instructions */}
            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed">
                    💡 <strong>ملاحظة:</strong> الكود يتكون من 8 أحرف وأرقام. تأكد من إدخاله بشكل صحيح.
                    إذا واجهت مشكلة، تواصل مع المعلم للحصول على كود جديد.
                </p>
            </div>
        </div>
    );
}
