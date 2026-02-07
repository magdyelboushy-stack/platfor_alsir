import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
    q: string;
    a: string;
}

interface FaqProps {
    faqs: FaqItem[];
}

export function FAQ({ faqs }: FaqProps) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <section className="py-24 bg-[var(--bg-main)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] mb-6 font-display">
                        الأسئلة <span className="text-brand-500">الشائعة</span>
                    </h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-brand-500 to-brand-700 mx-auto rounded-full shadow-lg shadow-brand-500/20" />
                </motion.div>

                <div className="space-y-5">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-[1.5rem] border transition-all duration-300 ${openFaq === i
                                ? 'bg-[var(--bg-secondary)] border-[var(--brand-primary)]/40 shadow-xl shadow-[var(--brand-primary)]/5'
                                : 'bg-[var(--bg-secondary)]/50 border-[var(--border-color)] hover:border-[var(--brand-primary)]/20'
                                }`}
                        >
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full p-8 flex items-center justify-between text-right"
                                aria-expanded={openFaq === i}
                                aria-label={openFaq === i ? "إغلاق السؤال" : "فتح السؤال"}
                            >
                                <span className={`text-xl font-black transition-colors ${openFaq === i ? 'text-brand-500' : 'text-[var(--text-primary)]'}`}>
                                    {faq.q}
                                </span>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'bg-brand-500 text-white rotate-180' : 'bg-slate-500/10 text-slate-500'
                                    }`}>
                                    <ChevronDown className="w-6 h-6" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "circOut" }}
                                        className="overflow-hidden"
                                        layout="position" // Optimize animation with layout
                                    >
                                        <div className="px-8 pb-8 pt-2 border-t border-[var(--border-color)]/20">
                                            <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-bold opacity-90 italic">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
