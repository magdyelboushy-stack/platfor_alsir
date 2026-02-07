import { motion } from 'framer-motion';

export const AboutFounder = () => {
    return (
        <section className="py-24 bg-[var(--bg-secondary)]/30 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                >
                    <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-12 font-display">
                        كلمة من <span className="text-brand-500">القلب</span>
                    </h2>

                    <div className="relative p-12 lg:p-20 rounded-[3rem] bg-[var(--bg-card)]/40 backdrop-blur-xl border border-brand-500/10 shadow-3xl overflow-hidden group">
                        <span className="absolute -top-10 -right-8 text-[15rem] text-brand-500/5 font-serif leading-none italic pointer-events-none select-none group-hover:text-brand-500/10 transition-colors duration-700">"</span>

                        <p className="text-2xl lg:text-4xl text-[var(--text-secondary)] leading-[2] font-medium italic relative z-10">
                            "الرياضيات ليست مجرد أرقام، بل هي موسيقى العقل والمنطق الجميل خلف كل شيء في الكون. عهدي معكم أن أجعل هذه اللغة هي جسركم نحو أحلامكم، وأن تظل هذه المنصة دائماً سندكم الأقوى للوصول للقمة."
                        </p>

                        <div className="mt-16 flex flex-col items-center gap-6 relative z-10">
                            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full" />
                            <div className="text-center">
                                <h4 className="font-black text-[var(--text-primary)] font-display text-4xl tracking-tight">السير الشامي</h4>
                                <p className="text-brand-600 font-bold text-sm lg:text-base mt-2 uppercase tracking-[0.3em]">خبير الرياضيات للمرحلة الثانوية</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
