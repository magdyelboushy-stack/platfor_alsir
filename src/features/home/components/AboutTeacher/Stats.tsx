import { motion } from 'framer-motion';
import { Award, Users, BookOpen, Star } from 'lucide-react';

const stats = [
    { label: "طالب متفوق", value: "+15K", icon: Users, color: "from-brand-500 to-brand-700" },
    { label: "سنة خبرة", value: "+10", icon: Award, color: "from-brand-700 to-brand-900" },
    { label: "فيديو شرح", value: "+500", icon: BookOpen, color: "from-brand-500 to-brand-600" },
    { label: "نسبة نجاح", value: "100%", icon: Star, color: "from-brand-700 to-brand-500" },
];

export function Stats() {
    return (
        <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-500"
                >
                    <div className={`absolute top-0 right-0 w-2 h-full bg-gradient-to-b ${stat.color} opacity-20`} />
                    <div className="relative z-10 space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-brand-500 shadow-sm">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-[var(--text-primary)] font-display">{stat.value}</p>
                            <p className="text-xs text-[var(--text-secondary)] font-bold">{stat.label}</p>
                        </div>
                    </div>
                    {/* Decorative Background Glow */}
                    <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-brand-500/5 blur-2xl rounded-full transition-all group-hover:bg-brand-500/10" />
                </motion.div>
            ))}
        </div>
    );
}
