// ============================================================
// StaffLoginPage - Premium Split-Screen (Theme Aware)
// ============================================================

import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Loader2,
    Smartphone,
    Home,
    UserCog,
    Shield,
    Users
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { Dialog } from '@/core/components/Dialog';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

// Default Assets
const DEFAULT_LOGO = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';
const DEFAULT_BANNER = '/assets/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg';

const DECORATIONS = '/src/assets/images/decorations.png';

// Role Configuration
const ROLE_CONFIG = {
    teacher: {
        title: 'بوابة المدرسين',
        subtitle: 'لوحة التحكم الخاصة بالمحتوى والطلاب',
        icon: UserCog,
        color: 'cyan',
    },
    admin: {
        title: 'بوابة الإدارة',
        subtitle: 'لوحة التحكم الكاملة للنظام',
        icon: Shield,
        color: 'red',
    },
    assistant: {
        title: 'بوابة المساعدين',
        subtitle: 'نظام المتابعة والدعم الفني',
        icon: Users,
        color: 'emerald',
    }
};

export function StaffLoginPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const { login, isAuthenticated, user } = useAuthStore();

    const logoUrl = getFileUrl(settings?.logo_url) || DEFAULT_LOGO;
    const bannerUrl = getFileUrl(settings?.banner_url) || DEFAULT_BANNER;

    // Determine Role from URL
    const role = location.pathname.includes('admin') ? 'admin'
        : location.pathname.includes('teacher') ? 'teacher'
            : 'assistant';

    const config = ROLE_CONFIG[role as keyof typeof ROLE_CONFIG];

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({
        type: 'error' as 'success' | 'error' | 'warning' | 'info',
        title: '',
        message: ''
    });

    const showDialog = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setDialogConfig({ type, title, message });
        setDialogOpen(true);
    };

    // Inline error state
    const [inlineError, setInlineError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'teacher') navigate('/teacher/dashboard');
            else if (user.role === 'admin') navigate('/admin/dashboard');
            else if (user.role === 'assistant') navigate('/assistant/dashboard');
            else navigate('/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setInlineError(null);
        setIsLoading(true);

        try {
            await login(email, password, role);

            const user = useAuthStore.getState().user;
            const logout = useAuthStore.getState().logout;

            // 1. Block Students from Staff Portals
            if (user?.role === 'student') {
                logout();
                setIsLoading(false);
                setInlineError('عذراً، هذا الحساب للطلاب فقط. يرجى استخدام بوابة دخول الطلاب.');
                return;
            }

            // 2. Strict Role Matching (Admin must be Admin, Teacher must be Teacher, etc.)
            const isAuthorized =
                (role === 'admin' && user?.role === 'admin') ||
                (role === 'teacher' && (user?.role === 'teacher' || user?.role === 'admin')) || // Admin can enter teacher portal
                (role === 'assistant' && (user?.role === 'assistant' || user?.role === 'admin')); // Admin can enter assistant portal

            if (!isAuthorized) {
                logout();
                setIsLoading(false);
                setInlineError(`عذراً، لا تملك صلاحيات الدخول إلى ${config.title}.`);
                return;
            }

            setIsLoading(false);
            const userName = user?.name || 'المستخدم';

            showDialog('success', `أهلاً يا ${userName}! 👋`, `مرحباً بك في منصة ${settings?.app_name || 'السير الشامي'}. جاري تحويلك...`);

            setTimeout(() => {
                if (user?.role === 'teacher') navigate('/teacher/dashboard');
                else if (user?.role === 'admin') navigate('/admin/dashboard');
                else if (user?.role === 'assistant') navigate('/assistant/dashboard');
                else navigate('/dashboard');
            }, 1500);
        } catch (err: any) {
            setIsLoading(false);

            let errorMessage = 'فشل تسجيل الدخول';

            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
                if (err.response.data.message) {
                    errorMessage += `\n${err.response.data.message}`;
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setInlineError(errorMessage);
        }
    };

    const inputContainerVariants = {
        idle: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
        focused: { scale: 1.01, boxShadow: "0px 10px 40px -10px rgb(var(--brand-500-rgb) / 0.15)" }
    };

    const floatingVariants = {
        animate: (i: number) => ({
            y: [0, -15, 0],
            rotate: [i * 5, i * -5, i * 5],
            transition: {
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut"
            }
        })
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-main)] transition-colors duration-300" dir="rtl">
            <Dialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
            />

            {/* Right Side: Visual Brand Experience */}
            <div className="hidden lg:flex flex-1 relative bg-dark-900 overflow-hidden">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    src={bannerUrl}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_BANNER; }}
                    alt="Brand Experience"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/40" />

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="p-6 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl"
                    >
                        <img
                            src={logoUrl}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                            alt="Logo"
                            className="w-32 h-auto rounded-2xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-center space-y-6"
                    >
                        <div className="relative inline-block">
                            <div
                                className="absolute -inset-4 rounded-full blur-2xl animate-pulse"
                                style={{
                                    backgroundColor: config.color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' :
                                        config.color === 'red' ? 'rgba(239, 68, 68, 0.2)' :
                                            'rgba(16, 185, 129, 0.2)'
                                }}
                            />
                            <div
                                className="w-32 h-32 md:w-44 md:h-44 rounded-full border-4 border-white/30 flex items-center justify-center shadow-2xl relative"
                                style={{
                                    background: config.color === 'cyan' ? 'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2))' :
                                        config.color === 'red' ? 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))' :
                                            'linear-gradient(to bottom right, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                                }}
                            >
                                <config.icon className="w-16 h-16 md:w-20 md:h-20 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight font-display drop-shadow-2xl">
                            {config.title}
                        </h2>
                        <p className="text-white/70 text-xl font-bold tracking-wide">بوابة موظفي {settings?.app_name || 'السير الشامي'}</p>
                    </motion.div>
                </div>
            </div>

            {/* Left Side: Form Section */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative overflow-hidden bg-[var(--bg-main)] transition-colors">
                {/* 3D Decorative Assets - Floating */}
                <motion.div
                    custom={1}
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute top-[15%] left-[10%] w-32 md:w-48 h-auto pointer-events-none z-0 opacity-40 dark:opacity-20 blur-[1px]"
                >
                    <div className="relative">
                        <img src={DECORATIONS} alt="3D Pen" className="w-full h-auto object-contain scale-[2.5] -rotate-12 translate-x-[-100%] translate-y-[-100%]" style={{ clipPath: 'inset(0 66% 0 0)' }} />
                    </div>
                </motion.div>

                <motion.div
                    custom={2}
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute bottom-[10%] right-[10%] w-32 md:w-48 h-auto pointer-events-none z-0 opacity-40 dark:opacity-20 blur-[1px]"
                >
                    <div className="relative">
                        <img src={DECORATIONS} alt="3D Inkwell" className="w-full h-auto object-contain scale-[2.5] rotate-12 translate-x-[150%] translate-y-[150%]" style={{ clipPath: 'inset(0 0 0 66%)' }} />
                    </div>
                </motion.div>

                {/* Decorative Accents */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                    style={{
                        backgroundColor: config.color === 'cyan' ? 'rgba(6, 182, 212, 0.05)' :
                            config.color === 'red' ? 'rgba(239, 68, 68, 0.05)' :
                                'rgba(16, 185, 129, 0.05)'
                    }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[120px] pointer-events-none"
                    style={{
                        backgroundColor: config.color === 'cyan' ? 'rgba(8, 145, 178, 0.05)' :
                            config.color === 'red' ? 'rgba(220, 38, 38, 0.05)' :
                                'rgba(5, 150, 105, 0.05)'
                    }}
                />

                {/* Back to Home & Logo */}
                <div className="absolute top-8 left-8 lg:left-24 flex items-center gap-4 z-20">
                    <Link to="/" className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500 transition-all shadow-sm">
                        <Home className="w-5 h-5" />
                    </Link>
                    <img
                        src={logoUrl}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                        alt="Logo"
                        className="h-12 w-auto rounded-xl shadow-xl border border-white/10"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full mx-auto relative z-10"
                >
                    <div className="mb-14 text-right relative">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "80px" }}
                            transition={{ delay: 0.3, duration: 1, ease: "circOut" }}
                            className="h-2 rounded-full mb-8 shadow-lg"
                            style={{
                                background: config.color === 'cyan' ? 'linear-gradient(to right, rgb(8, 145, 178), rgb(34, 211, 238))' :
                                    config.color === 'red' ? 'linear-gradient(to right, rgb(220, 38, 38), rgb(248, 113, 113))' :
                                        'linear-gradient(to right, rgb(5, 150, 105), rgb(52, 211, 153))',
                                boxShadow: config.color === 'cyan' ? '0 10px 15px -3px rgba(6, 182, 212, 0.2)' :
                                    config.color === 'red' ? '0 10px 15px -3px rgba(239, 68, 68, 0.2)' :
                                        '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                            }}
                        />
                        <h1 className="text-5xl font-black text-[var(--text-primary)] mb-4 font-display tracking-tight transition-colors drop-shadow-sm">
                            {config.title}
                        </h1>
                        <p className="text-[var(--text-secondary)] font-bold text-xl font-body transition-colors">
                            {config.subtitle}
                        </p>
                    </div>

                    {/* Inline Error Banner */}
                    {inlineError && (
                        <motion.div
                            key="error-banner"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-700 dark:text-rose-300 text-center shadow-lg"
                        >
                            <p className="font-black text-base whitespace-pre-line leading-relaxed">{inlineError}</p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setInlineError(null);
                                }}
                                className="mt-3 px-4 py-2 text-sm font-bold bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                            >
                                ✓ فهمت
                            </button>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Email/Code Input */}
                        <motion.div
                            variants={inputContainerVariants}
                            animate={focusedField === 'email' ? 'focused' : 'idle'}
                            className="group relative"
                        >
                            <div className="absolute -top-3 right-4 z-10">
                                <motion.div
                                    animate={focusedField === 'email' ? { y: -5, rotate: -8, scale: 1.15 } : { y: 0, rotate: 0, scale: 1 }}
                                    className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all duration-500",
                                        focusedField === 'email'
                                            ? "border-white text-white"
                                            : "bg-white border-brand-500/10 text-[var(--text-secondary)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
                                    )}
                                    style={focusedField === 'email' ? {
                                        background: config.color === 'cyan' ? 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(8, 145, 178))' :
                                            config.color === 'red' ? 'linear-gradient(to bottom right, rgb(248, 113, 113), rgb(220, 38, 38))' :
                                                'linear-gradient(to bottom right, rgb(52, 211, 153), rgb(5, 150, 105))',
                                        boxShadow: config.color === 'cyan' ? '0 20px 25px -5px rgba(6, 182, 212, 0.4)' :
                                            config.color === 'red' ? '0 20px 25px -5px rgba(239, 68, 68, 0.4)' :
                                                '0 20px 25px -5px rgba(16, 185, 129, 0.4)'
                                    } : {}}
                                >
                                    <Smartphone className="w-6 h-6" />
                                </motion.div>
                            </div>

                            <input
                                type="text"
                                value={email}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => { setEmail(e.target.value); }}
                                placeholder="البريد الإلكتروني / كود الموظف"
                                required
                                className={clsx(
                                    'w-full pt-7 pb-5 px-8 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border-2 transition-all duration-500 outline-none text-right font-black text-xl font-body',
                                    'placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-lg',
                                    focusedField === 'email'
                                        ? 'shadow-[0_25px_50px_-12px_rgba(197,160,89,0.2)] ring-8'
                                        : 'border-brand-500/10 text-[var(--text-primary)] hover:border-brand-500/40 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]'
                                )}
                                style={focusedField === 'email' ? {
                                    borderColor: config.color === 'cyan' ? 'rgb(6, 182, 212)' :
                                        config.color === 'red' ? 'rgb(239, 68, 68)' :
                                            'rgb(16, 185, 129)',
                                    ['--tw-ring-color' as any]: config.color === 'cyan' ? 'rgba(6, 182, 212, 0.05)' :
                                        config.color === 'red' ? 'rgba(239, 68, 68, 0.05)' :
                                            'rgba(16, 185, 129, 0.05)'
                                } : {}}
                                dir="rtl"
                            />
                        </motion.div>

                        {/* Password Input */}
                        <motion.div
                            variants={inputContainerVariants}
                            animate={focusedField === 'password' ? 'focused' : 'idle'}
                            className="group relative"
                        >
                            <div className="absolute -top-3 right-4 z-10">
                                <motion.div
                                    animate={focusedField === 'password' ? { y: -5, rotate: -8, scale: 1.15 } : { y: 0, rotate: 0, scale: 1 }}
                                    className={clsx(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all duration-500",
                                        focusedField === 'password'
                                            ? "border-white text-white"
                                            : "bg-white border-brand-500/10 text-[var(--text-secondary)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]"
                                    )}
                                    style={focusedField === 'password' ? {
                                        background: config.color === 'cyan' ? 'linear-gradient(to bottom right, rgb(34, 211, 238), rgb(8, 145, 178))' :
                                            config.color === 'red' ? 'linear-gradient(to bottom right, rgb(248, 113, 113), rgb(220, 38, 38))' :
                                                'linear-gradient(to bottom right, rgb(52, 211, 153), rgb(5, 150, 105))',
                                        boxShadow: config.color === 'cyan' ? '0 20px 25px -5px rgba(6, 182, 212, 0.4)' :
                                            config.color === 'red' ? '0 20px 25px -5px rgba(239, 68, 68, 0.4)' :
                                                '0 20px 25px -5px rgba(16, 185, 129, 0.4)'
                                    } : {}}
                                >
                                    <Lock className="w-6 h-6" />
                                </motion.div>
                            </div>

                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                onChange={(e) => { setPassword(e.target.value); }}
                                placeholder="كلمة المرور"
                                required
                                className={clsx(
                                    'w-full pt-7 pb-5 px-8 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl border-2 transition-all duration-500 outline-none text-right font-black text-xl font-body',
                                    'placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:text-lg',
                                    focusedField === 'password'
                                        ? 'shadow-[0_25px_50px_-12px_rgba(197,160,89,0.2)] ring-8'
                                        : 'border-brand-500/10 text-[var(--text-primary)] hover:border-brand-500/40 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)]'
                                )}
                                style={focusedField === 'password' ? {
                                    borderColor: config.color === 'cyan' ? 'rgb(6, 182, 212)' :
                                        config.color === 'red' ? 'rgb(239, 68, 68)' :
                                            'rgb(16, 185, 129)',
                                    ['--tw-ring-color' as any]: config.color === 'cyan' ? 'rgba(6, 182, 212, 0.05)' :
                                        config.color === 'red' ? 'rgba(239, 68, 68, 0.05)' :
                                            'rgba(16, 185, 129, 0.05)'
                                } : {}}
                                dir="rtl"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 mt-1 text-slate-400 hover:text-[var(--color-brand)] transition-colors p-2"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </motion.div>

                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01, translateY: -2 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={isLoading}
                            className={clsx(
                                'relative w-full py-6 rounded-2xl font-black text-2xl overflow-hidden group font-display transition-all duration-300',
                                'bg-brand-500 hover:bg-brand-600 text-white shadow-2xl shadow-brand-500/40',
                                'disabled:opacity-70 disabled:cursor-not-allowed'
                            )}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center justify-center gap-3">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        جاري التحميل...
                                    </>
                                ) : (
                                    <>
                                        تسجيل الدخول
                                        <LogIn className="w-6 h-6" />
                                    </>
                                )}
                            </div>
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div >
    );
}
