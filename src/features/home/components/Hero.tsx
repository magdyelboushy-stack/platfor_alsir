import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Play, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface HeroProps {
    teacherImage: string;
    brandImage: string;
    appName: string;
    stats: Array<{ value: string; label: string; icon: any }>;
}

// Floating Math Icon with Glow
const FloatingMathIcon = ({
    symbol,
    className,
    delay = 0,
    duration = 6
}: {
    symbol: string;
    className: string;
    delay?: number;
    duration?: number;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className={`absolute select-none pointer-events-none z-0 ${className}`}
    >
        <span
            className="text-[var(--brand-500)] dark:text-[var(--brand-secondary)] font-black text-opacity-40 blur-[1px] md:blur-none"
            style={{
                textShadow: '0 0 20px var(--brand-secondary-rgb / 0.3)',
            }}
        >
            {symbol}
        </span>
    </motion.div>
);

export function Hero({ teacherImage, stats }: HeroProps) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const rotate = useTransform(scrollY, [0, 500], [0, 15]);
    const { isAuthenticated, user } = useAuthStore();
    const isStudent = !!isAuthenticated && user?.role === 'student';
    const primaryCtaLink = isStudent ? '/dashboard/courses' : '/register';
    const primaryCtaLabel = isStudent ? 'كورساتي' : 'ابدأ رحلتك الآن';

    return (
        <section className="relative min-h-[90vh] lg:min-h-screen flex items-center pt-32 pb-24 overflow-hidden bg-[var(--bg-main)] transition-colors duration-500">
            {/* dynamic Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Main Radial Glow - Adjusts based on theme */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--brand-200)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_var(--brand-900)_0%,_transparent_70%)] opacity-30 dark:opacity-40 animate-pulse" />

                {/* Colored Rays - Subtle in light mode */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-20 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_var(--brand-500)_15%,_transparent_30%,_var(--brand-secondary)_50%,_transparent_70%,_var(--brand-500)_85%,_transparent_100%)] animate-[spin_60s_linear_infinite]" />

                {/* Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(var(--brand-500) 1px, transparent 1px), linear-gradient(90deg, var(--brand-500) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* Floating Math Symbols - Lower opacity in light mode */}
            <FloatingMathIcon symbol="∑" className="text-8xl top-[15%] left-[5%] opacity-20 dark:opacity-100" delay={0} duration={8} />
            <FloatingMathIcon symbol="π" className="text-9xl top-[10%] right-[10%] opacity-20 dark:opacity-100" delay={1} duration={10} />
            <FloatingMathIcon symbol="√" className="text-7xl bottom-[25%] left-[8%] opacity-20 dark:opacity-100" delay={2} duration={7} />
            <FloatingMathIcon symbol="∫" className="text-[12rem] bottom-[10%] right-[5%] opacity-20 dark:opacity-100" delay={0.5} duration={12} />
            <FloatingMathIcon symbol="∞" className="text-8xl top-1/2 left-1/4 opacity-20 dark:opacity-100" delay={3} duration={9} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
                <div className="grid lg:grid-cols-2 gap-20 lg:gap-24 items-center">

                    {/* Left Side: Teacher Image (Premium Visual) */}
                    <div className="relative order-2 lg:order-1 flex justify-center lg:justify-start">
                        <motion.div
                            style={{ y: y1, rotate }}
                            className="relative"
                        >
                            {/* main Multi-layered Glow */}
                            <div className="absolute -inset-10 rounded-full bg-[var(--brand-secondary)]/20 blur-[80px] animate-pulse" />
                            <div className="absolute -inset-20 rounded-full bg-[var(--brand-primary)]/10 blur-[100px]" />

                            {/* The Frame */}
                            <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] rounded-[4rem] overflow-hidden group shadow-2xl">
                                {/* Double Border Gradient */}
                                <div className="absolute inset-0 p-1.5 rounded-[4rem] bg-gradient-to-br from-[var(--brand-secondary)] via-[var(--brand-300)] to-[var(--brand-700)]">
                                    <div className="w-full h-full rounded-[3.8rem] overflow-hidden bg-[var(--bg-secondary)] relative">
                                        <img
                                            src={teacherImage}
                                            alt="السير الشامي"
                                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Overlay for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-950)]/40 via-transparent to-transparent opacity-0 dark:opacity-100" />
                                    </div>
                                </div>

                                {/* Floating Achievement Badges */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="absolute top-10 -right-4 md:-right-8 p-4 rounded-2xl bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl skew-y-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--brand-secondary)]/20 flex items-center justify-center">
                                            <Star className="w-5 h-5 text-[var(--brand-secondary)] fill-current" />
                                        </div>
                                        <div>
                                            <p className="text-[var(--text-primary)] dark:text-white font-black text-sm">مدرس معتمد</p>
                                            <p className="text-[var(--text-secondary)] dark:text-white/60 text-xs">خيرة 20 عاماً</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Floating Glass Formula Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -left-6 md:-left-12 bottom-[20%] p-5 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] -rotate-6"
                            >
                                <p className="text-[var(--brand-secondary)] font-mono text-xl font-black italic tracking-tighter">
                                    sin²θ + cos²θ = 1
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Side: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-right order-1 lg:order-2 flex flex-col items-end"
                    >
                        {/* Status Badge */}
                        <div className="mb-10 w-full flex justify-end">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--brand-secondary)]/10 dark:bg-[var(--brand-primary)]/20 border-r-4 border-[var(--brand-secondary)] shadow-sm backdrop-blur-md"
                            >
                                <Sparkles className="w-4 h-4 text-[var(--brand-secondary)]" />
                                <span className="text-[var(--text-primary)] dark:text-white text-xs md:text-sm font-black tracking-widest uppercase">
                                    انضم لأكثر من 15,000 طالب متفوق
                                </span>
                            </motion.div>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--text-primary)] dark:text-white leading-[1.6] mb-12">
                            الرياضيات أصـلاً
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-700)] via-[var(--brand-500)] dark:via-white to-[var(--brand-800)] dark:to-[var(--brand-300)] drop-shadow-[0_0_15px_rgba(var(--brand-secondary-rgb),0.1)] dark:drop-shadow-[0_0_30px_rgba(var(--brand-secondary-rgb),0.3)]">
                                سهلة مع السير
                            </span>
                        </h1>

                        <p className="text-lg md:text-2xl text-[var(--text-secondary)] dark:text-white/70 mb-16 max-w-2xl leading-loose font-medium">
                            رحلة من التميز تبدأ بخطوة، نحن هنا لنحول تعقيدات الرياضيات إلى معادلة بسيطة نتيجتها التفوق النهائي.
                        </p>

                        <div className="flex flex-wrap gap-6 justify-end mb-20 w-full">
                            <Link
                                to={primaryCtaLink}
                                className="group relative px-10 py-5 rounded-2xl font-black text-xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(var(--brand-secondary-rgb),0.2)] dark:shadow-[0_20px_50px_rgba(var(--brand-secondary-rgb),0.3)] overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-accent) 100%)',
                                    color: '#2d0a0f'
                                }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{primaryCtaLabel}</span>
                                <ArrowLeft className="relative z-10 w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                            </Link>

                            <button className="group px-8 py-5 rounded-2xl bg-white dark:bg-white/5 shadow-md border border-[var(--brand-500)]/10 dark:border-white/10 text-[var(--text-primary)] dark:text-white font-bold text-lg hover:shadow-lg transition-all flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--brand-secondary)]/10 dark:bg-[var(--brand-secondary)]/20 flex items-center justify-center group-hover:bg-[var(--brand-secondary)]/20 dark:group-hover:bg-[var(--brand-secondary)]/30 transition-colors">
                                    <Play className="w-5 h-5 fill-[var(--brand-secondary)] text-[var(--brand-secondary)]" />
                                </div>
                                شاهد المقدمة
                            </button>
                        </div>

                        {/* Quick Metrics */}
                        <div className="grid grid-cols-3 gap-8 md:gap-12 border-t border-[var(--brand-500)]/10 dark:border-white/10 pt-12 w-full">
                            {stats.map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--brand-secondary)]/10 dark:bg-white/5 mb-3 group-hover:bg-[var(--brand-secondary)]/20 transition-colors">
                                        <stat.icon className="w-6 h-6 text-[var(--text-secondary)] dark:text-white/40 group-hover:text-[var(--brand-secondary)] transition-colors" />
                                    </div>
                                    <p className="text-2xl md:text-3xl font-black text-[var(--text-primary)] dark:text-white">{stat.value}</p>
                                    <p className="text-[var(--text-secondary)] dark:text-white/60 font-bold text-xs md:text-sm tracking-tighter uppercase">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Premium Divider Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[var(--bg-main)] to-transparent z-20" />
        </section>
    );
}
