
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Trash2,
    FileText,
    Image as ImageIcon,
    Upload,
    X,
    Loader2,
    CheckCircle2,
    Search
} from 'lucide-react';
import { api } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import type { Evaluation } from '@/core/types/common';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';
import { EVALUATION_SUBJECTS } from '../../evaluations/constants';

const EDUCATION_STAGES: { id: string; label: string }[] = [
    { id: 'primary', label: 'المرحلة الابتدائية' },
    { id: 'prep', label: 'المرحلة الإعدادية' },
    { id: 'secondary', label: 'المرحلة الثانوية' },
];

const GRADE_LEVELS: Record<string, { id: number; label: string }[]> = {
    primary: [1, 2, 3, 4, 5, 6].map(i => ({ id: i, label: `الصف ${i} الابتدائي` })),
    prep: [7, 8, 9].map(i => ({ id: i, label: `الصف ${i - 6} الإعدادي` })),
    secondary: [10, 11, 12].map(i => ({ id: i, label: `الصف ${i - 9} الثانوي` })),
};

export default function EvaluationManager() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useUIStore();
    const { fetchCsrfToken } = useAuthStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        education_stage: 'secondary',
        grade_level: '10',
        subject: EVALUATION_SUBJECTS[0].ar,
        resource_type: 'evaluation' as 'evaluation' | 'study_material',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchEvaluations();
    }, []);

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const data = await api.get<Evaluation[]>(ENDPOINTS.EVALUATIONS.LIST);
            setEvaluations(data);
        } catch (error) {
            showToast({ type: 'error', title: 'خطأ', message: 'فشل تحميل التقييمات' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            showToast({ type: 'warning', title: 'تنبيه', message: 'يرجى اختيار ملف واحد على الأقل' });
            return;
        }

        setIsSubmitting(true);
        try {
            const csrfToken = await fetchCsrfToken();
            if (!csrfToken) {
                showToast({ type: 'error', title: 'خطأ', message: 'فشل التحقق الأمني (CSRF)' });
                setIsSubmitting(false);
                return;
            }

            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('education_stage', formData.education_stage);
            data.append('grade_level', formData.grade_level);
            data.append('subject', formData.subject);
            data.append('resource_type', formData.resource_type);
            data.append('csrf_token', csrfToken);

            selectedFiles.forEach((file) => {
                data.append('files[]', file);
            });

            await api.post(ENDPOINTS.EVALUATIONS.ADMIN_CREATE, data);
            showToast({ type: 'success', title: 'تمت العملية', message: 'تم إضافة التقييم بنجاح' });
            setIsModalOpen(false);
            setFormData({ title: '', description: '', education_stage: 'secondary', grade_level: '10', subject: EVALUATION_SUBJECTS[0].ar, resource_type: 'evaluation' });
            setSelectedFiles([]);
            fetchEvaluations();
        } catch (error) {
            showToast({ type: 'error', title: 'خطأ', message: 'فشل إضافة التقييم' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

        try {
            await api.delete(ENDPOINTS.EVALUATIONS.ADMIN_DELETE(id));
            showToast({ type: 'success', title: 'تم الحذف', message: 'تم حذف التقييم بنجاح' });
            fetchEvaluations();
        } catch (error) {
            showToast({ type: 'error', title: 'خطأ', message: 'فشل حذف التقييم' });
        }
    };

    return (
        <div className="p-6 space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">إدارة التقييمات الأسبوعية</h1>
                    <p className="text-[var(--text-secondary)] font-bold opacity-70">إدارة الملفات والمراجعات لكل المراحل والمواد الدراسية</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-brand-500 text-white rounded-2xl font-black shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                    <Plus className="w-5 h-5" />
                    إضافة تقييم جديد
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)]">
                    <Loader2 className="w-12 h-12 animate-spin text-brand-500 mb-4" />
                    <p className="font-black text-sm text-[var(--text-secondary)]">جاري جلب التقييمات...</p>
                </div>
            ) : (
                <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-2xl shadow-black/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                                    <th className="p-6 font-black text-sm">العنوان</th>
                                    <th className="p-6 font-black text-sm text-center">المرحلة / الصف</th>
                                    <th className="p-6 font-black text-sm text-center">النوع</th>
                                    <th className="p-6 font-black text-sm text-center">المادة</th>
                                    <th className="p-6 font-black text-sm text-center">التنزيلات</th>
                                    <th className="p-6 font-black text-sm text-center">الملفات</th>
                                    <th className="p-6 font-black text-sm text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {evaluations.map((ev) => (
                                    <tr key={ev.id} className="hover:bg-brand-500/[0.02] transition-colors group">
                                        <td className="p-6">
                                            <div className="font-black text-[var(--text-primary)] group-hover:text-brand-500 transition-colors">{ev.title}</div>
                                            <div className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50 mt-1 uppercase tracking-widest leading-none">
                                                Created at: {new Date(ev.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="text-xs font-black text-brand-500 uppercase tracking-widest mb-1">
                                                {EDUCATION_STAGES.find(s => s.id === ev.education_stage)?.label}
                                            </div>
                                            <div className="text-xs font-bold text-[var(--text-secondary)] opacity-70">
                                                السنة الدراسي {ev.grade_level}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className={clsx(
                                                "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border",
                                                ev.resource_type === 'study_material' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-brand-500/10 text-brand-500 border-brand-500/20"
                                            )}>
                                                {ev.resource_type === 'study_material' ? 'مذكرة' : 'تقييم'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="px-4 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 font-black text-xs border border-blue-500/20">
                                                {ev.subject || 'عام'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="px-4 py-1.5 rounded-xl bg-brand-500/5 text-brand-500 font-black text-xs">
                                                {ev.downloads_count} تنزيل
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-center gap-2">
                                                {ev.files?.map((f, i) => (
                                                    <div
                                                        key={i}
                                                        className="group/thumb relative w-10 h-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center cursor-pointer shadow-sm hover:border-brand-500/50 transition-all"
                                                        title={f.file_type}
                                                        onClick={() => window.open(f.url, '_blank')}
                                                    >
                                                        {f.file_type === 'pdf' ? (
                                                            <FileText className="w-5 h-5 text-red-500" />
                                                        ) : (
                                                            <img src={f.url} alt="Preview" className="w-full h-full object-cover group-hover/thumb:scale-125 transition-transform" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ImageIcon className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleDelete(ev.id)}
                                                className="p-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-95"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {evaluations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="text-[var(--text-secondary)] text-sm font-black opacity-30 flex flex-col items-center gap-4">
                                                <Search className="w-12 h-12" />
                                                لا يوجد أي تقييمات حالياً
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Upload Modal - Premium Redesign */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/50 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="w-full max-w-2xl bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-color)] shadow-3xl overflow-hidden"
                    >
                        <div className="p-10 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-brand-500/[0.02] to-transparent">
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">إضافة تقييم جديد</h2>
                                <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Resource Creation Portal</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all text-[var(--text-secondary)] hover:text-brand-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3 col-span-2">
                                    <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">عنوان التقييم</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="مثال: تقييم الكيمياء العضوية - المحاضرة الأولى"
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-all font-black text-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">المرحلة</label>
                                    <select
                                        value={formData.education_stage}
                                        onChange={(e) => setFormData({ ...formData, education_stage: e.target.value, grade_level: GRADE_LEVELS[e.target.value][0].id.toString() })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-all font-black text-sm"
                                    >
                                        {EDUCATION_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">السنة الدراسية</label>
                                    <select
                                        value={formData.grade_level}
                                        onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-all font-black text-sm"
                                    >
                                        {GRADE_LEVELS[formData.education_stage].map(g => (
                                            <option key={g.id} value={g.id}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3 col-span-2">
                                    <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">نوع المورد</label>
                                    <div className="flex gap-4">
                                        {[
                                            { id: 'evaluation', label: 'تقييم أسبوعي (عداد وقت)' },
                                            { id: 'study_material', label: 'مذكرة تعليمية (مشاركة واتساب)' }
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, resource_type: type.id as any })}
                                                className={clsx(
                                                    "flex-1 py-4 rounded-2xl border-2 font-black text-sm transition-all",
                                                    formData.resource_type === type.id
                                                        ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20"
                                                        : "bg-[var(--bg-main)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-500/40"
                                                )}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 col-span-2">
                                    <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">المادة الدراسية (لغات وعربي)</label>
                                    <div className="relative group">
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl px-6 py-4 outline-none focus:border-brand-500 transition-all font-black text-sm appearance-none"
                                        >
                                            {EVALUATION_SUBJECTS.map(s => (
                                                <option key={s.id} value={s.ar}>{s.ar} / {s.en}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ImageIcon className="w-4 h-4 text-brand-500/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">وصف إضافي (اختياري)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full h-32 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-3xl px-6 py-5 outline-none focus:border-brand-500 transition-all font-bold text-sm resize-none shadow-inner"
                                    placeholder="اكتب تفاصيل إضافية عن الملفات أو تعليمات للطلاب..."
                                />
                            </div>

                            {/* File Upload Area */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-brand-500 mr-4 uppercase tracking-widest">الملفات المرفقة (صور أو PDF)</label>
                                <div
                                    onClick={() => document.getElementById('eval-file-upload')?.click()}
                                    className="border-2 border-dashed border-brand-500/10 hover:border-brand-500/40 rounded-[2.5rem] p-12 flex flex-col items-center justify-center cursor-pointer bg-brand-500/[0.02] transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        className="w-16 h-16 bg-brand-500/10 rounded-3xl flex items-center justify-center mb-4 text-brand-500 relative z-10"
                                    >
                                        <Upload className="w-8 h-8" />
                                    </motion.div>
                                    <p className="font-black text-[var(--text-primary)] relative z-10">اضغط لرفع الملفات</p>
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-2 opacity-50 relative z-10 uppercase tracking-widest">(PNG, JPG, PDF) • Max 5MB per file</p>
                                    <input
                                        id="eval-file-upload"
                                        type="file"
                                        multiple
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setSelectedFiles([...selectedFiles, ...files]);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Selected Files List */}
                            {selectedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {selectedFiles.map((file, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={idx}
                                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-brand-500/10 text-brand-500 font-black text-xs border border-brand-500/10 group/item"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="max-w-[120px] truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))}
                                                className="hover:scale-125 transition-transform p-1 hover:text-rose-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <button
                                    disabled={isSubmitting}
                                    className="w-full py-6 rounded-[2rem] bg-brand-500 text-white font-black text-lg shadow-2xl shadow-brand-500/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-4"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                    {isSubmitting ? 'جاري الحفظ والرفع...' : 'حفظ التقييم ونشره الآن'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
