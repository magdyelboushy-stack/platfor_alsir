import { motion } from 'framer-motion';
import { Target, Lightbulb } from 'lucide-react';

export const AboutVision = () => {
    return (
        <section className="py-24 bg-[var(--bg-secondary)]/30 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Vision Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="group relative bg-[var(--bg-card)]/50 backdrop-blur-xl rounded-[2.5rem] p-12 border border-brand-500/10 hover:border-brand-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[60px] translate-x-[-50%] translate-y-[-50%]" />

                        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-8 border border-brand-500/10 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                            <Target className="w-8 h-8" />
                        </div>

                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 font-display tracking-tight">رؤيتنا</h2>
                        <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                            أن نسلح كل طالب بعقلية رياضية منطقية، تتجاوز مجرد حفظ المعادلات إلى فهم الجمال الكامن خلف كل رقم، والوصول به إلى القمة في الثانوية العامة.
                        </p>
                    </motion.div>

                    {/* Mission Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="group relative bg-[var(--bg-card)]/50 backdrop-blur-xl rounded-[2.5rem] p-12 border border-brand-500/10 hover:border-brand-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-[60px] translate-x-[50%] translate-y-[50%]" />

                        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-8 border border-brand-500/10 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                            <Lightbulb className="w-8 h-8" />
                        </div>

                        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6 font-display tracking-tight">رسالتنا</h2>
                        <p className="text-[var(--text-secondary)] text-lg leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                            تحويل الرياضيات من "فوبيا" إلى مادة ممتعة وشيقة، من خلال تبسيط أعقد المفاهيم وسد الفجوات التعليمية، لنبني معاً "فلسفة الـ 60/60" في وجدان كل طالب.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
