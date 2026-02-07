import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, Fingerprint } from 'lucide-react';
import { clsx } from 'clsx';

interface ProfileSettingsProps {
    data: {
        name: string;
        email: string;
        phone: string;
        bio: string;
    };
    onChange: (field: string, value: string) => void;
    onSave: () => void;
    isLoading: boolean;
}

export function ProfileSettings({ data, onChange, onSave, isLoading }: ProfileSettingsProps) {
    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onSave(); }}
            className="p-8 md:p-10 rounded-[3rem] bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl shadow-xl space-y-8"
        >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <User className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight uppercase">البيانات الشخصية</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name - Read Only Admin Field */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                        <Fingerprint className="w-3.5 h-3.5" />
                        الاسم بالكامل (إداري)
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={data.name}
                            readOnly
                            className="w-full px-8 py-5 rounded-2xl bg-slate-500/5 border-2 border-brand-500/5 text-[var(--text-secondary)] cursor-not-allowed opacity-75 font-black text-lg outline-none"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors pointer-events-none" />
                    </div>
                    <p className="text-[10px] font-bold text-amber-500/80 pr-4">* لا يمكن تغيير الاسم إلا من خلال تواصلك مع الإدارة</p>
                </div>

                {/* Email - Read Only Field */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                        <Mail className="w-3.5 h-3.5" />
                        البريد الإلكتروني
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        readOnly
                        className="w-full px-8 py-5 rounded-2xl bg-slate-500/5 border-2 border-brand-500/5 text-[var(--text-secondary)] cursor-not-allowed opacity-75 font-black text-lg outline-none"
                    />
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                        <Phone className="w-3.5 h-3.5" />
                        رقم الهاتف
                    </label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.replace(/\D/g, ''); // Numeric only
                            if (val.length <= 11) onChange('phone', val);
                        }}
                        maxLength={11}
                        className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 text-[var(--text-primary)] font-black text-lg outline-none transition-all"
                    />
                </div>

                {/* Bio / Bio Bio */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em] opacity-60 pr-4">
                        <User className="w-3.5 h-3.5" />
                        النبذة التعريفية (Bio)
                    </label>
                    <input
                        type="text"
                        value={data.bio}
                        onChange={(e) => onChange('bio', e.target.value)}
                        className="w-full px-8 py-5 rounded-2xl bg-white/50 dark:bg-black/20 border-2 border-brand-500/10 focus:border-brand-500/50 text-[var(--text-primary)] font-black text-lg outline-none transition-all"
                        placeholder="طالب علم..."
                    />
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
                            حفظ البيانات
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
}
