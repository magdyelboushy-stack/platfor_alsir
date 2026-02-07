// ============================================================
// UploadSection - رفع الواجب
// ============================================================

import { HomeworkUploadArea } from '../components/homework/HomeworkUploadArea';
import { SubmissionHistoryList } from '../components/homework/SubmissionHistoryList';

export function UploadSection() {
    // Zeroed data template as requested (No API/Backend/Mock)
    const history: any[] = [];

    return (
        <div className="space-y-12 pb-20 max-w-6xl mx-auto">
            {/* 1. Header Area - Luxe Alignment */}
            <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] mb-3 font-display tracking-tight transition-colors">
                    تسليم <span className="text-[var(--color-brand)]">الواجبات</span>
                </h2>
                <div className="h-1.5 w-24 bg-brand-500 rounded-full mb-4 shadow-brand-500/40" />
                <p className="text-[var(--text-secondary)] font-bold text-lg max-w-2xl leading-relaxed">
                    قم برفع ملف الواجب بصيغة <span className="text-rose-500 font-display">PDF</span> ليتم مراجعته وتصحيحه من قبل الفريق المختص.
                </p>
            </div>

            {/* 2. Upload Engine */}
            <HomeworkUploadArea />

            {/* 3. Status Tracking */}
            <SubmissionHistoryList submissions={history} />

            {/* Decorative Element */}
            <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        </div>
    );
}
