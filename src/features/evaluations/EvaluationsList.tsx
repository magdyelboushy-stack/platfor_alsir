
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Image as ImageIcon,
    Download,
    Search,
    Filter,
    ArrowRight,
    MessageCircle,
    X,
    ExternalLink,
    Hexagon,
    Clock,
    Share2,
    Trophy
} from 'lucide-react';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { Evaluation } from '@/core/types/common';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { EVALUATION_SUBJECTS, COLOR_MAP } from './constants';

function generateSimpleUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const EDUCATION_STAGES = [
    { id: 'primary', label: 'المرحلة الابتدائية' },
    { id: 'prep', label: 'المرحلة الإعدادية' },
    { id: 'secondary', label: 'المرحلة الثانوية' },
];

const GRADE_LEVELS: Record<string, { id: number; label: string }[]> = {
    primary: [
        { id: 1, label: 'الأول الابتدائي' },
        { id: 2, label: 'الثاني الابتدائي' },
        { id: 3, label: 'الثالث الابتدائي' },
        { id: 4, label: 'الرابع الابتدائي' },
        { id: 5, label: 'الخامس الابتدائي' },
        { id: 6, label: 'السادس الابتدائي' },
    ],
    prep: [
        { id: 7, label: 'الأول الإعدادي' },
        { id: 8, label: 'الثاني الإعدادي' },
        { id: 9, label: 'الثالث الإعدادي' },
    ],
    secondary: [
        { id: 10, label: 'الأول الثانوي' },
        { id: 11, label: 'الثاني الثانوي' },
        { id: 12, label: 'الثالث الثانوي' },
    ],
};

