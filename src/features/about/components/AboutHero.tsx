import { motion } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';

export const AboutHero = () => {
    return (
        <section className="relative pt-40 pb-20 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-500/10 to-transparent blur-[120px] opacity-50" />
                <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-brand-700/10 to-transparent blur-[120px] opacity-50" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-500/5 text-brand-600 dark:text-brand-400 font-black mb-10 border border-brand-500/10 backdrop-blur-md">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.3em]">رؤية جديدة للتميز التعليمي</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black text-[var(--text-primary)] mb-10 font-display leading-tight tracking-tight flex flex-col items-center">
                        <span className="opacity-80">نحن نعيد صياغة</span>
                        <span className="text-brand-500 relative mt-4">
                            مستقبل التعليم
                            <svg className="absolute w-full h-4 -bottom-2 left-0 text-brand-500 opacity-20" viewBox="0 0 200 9" fill="none">
                                <path d="M2.00025 6.99997C29.5638 3.86877 98.7107 -1.22919 198.001 2.99999" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-[2] font-medium mb-12 italic">
                        منصة السير الشامي هي رحلة بدأت بشغف لتبسيط لغة العباقرة (الرياضيات)، صُممت لتكون بيت الطالب الأول في طريقه نحو التفوق والوصول للدرجة النهائية.
                    </p>

                    <div className="flex items-center justify-center gap-6">
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="p-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <ArrowDown className="w-5 h-5 text-brand-500" />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
