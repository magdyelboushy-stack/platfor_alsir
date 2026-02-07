import { motion } from 'framer-motion';
import { Clock, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface Ticket {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'closed';
    date: string;
    lastReply: string;
}

interface TicketItemProps {
    ticket: Ticket;
    index: number;
}

export function TicketItem({ ticket, index }: TicketItemProps) {
    const isOpen = ticket.status === 'open';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div className={clsx(
                "flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] transition-all duration-500 relative overflow-hidden",
                "bg-white/40 dark:bg-[var(--bg-card)] border border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/30 hover:shadow-brand-500/10 hover:bg-white/60 dark:hover:bg-[var(--dark-panel)]"
            )}>
                {/* 1. Ticket ID / Icon */}
                <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 border relative z-10",
                    isOpen
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_5px_15px_-5px_rgba(245,158,11,0.3)]"
                        : "bg-brand-500/10 border-brand-500/5 text-[var(--color-brand)]"
                )}>
                    <span className="text-xs font-black">#{ticket.id}</span>
                </div>

                {/* 2. Content Info */}
                <div className="flex-1 min-w-0 text-center md:text-right relative z-10 w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h4 className="text-lg font-black text-[var(--text-primary)] truncate font-display group-hover:text-[var(--color-brand)] transition-colors">
                            {ticket.subject}
                        </h4>
                        <span className={clsx(
                            "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border w-fit mx-auto md:mx-0 uppercase tracking-widest",
                            isOpen ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                            {isOpen ? "تذكرة مفتوحة" : "تم الحل والمصادقة"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5 opacity-60">
                            <Clock className="w-3.5 h-3.5" />
                            <span>آخر رد: {ticket.lastReply}</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <span>بتاريخ: {ticket.date}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Navigation Indicator */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-brand-500/10 group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all">
                    <ChevronLeft className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--color-brand)] group-hover:translate-x-[-4px] transition-all" />
                </div>
            </div>
        </motion.div>
    );
}
