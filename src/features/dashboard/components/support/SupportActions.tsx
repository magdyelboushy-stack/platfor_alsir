import { motion } from 'framer-motion';
import { Plus, MessageSquare } from 'lucide-react';

interface SupportActionsProps {
    onCreateTicket: () => void;
    onStartChat: () => void;
}

export function SupportActions({ onCreateTicket, onStartChat }: SupportActionsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCreateTicket}
                className="group p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-2xl shadow-brand-500/20 text-right overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 group-hover:rotate-6 transition-transform">
                        <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 font-display uppercase tracking-tight">فتح تذكرة دعم</h3>
                    <p className="text-white/80 font-bold text-sm leading-relaxed">واجهت مشكلة تقنية أو عندك استفسار؟ احنا هنا عشان نساعدك.</p>
                </div>
                {/* Background Decor */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-[60px]" />
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartChat}
                className="group p-8 rounded-[2.5rem] bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl shadow-xl text-right overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6 border border-brand-500/20 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-8 h-8 text-[var(--color-brand)]" />
                    </div>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 font-display uppercase tracking-tight">محادثة مباشرة</h3>
                    <p className="text-[var(--text-secondary)] font-bold text-sm leading-relaxed">اتكلم معانا في الشات المباشر وهنرد عليك فوراً.</p>
                </div>
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/5 rounded-full blur-[40px]" />
            </motion.button>
        </div>
    );
}
