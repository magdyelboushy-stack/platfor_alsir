import { useState, useCallback } from 'react';
import {
    User,
    GraduationCap,
    Users,
    Lock,
    Eye,
    EyeOff,
    Upload,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Home,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Dialog } from '@/core/components/Dialog';
import { EGYPT_LOCATIONS } from '@/core/data/egypt-locations';
import { useSettings } from '@/contexts/SettingsContext';
import { getFileUrl } from '@/utils/fileUrl';

// Default Assets
// Default Assets - Using Al-Seer Al-Shami images
const DEFAULT_LOGO = '/assets/السير_الشامي/594930133_1456894779774091_6490422839217536606_n.jpg';
const DEFAULT_BANNER = '/assets/السير_الشامي/577042863_1456895286440707_6069203572316920901_n.jpg';

const DECORATIONS = '/src/assets/images/decorations.png';

// Step Configuration
const steps = [
    { id: 1, title: "البيانات الشخصية", icon: User },
    { id: 2, title: "البيانات الدراسية", icon: GraduationCap },
    { id: 3, title: "بيانات ولي الأمر", icon: Users },
    { id: 4, title: "الأمان والتأكيد", icon: Lock },
];

// Educational Stages Configuration
const educationStages = [
    { id: 'primary', title: 'المرحلة الابتدائية', grades: ['الصف الرابع', 'الصف الخامس', 'الصف السادس'] },
    { id: 'prep', title: 'المرحلة الإعدادية', grades: ['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي'] },
    { id: 'secondary', title: 'المرحلة الثانوية', grades: ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'] },
];

// Important Guidelines
const guidelines = [
    "المنصة متاحة على كل الأجهزة سواء موبايل أو لابتوب أو تابلت.",
    "الجهاز اللي هتسجل منه أول مرة هيكون الجهاز المعتمد - لو عايز تغيره تواصل مع الدعم.",
    "لو بتحضر في سنتر، سجل كطالب سنتر. لو أونلاين، سجل كطالب أونلاين.",
    "تعديل البيانات الشخصية بعد التسجيل يتطلب التواصل مع فريق الدعم.",
    "الاشتراك في الكورسات نهائي ولا يمكن استرجاعه أو تبديله.",
    "لو عندك أي استفسار، تواصل مع الدعم قبل الاشتراك في أي كورس.",
    "استخدم انترنت مستقر (ويفي أو نت قوي) عشان تتفرج على الفيديوهات بدون مشاكل.",
    "الحساب شخصي ومشاركته مع أي حد تاني ممكن يعرضه للإغلاق الدائم.",
];

// Reusable Input Style using variables - Luxe Light Premium Refinement
// Reusable Input Style - Integration with Dark/Premium theme
const inputClassName = "w-full px-8 py-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[var(--border-color)] text-[var(--text-primary)] font-black text-xl outline-none focus:border-brand-500 focus:ring-8 focus:ring-brand-500/5 transition-all duration-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-right shadow-sm focus:shadow-[0_25px_50px_-12px_rgba(var(--brand-500-rgb),0.15)] focus:scale-[1.01]";

export function RegisterForm() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const logoUrl = getFileUrl(settings?.logo_url) || DEFAULT_LOGO;
    const bannerUrl = getFileUrl(settings?.banner_url) || DEFAULT_BANNER;

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogConfig, setDialogConfig] = useState<{
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        children?: React.ReactNode;
        onConfirm?: () => void;
        buttonText?: string;
    }>({
        type: 'success',
        title: '',
        message: ''
    });

    // Form Data
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [educationStage, setEducationStage] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [guardianPhone, setGuardianPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [governorate, setGovernorate] = useState('');
    const [city, setCity] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const showDialog = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
        setDialogConfig({ type, title, message });
        setDialogOpen(true);
    };

    // Helper to validate file size (Max 5MB)
    const validateFileSize = (file: File) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return 'حجم الملف كبير جداً (أقصى حد 5 ميجابايت)';
        }
        return null;
    };

    // Client-Side Validation Logic
    const validateLocalStep = (): string | null => {
        if (currentStep === 1) {
            if (!fullName || fullName.trim().length < 3) return 'يرجى إدخال الاسم الثلاثي بشكل صحيح';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'يرجى إدخال بريد إلكتروني صحيح';
            if (!phone || !/^01[0-2|5][0-9]{8}$/.test(phone)) return 'رقم الهاتف يجب أن يكون رقم مصري صحيح (11 رقم)';
        }
        if (currentStep === 2) {
            if (!educationStage) return 'يرجى اختيار المرحلة الدراسية';
            if (!gradeLevel) return 'يرجى اختيار الصف الدراسي';
            if (!birthDate) return 'يرجى تحديد تاريخ الميلاد';
            if (!gender) return 'يرجى اختيار النوع';

            // Local Age Logic (Basic check)
            const birthYear = new Date(birthDate).getFullYear();
            const currentYear = new Date().getFullYear();
            const age = currentYear - birthYear;
            if (age < 6 || age > 25) return 'تاريخ الميلاد غير منطقي (يجب أن يكون العمر بين 6 و 25 عاماً)';
        }
        if (currentStep === 3) {
            if (!guardianName || guardianName.trim().length < 3) return 'يرجى إدخال اسم ولي الأمر بشكل صحيح';
            if (!guardianPhone || !/^01[0-2|5][0-9]{8}$/.test(guardianPhone)) return 'رقم هاتف ولي الأمر غير صحيح';
            if (guardianPhone === phone) return 'مينفعش رقم ولي الأمر يبقى نفس رقمك! لازم رقم باباك أو مامتك عشان نتواصل معاهم في الطوارئ 👨‍👩‍👦';
        }
        if (currentStep === 4) {
            if (!password || password.length < 8) return 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
            if (password !== confirmPassword) return 'كلمة المرور غير متطابقة';
            if (!governorate) return 'يرجى اختيار المحافظة';
            if (!city) return 'يرجى اختيار المدينة';
            if (!profilePhoto) return 'يرجى رفع الصورة الشخصية';
            if (profilePhoto && validateFileSize(profilePhoto)) return validateFileSize(profilePhoto);
            if (!agreeTerms) return 'يجب الموافقة على الشروط والأحكام';
        }
        return null;
    };

    const validateStep = useAuthStore((state) => state.validateStep);

    const nextStep = useCallback(async () => {
        // 1. Client-Side Validation
        const localError = validateLocalStep();
        if (localError) {
            showDialog('warning', 'يرجى مراجعة البيانات ⚠️', localError);
            return;
        }

        setIsLoading(true);
        try {
            // Prepare data for current step validation
            const stepData: Record<string, any> = {};

            if (currentStep === 1) {
                stepData.name = fullName;
                stepData.email = email;
                stepData.phone = phone;
            } else if (currentStep === 2) {
                // Map Grade Level
                const gradeMap: Record<string, string> = {
                    // Primary (4-6)
                    "الصف الرابع": "4", "الصف الخامس": "5", "الصف السادس": "6",
                    // Prep (7-9)
                    "الصف الأول الإعدادي": "7", "الصف الثاني الإعدادي": "8", "الصف الثالث الإعدادي": "9",
                    // Secondary (10-12)
                    "الصف الأول الثانوي": "10", "الصف الثاني الثانوي": "11", "الصف الثالث الثانوي": "12",
                };
                stepData.education_stage = educationStage;
                stepData.grade_level = gradeMap[gradeLevel] || gradeLevel;

                stepData.birth_date = birthDate;
                stepData.gender = gender === 'ذكر' ? 'male' : 'female';
            } else if (currentStep === 3) {
                stepData.guardian_name = guardianName;
                stepData.parent_phone = guardianPhone;
                // Check if parent phone is same as student phone locally too
                if (guardianPhone === phone) {
                    throw new Error('رقم ولي الأمر لا يمكن أن يكون نفس رقم الطالب');
                }
            } else if (currentStep === 4) {
                // Check passwords match locally
                if (password !== confirmPassword) {
                    throw new Error('كلمة المرور غير متطابقة');
                }
                stepData.password = password;
            }

            // Call Backend Validation (if not empty)
            if (Object.keys(stepData).length > 0) {
                await validateStep(stepData);
            }

            // Success -> Move Next
            setIsLoading(false);
            if (currentStep < 4) setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            setIsLoading(false);
            let msg = error.response?.data?.errors
                ? [...new Set(Object.values(error.response.data.errors).flat() as string[])].join('\n')
                : (error.message || 'بيانات غير صحيحة');

            // Translate Backend Age Logic Error
            if (msg.includes('Invalid birth date (Age logic)')) {
                msg = 'تاريخ الميلاد غير صالح (العمر لا يتوافق مع المرحلة الدراسية المختارة)';
            }

            showDialog('warning', 'يرجى مراجعة البيانات ⚠️', msg);
        }
    }, [currentStep, fullName, email, phone, educationStage, gradeLevel, birthDate, gender, guardianName, guardianPhone, password, confirmPassword, profilePhoto]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const authRegister = useAuthStore((state) => state.register);

    const handleSubmit = async () => {
        // 1. Final Local Validation (Especially for Step 4 files)
        const localError = validateLocalStep();
        if (localError) {
            showDialog('warning', 'يرجى مراجعة البيانات ⚠️', localError);
            return;
        }

        setIsLoading(true);
        try {
            // Prepare Form Data (using English keys for Backend)
            const formData = new FormData();
            formData.append('name', fullName);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('education_stage', educationStage); // Append Stage
            // Smart Grade Mapping Logic
            // 1-3 -> Primary (Assuming 4,5,6 actually, but backend expects 1-12. Let's map dynamically)
            // Actually, backend expects 1-12.
            // 4th Primary -> 4, 1st Prep -> 7, 1st Sec -> 10.
            const gradeMap: Record<string, string> = {
                // Primary (4-6)
                "الصف الرابع": "4", "الصف الخامس": "5", "الصف السادس": "6",
                // Prep (7-9)
                "الصف الأول الإعدادي": "7", "الصف الثاني الإعدادي": "8", "الصف الثالث الإعدادي": "9",
                // Secondary (10-12)
                "الصف الأول الثانوي": "10", "الصف الثاني الثانوي": "11", "الصف الثالث الثانوي": "12",
            };
            formData.append('grade_level', gradeMap[gradeLevel] || gradeLevel);

            formData.append('birth_date', birthDate);
            formData.append('gender', gender === 'ذكر' ? 'male' : 'female');
            formData.append('guardian_name', guardianName);
            formData.append('parent_phone', guardianPhone);
            formData.append('governorate', governorate);
            formData.append('city', city);
            formData.append('password', password);
            formData.append('password_confirmation', confirmPassword);
            formData.append('role', 'student');
            formData.append('remember_me', rememberMe ? '1' : '0'); // Added

            // Files
            if (profilePhoto) {
                formData.append('profile_photo', profilePhoto); // Append New File (Match Backend)
            }

            // Execute Register Action
            await authRegister(formData);

            setIsLoading(false);

            // Success Dialog with Credentials
            setDialogConfig({
                type: 'success',
                title: 'تم التسجيل بنجاح! 🎉',
                message: 'تم تسجيل بياناتك بنجاح. جاري مراجعة طلبك وسنتواصل معك عبر الواتساب أو البريد الإلكتروني قريباً.',
                children: (
                    <div className="mb-6">
                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3 mb-3">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">بيانات الدخول (احتفظ بها)</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">الاسم:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">{fullName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">الهاتف:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200" dir="ltr">{phone}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold">كلمة المرور:</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200" dir="ltr">{password}</span>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            خد سكرين شوت عشان متنساش البيانات!
                        </p>
                    </div>
                ),
                onConfirm: () => navigate('/login'),
                buttonText: 'تمام، سجل دخول'
            });
            setDialogOpen(true);

        } catch (error: any) {
            setIsLoading(false);

            // Parse Error Message (Handle Validation Errors with multiple lines)
            let msg = error.response?.data?.error || error.message || 'حدث خطأ في معالجة طلبك';

            if (error.response?.data?.errors) {
                const detailedErrors = [...new Set(Object.values(error.response.data.errors).flat() as string[])].join('\n');
                msg = detailedErrors;
            } else if (error.response?.data?.message) {
                msg = `${msg}\n${error.response.data.message}`;
            }

            // Translate Backend Age Logic Error
            if (msg.includes('Invalid birth date (Age logic)')) {
                msg = 'تاريخ الميلاد غير صالح (العمر لا يتوافق مع المرحلة الدراسية المختارة)';
            }

            // Normal Error Dialog
            setDialogConfig({
                type: 'error',
                title: 'فشل التسجيل ❌',
                message: msg
            });
            setDialogOpen(true);
        }
    };

    // Guidelines Modal Logic
    if (showGuidelines) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 transition-colors duration-300" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl overflow-hidden"
                >
                    <div className="bg-brand-500 p-8 shadow-inner">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
                                <AlertTriangle className="w-9 h-9 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white font-display drop-shadow-md">تعليمات مهمة</h2>
                                <p className="text-white font-black text-lg drop-shadow-sm">اقرأها كويس قبل ما تكمل</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        {guidelines.map((guideline, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex gap-5 p-6 rounded-[2rem] bg-white dark:bg-white/5 backdrop-blur-md border-2 border-brand-500/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.15)] transition-all group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0 font-black text-lg shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                                    {i + 1}
                                </div>
                                <p className="text-[var(--text-secondary)] leading-relaxed font-bold text-[15px] transition-colors">{guideline}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30">
                        <p className="text-center text-[var(--text-secondary)] text-sm font-bold mb-6 transition-colors">
                            التزم بالتعليمات دي عشان تضمن أفضل تجربة على المنصة
                        </p>
                        <button
                            onClick={() => setShowGuidelines(false)}
                            className="w-full py-5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xl hover:shadow-2xl transition-all shadow-xl shadow-brand-500/30 font-display active:scale-95"
                        >
                            فهمت، كمّل التسجيل
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex transition-colors duration-300" dir="rtl">
            <Dialog
                isOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    if (dialogConfig.onConfirm) dialogConfig.onConfirm();
                }}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                children={dialogConfig.children}
                buttonText={dialogConfig.buttonText}
            />

            {/* Sidebar - Premium Visual Overhaul */}
            <div className="hidden lg:flex w-[35%] relative bg-slate-900 overflow-hidden flex-col">
                <motion.img
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    src={bannerUrl}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_BANNER; }}
                    alt="Registration Experience"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

                <div className="relative z-10 p-10 h-full flex flex-col items-center justify-between">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl group-hover:scale-110 transition-transform">
                            <Home className="w-6 h-6 text-white" />
                        </div>
                        <img
                            src={logoUrl}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                            alt="Logo"
                            className="h-12 rounded-xl bg-white/10 p-1 backdrop-blur-md"
                        />
                    </Link>

                    <div className="space-y-8 flex-1 flex flex-col justify-center w-full px-4">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-4xl font-black text-white mb-8 font-display leading-[1.3] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                انضم الآن لمنصة <br />
                                <span className="text-[var(--color-brand)] drop-shadow-[0_2px_15px_rgba(197,160,89,0.5)]">{settings?.app_name || 'السير الشامي'}</span>
                            </h2>

                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className={clsx(
                                            "flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-300 border",
                                            currentStep === step.id
                                                ? "bg-white border-white shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] scale-105 z-10"
                                                : currentStep > step.id
                                                    ? "bg-black/60 border-brand-500/30 backdrop-blur-md"
                                                    : "bg-black/40 border-white/10 backdrop-blur-sm hover:bg-black/60"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center text-base font-black transition-all shadow-md",
                                            currentStep === step.id
                                                ? "bg-[var(--color-brand)] text-white shadow-brand-500/30"
                                                : "bg-white/10 text-white"
                                        )}>
                                            {currentStep > step.id ? <CheckCircle2 className="w-6 h-6 stroke-[3px] text-[var(--color-brand)]" /> : step.id}
                                        </div>
                                        <div>
                                            <p className={clsx(
                                                "font-black font-display text-[15px] transition-colors",
                                                currentStep === step.id ? "text-slate-900" : "text-white/90"
                                            )}>{step.title}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 }}
                        className="relative mb-8 group"
                    >
                        <div className="absolute -inset-4 bg-[var(--color-brand)]/30 rounded-full blur-2xl group-hover:bg-[var(--color-brand)]/50 transition-all animate-pulse" />
                        <img
                            src={logoUrl}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                            alt="Teacher"
                            className="w-32 h-32 rounded-full border-4 border-[var(--color-brand)] object-cover shadow-2xl relative z-10 mx-auto transition-transform group-hover:scale-105 duration-500"
                        />
                    </motion.div>

                    <div className="w-full space-y-4">
                        <button
                            onClick={() => setShowGuidelines(true)}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-3 backdrop-blur-md"
                        >
                            <AlertTriangle className="w-4 h-4 text-brand-500" />
                            التعليمات المهمة
                        </button>
                        <p className="text-sm text-white/70 font-bold text-center">
                            لديك حساب؟{' '}
                            <Link to="/login" className="text-brand-500 hover:text-white transition-colors font-black">سجل دخول</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-24 py-12 relative overflow-hidden bg-[var(--bg-main)] transition-colors">
                {/* Subtle background icons for the form area */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-[0.03] dark:opacity-[0.05]">
                    <span className="absolute top-[10%] right-[10%] text-[15rem] font-black">∑</span>
                    <span className="absolute bottom-[20%] left-[5%] text-[20rem] font-black">π</span>
                    <span className="absolute top-[40%] right-[30%] text-[10rem] font-black">∫</span>
                    <span className="absolute bottom-[10%] right-[5%] text-[12rem] font-black">√</span>
                </div>

                <motion.div
                    custom={1}
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute top-[10%] left-[5%] w-32 md:w-48 h-auto pointer-events-none z-0 opacity-40 dark:opacity-20 blur-[1px]"
                >
                    <div className="relative">
                        <img src={DECORATIONS} alt="3D Pen" className="w-full h-auto object-contain scale-[2.5] -rotate-12 translate-x-[-100%] translate-y-[-100%]" style={{ clipPath: 'inset(0 66% 0 0)' }} />
                    </div>
                </motion.div>

                <motion.div
                    custom={2}
                    variants={floatingVariants}
                    animate="animate"
                    className="absolute bottom-[20%] right-[10%] w-32 md:w-48 h-auto pointer-events-none z-0 opacity-40 dark:opacity-20 blur-[1px]"
                >
                    <div className="relative">
                        <img src={DECORATIONS} alt="3D Inkwell" className="w-full h-auto object-contain scale-[2.5] rotate-12 translate-x-[150%] translate-y-[150%]" style={{ clipPath: 'inset(0 0 0 66%)' }} />
                    </div>
                </motion.div>

                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

                {/* Mobile View Navigation Info */}
                <div className="lg:hidden mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/" className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors shadow-sm">
                            <Home className="w-6 h-6" />
                        </Link>
                        <button
                            onClick={() => setShowGuidelines(true)}
                            className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500 shadow-sm"
                        >
                            <AlertTriangle className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {steps.map(step => (
                            <div
                                key={step.id}
                                className={clsx(
                                    "flex-1 h-2 rounded-full transition-all duration-500",
                                    currentStep >= step.id ? "bg-[var(--color-brand)] shadow-sm shadow-brand-500/30" : "bg-[var(--border-color)]"
                                )}
                            />
                        ))}
                    </div>
                    <p className="text-center text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] mt-2">
                        الخطوة {currentStep} من 4 • {steps[currentStep - 1].title}
                    </p>
                </div>

                <div className="max-w-2xl w-full mx-auto relative z-10">
                    <div className="mb-12 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center"
                        >
                            <img
                                src={logoUrl}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO; }}
                                alt="Platform Logo"
                                className="w-20 h-20 rounded-2xl shadow-lg mb-6 p-1 bg-white border-2 border-[var(--brand-500)]/20"
                            />
                            <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] mb-4 font-display leading-[1.2]">
                                {steps[currentStep - 1].title}
                            </h1>
                            <p className="text-[var(--text-secondary)] font-black text-xl leading-relaxed max-w-[320px] mx-auto">
                                أكمل البيانات المطلوبة للمتابعة في رحلة التفوق مع السير الشامي
                            </p>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step 1: Personal */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            الاسم الكامل
                                        </label>
                                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثال: محمد أحمد علي" className={inputClassName} dir="rtl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            البريد الإلكتروني
                                        </label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className={inputClassName} dir="ltr" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            رقم الموبايل
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="012345678912"
                                            maxLength={11}
                                            className={inputClassName}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Educational */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            المرحلة الدراسية
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={educationStage}
                                                onChange={(e) => {
                                                    setEducationStage(e.target.value);
                                                    setGradeLevel(''); // Reset grade when stage changes
                                                }}
                                                className={clsx(inputClassName, "appearance-none cursor-pointer")}
                                                dir="rtl"
                                            >
                                                <option value="" disabled className="bg-[var(--bg-card)]">اختر المرحلة</option>
                                                {educationStages.map(stage => (
                                                    <option key={stage.id} value={stage.id} className="bg-[var(--bg-card)]">{stage.title}</option>
                                                ))}
                                            </select>
                                            <ArrowRight className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
                                        </div>
                                    </div>

                                    {/* Show Grade only if Stage is selected */}
                                    {educationStage && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                                الصف الدراسي
                                            </label>
                                            <div className="relative">
                                                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className={clsx(inputClassName, "appearance-none cursor-pointer")} dir="rtl">
                                                    <option value="" disabled className="bg-[var(--bg-card)]">اختر الصف</option>
                                                    {educationStages.find(s => s.id === educationStage)?.grades.map(grade => (
                                                        <option key={grade} value={grade} className="bg-[var(--bg-card)]">{grade}</option>
                                                    ))}
                                                </select>
                                                <ArrowRight className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90" />
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            تاريخ الميلاد
                                        </label>
                                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={clsx(inputClassName, "text-right")} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">
                                            النوع
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['ذكر', 'أنثى'].map(g => (
                                                <button key={g} type="button" onClick={() => setGender(g)} className={clsx("py-4 rounded-xl font-black transition-all border-2 font-display active:scale-95 shadow-sm", gender === g ? "bg-[var(--color-brand)] text-white border-brand-500 shadow-brand-500/20" : "bg-white/5 dark:bg-white/[0.03] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-brand-500/50 backdrop-blur-md")}>
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Guardian */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="p-5 rounded-xl bg-brand-500/5 border border-brand-500/20 text-brand-700 dark:text-brand-400 text-sm font-bold transition-colors">
                                        هذه البيانات مهمة للتواصل مع ولي الأمر ومتابعة مستوى الطالب بشكل مستمر.
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">اسم ولي الأمر</label>
                                        <input type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="مثال: أحمد محمد" className={inputClassName} dir="rtl" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">موبايل ولي الأمر</label>
                                        <input
                                            type="tel"
                                            value={guardianPhone}
                                            onChange={(e) => setGuardianPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="012345678912"
                                            maxLength={11}
                                            className={inputClassName}
                                            dir="ltr"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Security */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">كلمة المرور (8 أحرف على الأقل)</label>
                                        <div className="relative">
                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputClassName} dir="ltr" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-brand)] p-1">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">تأكيد كلمة المرور</label>
                                        <div className="relative">
                                            <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputClassName} dir="ltr" />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--color-brand)] p-1">
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[var(--text-secondary)] px-1 transition-colors block text-right">رفع الصورة الشخصية (صورة واضحة)</label>
                                        <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-brand-500/50 hover:bg-brand-500/5 transition-all cursor-pointer group backdrop-blur-sm">
                                            <input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} className="hidden" id="avatar-upload" />
                                            <label htmlFor="avatar-upload" className="cursor-pointer block">
                                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-[var(--color-brand)] group-hover:scale-110 transition-all" />
                                                <p className="text-[var(--text-primary)] font-black transition-colors">اضغط لرفع الصورة الشخصية</p>
                                                {profilePhoto && <p className="text-emerald-500 font-bold text-sm mt-2 flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> {profilePhoto.name}</p>}
                                            </label>
                                        </div>
                                    </div>
                                    {/* Governorate Selection */}
                                    <div className="space-y-4">
                                        <label className="text-2xl font-black text-[var(--text-primary)] mr-2 flex items-center gap-3">
                                            <div className="w-3 h-8 bg-brand-500 rounded-full" />
                                            المحافظة
                                        </label>
                                        <select
                                            value={governorate}
                                            onChange={(e) => {
                                                setGovernorate(e.target.value);
                                                setCity(''); // Reset city when governorate changes
                                            }}
                                            className={inputClassName}
                                        >
                                            <option value="">اختر المحافظة...</option>
                                            {Object.keys(EGYPT_LOCATIONS).map((gov) => (
                                                <option key={gov} value={gov} className="text-black dark:text-white bg-white dark:bg-[#1a1a1a]">
                                                    {gov}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* City Selection */}
                                    <div className="space-y-4">
                                        <label className="text-2xl font-black text-[var(--text-primary)] mr-2 flex items-center gap-3">
                                            <div className="w-3 h-8 bg-brand-500 rounded-full" />
                                            المدينة/المنطقة
                                        </label>
                                        <select
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className={inputClassName}
                                            disabled={!governorate}
                                        >
                                            <option value="">اختر المدينة...</option>
                                            {governorate && EGYPT_LOCATIONS[governorate].map((c) => (
                                                <option key={c} value={c} className="text-black dark:text-white bg-white dark:bg-[#1a1a1a]">
                                                    {c}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <label className="flex items-start gap-4 cursor-pointer group p-5 rounded-xl bg-white/5 dark:bg-white/[0.03] border border-[var(--border-color)] hover:border-[var(--color-brand)]/30 transition-all shadow-sm backdrop-blur-md">
                                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="hidden" />
                                        <div className={clsx("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 shadow-sm", agreeTerms ? "bg-[var(--color-brand)] border-[var(--color-brand)]" : "bg-white/5 border-[var(--border-color)]")}>
                                            {agreeTerms && <CheckCircle2 className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-sm text-[var(--text-secondary)] font-bold leading-relaxed transition-colors">
                                            أوافق على <a href="#" className="text-brand-700 dark:text-brand-400 hover:underline">الشروط والأحكام</a> و <a href="#" className="text-brand-700 dark:text-brand-400 hover:underline">سياسة الخصوصية</a> الخاصة بالمنصة.
                                        </span>
                                    </label>

                                    <div className="flex items-center justify-between px-2 pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group select-none">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
                                            <div className={clsx(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                "border-[var(--border-color)] group-hover:border-[var(--color-brand)] bg-white/5",
                                                rememberMe ? "bg-[var(--color-brand)] border-[var(--color-brand)]" : "bg-white/5"
                                            )}>
                                                <div className={clsx("w-3 h-3 bg-white rounded-sm transition-opacity", rememberMe ? "opacity-100" : "opacity-0")} />
                                            </div>
                                            <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors font-body">تذكرني على هذا الجهاز</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-12">
                        {currentStep > 1 && (
                            <button type="button" onClick={prevStep} className="flex-1 py-6 rounded-2xl bg-white dark:bg-white/5 border-2 border-brand-500/20 text-[var(--text-primary)] font-black flex items-center justify-center gap-3 hover:bg-brand-50 transition-all font-display active:scale-95 shadow-sm text-lg">
                                <ArrowRight className="w-6 h-6" />
                                السابق
                            </button>
                        )}
                        {currentStep < 4 ? (
                            <button type="button" onClick={nextStep} disabled={isLoading} className="flex-1 py-6 rounded-2xl bg-brand-700 hover:bg-brand-800 text-white font-black flex items-center justify-center gap-3 hover:shadow-2xl transition-all shadow-xl shadow-brand-700/40 font-display active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed text-2xl tracking-wider">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        جاري التحقق...
                                    </>
                                ) : (
                                    <>
                                        التالي
                                        <ArrowLeft className="w-8 h-8" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button type="button" onClick={handleSubmit} disabled={isLoading || !agreeTerms} className="flex-1 py-6 rounded-2xl bg-brand-900 text-white font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed font-display active:scale-95 text-2xl tracking-wider">
                                {isLoading ? (
                                    <><Loader2 className="w-8 h-8 animate-spin" />جاري الإرسال...</>
                                ) : (
                                    <><CheckCircle2 className="w-8 h-8" />إرسال الطلب</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
