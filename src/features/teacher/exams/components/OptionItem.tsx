import { useState } from 'react';
import { Check, Trash2, AlertTriangle } from 'lucide-react';

interface OptionItemProps {
    id: string;
    text: string;
    isCorrect: boolean;
    wrongExplanation?: string;
    index: number;
    onTextChange: (text: string) => void;
    onWrongExplanationChange?: (exp: string) => void;
    onSetCorrect: () => void;
    onDelete: () => void;
}

export function OptionItem({
    text,
    isCorrect,
    wrongExplanation = '',
    index,
    onTextChange,
    onWrongExplanationChange,
    onSetCorrect,
    onDelete
}: OptionItemProps) {
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <div className="space-y-2">
            <div
                className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all ${isCorrect
                    ? 'bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/10'
                    : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:border-brand-500/30'
                    }`}
            >
                <button
                    onClick={onSetCorrect}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${isCorrect
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'border-[var(--border-color)] text-transparent hover:border-emerald-500/50'
                        }`}
                    title="حدد كإجابة صحيحة"
                >
                    <Check className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => onTextChange(e.target.value)}
                        className={`w-full bg-transparent border-none outline-none font-bold text-lg placeholder:opacity-30 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                            }`}
                        placeholder={`خيار الإجابة رقم ${index + 1}...`}
                    />
                </div>

                {/* Toggle explanation for wrong answers */}
                {!isCorrect && onWrongExplanationChange && (
                    <button
                        onClick={() => setShowExplanation(!showExplanation)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showExplanation ? 'bg-amber-500/10 text-amber-500' : 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-amber-500/10'
                            }`}
                        title="توضيح سبب الخطأ"
                    >
                        <AlertTriangle className="w-5 h-5" />
                    </button>
                )}

                <button
                    onClick={onDelete}
                    className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Wrong Explanation Field */}
            {!isCorrect && showExplanation && onWrongExplanationChange && (
                <div className="mr-14 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-amber-600">لماذا هذه الإجابة خاطئة؟</span>
                    </div>
                    <textarea
                        rows={2}
                        value={wrongExplanation}
                        onChange={(e) => onWrongExplanationChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 dark:bg-black/20 border border-amber-500/20 rounded-xl text-sm font-bold text-amber-700 dark:text-amber-400 placeholder:text-amber-400/50 outline-none focus:border-amber-500 transition-all"
                        placeholder="اشرح للطالب لماذا هذا الخيار غير صحيح..."
                    />
                </div>
            )}
        </div>
    );
}

