import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, GraduationCap } from 'lucide-react';
import { apiClient } from '@/core/api/client';

interface AvatarUploadProps {
    name: string;
    studentId: string;
    avatar?: string;
}

export function AvatarUpload({ name, studentId, avatar }: AvatarUploadProps) {
    const [blobSrc, setBlobSrc] = useState<string | null>(null);
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 1) || '?';

    // Same logic as StudentIdentityCard for fetching secure avatar blobs
    const avatarPath = avatar ? (avatar.startsWith('http') ? null : `avatars/${avatar.split(/[\\/]/).pop()}`) : null;

    useEffect(() => {
        if (!avatarPath) {
            setBlobSrc(null);
            return;
        }

        let cancelled = false;
        apiClient.get(avatarPath, { responseType: 'blob' })
            .then((res) => {
                if (!cancelled) setBlobSrc(URL.createObjectURL(res.data as Blob));
            })
            .catch(() => {
                if (!cancelled) setBlobSrc(null);
            });

        return () => { cancelled = true; };
    }, [avatarPath]);

    return (
        <div className="bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 rounded-[2.5rem] p-8 text-center backdrop-blur-xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="relative w-36 h-36 mx-auto mb-6">
                    {/* Royal Avatar Frame */}
                    <div className="absolute inset-[-8px] rounded-full border-2 border-brand-500/20 animate-pulse" />
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-black text-4xl border-4 border-white dark:border-[var(--bg-card)] shadow-2xl relative overflow-hidden">
                        {blobSrc ? (
                            <img src={blobSrc} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center opacity-30 dark:opacity-10 text-white/50 font-display">
                                <GraduationCap className="w-10 h-10" />
                                <span className="text-2xl font-black italic mt-1 uppercase">{initials}</span>
                            </div>
                        )}
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </div>

                    {/* Camera Action Button */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-1 right-1 p-3 rounded-2xl bg-[var(--color-brand)] text-white shadow-xl shadow-brand-500/30 border-2 border-white dark:border-[var(--bg-card)] transition-all"
                    >
                        <Camera className="w-5 h-5 fill-current" />
                    </motion.button>
                </div>

                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-1 font-display uppercase tracking-tight">{name}</h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-6">
                    <span className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest leading-none">ID: {studentId}</span>
                </div>

                <div className="pt-6 border-t border-brand-500/10">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-[0.15em] leading-relaxed">
                        يسمح بتغيير الصورة الشخصية<br />مرة واحدة كل 30 يوم
                    </p>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-3xl" />
        </div>
    );
}
