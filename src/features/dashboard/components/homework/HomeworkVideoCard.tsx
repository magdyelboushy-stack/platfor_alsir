import { motion } from 'framer-motion';
import { Play, CheckCircle, Calendar, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface HomeworkVideoCardProps {
    video: {
        id: number;
        title: string;
        course: string;
        duration: string;
        uploadDate: string;
        watched: boolean;
        thumbnail?: string | null;
    };
    index: number;
}

export function HomeworkVideoCard({ video, index }: HomeworkVideoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
        >
            <div className={clsx(
                "relative rounded-[2.5rem] overflow-hidden border transition-all duration-500",
                "bg-white/40 dark:bg-[var(--bg-card)] border-brand-500/10 backdrop-blur-xl",
                "hover:border-brand-500/50 hover:shadow-[0_20px_40px_-15px_rgba(197,160,89,0.2)]",
                video.watched && "border-emerald-500/20"
            )}>
                {/* Thumbnail / Visual Area */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                    <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-[var(--color-brand)] group-hover:scale-110 transition-all shadow-2xl z-10">
                        <Play className="w-8 h-8 text-white fill-current translate-x-[2px]" />
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] font-black border border-white/10 flex items-center gap-1.5 z-10 leading-none h-6">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                    </div>

                    {/* Watched Badge */}
                    {video.watched && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-black shadow-lg flex items-center gap-1.5 z-10 leading-none h-6">
                            <CheckCircle className="w-3 h-3" />
                            تمت المشاهدة
                        </div>
                    )}
                </div>

                {/* Info Area */}
                <div className="p-6">
                    <h4 className="text-lg font-black text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
                        {video.title}
                    </h4>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                            <span>{video.course}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-secondary)] opacity-50">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(video.uploadDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                    </div>
                </div>

                {/* Hover Accent */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.div>
    );
}
