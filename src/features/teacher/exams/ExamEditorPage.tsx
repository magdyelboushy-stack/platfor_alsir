// ============================================================
// Exam Editor Page - Premium Redesign with API Integration
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { FileQuestion, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ExamBuilderHeader } from './components/ExamBuilderHeader';
import { ExamSettingsForm } from './components/ExamSettingsForm';
import { QuestionSidebar } from './components/QuestionSidebar';
import { QuestionEditor } from './components/QuestionEditor';
import apiClient from '@/core/api/client';

interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
    wrongExplanation?: string;
}

interface Question {
    id: string;
    text: string;
    image?: string;
    score: number;
    options: QuestionOption[];
    feedback: string;
}

export function ExamEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'settings' | 'questions'>('settings');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(!!id);

    const basePath = user?.role === 'assistant' ? '/assistant' : '/admin';

    // Exam Settings State (courseId comes from URL if editing from course)
    const [examTitle, setExamTitle] = useState('');
    const [duration, setDuration] = useState(45);
    const [passScore, setPassScore] = useState(50);
    const [antiCheatEnabled, setAntiCheatEnabled] = useState(true);

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

    // Load existing exam if editing
    useEffect(() => {
        if (id) {
            apiClient.get(`/admin/exams/${id}`)
                .then(res => {
                    const exam = res.data.exam;
                    setExamTitle(exam.title || '');
                    setDuration(exam.duration || 45);
                    setPassScore(exam.passScore || 50);
                    setAntiCheatEnabled(exam.antiCheatEnabled ?? true);

                    if (exam.questions && exam.questions.length > 0) {
                        const loadedQuestions: Question[] = exam.questions.map((q: any) => ({
                            id: q.id,
                            text: q.text,
                            image: q.imageUrl || undefined,
                            score: q.points || 1,
                            options: (q.options || []).map((o: any) => ({
                                id: o.id,
                                text: o.text,
                                isCorrect: o.isCorrect,
                                wrongExplanation: o.wrongExplanation || ''
                            })),
                            feedback: q.explanation || ''
                        }));
                        setQuestions(loadedQuestions);
                        setSelectedQuestionId(loadedQuestions[0]?.id || null);
                    }
                })
                .catch((err: any) => {
                    console.error('Failed to load exam:', err);
                    const errorMsg = err.response?.data?.error || err.message || 'فشل تحميل الامتحان';
                    toast.error(errorMsg);
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Derived State
    const activeQuestion = questions.find(q => q.id === selectedQuestionId);

    const handleAddQuestion = () => {
        const newId = Date.now().toString();
        const newQuestion: Question = {
            id: newId,
            text: 'سؤال جديد...',
            score: 1,
            options: [
                { id: '1', text: 'الخيار الأول', isCorrect: true, wrongExplanation: '' },
                { id: '2', text: 'الخيار الثاني', isCorrect: false, wrongExplanation: 'هذه ليست الإجابة الصحيحة' },
            ],
            feedback: ''
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newId);
        setActiveTab('questions');
    };

    const updateQuestion = (qId: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q));
    };

    const updateOption = (qId: string, optId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.map(o => o.id === optId ? { ...o, text } : o)
            };
        }));
    };

    const updateOptionWrongExplanation = (qId: string, optId: string, wrongExplanation: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.map(o => o.id === optId ? { ...o, wrongExplanation } : o)
            };
        }));
    };

    const setCorrectOption = (qId: string, optId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.map(o => ({ ...o, isCorrect: o.id === optId }))
            };
        }));
    };

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: [...q.options, { id: Date.now().toString(), text: '', isCorrect: false, wrongExplanation: '' }]
            };
        }));
    };

    const deleteOption = (qId: string, optId: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            return {
                ...q,
                options: q.options.filter(o => o.id !== optId)
            };
        }));
    };

    const deleteQuestion = (qId: string) => {
        const newQuestions = questions.filter(q => q.id !== qId);
        setQuestions(newQuestions);
        if (selectedQuestionId === qId) {
            setSelectedQuestionId(newQuestions[0]?.id || null);
        }
    };

    const handleSave = async (status: 'draft' | 'published' = 'draft') => {
        if (!examTitle.trim()) {
            toast.error('يرجى كتابة عنوان الامتحان');
            setActiveTab('settings');
            return;
        }
        if (questions.length === 0) {
            toast.error('يرجى إضافة سؤال واحد على الأقل');
            return;
        }

        setSaving(true);

        const payload = {
            title: examTitle,
            duration,
            passScore,
            antiCheatEnabled,
            status,
            questions: questions.map((q) => ({
                type: 'single',
                text: q.text,
                image_url: q.image || null,
                points: q.score,
                explanation: q.feedback || null,
                options: q.options.map((o) => ({
                    text: o.text,
                    is_correct: o.isCorrect,
                    wrong_explanation: o.wrongExplanation || null,
                }))
            }))
        };

        try {
            if (id) {
                await apiClient.post(`/admin/exams/${id}/update`, payload);
                toast.success('تم تحديث الامتحان بنجاح');
            } else {
                const res = await apiClient.post('/admin/exams', payload);
                toast.success('تم إنشاء الامتحان بنجاح');
                navigate(`${basePath}/exams/${res.data.examId}`, { replace: true });
            }
        } catch (err: any) {
            console.error('Failed to save exam:', err);
            toast.error(err?.response?.data?.error || 'فشل حفظ الامتحان');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-140px)] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <ExamBuilderHeader
                title={examTitle || 'امتحان جديد'}
                questionsCount={questions.length}
                duration={duration}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onSave={() => handleSave('draft')}
                onPublish={() => handleSave('published')}
                saving={saving}
            />

            {/* Main Interactive Workspace */}
            <div className="flex-1 min-h-0">
                {activeTab === 'settings' ? (
                    <ExamSettingsForm
                        title={examTitle}
                        setTitle={setExamTitle}
                        duration={duration}
                        setDuration={setDuration}
                        passScore={passScore}
                        setPassScore={setPassScore}
                        antiCheatEnabled={antiCheatEnabled}
                        setAntiCheatEnabled={setAntiCheatEnabled}
                    />
                ) : (
                    <div className="h-full grid grid-cols-12 gap-8 px-2">
                        {/* Sidebar: Question List */}
                        <div className="col-span-3 h-full">
                            <QuestionSidebar
                                questions={questions}
                                selectedId={selectedQuestionId}
                                setSelectedId={setSelectedQuestionId}
                                onAdd={handleAddQuestion}
                                onDelete={deleteQuestion}
                            />
                        </div>

                        {/* Surface: Rich Editor */}
                        <div className="col-span-9 h-full min-h-0">
                            {activeQuestion ? (
                                <QuestionEditor
                                    question={activeQuestion}
                                    onUpdate={(updates) => updateQuestion(activeQuestion.id, updates)}
                                    onUpdateOption={(optId, text) => updateOption(activeQuestion.id, optId, text)}
                                    onUpdateWrongExplanation={(optId, exp) => updateOptionWrongExplanation(activeQuestion.id, optId, exp)}
                                    onSetCorrect={(optId) => setCorrectOption(activeQuestion.id, optId)}
                                    onAddOption={() => addOption(activeQuestion.id)}
                                    onDeleteOption={(optId) => deleteOption(activeQuestion.id, optId)}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] opacity-40">
                                    <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)] mb-6 shadow-inner">
                                        <FileQuestion className="w-10 h-10" />
                                    </div>
                                    <p className="font-black text-xl">اختر سؤالاً من القائمة الجانبية لبدء التعديل</p>
                                    <p className="text-sm font-bold mt-2">أو أضف سؤالاً جديداً تماماً للامتحان</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Background Atmosphere */}
            <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        </div>
    );
}

