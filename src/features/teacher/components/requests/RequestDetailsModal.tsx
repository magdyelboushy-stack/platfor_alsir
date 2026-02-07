import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Users, Calendar, Smartphone, FileText, Check, MapPin, Mail } from 'lucide-react';
import { formatEducationValue } from '@/core/utils/educationMapping';
import { getImageUrl } from '@/core/utils/url';
import { clsx } from 'clsx';

interface RequestDetailsModalProps {
    req: any | null;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export function RequestDetailsModal({ req, onClose, onApprove, onReject }: RequestDetailsModalProps) {
    const avatarUrl = getImageUrl(req?.details?.avatar);

    if (!req) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 dark:bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    dir="rtl"
                    className={clsx(
                        "w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl max-h-[92vh] flex flex-col border border-brand-500/20",
                        "bg-white dark:bg-[var(--bg-card)] backdrop-blur-3xl"
                    )}
                >
                    {/* Premium Header */}
                    <div className="relative p-8 border-b border-brand-500/10 bg-brand-500/[0.03] dark:bg-white/[0.02] flex justify-between items-center group">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-white/5 shadow-xl bg-slate-100 dark:bg-slate-900 group-hover:scale-105 transition-transform duration-500">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt={req.student} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-500/10 text-brand-500">
                                            <User className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-lg" />
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] font-display tracking-tight leading-tight">
                                    {req.student}
                                </h2>
                                <p className="text-[var(--text-secondary)] font-bold opacity-70 flex items-center gap-2 mt-1.5 text-sm">
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    طلب تسجيل جديد للتوثيق
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white dark:bg-white/5 hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-500 rounded-2xl transition-all duration-300 transform border border-brand-500/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar text-right">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                            {/* Column 1: Core Info */}
                            <div className="space-y-10">
                                <Section title="بيانات شخصية" icon={User}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="sm:col-span-2">
                                            <InfoItem label="الاسم الرباعي" value={req.details.fullName} />
                                        </div>
                                        <InfoItem label="النوع" value={req.details.gender === 'male' ? 'ذكر' : 'أنثى'} icon={User} />
                                        <InfoItem label="تاريخ الميلاد" value={req.details.birthDate} icon={Calendar} />
                                        <div className="sm:col-span-2">
                                            <InfoItem label="البريد الإلكتروني" value={req.details.email} icon={Mail} isDirLtr />
                                        </div>
                                    </div>
                                </Section>

                                <Section title="الدراسة والسكن" icon={FileText}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <InfoItem label="المرحلة الدراسية" value={formatEducationValue(req.details.educationStage)} />
                                        <InfoItem label="الصف الدراسي" value={formatEducationValue(req.details.gradeLevel)} />
                                        <InfoItem label="المحافظة" value={req.details.governorate} icon={MapPin} />
                                        <InfoItem label="المركز/المدينة" value={req.details.city} />
                                    </div>
                                </Section>
                            </div>

                            {/* Column 2: Contact & Security */}
                            <div className="space-y-10">
                                <Section title="بيانات التواصل" icon={Smartphone}>
                                    <div className="grid grid-cols-1 gap-6">
                                        <InfoItem label="رقم الهاتف الشخصي" value={req.details.phone} isDirLtr />
                                    </div>
                                </Section>

                                <Section title="بيانات ولي الأمر" icon={Users}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                                        <InfoItem label="اسم ولي الأمر" value={req.details.guardianName} />
                                        <InfoItem label="رقم هاتف ولي الأمر" value={req.details.guardianPhone} isDirLtr />
                                    </div>
                                </Section>

                                <div className="p-8 rounded-[2.5rem] bg-brand-500/[0.04] dark:bg-white/[0.02] border border-brand-500/10 text-center relative overflow-hidden group">
                                    <p className="text-[10px] font-black text-brand-500 mb-3 uppercase tracking-[0.2em]">الوضع الحالي للطلب</p>
                                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500 text-sm font-black border border-amber-500/20 shadow-sm transition-transform duration-500 group-hover:scale-105">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        في انتظار المراجعة والتوثيق
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-brand-500/[0.03] dark:bg-white/[0.01] border-t border-brand-500/10 flex gap-6">
                        <button
                            onClick={() => { onApprove(req.id); onClose(); }}
                            className="flex-1 py-5 bg-brand-500 hover:brightness-110 text-white rounded-[2rem] font-black transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 text-lg"
                        >
                            <Check className="w-6 h-6" />
                            <span>توثيق وتفعيل الحساب</span>
                        </button>
                        <button
                            onClick={() => { onReject(req.id); onClose(); }}
                            className="flex-[0.4] py-5 bg-white dark:bg-white/5 text-rose-500 font-black rounded-[2rem] border border-rose-500/20 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all text-lg shadow-sm"
                        >
                            رفض الطلب
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function Section({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="relative group/sec">
            <h3 className="text-sm font-black text-brand-500 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center border border-brand-500/10 group-hover/sec:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                </div>
                {title}
            </h3>
            <div className="pr-4 border-r-2 border-brand-500/10 group-hover/sec:border-brand-500/30 transition-colors">
                {children}
            </div>
        </div>
    );
}

function InfoItem({ label, value, icon: Icon, isDirLtr }: { label: string, value: string, icon?: any, isDirLtr?: boolean }) {
    return (
        <div className="group/item flex flex-col items-start gap-1">
            <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">{label}</p>
            <div className={clsx(
                "font-black text-[15px] text-[var(--text-primary)] flex items-center gap-2 group-hover/item:text-brand-500 transition-colors break-all",
                isDirLtr && "dir-ltr"
            )}>
                {Icon && <Icon className="w-3.5 h-3.5 opacity-40 shrink-0" />}
                <span className="leading-relaxed">{value || 'غير متوفر'}</span>
            </div>
        </div>
    );
}
