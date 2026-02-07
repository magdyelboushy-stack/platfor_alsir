import { HomeworkVideoCard } from './HomeworkVideoCard';
import { Video } from 'lucide-react';

interface VideoData {
    id: number;
    title: string;
    course: string;
    duration: string;
    uploadDate: string;
    watched: boolean;
    thumbnail?: string | null;
}

interface HomeworkVideoListProps {
    videos: VideoData[];
}

export function HomeworkVideoList({ videos }: HomeworkVideoListProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
                    <Video className="w-5 h-5 text-[var(--color-brand)]" />
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] font-display tracking-tight">قائمة الفيديوهات</h3>
            </div>

            {videos.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {videos.map((video, index) => (
                        <HomeworkVideoCard key={video.id} video={video} index={index} />
                    ))}
                </div>
            ) : (
                <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-brand-500/10 text-center bg-white/5 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                        <Video className="w-8 h-8 text-[var(--color-brand)]" />
                    </div>
                    <p className="text-xl font-black text-[var(--text-secondary)] opacity-60">لا توجد فيديوهات واجب حالياً.</p>
                </div>
            )}
        </div>
    );
}
