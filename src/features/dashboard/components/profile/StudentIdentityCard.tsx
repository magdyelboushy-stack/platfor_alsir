import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, GraduationCap, Award, Phone,
    Mail, Users, Zap, Star, Target, Download
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/core/utils/url';

// مكون فرعي لكل خلية في الـ Bento Grid
function BentoBox({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 group ${className}`}>
            {children}
        </div>
    );
}

export function StudentIdentityCard() {
    const user = useAuthStore(state => state.user);
    const highResQrRef = useRef<HTMLCanvasElement>(null);

    const downloadQRCode = () => {
        if (!highResQrRef.current) return;
        const canvas = highResQrRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR_${user?.name || 'student'}_${user?.id || 'ID'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // المنطق البرمجي الخاص بك (لم يتغير لضمان العمل)
    const formatGrade = (level?: string | number, stage?: string) => {
        if (!level) return "طالب متميز";
        const l = level.toString();
        const s = stage?.toLowerCase() || '';
        const levelMap: Record<string, string> = {
            '1': 'الأول', '2': 'الثاني', '3': 'الثالث',
            '4': 'الرابع', '5': 'الخامس', '6': 'السادس',
            '7': 'الأول', '8': 'الثاني', '9': 'الثالث',
            '10': 'الأول', '11': 'الثاني', '12': 'الثالث'
        };
        let stageName = s.includes('primary') ? 'الابتدائي' : s.includes('prep') ? 'الإعدادي' : 'الثانوي';
        const gradeName = levelMap[l] || l;
        return `الصف ${gradeName} ${stageName}`;
    };

    const avatarUrl = getImageUrl(user?.avatar);

    const student = {
        name: user?.name || "طالب متميز",
        id: user?.id || "ID-00000000",
        email: user?.email || "student@elite.com",
        phone: user?.phone || "غير مسجل",
        parentPhone: user?.parent_phone || "غير مسجل",
        role: formatGrade(user?.grade_level, user?.education_stage),
        status: user?.status === 'active' ? "حساب نشط" : "قيد المراجعة"
    };

    const qrData = `
بطاقة هوية طالب - منصة الأستاذ مجدي البوشي
الاسم: ${student.name}
الصف: ${student.role}
الـ ID: ${student.id}
الموبايل: ${student.phone}
ولي الأمر: ${student.parentPhone}
البريد: ${student.email}
الحالة: ${student.status}
`.trim();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-8 select-none"
        >
            {/* الخلفية المضيئة المحيطة */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 blur-[120px] -z-10 rounded-full animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-600/10 blur-[120px] -z-10 rounded-full animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* 1. بلوك الصورة والهوية الأساسية (Main Info) */}
                <BentoBox className="lg:col-span-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                    {/* Left/Start: Identity Area */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 lg:gap-14 flex-shrink-0 w-full sm:w-auto">
                        {/* Interactive Avatar Area */}
                        <div className="relative group/avatar">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-[2.5rem] sm:rounded-[3.2rem] p-2 bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-color)] relative z-10 transition-all duration-700 group-hover/avatar:scale-[1.05] group-hover/avatar:rotate-2 group-hover/avatar:shadow-brand-500/20">
                                <div className="w-full h-full rounded-[2.2rem] sm:rounded-[2.8rem] overflow-hidden bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center relative">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} className="w-full h-full object-cover transition-all duration-1000 group-hover/avatar:scale-115" alt={student.name} />
                                    ) : (
                                        <div className="flex flex-col items-center opacity-30 dark:opacity-10 text-slate-400 font-display">
                                            <GraduationCap className="w-10 h-10 sm:w-14 sm:h-14" />
                                            <span className="text-2xl sm:text-4xl font-black italic mt-2 uppercase">{student.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-600/30 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                                </div>
                            </div>
                            {/* Floating Verified Badge */}
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 p-2.5 sm:p-4 bg-brand-600 text-white rounded-[1.2rem] sm:rounded-[1.6rem] shadow-[0_15px_40px_rgba(197,160,89,0.5)] border-4 border-[var(--bg-card)] z-20 group-hover/avatar:scale-120 transition-transform"
                            >
                                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
                            </motion.div>
                            {/* External Aura Effect */}
                            <div className="absolute -inset-6 bg-brand-500/0 group-hover/avatar:bg-brand-500/10 rounded-[4rem] blur-3xl transition-all duration-700 -z-0" />
                        </div>

                        {/* Center Information (Primary) */}
                        <div className="text-center sm:text-right flex flex-col items-center sm:items-start space-y-3 sm:space-y-4 w-full">
                            <div className="inline-flex px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 gap-2 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{student.status}</span>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-[var(--text-primary)] leading-[1.1] tracking-tighter drop-shadow-sm break-words max-w-full">
                                    {user?.name || "طالب متميز"}
                                </h1>
                            </div>
                            <div className="flex flex-col items-center sm:items-start gap-2.5 sm:gap-3 pt-1 sm:pt-2 w-full">
                                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[var(--color-brand)] shadow-xl shadow-brand-500/30 border border-brand-400/20 transition-transform active:scale-95 cursor-default">
                                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider">{student.role}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-sm group/id max-w-[200px] sm:max-w-full overflow-hidden">
                                    <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">ID:</span>
                                    <span className="text-[9px] sm:text-[10px] font-mono font-black text-[var(--text-primary)] tracking-tight uppercase truncate">{student.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </BentoBox>

                {/* 2. بلوك الـ QR Code (Identity Key) */}
                <BentoBox className="lg:col-span-4 flex flex-col items-center justify-center bg-gradient-to-br from-brand-600/5 to-transparent py-8 sm:py-6 relative group/bento-qr min-h-[350px]">
                    <div className="relative group/qr flex flex-col items-center gap-6">
                        <div className="relative p-4 sm:p-5 bg-white rounded-3xl shadow-2xl transition-transform duration-500 group-hover/qr:scale-105 aspect-square flex items-center justify-center overflow-hidden border-2 border-brand-500/10 hover:border-brand-500/50">
                            {/* Visible UI QR (Stable Size) */}
                            <QRCodeCanvas
                                value={qrData}
                                size={180}
                                level="H"
                                fgColor="#342718"
                                className="w-full h-full max-w-[120px] max-h-[120px] sm:max-w-[180px] sm:max-h-[180px]"
                            />

                            {/* Hidden High-Res QR for Download */}
                            <div className="fixed -top-[2000px] -left-[2000px] opacity-0 pointer-events-none">
                                <QRCodeCanvas
                                    ref={highResQrRef}
                                    value={qrData}
                                    size={1024}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                        </div>

                        {/* Explicit Premium Download Button (Always Visible) */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={downloadQRCode}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-brand-600 text-white font-black text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all border border-brand-400/30 group/btn"
                        >
                            <Download className="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" />
                            <span>تحميل كود الـ QR</span>
                        </motion.button>
                    </div>

                    <p className="mt-6 text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] sm:tracking-[0.3em] text-center">
                        Personal Digital Identity Pass
                    </p>
                </BentoBox>

                {/* 3. بلوك إحصائيات سريعة (Stats Grid) */}
                <BentoBox className="lg:col-span-4 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <Zap className="text-amber-500 w-5 h-5 mb-2" />
                        <span className="text-2xl font-black text-[var(--text-primary)]">84%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">معدل الحضور</span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-brand-200 dark:border-white/5 pr-4">
                        <Star className="text-brand-600 w-5 h-5 mb-2" />
                        <span className="text-2xl font-black text-[var(--text-primary)]">4.9</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">تقييم الأداء</span>
                    </div>
                </BentoBox>

                {/* 4. بلوك معلومات التواصل (Contact Bento) */}
                <BentoBox className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600"><Phone size={20} /></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase">الهاتف</span>
                            <span className="text-sm font-bold truncate">{student.phone}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-brand-600/10 text-brand-700"><Mail size={20} /></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase">البريد</span>
                            <span className="text-sm font-bold truncate">{student.email}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-brand-400/10 text-brand-500"><Users size={20} /></div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-black text-slate-400 uppercase">ولي الأمر</span>
                            <span className="text-sm font-bold truncate">{student.parentPhone}</span>
                        </div>
                    </div>
                </BentoBox>

                {/* 5. شريط التقدم الأكاديمي (Academic Progress) */}
                <BentoBox className="lg:col-span-12">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-3 min-w-fit">
                            <Target className="text-brand-600 w-6 h-6" />
                            <span className="text-sm font-black text-[var(--text-primary)]">التقدم في المنهج:</span>
                        </div>
                        <div className="flex-1 w-full h-4 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden p-1 border border-slate-300 dark:border-white/10">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 2, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-brand-600 via-brand-700 to-brand-400 rounded-full"
                            />
                        </div>
                        <span className="text-sm font-black text-brand-600">75% مكتمل</span>
                    </div>
                </BentoBox>

            </div>
        </motion.div>
    );
}