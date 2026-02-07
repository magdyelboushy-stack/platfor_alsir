import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldAlert, Eye, Check, X, Phone, GraduationCap, Smartphone } from 'lucide-react';
import { formatEducationValue } from '@/core/utils/educationMapping';
import { getImageUrl } from '@/core/utils/url';
import { clsx } from 'clsx';

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

interface RequestCardProps {
    req: any;
    onView: (req: any) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function RequestCard({ req, onView, onApprove, onReject }: RequestCardProps) {
    const isRegistration = req.type === 'new_registration';
    const avatarUrl = getImageUrl(req.details?.avatar);

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -8 }}
            dir="rtl"
            className="group"
        >
            <div className={clsx(
                "p-6 rounded-[2.5rem] transition-all duration-500 relative overflow-hidden flex flex-col h-full",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/5 shadow-sm",
                "hover:border-brand-500/50 hover:shadow-brand-500/20",
            )}>
                {/* Status Indicator Bar */}
                <div className={clsx(
                    "absolute top-0 right-10 w-16 h-1 rounded-b-full transition-all duration-500 group-hover:h-2",
                    isRegistration ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                )} />

                {/* Header Information */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            "w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden border-2 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-inner",
                            isRegistration ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-amber-500/10 border-amber-500/20'
                        )}>
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={req.student} className="w-full h-full object-cover" />
                            ) : (
                                isRegistration ? <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> : <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                            )}
                        </div>
                        <div className="text-right">
                            <h3 className="text-lg font-black text-[var(--text-primary)] font-display line-clamp-1 group-hover:text-brand-500 transition-colors">
                                {req.student}
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-60 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-brand-500/50" />
                                {req.time}
                            </p>
                        </div>
                    </div>

                    <span className={clsx(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest",
                        isRegistration
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    )}>
                        {isRegistration ? 'تسجيل جديد' : 'تنبيه أمان'}
                    </span>
                </div>

                {/* Quick Details Area */}
                <div className="space-y-3 mb-8 bg-brand-500/[0.03] p-5 rounded-3xl border border-brand-500/5 relative overflow-hidden flex-1 group-hover:bg-brand-500/[0.05] transition-colors text-right">
                    {isRegistration ? (
                        <>
                            <DetailRow icon={GraduationCap} label="الصف الدراسي" value={formatEducationValue(req.details?.gradeLevel)} />
                            <DetailRow icon={Phone} label="رقم الهاتف" value={req.details?.phone} isDirLtr />
                        </>
                    ) : (
                        <>
                            <DetailRow icon={ShieldAlert} label="السبب" value={req.reason} />
                            <DetailRow icon={Smartphone} label="الجهاز" value={req.device} isDirLtr />
                        </>
                    )}

                    {/* View Details Overlay Toggle */}
                    <button
                        onClick={() => onView(req)}
                        className="w-full mt-4 py-3 bg-white dark:bg-black/20 text-brand-500 text-[11px] font-black rounded-2xl border border-brand-500/10 hover:bg-brand-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
                    >
                        <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        عرض ملف الطالب كاملاً
                    </button>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => onApprove(req.id)}
                        className="flex-1 py-4 bg-brand-500 hover:brightness-110 text-white rounded-2xl font-black transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 text-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Check className="w-5 h-5" />
                        <span>موافقة</span>
                    </button>
                    <button
                        onClick={() => onReject(req.id)}
                        className="flex-1 py-4 bg-white/50 dark:bg-white/5 hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 border-brand-500/10 hover:border-brand-500/30 rounded-2xl font-black transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <X className="w-5 h-5" />
                        <span>رفض</span>
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.div>
    );
}

function DetailRow({ icon: Icon, label, value, isDirLtr }: { icon: any, label: string, value: string, isDirLtr?: boolean }) {
    return (
        <div className="flex items-center justify-between group/row">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] opacity-60">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black">{label}:</span>
            </div>
            <span className={clsx(
                "text-xs font-black text-[var(--text-primary)] transition-colors group-hover/row:text-brand-500",
                isDirLtr && "dir-ltr"
            )}>
                {value || '---'}
            </span>
        </div>
    );
}

