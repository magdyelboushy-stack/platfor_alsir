import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarUpload } from '../components/settings/AvatarUpload';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { SettingsTabs } from '../components/settings/SettingsTabs';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore, selectUser } from '../../../store/authStore';

export function SettingsSection() {
    // 1. Auth Store & States
    const user = useAuthStore(selectUser);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // 2. Profile Data State (Dynamic Initialization)
    const [profileData, setProfileData] = useState({
        name: user?.name || "طالب مجهول",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.grade_level ? `طالب - صف ${user.grade_level}` : "طالب بالمنصة"
    });

    // Update state if user changes (e.g. after refresh)
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                email: user.email,
                phone: user.phone || "",
                bio: user.grade_level ? `طالب - صف ${user.grade_level}` : "طالب بالمنصة"
            });
        }
    }, [user]);

    // 3. Handlers
    const handleProfileChange = (field: string, value: string) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        // 1. Client-side Validation: Exact 11 digits
        if (profileData.phone.length !== 11) {
            showFeedback('error', 'عذراً، يجب أن يتكون رقم الهاتف من 11 رقم بالضبط.');
            return;
        }

        // 2. Client-side Validation: Student phone != Parent phone
        if (profileData.phone === user?.parent_phone) {
            showFeedback('error', 'عذراً، لا يمكن استخدام نفس رقم هاتف ولي الأمر كرقـم شخصي للطالب.');
            return;
        }

        setIsLoading(true);
        try {
            const updateProfile = useAuthStore.getState().updateProfile;
            await updateProfile({
                phone: profileData.phone,
                bio: profileData.bio
            });
            showFeedback('success', 'تم حفظ التغييرات وتحديث بياناتك بنجاح!');
        } catch (error: any) {
            // Show the specific error from the backend (e.g. "Phone already in use")
            showFeedback('error', error.message || 'عذراً، حدث خطأ أثناء تحديث البيانات.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePassword = async (data: any) => {
        // 1. Client-side Validation: Complexity
        const { newPassword } = data;

        if (newPassword.length < 8) {
            showFeedback('error', 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            showFeedback('error', 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (Capital Letter).');
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            showFeedback('error', 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.');
            return;
        }
        if (!/[^a-zA-Z0-9]/.test(newPassword)) {
            showFeedback('error', 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (Symbol).');
            return;
        }

        setIsLoading(true);
        try {
            const updatePassword = useAuthStore.getState().updatePassword;
            await updatePassword(data); // data contains currentPassword, newPassword, confirmPassword
            showFeedback('success', 'تم تحديث كلمة المرور بنجاح!');
        } catch (error: any) {
            showFeedback('error', error.message || 'عذراً، حدث خطأ أثناء تحديث كلمة المرور.');
        } finally {
            setIsLoading(false);
        }
    };

    const showFeedback = (type: 'success' | 'error', text: string) => {
        setFeedback({ type, text });
        setTimeout(() => setFeedback(null), 4000);
    };

    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-brand-500/10 pb-12">
                <div className="text-right">
                    <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                        إعدادات <span className="text-[var(--color-brand)]">الحساب</span>
                    </h2>
                    <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                    <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                        قم بتحديث بياناتك الشخصية، إدارة كلمة المرور، وتخصيص تجربتك التعليمية على المنصة.
                    </p>
                </div>
                {/* Desktop Tabs */}
                <div className="hidden lg:block">
                    <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </div>

            {/* 2. Mobile Tabs */}
            <div className="lg:hidden px-2">
                <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* 3. Main Settings Content Container */}
            <div className="relative min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                        >
                            <div className="lg:col-span-4">
                                <AvatarUpload
                                    name={profileData.name}
                                    studentId={user?.id || "----"}
                                    avatar={user?.avatar}
                                />
                            </div>
                            <div className="lg:col-span-8">
                                <ProfileSettings
                                    data={profileData}
                                    onChange={handleProfileChange}
                                    onSave={handleSaveProfile}
                                    isLoading={isLoading}
                                />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <SecuritySettings
                                onSave={handleSavePassword}
                                isLoading={isLoading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Feedback Toast Notification */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={clsx(
                            "fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]",
                            "w-[min(90%,500px)] px-6 py-4 rounded-3xl flex items-center gap-4 border-2 backdrop-blur-2xl shadow-2xl",
                            feedback.type === 'success'
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                                : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        )}
                    >
                        <div className="shrink-0">
                            {feedback.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <span className="text-sm sm:text-lg font-black leading-tight text-center flex-1">{feedback.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Elements */}
            <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
