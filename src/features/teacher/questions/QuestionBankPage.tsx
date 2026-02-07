import { QuestionBankHeader } from './components/QuestionBankHeader';
import { QuestionBankStats } from './components/QuestionBankStats';
import { QuestionList } from './components/QuestionList';

export function QuestionBankPage() {
    return (
        <div className="space-y-12 pb-20 max-w-7xl mx-auto">
            {/* 1. Page Header: Title, Search & Filters */}
            <QuestionBankHeader />

            {/* 2. Key Statistics View */}
            <QuestionBankStats />

            {/* 3. The Central Question Repository */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-black text-[var(--text-primary)]">المستودع الرقمي للأسئلة</h3>
                    <div className="text-sm font-bold text-[var(--text-secondary)]">عرض 1-12 من أصل 1240 سؤال</div>
                </div>
                <QuestionList />
            </div>

            {/* Background Decorative Blobs - Golden Atmosphere */}
            <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        </div>
    );
}
