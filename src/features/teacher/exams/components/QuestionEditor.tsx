import { motion } from 'framer-motion';
import { ImageIcon, Plus, AlertCircle, FileText } from 'lucide-react';
import { OptionItem } from './OptionItem';

interface QuestionEditorProps {
    question: any;
    onUpdate: (updates: any) => void;
    onUpdateOption: (optId: string, text: string) => void;
    onUpdateWrongExplanation?: (optId: string, exp: string) => void;
    onSetCorrect: (optId: string) => void;
    onAddOption: () => void;
    onDeleteOption: (optId: string) => void;
}

export function QuestionEditor({
    question,
    onUpdate,
    onUpdateOption,
    onUpdateWrongExplanation,
    onSetCorrect,
    onAddOption,
    onDeleteOption
}: QuestionEditorProps) {
    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-10 overflow-y-auto custom-scrollbar shadow-xl shadow-black/5"
        >
            <div className="max-w-4xl mx-auto space-y-12">
                {/* 1. Header & Score */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-[var(--text-primary)]">محرر نص السؤال</h3>
                            <p className="text-xs font-bold text-[var(--text-secondary)]">اكتب نص السؤال بدقة وحدد الدرجة</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[var(--bg-main)] p-2 rounded-2xl border border-[var(--border-color)]">
                        <span className="text-xs font-black text-[var(--text-secondary)] mr-2">درجة السؤال</span>
                        <input
                            type="number"
                            value={question.score}
                            onChange={(e) => onUpdate({ score: Number(e.target.value) })}
                            className="w-16 h-10 px-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-center text-sm font-black text-brand-500 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* 2. Question Text */}
                <div className="space-y-4">
                    <textarea
                        rows={4}
                        value={question.text}
                        onChange={(e) => onUpdate({ text: e.target.value })}
                        className="w-full px-8 py-8 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[2rem] text-[var(--text-primary)] text-2xl font-black focus:border-brand-500 focus:ring-brand-500/5 outline-none transition-all leading-relaxed placeholder:opacity-20"
                        placeholder="اكتب هنا نص السؤال بوضوح..."
                    />
                    <div className="flex justify-start">
                        <button className="px-6 py-3 bg-[var(--bg-main)] hover:bg-brand-500/10 text-brand-500 hover:border-brand-500/50 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95">
                            <ImageIcon className="w-4 h-4" />
                            <span>إرفاق صورة توضيحية للسؤال</span>
                        </button>
                    </div>
                </div>

                {/* 3. Options Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                            <span>خيارات الإجابة</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest font-black">حدد الإجابة الصحيحة</span>
                        </h4>
                    </div>

                    <div className="space-y-4">
                        {question.options.map((option: any, idx: number) => (
                            <OptionItem
                                key={option.id}
                                id={option.id}
                                text={option.text}
                                isCorrect={option.isCorrect}
                                wrongExplanation={option.wrongExplanation || ''}
                                index={idx}
                                onTextChange={(text) => onUpdateOption(option.id, text)}
                                onWrongExplanationChange={onUpdateWrongExplanation ? (exp) => onUpdateWrongExplanation(option.id, exp) : undefined}
                                onSetCorrect={() => onSetCorrect(option.id)}
                                onDelete={() => onDeleteOption(option.id)}
                            />
                        ))}

                        <button
                            onClick={onAddOption}
                            className="w-full h-16 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex items-center justify-center gap-3 text-[var(--text-secondary)] hover:text-brand-500 hover:border-brand-500 hover:bg-brand-500/5 transition-all font-black group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span>إضافة خيار إجابة جديد</span>
                        </button>
                    </div>
                </div>

                {/* 4. Feedback / Explanation */}
                <div className="bg-brand-500/5 border-brand-500/10 rounded-[2rem] p-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-black text-brand-500">الشرح والتعليل (Feedback)</h4>
                    </div>
                    <p className="text-sm font-bold text-brand-500/60 leading-relaxed max-w-2xl">
                        سيظهر هذا الشرح للطالب بعد انتهاء الامتحان لتوضيح كيفية الوصول للإجابة الصحيحة أو لماذا أخطأ في هذا السؤال.
                    </p>
                    <textarea
                        rows={3}
                        value={question.feedback}
                        onChange={(e) => onUpdate({ feedback: e.target.value })}
                        className="w-full px-6 py-6 bg-[var(--bg-main)] border border-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:opacity-20"
                        placeholder="اشرح خطواط الحل أو القاعدة المستخدمة هنا..."
                    />
                </div>
            </div>
        </motion.div>
    );
}
