import { TicketItem } from './TicketItem';
import { Ticket, Search } from 'lucide-react';

interface TicketData {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'closed';
    date: string;
    lastReply: string;
}

interface TicketListProps {
    tickets: TicketData[];
}

export function TicketList({ tickets }: TicketListProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20 shadow-sm">
                        <Ticket className="w-5 h-5 text-[var(--color-brand)]" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight uppercase">سجل التذاكر والدعم</h3>
                </div>

                {/* Filter Search - Luxe Style */}
                <div className="relative group max-w-xs w-full">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-[var(--color-brand)] transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث برقم التذكرة..."
                        className="w-full pr-12 pl-6 py-3 rounded-2xl bg-white/40 dark:bg-black/20 border-2 border-brand-500/5 focus:border-brand-500/30 outline-none text-sm font-bold transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {tickets.length > 0 ? (
                    tickets.map((ticket, index) => (
                        <TicketItem key={ticket.id} ticket={ticket} index={index} />
                    ))
                ) : (
                    <div className="p-16 rounded-[3rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm opacity-60">
                        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Ticket className="w-10 h-10 text-[var(--color-brand)]" />
                        </div>
                        <p className="text-2xl font-black text-[var(--text-secondary)] mb-2">لا توجد بلاغات حالياً</p>
                        <p className="text-xs font-bold text-[var(--text-secondary)] opacity-50">في حال واجهت أي مشكلة، لا تتردد في فتح تذكرة جديدة وسنرد عليك فوراً.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
