import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { clsx } from 'clsx';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RatingModal({ isOpen, onClose }: RatingModalProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            >
                <div className="absolute top-6 right-6">
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-4 rounded-full text-white transition-all shadow-2xl border border-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="w-full max-w-lg bg-[var(--bg-card)] rounded-[3rem] p-10 border-2 border-[var(--border-color)] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />

                    <div className="text-center mb-10 relative z-10">
                        <div className="w-24 h-24 bg-brand-500/10 text-[var(--color-brand)] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner rotate-12">
                            <Star className="w-12 h-12 fill-current" />
                        </div>
                        <h3 className="text-3xl font-black text-[var(--text-primary)] mb-3 uppercase tracking-tighter">كيف كانت تجربتك؟</h3>
                        <p className="text-[var(--text-secondary)] font-bold text-lg">رأيك يهمنا ويساعدنا على تطوير المحتوى بما يناسبك</p>
                    </div>

                    <div className="flex justify-center gap-3 mb-10" dir="ltr">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="transition-all duration-300 hover:scale-125 active:scale-90"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={clsx(
                                        "w-12 h-12 transition-all duration-300",
                                        star <= (hover || rating) ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "text-slate-300 dark:text-white/10"
                                    )}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="relative">
                            <textarea
                                placeholder="اكتب تعليقك هنا بكل صراحة..."
                                className="w-full h-40 p-6 rounded-[2rem] bg-white/5 border-2 border-[var(--border-color)] focus:border-[var(--color-brand)] outline-none text-[var(--text-primary)] font-bold resize-none transition-all placeholder:text-[var(--text-secondary)]/30 shadow-inner text-lg"
                            />
                        </div>
                        <button
                            onClick={onClose}
                            disabled={rating === 0}
                            className="w-full py-5 rounded-2.5xl bg-[var(--color-brand)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xl shadow-2xl shadow-brand-500/30 transition-all flex items-center justify-center gap-3"
                        >
                            <Send className="w-6 h-6 rtl:-scale-x-100" />
                            إرسال التقييم المبدع
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
