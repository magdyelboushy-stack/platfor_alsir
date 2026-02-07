import { useState, useEffect } from 'react';
import { Book, Tag, CircleDollarSign, GraduationCap, Save, Loader2 } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    education_stage: string;
    grade_level: string;
    status: string;
    // إضافة الأهداف للواجهة
    objectives?: string[];
}

interface CourseGeneralSettingsProps {
    course: Course;
    onUpdate: (data: Partial<Course>) => Promise<void>;
}

const EDUCATION_STAGES = [
    { value: 'primary', label: 'المرحلة الابتدائية' },
    { value: 'prep', label: 'المرحلة الإعدادية' },
    { value: 'secondary', label: 'المرحلة الثانوية' },
];

const GRADE_LEVELS: Record<string, { value: string; label: string }[]> = {
    primary: [
        { value: 'first_primary', label: 'الصف الأول الابتدائي' },
        { value: 'second_primary', label: 'الصف الثاني الابتدائي' },
        { value: 'third_primary', label: 'الصف الثالث الابتدائي' },
        { value: 'fourth_primary', label: 'الصف الرابع الابتدائي' },
        { value: 'fifth_primary', label: 'الصف الخامس الابتدائي' },
        { value: 'sixth_primary', label: 'الصف السادس الابتدائي' },
    ],
    prep: [
        { value: 'first_prep', label: 'الصف الأول الإعدادي' },
        { value: 'second_prep', label: 'الصف الثاني الإعدادي' },
        { value: 'third_prep', label: 'الصف الثالث الإعدادي' },
    ],
    secondary: [
        { value: 'first_secondary', label: 'الصف الأول الثانوي' },
        { value: 'second_secondary', label: 'الصف الثاني الثانوي' },
        { value: 'third_secondary', label: 'الصف الثالث الثانوي' },
    ],
};

export function CourseGeneralSettings({ course, onUpdate }: CourseGeneralSettingsProps) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description || '');
    const [price, setPrice] = useState(course.price || 0);
    const [educationStage, setEducationStage] = useState(course.education_stage);
    const [gradeLevel, setGradeLevel] = useState(course.grade_level);
    const [isSaving, setIsSaving] = useState(false);

    const [objectives, setObjectives] = useState<string[]>(course.objectives || []);
    const [newObjective, setNewObjective] = useState('');

    const currentGrades = GRADE_LEVELS[educationStage] || [];

    // Update local state when course changes
    useEffect(() => {
        setTitle(course.title);
        setDescription(course.description || '');
        setPrice(course.price || 0);
        setEducationStage(course.education_stage);
        setGradeLevel(course.grade_level);
        setObjectives(course.objectives || []);
    }, [course]);

    const addObjective = () => {
        const trimmed = newObjective.trim();
        if (!trimmed) return;
        setObjectives(prev => [...prev, trimmed]);
        setNewObjective('');
    };

    const removeObjective = (index: number) => {
        setObjectives(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({
                title,
                description,
                price: Number(price),
                education_stage: educationStage,
                grade_level: gradeLevel,
                objectives,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main Info */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                            <Book className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-[var(--text-primary)]">المعلومات الأساسية</h2>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        حفظ التغييرات
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">عنوان الكورس *</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="مثال: شرح الجبر والهندسة الفراغية للصف الثالث الثانوي"
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all group-hover:border-brand-500/30 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">فرع الرياضيات</label>
                        <div className="relative group">
                            <select className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer group-hover:border-brand-500/30 shadow-inner">
                                <option>البحار والرياضيات</option>
                                <option>الجبر والهندسة</option>
                                <option>التفاضل والتكامل</option>
                                <option>الديناميكا والاستاتيكا</option>
                            </select>
                            <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none opacity-50" />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">وصف الكورس</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="اكتب وصفاً جذاباً يشرح للطلاب ماذا سيتعلمون في هذا الكورس بالتفصيل..."
                            className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all resize-none group-hover:border-brand-500/30 shadow-inner"
                        />
                    </div>

                    {/* Objectives */}
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">أهداف الكورس</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newObjective}
                                onChange={(e) => setNewObjective(e.target.value)}
                                placeholder="اكتب هدفاً ثم اضغط إضافة"
                                className="flex-1 px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-brand-500 outline-none transition-all shadow-inner"
                            />
                            <button
                                type="button"
                                onClick={addObjective}
                                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black text-xs transition-all active:scale-95"
                            >
                                إضافة
                            </button>
                        </div>
                        {!!objectives.length && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {objectives.map((obj, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] font-bold">
                                        {obj}
                                        <button
                                            type="button"
                                            onClick={() => removeObjective(idx)}
                                            className="text-[var(--text-secondary)] hover:text-red-500"
                                            aria-label="حذف الهدف"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing & Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-sm group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <CircleDollarSign className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-[var(--text-primary)]">التسعير</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">السعر (ج.م)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-12 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-black text-2xl focus:border-amber-500 outline-none transition-all shadow-inner"
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-amber-500">ج.م</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-2 mr-4 opacity-60 font-bold">اترك الحقل فارغاً أو 0 ليكون الكورس مجانياً.</p>
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-sm group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-[var(--text-primary)]">الفئة المستهدفة</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">المرحلة الدراسية</label>
                            <select
                                value={educationStage}
                                onChange={(e) => {
                                    setEducationStage(e.target.value);
                                    const newGrades = GRADE_LEVELS[e.target.value];
                                    if (newGrades?.length) {
                                        setGradeLevel(newGrades[0].value);
                                    }
                                }}
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-blue-500 outline-none transition-all cursor-pointer shadow-inner"
                            >
                                {EDUCATION_STAGES.map(stage => (
                                    <option key={stage.value} value={stage.value}>{stage.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest mr-4">الصف الدراسي</label>
                            <select
                                value={gradeLevel}
                                onChange={(e) => setGradeLevel(e.target.value)}
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] font-bold focus:border-blue-500 outline-none transition-all cursor-pointer shadow-inner"
                            >
                                {currentGrades.map(grade => (
                                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
