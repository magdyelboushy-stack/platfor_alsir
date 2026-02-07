// ============================================================
// SupportSection - الدعم الفني
// ============================================================

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SupportStats } from '../components/support/SupportStats';
import { SupportActions } from '../components/support/SupportActions';
import { TicketList } from '../components/support/TicketList';
import { SupportForm } from '../components/support/SupportForm';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function SupportSection() {
    // 1. Data States (Zeroed as requested)
    const tickets: any[] = [];
    const totalTickets = 0;
    const openTickets = 0;
    const resolvedTickets = 0;

    // 2. View States
    const [view, setView] = useState<'dashboard' | 'form' | 'success'>('dashboard');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateTicket = () => {
        setView('form');
    };

    const handleFormSubmit = () => {
        setIsSubmitting(true);
        // Simulate high-fidelity processing
        setTimeout(() => {
            setIsSubmitting(false);
            setView('success');
        }, 2000);
    };

    const handleStartChat = () => {
        // Just as proof-of-concept for internal UI
        window.alert('بدء محادثة فورية مع الدعم المباشر...');
    };

    return (
        <div className="relative pb-20 max-w-6xl mx-auto min-h-[600px]">
            <AnimatePresence mode="wait">
                {/* View 1: Main Dashboard */}
                {view === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-12"
                    >
                        {/* Header Area */}
                        <div className="text-right">
                            <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                                الدعم <span className="text-[var(--color-brand)]">والتواصل</span>
                            </h2>
                            <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                            <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                                فريق الدعم الفني متاح دائماً لمساعدتك في حل أي مشاكل تقنية أو الإجابة على استفساراتك الأكاديمية.
                            </p>
                        </div>

                        {/* Stats Dashboard */}
                        <SupportStats
                            totalTickets={totalTickets}
                            openTickets={openTickets}
                            resolvedTickets={resolvedTickets}
                        />

                        {/* Action Hub */}
                        <SupportActions
                            onCreateTicket={handleCreateTicket}
                            onStartChat={handleStartChat}
                        />

                        {/* Ticket Repository */}
                        <TicketList tickets={tickets} />
                    </motion.div>
                )}

                {/* View 2: Ticket Form */}
                {view === 'form' && (
                    <SupportForm
                        onBack={() => setView('dashboard')}
                        onSubmit={handleFormSubmit}
                    />
                )}

                {/* View 3: Success State */}
                {view === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center pt-20 text-center space-y-8"
                    >
                        <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black text-[var(--text-primary)] font-display">تم إرسال بلاغك!</h3>
                            <p className="text-xl font-bold text-[var(--text-secondary)] max-w-md mx-auto">لقد استلمنا تذكرتك بنجاح وسنقوم بالرد عليك في أسرع وقت ممكن عبر سجل التذاكر.</p>
                        </div>
                        <button
                            onClick={() => setView('dashboard')}
                            className="px-12 py-5 rounded-[2rem] bg-[var(--color-brand)] text-white font-black text-xl hover:scale-[1.05] transition-all shadow-2xl shadow-brand-500/20"
                        >
                            فهمت، العودة للرئيسية
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Loader Overlay for transitions */}
            <AnimatePresence>
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white"
                    >
                        <Loader2 className="w-16 h-16 animate-spin text-[var(--color-brand)] mb-6" />
                        <p className="text-2xl font-black font-display tracking-widest uppercase">جاري تأمين وإرسال بياناتك...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decorative Element */}
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        </div>
    );
}
