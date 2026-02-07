import { motion } from 'framer-motion';
import { PlayCircle, FileText, HelpCircle, Clock, Share2, Star } from 'lucide-react';
import { getImageUrl } from '@/core/utils/url';
import { clsx } from 'clsx';

import { useState } from 'react';
import { PromoVideoModal } from './PromoVideoModal';

interface CourseDetailsSidebarProps {
    course: any;
    onOpenRating: () => void;
    onEnroll: () => void;
}

export const CourseDetailsSidebar = ({ course, onOpenRating, onEnroll }: CourseDetailsSidebarProps) => {
    const [isPromoOpen, setIsPromoOpen] = useState(false);
    const originalPrice = Math.round(Number(course.price || 0) * 1.5);
    const discount = 33;
    const isFree = Number(course.price || 0) <= 0;
    const isSubscribed = course.isSubscribed;

    // A student is "Enrolled" (can see) if it's free/matching grade, 
    // but "Subscribed" (saved to dashboard) only if they clicked the button.
    return (
        <>
            <PromoVideoModal
                isOpen={isPromoOpen}
                onClose={() => setIsPromoOpen(false)}
                videoUrl={course.introVideoUrl}
            />
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:sticky lg:top-28 space-y-6"
            >
                <div className="bg-[var(--bg-card)] rounded-[2rem] md:rounded-[3rem] border-2 border-[var(--border-color)] overflow-hidden shadow-3xl group">
                    {/* Video Preview / Thumbnail */}
                    {course.introVideoUrl && (
                        <div
                            className="relative aspect-video overflow-hidden cursor-pointer"
                            onClick={() => setIsPromoOpen(true)}
                        >
                            <img
                                src={getImageUrl(course.thumbnail)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt="Preview"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-brand)]/90 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                    <PlayCircle className="w-10 h-10 fill-current" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] px-4 py-2 rounded-xl font-black tracking-widest uppercase shadow-2xl">
                                شاهد البرومو
                            </div>
                        </div>
                    )}
                    {!course.introVideoUrl && (
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={getImageUrl(course.thumbnail)}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                alt="Preview"
                            />
                        </div>
                    )}

                    <div className="p-8 space-y-8">
                        {/* Pricing */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">سعر الكورس</p>
                                <div className="flex items-baseline gap-3">
                                    {isFree ? (
                                        <span className="text-4xl font-black text-emerald-500">مجاني بالكامل</span>
                                    ) : (
                                        <>
                                            <span className="text-4xl font-black text-[var(--color-brand)]">{Number(course.price || 0)} <small className="text-sm font-bold opacity-80">ج.م</small></span>
                                            <span className="text-lg text-[var(--text-secondary)] line-through opacity-40 font-bold">{originalPrice} ج.م</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {!isFree && (
                                <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-inner">
                                    خصم {discount}%
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={() => {
                                if (isSubscribed) return;
                                if (isFree) onEnroll();
                            }}
                            className={clsx(
                                "w-full py-6 rounded-2xl text-white font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95",
                                isSubscribed ? "bg-emerald-500 shadow-emerald-600/30" : "bg-[var(--color-brand)] shadow-brand-600/30"
                            )}
                        >
                            {isSubscribed ? 'مشترك بالفعل' : (isFree ? 'اشترك مجاناً' : (course.isEnrolled ? 'استكمل التعلم الآن' : 'اشترك الآن في الكورس'))}
                        </button>

                        {/* List Features */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: PlayCircle, label: `دروس فيديو`, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                                { icon: FileText, label: `ملفات PDF`, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                                { icon: HelpCircle, label: `اختبارات`, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                                { icon: Clock, label: "بث مباشر", color: 'text-brand-500', bg: 'bg-brand-500/5' },
                            ].map((stat, i) => (
                                <div key={i} className={`flex flex-col gap-2 p-4 rounded-2xl ${stat.bg} border-2 border-transparent hover:border-[var(--border-color)] transition-all group/stat cursor-default`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color} group-hover/stat:scale-110 transition-transform`} />
                                    <span className="text-[10px] font-black text-[var(--text-primary)] tracking-tight uppercase">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Social/Rating Actions */}
                        <div className="flex items-center gap-4 pt-6 border-t border-[var(--border-color)]">
                            <button
                                onClick={onOpenRating}
                                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-transparent hover:border-[var(--border-color)] transition-all text-[var(--text-primary)] font-black text-xs"
                            >
                                <Star className="w-4 h-4 text-amber-500" />
                                تقييم
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-transparent hover:border-[var(--border-color)] transition-all text-[var(--text-primary)] font-black text-xs">
                                <Share2 className="w-4 h-4 text-brand-500" />
                                مشاركة
                            </button>
                        </div>
                    </div>
                </div>

                {/* Support Card */}
                <div className="p-8 rounded-[3rem] bg-gradient-to-br from-brand-600/10 to-amber-600/10 border-2 border-[var(--color-brand)]/10 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <p className="relative z-10 text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest mb-3">الدعم الفني والتقني</p>
                    <h4 className="relative z-10 text-lg font-black text-[var(--text-primary)] mb-4">واجهتك أي مشكلة؟</h4>
                    <button className="relative z-10 w-full py-4 rounded-2xl bg-white/5 border-2 border-white/10 text-[var(--text-primary)] text-sm font-black hover:bg-white/10 transition-all group-hover:border-brand-500/30">تحدث معنا الآن</button>
                </div>
            </motion.div>
        </>
    );
};
