// ============================================================
// HomeworkVideosSection - فيديوهات الواجبات
// ============================================================

import { HomeworkVideoStats } from '../components/homework/HomeworkVideoStats';
import { HomeworkVideoList } from '../components/homework/HomeworkVideoList';

export function HomeworkVideosSection() {
    // Zeroed data template as requested (No API/Backend/Mock)
    const videos: any[] = [];
    const totalVideos = 0;
    const watchedVideos = 0;
    const unwatchedVideos = 0;

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    فيديوهات <span className="text-[var(--color-brand)]">الواجبات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    هنا تجد جميع فيديوهات شرح حلول الواجبات ونماذج الإجابة النموذجية لمساعدتك على التفوق.
                </p>
            </div>

            {/* 2. Stats Module */}
            <HomeworkVideoStats
                total={totalVideos}
                watched={watchedVideos}
                unwatched={unwatchedVideos}
            />

            {/* 3. Main Videos Repository */}
            <HomeworkVideoList videos={videos} />

            {/* Decorative Element */}
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
