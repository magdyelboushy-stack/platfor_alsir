import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, Save, Key } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

interface SecuritySettingsProps {
    onSave: (data: any) => void;
    isLoading: boolean;
}

export function SecuritySettings({ onSave, isLoading }: SecuritySettingsProps) {
    const [visibility, setVisibility] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const toggleVisibility = (field: keyof typeof visibility) => {
        setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSave(passwordData); }}
            className="max-w-3xl mx-auto p-8 md:p-12 rounded-[3.5rem] bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl shadow-xl space-y-8"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight uppercase">الأمان وكلمة المرور</h3>
            </div>

            <div className="space-y-8">
                {/* Current Password */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                        <Lock className="w-3.5 h-3.5" />
                        كلمة المرور الحالية
                    </label>
                    <div className="relative group">
                        <input
                            type={visibility.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 text-[var(--text-primary)] font-black text-lg outline-none transition-all pr-16"
                        />
                        <button
                            type="button"
                            onClick={() => toggleVisibility('current')}
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--color-brand)] transition-colors p-2"
                        >
                            {visibility.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* New Password */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                            <Key className="w-3.5 h-3.5" />
                            كلمة المرور الجديدة
                        </label>
                        <div className="relative group">
                            <input
                                type={visibility.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 text-[var(--text-primary)] font-black text-lg outline-none transition-all pr-16"
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility('new')}
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--color-brand)] transition-colors p-2"
                            >
                                {visibility.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                            <Key className="w-3.5 h-3.5" />
                            تأكيد كلمة المرور
                        </label>
                        <div className="relative group">
                            <input
                                type={visibility.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 text-[var(--text-primary)] font-black text-lg outline-none transition-all pr-16"
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility('confirm')}
                                className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--color-brand)] transition-colors p-2"
                            >
                                {visibility.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-brand-500/5 border border-brand-500/10 space-y-2">
                    <p className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-[0.2em]">متطلبات الأمن القصوى</p>
                    <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed opacity-80">
                        لضمان حماية حسابك، يجب أن تتكون كلمة المرور من <span className="text-[var(--text-primary)] font-black">8 أحرف على الأقل</span>، وتتضمن حتماً <span className="text-[var(--text-primary)] font-black">حرفاً كبيراً (Capital)</span>، <span className="text-[var(--text-primary)] font-black">رقماً (Number)</span>، و <span className="text-[var(--text-primary)] font-black">رمزاً خاصاً (@#$%)</span>.
                    </p>
                </div>
            </div>

            <div className="pt-8 border-t border-brand-500/10 flex justify-end">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isLoading}
                    className={clsx(
                        "flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-lg shadow-2xl transition-all",
                        "bg-[var(--color-brand)] text-white shadow-brand-500/20 hover:shadow-brand-500/40",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                    )}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-6 h-6 fill-current" />
                            تحديث كلمة المرور
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
}
