import { motion } from 'framer-motion';
import { User, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

interface SettingsTabsProps {
    activeTab: 'profile' | 'security';
    onTabChange: (tab: 'profile' | 'security') => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
    const tabs = [
        { id: 'profile', label: 'البيانات الشخصية', icon: User },
        { id: 'security', label: 'الأمان وكلمة المرور', icon: ShieldCheck },
    ] as const;

    return (
        <div className="flex gap-4 p-2 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-brand-500/10 backdrop-blur-md w-fit mx-auto lg:mx-0">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={clsx(
                            "relative flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all duration-500 overflow-hidden",
                            isActive ? "text-white shadow-xl" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/50 dark:hover:bg-white/5"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTabGlow"
                                className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 z-0"
                            />
                        )}
                        <tab.icon className={clsx("w-5 h-5 relative z-10", isActive && "fill-current")} />
                        <span className="relative z-10 font-display uppercase tracking-tight">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
