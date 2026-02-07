import { motion } from 'framer-motion';
import { Phone, Users, ShieldCheck, ExternalLink, GraduationCap } from 'lucide-react';
import { clsx } from 'clsx';
import { formatEducationValue } from '@/core/utils/educationMapping';

interface ParentCardProps {
    student: any;
    onViewStudent: (student: any) => void;
}

export function ParentCard({ student, onViewStudent }: ParentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            dir="rtl"
            className="group"
        >
            <div className={clsx(
                "p-8 rounded-[3rem] transition-all duration-500 relative overflow-hidden flex flex-col h-full",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/50 hover:shadow-brand-500/20",
                "dark:hover:bg-[var(--dark-panel)]"
            )}>
                {/* Header: Guardian Info */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/10 text-brand-500 shrink-0">
                        <Users className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-right">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-[var(--text-primary)]">
                                {student.guardianName || "ولي أمر الطالب"}
                            </h3>
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-brand-500" />
                            بيانات التواصل المعتمدة
                        </p>
                    </div>
                </div>

                {/* Main Contact Area */}
                <div className="space-y-4 mb-8">
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-brand-500/5 flex items-center justify-between group/phone">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Phone className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">رقم الهاتف:</span>
                        </div>
                        <span className="text-sm font-black text-[var(--text-primary)] dir-ltr group-hover:text-brand-500 transition-colors">
                            {student.parentPhone || "غير مسجل"}
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-brand-600/60">
                            <GraduationCap className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">الطالب المرتبط:</span>
                        </div>
                        <span className="text-sm font-bold text-brand-600">
                            {student.name}
                        </span>
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">الصف الدراسي</p>
                        <p className="text-[10px] font-black text-[var(--text-primary)]">{formatEducationValue(student.gradeLevel)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">المحفظة</p>
                        <p className="text-[10px] font-black text-[var(--text-primary)]">{student.governorate}</p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => onViewStudent(student)}
                    className="w-full py-4 rounded-2xl bg-white dark:bg-black/10 text-[var(--color-brand)] text-xs font-black border border-brand-500/5 hover:bg-brand-500 hover:text-white transition-all flex items-center justify-center gap-3 group/btn"
                >
                    عرض ملف الطالب الكامل
                    <ExternalLink className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                </button>

                {/* Decorative Background Icon */}
                <Users className="absolute -bottom-10 -left-10 w-40 h-40 text-brand-500/5 -rotate-12 pointer-events-none" />
            </div>
        </motion.div>
    );
}
