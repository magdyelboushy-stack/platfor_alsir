
export function Story() {
    return (
        <div className="space-y-8 text-right">
            <h3 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] font-display leading-tight">
                رحلة العطاء في <span className="text-brand-500">عالم الرياضيات</span>
            </h3>
            <div className="relative">
                <span className="absolute -top-10 -right-8 text-9xl text-brand-500/10 font-serif leading-none italic pointer-events-none">"</span>
                <p className="text-xl text-[var(--text-secondary)] leading-loose font-medium italic relative z-10">
                    بدأت رحلتي مع الرياضيات ليس كمدرسة فقط، بل كشغف بالأرقام والمنطق العميق. هدفي كان دائماً كسر حاجز "التعقيد" اللي بيواجهه الطلاب في الجبر والهندسة.
                </p>
                <p className="text-xl text-[var(--text-secondary)] leading-loose font-medium mt-6 italic relative z-10">
                    على مدار 10 سنوات، طورت منهج "التبسيط الرياضي" اللي بيخلي الطالب مش بس يحل، لكن يفكر بعقلية رياضية ذكية ويضمن الدرجة النهائية بكل ثقة.
                </p>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4">
                <div className="text-right">
                    <p className="text-2xl font-black text-[var(--text-primary)] font-display">أ/ مجدي البوشي</p>
                    <p className="text-brand-700 font-bold">خبير الرياضيات</p>
                </div>
                <div className="w-16 h-1 bg-brand-500 rounded-full" />
            </div>
        </div>
    );
}
