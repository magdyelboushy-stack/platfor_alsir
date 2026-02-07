import { motion } from 'framer-motion';
import { Target, Lightbulb, ShieldCheck } from 'lucide-react';

const principles = [
    {
        title: "منهجية التبسيط",
        desc: "تحويل القواعد المعقدة لنماذج ذهنية سهلة الحفظ والتطبيق.",
        icon: Lightbulb
    },
    {
        title: "التركيز على الهدف",
        desc: "تدريب مكثف على أسئلة الامتحان والوصول للدرجة النهائية.",
        icon: Target
    },
    {
        title: "المتابعة والالتزام",
        desc: "نظام متابعة صارم يضمن تطورك المستمر طول العام الدراسي.",
        icon: ShieldCheck
    }
];

export function Philosophy() {
    return (
        <div className="grid md:grid-cols-3 gap-8 mt-20">
            {principles.map((p, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="p-8 rounded-[2.5rem] bg-[var(--bg-card)]/50 backdrop-blur-xl border border-brand-500/20 hover:border-brand-500/50 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 mb-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                        <p.icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-black text-[var(--text-primary)] mb-3 font-display text-right">{p.title}</h4>
                    <p className="text-[var(--text-secondary)] text-md leading-relaxed font-bold text-right opacity-80 group-hover:opacity-100 transition-opacity">
                        {p.desc}
                    </p>
                </motion.div>
            ))}
        </div>
    );
}
