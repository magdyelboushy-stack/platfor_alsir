
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Loader2,
    Smartphone,
    Home,
    Mail
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Dialog } from '@/core/components/Dialog';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

// Default Assets
// Default Assets - Fixed paths
const DEFAULT_LOGO = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';
const DEFAULT_BANNER = '/assets/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg';

// Floating 3D Math Icons Component
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
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className={`absolute select-none pointer-events-none ${className}`}
        style={{ textShadow: '0 4px 12px rgba(107, 27, 43, 0.3)' }}
    >
        <span className="text-[var(--brand-secondary)] font-serif font-black">{symbol}</span>
    </motion.div>
);

export function LoginForm() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const authLogin = useAuthStore((state) => state.login);

    const logoUrl = getFileUrl(settings?.logo_url) || DEFAULT_LOGO;
    const bannerUrl = getFileUrl(settings?.banner_url) || DEFAULT_BANNER;

    const [identifier, setIdentifier] = useState('');
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
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [emailCode, setEmailCode] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');

    const [inlineError, setInlineError] = useState<string | null>(null);

    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineError(null);
        setIsLoading(true);

        try {
            await authLogin(identifier, password, 'student');
            setIsLoading(false);
            handleLoginSuccess();
        } catch (err: any) {
            setIsLoading(false);

            if (err.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
                setVerificationEmail(err.response.data.email);
                setIsVerifyingEmail(true);
                return;
            }

            let errorMessage = 'فشل تسجيل الدخول';
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setInlineError(errorMessage);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setInlineError(null);
        setIsLoading(true);

        try {
            const verifySms = useAuthStore.getState().verifySms;
            await verifySms(verificationEmail, emailCode);
            setIsLoading(false);

            showDialog('success', 'تم التحقق بنجاح! ✅', 'تم تفعيل حسابك. يمكنك الآن تسجيل الدخول.');
            setIsVerifyingEmail(false);
            setEmailCode('');
        } catch (err: any) {
            setIsLoading(false);
            setInlineError(err.response?.data?.error || 'كود التحقق غير صحيح');
        }
    };

    const handleLoginSuccess = () => {
        const user = useAuthStore.getState().user;
        const userName = user?.name || 'الطالب';

        showDialog('success', `أهلاً يا ${userName}! 👋`, `مرحباً بك في منصة ${settings?.app_name || 'السير الشامي'}. جاري تحويلك...`);
        setTimeout(() => {
            if (user?.role === 'assistant') {
                navigate('/assistant/dashboard');
            } else if (user?.role === 'teacher' || user?.role === 'admin') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/dashboard');
            }
        }, 1500);
    };

    const inputContainerVariants = {
        idle: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" },
        focused: { scale: 1.01, boxShadow: "0px 10px 40px -10px rgba(var(--brand-500-rgb), 0.15)" }
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

            {/* Right Side: Visual Brand Experience - Burgundy/Gold Theme */}
            <div className="hidden lg:flex flex-1 relative bg-[var(--brand-950)] overflow-hidden">
                <img
                    src={bannerUrl}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_BANNER; }}
                    alt="Brand Experience"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-900)]/80 via-[var(--brand-950)]/90 to-black" />

                {/* Chalkboard Texture Overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Floating Math Icons */}
                <FloatingMathIcon symbol="∑" className="text-8xl top-[15%] left-[10%]" delay={0} />
                <FloatingMathIcon symbol="π" className="text-9xl bottom-[20%] right-[15%]" delay={1} />
                <FloatingMathIcon symbol="∫" className="text-7xl top-[40%] right-[10%]" delay={0.5} />
                <FloatingMathIcon symbol="√" className="text-8xl bottom-[15%] left-[20%]" delay={1.5} />

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative mb-12"
                    >
                        <div className="absolute -inset-6 rounded-full bg-[var(--brand-500)]/20 blur-3xl animate-pulse" />
                        <div className="relative p-1 rounded-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-600)] shadow-2xl">
                            <img
                                src={logoUrl}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                                alt="Logo"
                                className="w-48 h-48 rounded-full border-4 border-[var(--brand-950)] object-cover bg-white"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <h2 className="text-5xl font-black text-white leading-tight font-display mb-6">
                            منصة <span className="text-[var(--brand-secondary)]">{settings?.app_name || 'السير الشامي'}</span>
                        </h2>
                        <p className="text-[var(--brand-200)] text-xl font-bold max-w-md mx-auto leading-relaxed">
                            أقوى محتوى تعليمي للرياضيات للمرحلة الثانوية. ابدأ رحلة التفوق الآن.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Left Side: Form Section */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 relative overflow-hidden bg-[var(--bg-main)]">

                {/* Back to Home & Logo (Mobile) */}
                <div className="absolute top-8 left-8 flex items-center gap-4 z-20">
                    <Link to="/" className="p-3 rounded-2xl bg-white border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--brand-500)] hover:border-[var(--brand-500)] transition-all shadow-sm">
                        <Home className="w-5 h-5" />
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full mx-auto relative z-10"
                >
                    <div className="mb-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <img
                                src={logoUrl}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                                alt="Platform Logo"
                                className="w-24 h-24 rounded-3xl shadow-xl mb-6 p-1 bg-white border-2 border-[var(--brand-500)]/20"
                            />
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <div className="flex items-center justify-center gap-3">
                                    <h1 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] font-display leading-tight">
                                        {!isVerifyingEmail ? 'تسجيل الدخول' : 'تفعيل الحساب'}
                                    </h1>
                                    <span className="text-4xl lg:text-5xl animate-bounce-slow">👋</span>
                                </div>
                                <div className="w-16 h-1.5 bg-[var(--brand-500)] rounded-full" />
                            </div>
                            <p className="text-[var(--text-secondary)] font-black text-xl leading-relaxed max-w-[280px] mx-auto">
                                مرحباً بك مجدداً في منصة التفوق
                            </p>
                        </motion.div>
                    </div>

                    {/* Inline Error Banner */}
                    {inlineError && (
                        <motion.div
                            key="error-banner"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center text-sm font-bold shadow-sm"
                        >
                            {inlineError}
                        </motion.div>
                    )}

                    {!isVerifyingEmail ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Identifier Input */}
                            <motion.div
                                variants={inputContainerVariants}
                                animate={focusedField === 'identifier' ? 'focused' : 'idle'}
                                className="group relative"
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 text-[var(--brand-500)]">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onFocus={() => setFocusedField('identifier')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => { setIdentifier(e.target.value); }}
                                    placeholder="رقم الهاتف أو البريد الإلكتروني"
                                    required
                                    className="w-full py-5 pr-14 pl-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold text-lg outline-none focus:border-[var(--brand-500)] focus:ring-4 focus:ring-[var(--brand-500)]/10 transition-all placeholder:text-slate-400"
                                    dir="rtl"
                                />
                            </motion.div>

                            {/* Password Input */}
                            <motion.div
                                variants={inputContainerVariants}
                                animate={focusedField === 'password' ? 'focused' : 'idle'}
                                className="group relative"
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 text-[var(--brand-500)]">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    onChange={(e) => { setPassword(e.target.value); }}
                                    placeholder="كلمة المرور"
                                    required
                                    className="w-full py-5 pr-14 pl-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-bold text-lg outline-none focus:border-[var(--brand-500)] focus:ring-4 focus:ring-[var(--brand-500)]/10 transition-all placeholder:text-slate-400"
                                    dir="rtl"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--brand-500)] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </motion.div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-3 cursor-pointer group select-none">
                                    <input type="checkbox" className="w-5 h-5 rounded-md border-2 border-[var(--border-color)] text-[var(--brand-500)] focus:ring-[var(--brand-500)]" />
                                    <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--brand-500)] transition-colors">تذكرني</span>
                                </label>
                                <Link to="/forgot-password" className="text-sm font-bold text-[var(--brand-500)] hover:text-[var(--brand-600)] underline decoration-2 underline-offset-4">
                                    نسيت كلمة السر؟
                                </Link>
                            </div>

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isLoading}
                                className="w-full py-5 rounded-2xl bg-gradient-to-l from-[var(--brand-600)] to-[var(--brand-500)] text-white font-black text-xl shadow-xl shadow-[var(--brand-500)]/20 hover:shadow-2xl hover:shadow-[var(--brand-500)]/30 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                                تسجيل الدخول
                            </motion.button>
                        </form>
                    ) : (
                        // Verification Form (Same style)
                        <form onSubmit={handleVerifyEmail} className="space-y-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-black text-[var(--brand-500)] mb-2 font-display">تحقق من حسابك 📧</h2>
                                <p className="text-[var(--text-secondary)] font-bold">أدخل الكود المرسل إلى: <br /><span className="text-[var(--brand-500)]" dir="ltr">{verificationEmail}</span></p>
                            </div>

                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={emailCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                    setEmailCode(val);
                                }}
                                placeholder="------"
                                required
                                className="w-full py-6 rounded-2xl bg-black/20 border-2 border-[var(--brand-500)]/30 text-white font-black text-4xl text-center tracking-[0.5em] outline-none focus:border-[var(--brand-500)] focus:ring-4 focus:ring-[var(--brand-500)]/10 transition-all placeholder:text-white/20"
                            />

                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                disabled={isLoading || emailCode.length < 6}
                                className="w-full py-5 rounded-2xl bg-[var(--brand-500)] text-white font-black text-xl shadow-lg hover:bg-[var(--brand-600)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mail className="w-6 h-6" />}
                                تأكيد الكود
                            </motion.button>
                        </form>
                    )}

                    <div className="mt-10 text-center">
                        <p className="font-bold text-[var(--text-secondary)]">
                            ليس لديك حساب؟{' '}
                            <Link to="/register" className="text-[var(--brand-500)] font-black hover:underline decoration-2 underline-offset-4">
                                انشئ حساب جديد
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div >
    );
}

