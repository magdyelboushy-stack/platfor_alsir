import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Wallet, Search, Check, Users, BookOpen } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { api } from '@/core/api/client';
import { useToast } from '@/store/uiStore';

interface Student {
    id: string;
    name: string;
    email?: string;
}

interface Course {
    id: string;
    title: string;
    price?: number;
}

interface GenerateCodesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export function GenerateCodesModal({ isOpen, onClose, onSubmit }: GenerateCodesModalProps) {
    const [batchName, setBatchName] = useState('');
    const [courseId, setCourseId] = useState('');
    const [count, setCount] = useState(10);
    const [price, setPrice] = useState(0);
    const [selectionMode, setSelectionMode] = useState<'batch' | 'targeted'>('batch');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { show } = useToast();

    // Fetch courses and students when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch courses
            const coursesData = await api.get<any>('/admin/my-courses');
            const coursesArray = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);
            setCourses(coursesArray);

            // Fetch students
            const studentsData = await api.get<any>('/admin/my-students');
            const studentsArray = Array.isArray(studentsData) ? studentsData : (studentsData?.data || []);
            setStudents(studentsArray);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            show({ type: 'error', title: 'خطأ', message: 'فشل في جلب البيانات' });
        } finally {
            setIsLoading(false);
        }
    };

    // Update price when course changes
    useEffect(() => {
        const selectedCourse = courses.find(c => c.id === courseId);
        if (selectedCourse?.price) {
            setPrice(selectedCourse.price);
        }
    }, [courseId, courses]);

    const filteredStudents = useMemo(() =>
        students.filter(s =>
            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.email?.toLowerCase().includes(studentSearch.toLowerCase())
        ),
        [studentSearch, students]
    );

    const toggleStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!courseId) {
            show({ type: 'error', title: 'خطأ', message: 'يجب اختيار كورس' });
            return;
        }

        if (selectionMode === 'targeted' && selectedStudents.length === 0) {
            show({ type: 'error', title: 'خطأ', message: 'يجب اختيار طالب واحد على الأقل' });
            return;
        }

        onSubmit({
            course_id: courseId,
            price: price,
            batch_name: batchName || undefined,
            count: selectionMode === 'targeted' ? selectedStudents.length : count,
            students: selectionMode === 'targeted' ? selectedStudents : undefined
        });

        onClose();
        resetForm();
    };

    const resetForm = () => {
        setBatchName('');
        setCourseId('');
        setCount(10);
        setPrice(0);
        setSelectedStudents([]);
        setSelectionMode('batch');
        setStudentSearch('');
    };

    const totalValue = (selectionMode === 'targeted' ? selectedStudents.length : count) * price;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-l from-brand-500/5 to-transparent shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">توليد أكواد تفعيل</h2>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form - Scrollable */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <>
                                    {/* Selection Mode Tabs */}
                                    <div className="flex p-1 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)]">
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode('batch')}
                                            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-black transition-all ${selectionMode === 'batch' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            <span>توليد كمية</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectionMode('targeted')}
                                            className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-black transition-all ${selectionMode === 'targeted' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>طلاب محددين</span>
                                        </button>
                                    </div>

                                    {/* Course Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[var(--text-secondary)] px-2 flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            الكورس
                                        </label>
                                        <select
                                            required
                                            value={courseId}
                                            onChange={(e) => setCourseId(e.target.value)}
                                            className="w-full h-16 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all appearance-none"
                                        >
                                            <option value="">-- اختر الكورس --</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title} {course.price ? `(${course.price} ج.م)` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Batch Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-[var(--text-secondary)] px-2">اسم المجموعة (اختياري)</label>
                                        <input
                                            type="text"
                                            value={batchName}
                                            onChange={(e) => setBatchName(e.target.value)}
                                            placeholder="مثال: طلاب سنتر الأمل - فبراير"
                                            className="w-full h-14 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                        />
                                    </div>

                                    {selectionMode === 'targeted' ? (
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-brand-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    placeholder="ابحث عن طالب..."
                                                    className="w-full h-14 pr-12 pl-6 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all text-sm"
                                                />
                                            </div>

                                            <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                {filteredStudents.length === 0 ? (
                                                    <p className="text-center text-[var(--text-secondary)] py-4">لا توجد نتائج</p>
                                                ) : (
                                                    filteredStudents.map(student => (
                                                        <button
                                                            key={student.id}
                                                            type="button"
                                                            onClick={() => toggleStudent(student.id)}
                                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedStudents.includes(student.id) ? 'bg-brand-500/10 border-brand-500 text-brand-500' : 'bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-brand-500/30'}`}
                                                        >
                                                            <div className="text-right">
                                                                <p className="font-black text-sm">{student.name}</p>
                                                                <p className="text-[10px] font-bold opacity-60">{student.email}</p>
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedStudents.includes(student.id) ? 'bg-brand-500 border-brand-500' : 'border-[var(--border-color)]'}`}>
                                                                {selectedStudents.includes(student.id) && <Check className="w-4 h-4 text-white" />}
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-[var(--text-secondary)] px-2">عدد الأكواد</label>
                                                <input
                                                    required
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={count}
                                                    onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                                                    className="w-full h-16 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-[var(--text-secondary)] px-2">السعر (ج.م)</label>
                                                <input
                                                    required
                                                    type="number"
                                                    min={0}
                                                    value={price}
                                                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                    className="w-full h-16 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Price for targeted mode */}
                                    {selectionMode === 'targeted' && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-[var(--text-secondary)] px-2">السعر لكل كود (ج.م)</label>
                                            <input
                                                required
                                                type="number"
                                                min={0}
                                                value={price}
                                                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full h-14 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                            />
                                        </div>
                                    )}

                                    {/* Summary Box */}
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
                                                سيتم توليد {selectionMode === 'targeted' ? (
                                                    <><span className="text-amber-800 font-black">{selectedStudents.length}</span> كود لـ {selectedStudents.length} طالب مختار</>
                                                ) : (
                                                    <><span className="text-amber-800 font-black">{count}</span> كود تفعيل</>
                                                )}
                                            </p>
                                            <p className="text-[10px] font-black text-amber-600/60 uppercase">إجمالي القيمة: {totalValue.toLocaleString()} ج.م</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 h-16 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-black hover:bg-[var(--bg-card)] transition-all active:scale-95"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={(selectionMode === 'targeted' && selectedStudents.length === 0) || !courseId}
                                            className="flex-[2] h-16 rounded-2xl bg-brand-500 text-white font-black shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                            <span>تأكيد وتوليد الآن</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
