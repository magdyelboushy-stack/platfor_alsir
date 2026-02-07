import { Clock, CheckCircle, FileText, Target, Shield } from 'lucide-react';

interface ExamSettingsFormProps {
    title: string;
    setTitle: (v: string) => void;
    duration: number;
    setDuration: (v: number) => void;
    passScore: number;
    setPassScore: (v: number) => void;
    antiCheatEnabled: boolean;
    setAntiCheatEnabled: (v: boolean) => void;
}

export function ExamSettingsForm({
    title, setTitle,
    duration, setDuration,
    passScore, setPassScore,
    antiCheatEnabled, setAntiCheatEnabled
}: ExamSettingsFormProps) {
    return (
        <div className="max-w-4xl mx-auto w-full space-y-8 py-10 animate-in slide-in-from-bottom-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-10 shadow-xl shadow-black/5">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-[var(--border-color)]">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <FileText className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[var(--text-primary)]">إعدادات الامتحان الأساسية</h3>
                        <p className="text-[var(--text-secondary)] font-bold">تحكم في هوية الامتحان ومعايير النجاح</p>
                    </div>
                </div>

                <div className="space-y-8">

                    {/* Exam Title */}
                    <div className="group">
                        <label className="block text-sm font-black text-[var(--text-secondary)] mb-3 mr-1 transition-colors group-focus-within:text-brand-500">
                            عنوان الامتحان العريض
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-16 px-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] text-lg font-black focus:border-brand-500 focus:ring-brand-500/5 outline-none transition-all"
                            placeholder="مثال: الاختبار الشامل لمادة الكيمياء - الفصل الأول"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Duration */}
                        <div className="group">
                            <label className="block text-sm font-black text-[var(--text-secondary)] mb-3 mr-1 transition-colors group-focus-within:text-brand-500">
                                مدة الامتحان (دقيقة)
                            </label>
                            <div className="relative">
                                <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full h-16 pr-14 pl-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-black focus:border-brand-500 focus:ring-brand-500/5 outline-none transition-all"
                                />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--text-secondary)] opacity-50">MIN</span>
                            </div>
                        </div>

                        {/* Pass Score */}
                        <div className="group">
                            <label className="block text-sm font-black text-[var(--text-secondary)] mb-3 mr-1 transition-colors group-focus-within:text-brand-500">
                                درجة النجاح المطلوبة (%)
                            </label>
                            <div className="relative">
                                <Target className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="number"
                                    value={passScore}
                                    onChange={(e) => setPassScore(Number(e.target.value))}
                                    className="w-full h-16 pr-14 pl-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-black focus:border-brand-500 focus:ring-brand-500/5 outline-none transition-all"
                                />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--text-secondary)] opacity-50">PERCENT</span>
                            </div>
                        </div>
                    </div>

                    {/* Anti-Cheat Toggle */}
                    <div className="flex items-center justify-between p-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-black text-[var(--text-primary)]">نظام مكافحة الغش</p>
                                <p className="text-sm text-[var(--text-secondary)]">منع النسخ، الخروج، تبديل التبويبات</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAntiCheatEnabled(!antiCheatEnabled)}
                            className={`w-14 h-8 rounded-full transition-all ${antiCheatEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${antiCheatEnabled ? 'translate-x-1' : 'translate-x-7'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Hint Card */}
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-amber-700/80 leading-relaxed">
                    تأكد من تحديد درجة نجاح مناسبة لمستوى الامتحان. الطلاب الذين يحصلون على درجة أقل من هذه النسبة سيتم تصنيفهم بأنهم "لم يحالفهم الحظ" في نتائج الامتحان.
                </p>
            </div>
        </div>
    );
}

