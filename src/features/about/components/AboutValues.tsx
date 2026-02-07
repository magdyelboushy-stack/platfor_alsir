import { motion } from 'framer-motion';
import {
    BookOpen,
    Users,
    Heart,
    Trophy,
    Rocket,
    Target
} from 'lucide-react';

const AboutFeature = ({ icon: Icon, title, desc, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className="group relative p-10 rounded-[2.5rem] bg-[var(--bg-card)]/50 backdrop-blur-xl border border-brand-500/10 hover:border-brand-500/30 transition-all duration-500 shadow-xl overflow-hidden"
    >
        <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-8 border border-brand-500/10 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                <Icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] mb-4 font-display">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-loose font-bold text-md opacity-80 group-hover:opacity-100 transition-opacity">{desc}</p>
        </div>

        {/* Decorative Gradient Background */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
);

export const AboutValues = () => {
    return (
        <section className="py-24 bg-[var(--bg-main)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black text-[var(--text-primary)] mb-6 font-display">
                            قيمنا <span className="text-brand-500">الجوهرية</span>
                        </h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-brand-600 to-brand-400 mx-auto rounded-full shadow-lg shadow-brand-500/20" />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AboutFeature
                        icon={BookOpen}
                        title="الدقة الرياضية"
                        desc="لا مكان للصدفة في القوانين، نلتزم بأقصى درجات الدقة في شرح المعلومة وتأصيلها بعمق."
                        delay={0}
                    />
                    <AboutFeature
                        icon={Users}
                        title="الدعم الفوري"
                        desc="صعوبات الرياضيات تُحل فوراً، فريقنا مكرس للرد على كل تساؤل برمجي أو رياضي يدور في عقل الطالب."
                        delay={0.1}
                    />
                    <AboutFeature
                        icon={Heart}
                        title="إخلاص المعلم"
                        desc="التعليم رحلة حب قبل أن يكون واجباً، ما يقدمه السير الشامي نابع من قلب مخلص لنجاح أبنائه."
                        delay={0.2}
                    />
                    <AboutFeature
                        icon={Trophy}
                        title="فلسفة الـ 60/60"
                        desc="هدفنا ليس النجاح فقط، بل غرس فلسفة 'الدرجة النهائية' في وجدان كل طالب يثق بنا."
                        delay={0.3}
                    />
                    <AboutFeature
                        icon={Rocket}
                        title="الأساليب الحديثة"
                        desc="نوظف أحدث تقنيات التعليم عن بُعد لنقل التجربة التعليمية من الجمود إلى الحيوية."
                        delay={0.4}
                    />
                    <AboutFeature
                        icon={Target}
                        title="التبسيط العميق"
                        desc="تبسيط أعمق المفاهيم الرياضية بأسلوب قريب من ذهن الطالب، مما يجعل أصعب المسائل سهلة المنال."
                        delay={0.5}
                    />
                </div>
            </div>
        </section>
    );
};
