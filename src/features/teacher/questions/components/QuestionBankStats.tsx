import { motion } from 'framer-motion';
import { Database, FileText, CheckCircle2, Star } from 'lucide-react';

export function QuestionBankStats() {
    const stats = [
        { label: 'إجمالي الأسئلة', value: '0', color: '#10b981', icon: Database },
        { label: 'استخدمت في امتحانات', value: '0', color: '#06b6d4', icon: FileText },
        { label: 'متوسط نجاح الطلاب', value: '0%', color: '#f59e0b', icon: CheckCircle2 },
        { label: 'أسئلة مميزة', value: '0', color: 'brand-500', icon: Star },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/30 transition-all group hover:shadow-xl hover:shadow-amber-500/5"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                        >
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="font-black text-[var(--text-secondary)] text-sm">{stat.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{stat.value}</h4>
                        <div className="h-1 w-12 bg-brand-500/20 rounded-full" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
