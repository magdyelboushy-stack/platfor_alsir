import { motion } from 'framer-motion';

interface Feature {
    icon: any;
    title: string;
    desc: string;
    gradient: string;
    bgGlow: string;
}

interface FeaturesProps {
    features: Feature[];
}

export function Features({ features }: FeaturesProps) {
    return (
        <section className="py-24 bg-[var(--bg-main)] relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-brand-500 font-bold text-lg mb-2 block"
                    >
                        لماذا نحن؟
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] font-display"
                    >
                        مميزات تجعلنا <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600">الأفضل</span>
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative h-full"
                        >
                            <div className="relative h-full p-8 rounded-[2rem] bg-white/5 dark:bg-white/[0.02] border border-[var(--border-color)] hover:border-brand-500/30 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-2 overflow-hidden">
                                {/* Hover Glow */}
                                <div className={`absolute -right-20 -top-20 w-40 h-40 ${feature.bgGlow} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                        <div className="w-full h-full rounded-2xl bg-[var(--bg-main)] flex items-center justify-center">
                                            <feature.icon className="w-10 h-10 text-[var(--text-primary)]" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black text-[var(--text-primary)] mb-4 font-display">{feature.title}</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
