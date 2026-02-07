import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronRight, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface SupportFormProps {
    onBack: () => void;
    onSubmit: (data: any) => void;
}

export function SupportForm({ onBack, onSubmit }: SupportFormProps) {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'technical',
        message: ''
    });

    const isFormValid = formData.subject && formData.message;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
        >
            {/* Header / Back Link */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--color-brand)] font-black transition-colors group"
                >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    العودة للرئيسية
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">تذكرة جديدة</span>
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                        <MessageSquare className="w-4 h-4 text-[var(--color-brand)]" />
                    </div>
                </div>
            </div>

            {/* Form Container */}
            <div className="p-8 md:p-12 rounded-[3.5rem] bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-8">
                    <div className="text-right">
                        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display">أخبرنا بمشكلتك</h3>
                        <p className="text-[var(--text-secondary)] font-bold">اشرح لنا التفاصيل وسيقوم أحد خبرائنا بالرد عليك في أقرب وقت.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Subject Input */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pr-4">عنوان التذكرة</label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="مثال: مشكلة في تفعيل الكود"
                                className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 outline-none font-black text-lg transition-all"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pr-4">القسم المختص</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 outline-none font-black text-lg transition-all appearance-none cursor-pointer"
                            >
                                <option value="technical">دعم تقني وفني</option>
                                <option value="academic">سؤال تعليمي</option>
                                <option value="billing">المدفوعات والمحفظة</option>
                            </select>
                        </div>
                    </div>

                    {/* Message Textarea */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pr-4">تفاصيل البلاغ</label>
                        <textarea
                            rows={5}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="اكتب هنا كل التفاصيل التي تساعدنا على فهم المشكلة..."
                            className="w-full px-8 py-6 rounded-3xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 outline-none font-black text-lg transition-all resize-none shadow-inner"
                        />
                    </div>

                    {/* Submit Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                        <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                            <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            <p className="text-xs font-black leading-relaxed max-w-xs text-right opacity-60">بياناتك وصورك الشخصية محمية تماماً ولا يطلع عليها إلا الفريق المختص.</p>
                        </div>
                        <button
                            disabled={!isFormValid}
                            onClick={() => onSubmit(formData)}
                            className={clsx(
                                "w-full md:w-auto px-12 py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3",
                                isFormValid
                                    ? "bg-[var(--color-brand)] text-white shadow-brand-500/30 hover:scale-[1.05] active:scale-95"
                                    : "bg-slate-500/20 text-[var(--text-secondary)] cursor-not-allowed grayscale"
                            )}
                        >
                            <Send className="w-6 h-6 fill-current" />
                            إرسال التذكرة الآن
                        </button>
                    </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-brand-500/5 rounded-full blur-[80px]" />
            </div>

            {/* Support Notice */}
            <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center gap-4">
                <HelpCircle className="w-8 h-8 text-[var(--color-brand)] opacity-40 shrink-0" />
                <p className="text-sm font-bold text-[var(--text-secondary)]">تذكير: متوسط وقت الرد على التذاكر هو ساعتين خلال أوقات العمل الرسمية.</p>
            </div>
        </motion.div>
    );
}
