// ============================================================
// Dialog Component - Custom Modal Dialog (Theme Aware)
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    type?: DialogType;
    title: string;
    message?: string;
    buttonText?: string;
    children?: React.ReactNode;
}

const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-500 dark:text-emerald-400',
        button: 'bg-emerald-500 hover:bg-emerald-400',
    },
    error: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        icon: 'text-rose-500 dark:text-rose-400',
        button: 'bg-rose-500 hover:bg-rose-400',
    },
    warning: {
        bg: 'bg-brand-500/10',
        border: 'border-brand-500/30',
        icon: 'text-brand-500 dark:text-brand-400',
        button: 'bg-brand-500 hover:bg-brand-400',
    },
    info: {
        bg: 'bg-brand-500/10',
        border: 'border-brand-500/30',
        icon: 'text-brand-500 dark:text-brand-400',
        button: 'bg-brand-500 hover:bg-brand-400',
    },
};

export function Dialog({ isOpen, onClose, type = 'info', title, message, buttonText = 'حسناً', children }: DialogProps) {
    const Icon = iconMap[type];
    const colors = colorMap[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                    />

                    {/* Dialog Wrapper */}
                    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()} // Prevent backdrop click from closing
                            className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl overflow-hidden pointer-events-auto"
                            dir="rtl"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 left-5 p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Content */}
                            <div className="p-10 pt-14 text-center">
                                {/* Icon Container */}
                                <div className={clsx(
                                    'w-24 h-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center border-4 shadow-xl transition-colors',
                                    colors.bg,
                                    colors.border
                                )}>
                                    <Icon className={clsx('w-12 h-12 stroke-[2.5]', colors.icon)} />
                                </div>

                                {/* Text Content */}
                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 font-display transition-colors">{title}</h3>
                                {message && <p className="text-[var(--text-secondary)] leading-relaxed mb-6 font-bold transition-colors">{message}</p>}

                                {/* Custom Children (For Credentials Summary etc) */}
                                {children}

                                {/* Action Button */}
                                <button
                                    onClick={onClose}
                                    className={clsx(
                                        'w-full py-5 rounded-2xl text-white font-black text-xl transition-all shadow-xl font-display active:scale-[0.98] mt-4',
                                        colors.button
                                    )}
                                >
                                    {buttonText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
