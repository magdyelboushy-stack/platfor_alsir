// ============================================================
// Toasts Component - Professional Notification System
// ============================================================

import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/store/uiStore';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export function Toasts() {
    const { toasts, remove } = useToast();

    return (
        <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={clsx(
                            "pointer-events-auto relative flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden group",
                            toast.type === 'success' && "bg-emerald-500/90 border-emerald-500/50 text-white",
                            toast.type === 'error' && "bg-rose-500/90 border-rose-500/50 text-white",
                            toast.type === 'warning' && "bg-amber-500/90 border-amber-500/50 text-slate-900",
                            toast.type === 'info' && "bg-sky-500/90 border-sky-500/50 text-white"
                        )}
                    >
                        {/* Status Icon */}
                        <div className="shrink-0 pt-0.5">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black tracking-tight leading-none mb-1">{toast.title}</p>
                            {toast.message && (
                                <p className="text-xs font-bold opacity-80 leading-relaxed">{toast.message}</p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => remove(toast.id)}
                            className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Progress Bar (Visual only for now) */}
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
                            className={clsx(
                                "absolute bottom-0 left-0 h-1",
                                toast.type === 'success' && "bg-emerald-300",
                                toast.type === 'error' && "bg-rose-300",
                                toast.type === 'warning' && "bg-amber-100",
                                toast.type === 'info' && "bg-sky-300"
                            )}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
