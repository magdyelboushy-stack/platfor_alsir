// ============================================================
// ProfileSection - Elite Modular Architecture (v2)
// ============================================================

import { motion } from 'framer-motion';
import { Zap, HelpCircle, Edit3 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { StudentIdentityCard } from '../components/profile/StudentIdentityCard';
import { QuickStatsGrid } from '../components/profile/QuickStatsGrid';
import { EnrolledCoursesSection } from '../components/profile/EnrolledCoursesSection';

export function ProfileSection() {
    const user = useAuthStore(state => state.user);
    const firstName = user?.name?.split(' ')[0] || "طالبنا";

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden pb-24 space-y-20 selection:bg-brand-500 selection:text-white" dir="rtl">

            {/* --- Elite Atmospheric Background Decorations --- */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-500/10 dark:bg-brand-500/[0.03] blur-[150px] animate-pulse rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-600/10 dark:bg-brand-600/[0.03] blur-[130px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--bg-main)_70%)] opacity-30 dark:opacity-60" />
            </div>

            {/* --- Header Section (Smart Platform Branding) --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-10 px-4 md:px-6 mt-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col gap-6 md:gap-16 text-right w-full md:w-auto overflow-hidden"
                >
                    <div className="space-y-4 md:space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/10 dark:bg-brand-500/10 border border-brand-600/20 dark:border-brand-500/20 text-brand-800 dark:text-brand-400 backdrop-blur-xl shadow-sm w-fit mr-0 sm:mr-0 mt-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
                            </span>
                            <span className="text-[9px] sm:text-[11px] font-black tracking-[0.1em] uppercase leading-none">نظام التحليلات الذكي متاح</span>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] font-display tracking-tighter drop-shadow-sm">
                                أهلاً بك يا
                            </h1>
                            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-l from-brand-500 via-brand-600 to-brand-700 font-display tracking-tighter filter drop-shadow-md py-4">
                                {firstName}
                            </h1>
                        </div>
                    </div>

                    <p className="text-sm sm:text-lg md:text-2xl text-[var(--text-secondary)] opacity-80 font-bold max-w-xl border-r-4 sm:border-r-8 border-brand-500/30 pr-4 sm:pr-10 mr-1 md:mr-2 leading-relaxed">
                        تحليل شامل لأدائك الملحوظ وتفوقك الأكاديمي خلال هذا الفصل الدراسي.
                    </p>
                </motion.div>
            </div>

            {/* --- Tier 1: Unified Identity Banner (Full Width) --- */}
            <div className="px-4 md:px-6">
                <StudentIdentityCard />
            </div>

            {/* --- Tier 1.5: Academic Quick Stats Panel --- */}
            <div className="px-4 md:px-6">
                <QuickStatsGrid />
            </div>

            {/* --- Tier 2: Performance & Academic Content --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 md:px-6 items-start">

                {/* Main Academic Content (8/12) */}
                <div className="lg:col-span-12 flex flex-col gap-10">
                    <EnrolledCoursesSection />

                    {/* Cyber Action Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-10 rounded-[3.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row justify-between items-center text-center md:text-right space-y-10 md:space-y-0 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 blur-3xl group-hover:bg-brand-600/20 transition-all" />

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-20 h-20 rounded-3xl bg-brand-600/10 dark:bg-white/[0.04] flex items-center justify-center border border-brand-600/20 dark:border-white/10 shadow-2xl shrink-0"
                            >
                                <HelpCircle className="w-10 h-10 text-brand-600 dark:text-brand-500 drop-shadow-[0_0_10px_rgba(197,160,89,0.3)]" />
                            </motion.div>
                            <div className="space-y-3">
                                <h4 className="text-2xl font-black text-[var(--text-primary)] font-display uppercase tracking-tight">ركن المساعدة الذكي</h4>
                                <p className="text-base text-[var(--text-secondary)] opacity-80 font-bold leading-relaxed max-w-md">
                                    هل لديك استفسار؟ فريق الدعم متاح ٢٤ ساعة لخدمتك وإرشادك لأفضل طرق التعلم.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 relative z-10 w-full md:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-5 rounded-2xl bg-brand-700 shadow-brand-700/30 hover:bg-brand-800"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                تحدث مع المشرف
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-lg shadow-sm transition-all flex items-center justify-center gap-3"
                            >
                                <Edit3 className="w-5 h-5" />
                                تعديل البيانات
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
}
