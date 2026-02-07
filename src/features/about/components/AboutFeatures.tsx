/**
 * AboutFeatures - Premium 4-Pillar Platform Features Section
 * Design: Glassmorphic cards with icons and descriptions
 */

import { motion } from 'framer-motion';
import { Crown, GraduationCap, ClipboardCheck, Layers } from 'lucide-react';

const features = [
    {
        icon: Crown,
        title: 'احترافية الشرح',
        description: 'شرح منطقي يبدأ من الجذور ليصل بك إلى أعقد مستويات التفكير في الرياضيات.',
        gradient: 'from-amber-400 to-orange-500',
        bgGlow: 'bg-amber-500/20'
    },
    {
        icon: GraduationCap,
        title: 'خبرة ممتدة',
        description: 'سنوات من العطاء وبناء عقول آلاف الطلاب الذين حصدوا الدرجات النهائية.',
        gradient: 'from-brand-400 to-brand-600',
        bgGlow: 'bg-brand-500/20'
    },
    {
        icon: ClipboardCheck,
        title: 'التقييم المستمر',
        description: 'امتحانات جزئية وشاملة تحاكي نظام الوزارة الجديد لضمان جاهزيتك التامة.',
        gradient: 'from-emerald-400 to-teal-500',
        bgGlow: 'bg-emerald-500/20'
    },
    {
        icon: Layers,
        title: 'بنك أسئلة شامل',
        description: 'آلاف المسائل المتنوعة التي تغطي كل ركن في المنهج، من السهل الممتنع إلى مستويات التميز.',
        gradient: 'from-violet-400 to-purple-500',
        bgGlow: 'bg-violet-500/20'
    }
];

export function AboutFeatures() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-6 font-display">
                        لماذا <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">السير الشامي</span>؟
                    </h2>
                    <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-bold">
                        نقدم لك منظومة تعليمية متكاملة تهدف لتحرير عقلك من قيود الحفظ.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="group"
                        >
                            <div className="relative h-full p-8 rounded-[2rem] bg-[var(--bg-card)] border border-brand-500/10 hover:border-brand-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl text-center">
                                {/* Glow Effect */}
                                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                {/* Icon */}
                                <div className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <feature.icon className="w-10 h-10 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-black text-[var(--text-primary)] mb-4 font-display group-hover:text-brand-500 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] font-bold leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
