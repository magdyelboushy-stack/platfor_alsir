// ============================================================
// ThemeToggle - Educational Lamp Switch
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { clsx } from 'clsx';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 active:scale-90 group"
            title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"}
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"}
        >
            <div className="relative w-5 h-5 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {isDark ? (
                        <motion.div
                            key="moon"
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Moon className="w-5 h-5 text-brand-400 fill-brand-400/20" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sun"
                            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Subtle Ambient Glow */}
                <div className={clsx(
                    "absolute inset-0 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    isDark ? "bg-brand-500/30" : "bg-amber-500/30"
                )} />
            </div>
        </button>
    );
}
