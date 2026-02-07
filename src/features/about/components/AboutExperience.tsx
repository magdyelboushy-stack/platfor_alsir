import { motion } from 'framer-motion';
import { Award, BookOpen, Clock, Users } from 'lucide-react';

const stats = [
    { icon: Users, label: 'طالب وطالبة', value: '+10,000', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Award, label: 'سنوات خبرة', value: '+15', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: BookOpen, label: 'محاضرة تعليمية', value: '+500', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: Clock, label: 'ساعة شرح', value: '+2,000', color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export const AboutExperience = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] mb-6 font-display"
                    >
                        مسيرة من <span className="text-brand-500">العطاء</span>
                    </motion.h2>
                    <p className="text-xl text-[var(--text-secondary)] font-bold max-w-2xl mx-auto">
                        أكثر من 15 عاماً في خدمة أبنائنا طلاب المرحلة الثانوية، نضع فيها خلاصة خبرتنا بين أيديكم.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-brand-500/10 hover:border-brand-500/30 transition-all text-center group"
                        >
                            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2 font-display">{stat.value}</h3>
                            <p className="text-[var(--text-secondary)] font-bold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