export default function EvaluationsList() {
    const [searchParams] = useSearchParams();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        education_stage: '',
        grade_level: '',
        subject: '',
        resource_type: '',
    });

    // Referral State
    const [sharerUuid] = useState(() => {
        const existing = localStorage.getItem('bt_sharer_uuid');
        if (existing) return existing;
        const newUuid = generateSimpleUUID();
        localStorage.setItem('bt_sharer_uuid', newUuid);
        return newUuid;
    });

    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
    const [pendingEvalId, setPendingEvalId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [sharesCount, setSharesCount] = useState(0);
    const [targetCount, setTargetCount] = useState(5);
    const [isLinkReady, setIsLinkReady] = useState(false);
    const [isPolling, setIsPolling] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { fetchCsrfToken } = useAuthStore();

    const trackedTokens = useRef<Set<string>>(new Set());

    // 1. Initial Load & Referral Visit Tracking (Reactive to URL)
    useEffect(() => {
        const refToken = searchParams.get('ref');
        if (refToken && !trackedTokens.current.has(refToken)) {
            trackedTokens.current.add(refToken);

            api.post(`/referrals/${refToken}/visit`)
                .catch(() => { })
                .finally(() => {
                    // Redirect to WhatsApp channel after recording visit
                    window.location.href = "https://whatsapp.com/channel/0029VaoGbV4EFeXeSg4jDB34";
                });
        }

        const autoModalTimer = setTimeout(() => setShowWhatsappModal(true), 2500);
        return () => clearTimeout(autoModalTimer);
    }, [searchParams]);

    useEffect(() => {
        fetchEvaluations();
    }, [filters]);

    // 2. Countdown logic for Evaluations
    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0) {
            setIsLinkReady(true);
            setCountdown(null);
            if (pendingEvalId) handleIncrementDownload(pendingEvalId);
        }
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [countdown]);

    // 3. Polling logic for Study Materials (Referrals)
    useEffect(() => {
        if (isPolling && pendingEvalId && !isLinkReady) {
            pollIntervalRef.current = setInterval(checkReferralStatus, 4000);
        } else {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
        return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
    }, [isPolling, pendingEvalId, isLinkReady]);

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const data = await api.get<Evaluation[]>(ENDPOINTS.EVALUATIONS.LIST, { params: filters });
            setEvaluations(Array.isArray(data) ? data : []);
            if (!Array.isArray(data)) {
            }
        } catch (error) {
            console.error('Failed to fetch evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkReferralStatus = async () => {
        if (!pendingEvalId) return;
        try {
            const status = await api.get<any>(`/evaluations/${pendingEvalId}/referral-status`, {
                params: { sharer_uuid: sharerUuid }
            });

            setSharesCount(status.current_count || 0);
            setTargetCount(status.target_count || 5);

            // Cache partial progress
            if (pendingEvalId) {
                const progressMap = JSON.parse(localStorage.getItem('bt_progress_cache') || '{}');
                progressMap[pendingEvalId] = status.current_count || 0;
                localStorage.setItem('bt_progress_cache', JSON.stringify(progressMap));
            }
            // status.token is handled within this poll logic

            if (status.current_count >= status.target_count) {
                setIsLinkReady(true);
                setIsPolling(false);

                // Persist the unlocked state for this ID
                const unlocked = JSON.parse(localStorage.getItem('bt_unlocked_evals') || '[]');
                if (!unlocked.includes(pendingEvalId)) {
                    unlocked.push(pendingEvalId);
                    localStorage.setItem('bt_unlocked_evals', JSON.stringify(unlocked));
                }

                handleIncrementDownload(pendingEvalId);
            }
        } catch (error) {
        }
    };

    const handleFileClick = (e: React.MouseEvent, evaluationId: string | number, url: string) => {
        e.preventDefault();
        const idString = evaluationId.toString();
        const item = Array.isArray(evaluations) ? evaluations.find(ev => ev.id.toString() === idString) : null;

        // Immediate download if already unlocked
        const unlocked = JSON.parse(localStorage.getItem('bt_unlocked_evals') || '[]');
        if (unlocked.includes(idString)) {
            window.open(url, "_blank");
            handleIncrementDownload(idString);
            return;
        }

        setPendingFileUrl(url);
        setPendingEvalId(idString);
        setIsLinkReady(false);
        setCountdown(null);

        // Load cached partial progress
        const progressMap = JSON.parse(localStorage.getItem('bt_progress_cache') || '{}');
        setSharesCount(progressMap[idString] || 0);

        if (item?.resource_type === 'study_material') {
            setIsPolling(true);
            checkReferralStatus();
        }

        setShowWhatsappModal(true);
    };

    const handleConfirmJoin = () => {
        window.open("https://whatsapp.com/channel/0029VaoGbV4EFeXeSg4jDB34", "_blank");
        if (pendingFileUrl && currentEval) {
            if (currentEval.resource_type === 'evaluation') {
                setCountdown(5);
            }
        } else {
            setShowWhatsappModal(false);
        }
    };

    const handleShare = async () => {
        if (!pendingEvalId) return;

        try {
            // 1. Get/Create referral token
            const referral = await api.post<any>(`/evaluations/${pendingEvalId}/referral`, {
                sharer_uuid: sharerUuid
            });

            if (!referral || !referral.token) {
                throw new Error('Invalid referral response');
            }

            const token = referral.token;
            // setReferralToken(token); // Removed unused state update

            // 2. Prepare share URL - Use absolute path for reliability
            const shareUrl = `${window.location.origin}/mozakrat?ref=${token}`;

            const itemName = currentEval?.title || 'مذكرة تعليمية';
            const subjectName = currentEval?.subject || '';
            const text = `🚀 *مذكرة مميزة من السير الشامي* 🚀\n\n📖 *الموضوع:* ${itemName}\n📚 *المادة:* ${subjectName}\n\n✅ حملها الآن من هنا:\n${shareUrl}`;

            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
            setIsPolling(true);
        } catch (error) {
            alert('عذراً، فشل إنشاء رابط المشاركة. يرجى المحاولة مرة أخرى.');
        }
    };

    const handleIncrementDownload = async (id: string) => {
        try {
            const csrfToken = await fetchCsrfToken();
            const data = new FormData();
            if (csrfToken) data.append('csrf_token', csrfToken);
            await api.post(`/evaluations/${id}/download`, data);
            fetchEvaluations();
        } catch (error) { }
    };

    const handleFinalDownload = () => {
        if (pendingFileUrl) window.open(pendingFileUrl, "_blank");
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setShowWhatsappModal(false);
        setPendingFileUrl(null);
        setPendingEvalId(null);
        setIsLinkReady(false);
        setIsPolling(false);
        setCountdown(null);
    };

    const currentEval = Array.isArray(evaluations) ? evaluations.find(e => e.id.toString() === pendingEvalId) : null;
    const progressPercent = Math.min((sharesCount / targetCount) * 100, 100);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pb-20 pt-32 px-4 sm:px-6 lg:px-8" dir="rtl">
            <Helmet>
                <title>المذاكرات التعليمية - السير الشامي</title>
                <meta name="description" content="اطلع على أحدث المذاكرات التعليمية لجميع المراحل الدراسية." />
            </Helmet>

            {/* Header omitted for brevity in snippet but kept in actual file */}
            <div className="max-w-7xl mx-auto mb-16 relative text-center">
                <h1 className="text-5xl sm:text-7xl font-black text-[var(--text-primary)] mb-8 font-display">
                    المذاكرات <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">التعليمية</span>
                </h1>
            </div>

            {/* Filters */}
            <div className="max-w-6xl mx-auto mb-16 px-4">
                <div className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)] p-8 shadow-3xl relative overflow-hidden group/filter">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/[0.02] to-transparent pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10">
                        <div className="lg:col-span-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-500 mr-4 uppercase tracking-[0.2em]">المرحلة الدراسية</label>
                                <div className="relative group">
                                    <select
                                        value={filters.education_stage}
                                        onChange={(e) => setFilters({ ...filters, education_stage: e.target.value, grade_level: '' })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-[var(--text-primary)] appearance-none outline-none focus:border-brand-500 transition-all font-black text-sm shadow-sm"
                                    >
                                        <option value="">كل المراحل</option>
                                        {EDUCATION_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-500 mr-4 uppercase tracking-[0.2em]">السنة الدراسية</label>
                                <div className="relative group">
                                    <select
                                        value={filters.grade_level}
                                        onChange={(e) => setFilters({ ...filters, grade_level: e.target.value })}
                                        disabled={!filters.education_stage}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-[var(--text-primary)] appearance-none outline-none focus:border-brand-500 transition-all font-black text-sm shadow-sm disabled:opacity-40"
                                    >
                                        <option value="">كل السنوات</option>
                                        {filters.education_stage && GRADE_LEVELS[filters.education_stage].map(g => (
                                            <option key={g.id} value={g.id}>{g.label}</option>
                                        ))}
                                    </select>
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-500 mr-4 uppercase tracking-[0.2em]">المادة الدراسية</label>
                                <div className="relative group">
                                    <select
                                        value={filters.subject}
                                        onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-[var(--text-primary)] appearance-none outline-none focus:border-brand-500 transition-all font-black text-sm shadow-sm"
                                    >
                                        <option value="">كل المواد</option>
                                        {EVALUATION_SUBJECTS.map(s => (
                                            <option key={s.id} value={s.ar}>{s.ar}</option>
                                        ))}
                                    </select>
                                    <ArrowRight className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 rotate-90" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-brand-500 mr-4 uppercase tracking-[0.2em]">نوع المورد</label>
                                <div className="relative group">
                                    <select
                                        value={filters.resource_type}
                                        onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-5 text-[var(--text-primary)] appearance-none outline-none focus:border-brand-500 transition-all font-black text-sm shadow-sm"
                                    >
                                        <option value="">كل الأنواع</option>
                                        <option value="evaluation">التقييمات الأسبوعية</option>
                                        <option value="study_material">المذكرات التعليمية</option>
                                    </select>
                                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <button
                                onClick={() => setFilters({ education_stage: '', grade_level: '', subject: '', resource_type: '' })}
                                className="w-full py-5 rounded-2xl bg-brand-500 text-white font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-500/20"
                            >
                                عرض الكل
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => <div key={i} className="h-[400px] rounded-[3rem] bg-[var(--bg-card)] animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {Array.isArray(evaluations) && evaluations.map((item, idx) => (
                            <EvaluationCard key={item.id} evaluation={item} index={idx} onFileClick={handleFileClick} />
                        ))}
                    </div>
                )}
            </div>

            {/* Viral Modal */}
            <AnimatePresence>
                {showWhatsappModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-black/50 overflow-y-auto">
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative w-full max-w-xl bg-[var(--bg-card)] rounded-[4rem] border border-[var(--border-color)] p-10 sm:p-16 text-center">
                            <button onClick={handleCloseModal} className="absolute top-8 left-8 p-3 rounded-2xl hover:bg-brand-500/10 transition-all"><X /></button>

                            <div className={clsx("w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl", isLinkReady ? "bg-amber-500/20 text-amber-500" : "bg-brand-500/20 text-brand-500")}>
                                {isLinkReady ? <Trophy className="w-14 h-14" /> : currentEval?.resource_type === 'study_material' ? <Share2 className="w-14 h-14" /> : <Clock className="w-14 h-14" />}
                            </div>

                            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-6">
                                {isLinkReady ? 'تم فك القفل بنجاح!' : currentEval?.resource_type === 'study_material' ? `ادعُ 5 من أصدقائك لفتح المذكرة` : 'جاري تجهيز الرابط...'}
                            </h2>

                            <p className="text-[var(--text-secondary)] text-xl mb-12 font-bold opacity-80">
                                {isLinkReady ? 'رائع! لقد زار 5 من أصدقائك الرابط. يمكنك الآن تحميل الملف.' :
                                    currentEval?.resource_type === 'study_material' ? `هذه المذكرة حصرية! شارك الرابط مع أصدقائك، وبمجرد دخول 5 منهم عليه، سيفتح الرابط تلقائياً هنا.` :
                                        countdown !== null ? `سيظهر الرابط خلال ${countdown} ثوانٍ.` : 'انضم لقناتنا الرسمية للحصول على كل جديد.'}
                            </p>

                            <div className="space-y-4">
                                {isLinkReady ? (
                                    <button onClick={handleFinalDownload} className="flex items-center justify-center gap-4 w-full py-6 rounded-[2rem] bg-amber-500 text-white font-black text-xl shadow-2xl">
                                        <Download className="w-7 h-7" />
                                        تحميل الملف الحصري
                                    </button>
                                ) : currentEval?.resource_type === 'study_material' ? (
                                    <div className="space-y-6">
                                        <div className="relative h-4 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-color)]">
                                            <motion.div animate={{ width: `${progressPercent}%` }} className="absolute inset-y-0 right-0 bg-gradient-to-l from-blue-500 to-indigo-600 shadow-lg" />
                                        </div>
                                        <div className="flex justify-between text-xs font-black text-blue-500 uppercase tracking-widest px-2">
                                            <span>الهدف: {targetCount} زيارات</span>
                                            <span>الحالي: {sharesCount} زيارات</span>
                                        </div>
                                        <button onClick={handleShare} className="flex items-center justify-center gap-4 w-full py-6 rounded-[2rem] bg-blue-500 text-white font-black text-xl shadow-2xl">
                                            <Share2 /> مشاركة الرابط الفريد
                                        </button>
                                        <div className="flex items-center justify-center gap-2 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                            <span className="text-xs font-bold text-blue-500">في انتظار دخول أصدقائك... (لا تغلق الصفحة)</span>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={handleConfirmJoin} className="flex items-center justify-center gap-4 w-full py-6 rounded-[2rem] bg-emerald-500 text-white font-black text-xl shadow-2xl">
                                        <MessageCircle className="w-7 h-7" />
                                        انضم الآن & أظهر الرابط
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function EvaluationCard({ evaluation, index, onFileClick }: { evaluation: Evaluation; index: number; onFileClick: (e: React.MouseEvent, evaluationId: string | number, url: string) => void }) {
    const subjectInfo = EVALUATION_SUBJECTS.find(s => s.ar === evaluation.subject) || EVALUATION_SUBJECTS.find(s => s.id === 'other');
    const colorTheme = COLOR_MAP[subjectInfo?.color as keyof typeof COLOR_MAP] || COLOR_MAP.Slate;
    const Icon = subjectInfo?.icon || Hexagon;
    const [themeGlow, themeLight, themeText, themeBorder, themeBg] = colorTheme.split(' ');

    const [isAlreadyUnlocked, setIsAlreadyUnlocked] = useState(false);

    useEffect(() => {
        const unlocked = JSON.parse(localStorage.getItem('bt_unlocked_evals') || '[]');
        if (unlocked.includes(evaluation.id.toString())) {
            setIsAlreadyUnlocked(true);
        }
    }, [evaluation.id]);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)] overflow-hidden flex flex-col group">
            <div className={clsx("p-8 pb-4 relative overflow-hidden", themeGlow)}>
                <div className="flex items-center justify-between mb-6">
                    <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center text-white", themeBg)}><Icon className="w-8 h-8" /></div>
                    <span className={clsx("px-3 py-1 rounded-xl text-[10px] font-black border", themeText, themeBorder, themeLight)}>{evaluation.subject}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black",
                        evaluation.resource_type === 'study_material' ? (isAlreadyUnlocked ? "bg-emerald-500 text-white" : "bg-amber-500 text-white") : "bg-brand-500/20 text-brand-500"
                    )}>
                        {evaluation.resource_type === 'study_material' ? (isAlreadyUnlocked ? 'مفتوحة ✅' : 'مذكرة') : 'تقييم'}
                    </span>
                </div>
                <h3 className="text-xl font-black text-[var(--text-primary)] line-clamp-2 min-h-[3rem]">{evaluation.title}</h3>
            </div>
            <div className="p-8 pt-4 mt-auto">
                {evaluation.files?.map((file, fIdx) => (
                    <a key={fIdx} href={file.url} onClick={(e) => onFileClick(e, evaluation.id, file.url)} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] group/file hover:border-brand-500/40 transition-all mb-2">
                        <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white", file.file_type === 'pdf' ? "bg-red-500" : "bg-blue-600")}>
                                {file.file_type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                            </div>
                            <span className="text-sm font-black">{file.file_type === 'pdf' ? 'ملف PDF' : 'صورة'}</span>
                        </div>
                        {evaluation.resource_type === 'study_material' ? (
                            isAlreadyUnlocked ? <Download className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-amber-500" />
                        ) : <ExternalLink className="w-4 h-4 text-brand-500" />}
                    </a>
                ))}
            </div>
        </motion.div>
    );
}
