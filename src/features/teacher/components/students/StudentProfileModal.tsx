import { motion, AnimatePresence } from 'framer-motion';
import {
    X, User, Phone, MapPin,
    Calendar, Download, Target
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef, useState, useEffect } from 'react';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/store/uiStore';
import { formatEducationValue } from '@/core/utils/educationMapping';
import { getImageUrl } from '@/core/utils/url';
import { clsx } from 'clsx';


interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    onEdit?: (student: any) => void;
    onRefresh?: () => void;
}

export function StudentProfileModal({ isOpen, onClose, student, onEdit, onRefresh }: StudentProfileModalProps) {
    const { user, hasRole } = useAuthStore();
    const toast = useToast();
    const qrRef = useRef<HTMLCanvasElement>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'courses'>('profile');

    useEffect(() => {
        const fetchCourses = async () => {
            if (!isOpen || !student?.id) return;
            try {
                const res = await apiClient.get(ENDPOINTS.ADMIN.STUDENT_COURSES_DETAIL(student.id));
                setCourses(res.data || []);
            } catch (err) {
                // silent fail; keep profile visible
            }
        };
        fetchCourses();
    }, [isOpen, student?.id]);

    // Permissions check
    const canManage = user?.role === 'teacher' || user?.role === 'admin' ||
        (user?.role === 'assistant' && hasRole('assistant') && (user as any).permissions?.includes('students'));

    const avatarUrl = getImageUrl(student?.avatar);

    if (!student) return null;

    const qrData = `
بطاقة هوية طالب - السير الشامي
الاسم: ${student.name}
الـ ID: ${student.id}
الموبايل: ${student.phone}
البريد: ${student.email || 'غير مسجل'}
الحالة: نشط
`.trim();

    const downloadQR = () => {
        if (!qrRef.current) return;
        const canvas = qrRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR_${student.name}_${student.id}.png`;
        link.click();
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.UPDATE_STUDENT_STATUS(student.id), { status: newStatus });
            toast.show({
                type: 'success',
                title: 'تم التحديث',
                message: 'تم تغيير حالة الطالب بنجاح'
            });
            onRefresh?.();
            onClose();
        } catch (error: any) {
            if (error.response?.status !== 403 && error.response?.status !== 401) {
                toast.show({
                    type: 'error',
                    title: 'خطأ',
                    message: error.response?.data?.error || 'فشل تحديث حالة الطالب'
                });
            }
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف حساب هذا الطالب نهائياً؟')) return;

        setIsUpdating(true);
        try {
            await apiClient.post(ENDPOINTS.ADMIN.DELETE_STUDENT(student.id));
            toast.show({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم حذف حساب الطالب بنجاح'
            });
            onRefresh?.();
            onClose();
        } catch (error: any) {
            if (error.response?.status !== 403 && error.response?.status !== 401) {
                toast.show({
                    type: 'error',
                    title: 'خطأ',
                    message: error.response?.data?.error || 'فشل حذف الطالب'
                });
            }
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-[var(--bg-main)] border border-brand-500/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        dir="rtl"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-brand-600/10 to-transparent pointer-events-none" />

                        {/* Top Bar */}
                        <div className="flex justify-between items-center p-8 pb-4 relative z-20">
                            <h3 className="text-2xl font-black text-[var(--text-primary)] font-display tracking-tight">ملف بيانات الطالب</h3>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-colors border border-transparent hover:border-rose-500/20 bg-white/5"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0 space-y-8 relative z-10">
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <button onClick={() => setActiveTab('profile')} className={clsx('px-4 py-2 rounded-xl text-sm font-black', activeTab === 'profile' ? 'bg-brand-500 text-white' : 'bg-white/5 text-[var(--text-primary)]')}>البيانات</button>
                                    <button onClick={() => setActiveTab('courses')} className={clsx('px-4 py-2 rounded-xl text-sm font-black', activeTab === 'courses' ? 'bg-brand-500 text-white' : 'bg-white/5 text-[var(--text-primary)]')}>الكورسات والمتابعة</button>
                                </div>
                            </div>

                            {activeTab === 'profile' && (
                                <>
                                    {/* Identity Hub */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                        {/* Left: Profile Info */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-brand-500/10 shadow-sm relative overflow-hidden">
                                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                                    <div className="w-32 h-32 rounded-[2.5rem] bg-brand-500/10 border-4 border-brand-500/10 overflow-hidden shadow-2xl shrink-0">
                                                        {avatarUrl ? (
                                                            <img src={avatarUrl} className="w-full h-full object-cover" alt={student.name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-brand-500 bg-white/5">
                                                                <User className="w-16 h-16" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-center md:text-right flex-1">
                                                        <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">{student.name}</h1>
                                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                            <span className="px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20 text-xs font-black uppercase tracking-widest leading-none">
                                                                {formatEducationValue(student.gradeLevel)}
                                                            </span>
                                                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-black uppercase tracking-widest leading-none flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                طالب نشط
                                                            </span>
                                                        </div>
                                                        <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-white/20 uppercase tracking-[0.2em] break-all">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed Stats Bento */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <StatBox icon={Phone} label="رقم الطالب" value={student.phone} color="brand" />
                                                <StatBox icon={MapPin} label="المحافظة" value={student.governorate} color="indigo" />
                                                <StatBox icon={Calendar} label="تاريخ الانضمام" value={student.joinedAt} color="rose" />
                                                <StatBox icon={Target} label="التقييم" value="94%" color="emerald" />
                                            </div>
                                        </div>

                                        {/* Right: QR & Quick Actions */}
                                        <div className="space-y-6">
                                            <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border-2 border-brand-500/10 shadow-inner flex flex-col items-center gap-6 group/qr relative overflow-hidden">
                                                <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-brand-500/5 transition-transform group-hover/qr:scale-105 duration-500">
                                                    <QRCodeCanvas
                                                        ref={qrRef}
                                                        value={qrData}
                                                        size={180}
                                                        level="H"
                                                        includeMargin={true}
                                                        fgColor="#342718"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-black text-[var(--text-primary)] opacity-60">كود الهوية الرقمية</p>
                                                    <button
                                                        onClick={downloadQR}
                                                        className="mt-3 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-all text-xs font-black border border-brand-500/10"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        تحميل الكود
                                                    </button>
                                                </div>
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 blur-3xl -z-10" />
                                            </div>

                                            {canManage && (
                                                <div className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-brand-500/10 flex flex-col gap-3">
                                                    <button
                                                        onClick={() => onEdit?.(student)}
                                                        className="w-full py-4 rounded-2xl bg-brand-500/10 text-brand-500 font-black text-sm border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all mb-2"
                                                    >
                                                        تعديل بيانات الطالب
                                                    </button>
                                                    {student.status !== 'active' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate('active')}
                                                            disabled={isUpdating}
                                                            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                                                        >
                                                            تفعيل حساب الطالب
                                                        </button>
                                                    )}
                                                    {student.status !== 'blocked' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate('blocked')}
                                                            disabled={isUpdating}
                                                            className="w-full py-4 rounded-2xl border border-rose-500/20 text-rose-500 font-black text-sm hover:bg-rose-500/5 transition-all disabled:opacity-50"
                                                        >
                                                            حظر حساب الطالب
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleDelete}
                                                        disabled={isUpdating}
                                                        className="w-full py-4 rounded-2xl text-slate-400 font-black text-xs hover:text-rose-500 transition-all opacity-60 hover:opacity-100"
                                                    >
                                                        حذف الطالب نهائياً
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </>
                            )}

                            {activeTab === 'courses' && (
                                <div className="space-y-6">
                                    {courses.length === 0 ? (
                                        <div className="text-center text-sm text-slate-400">لا توجد بيانات كورسات مسجلة لهذا الطالب</div>
                                    ) : (
                                        courses.map((course) => (
                                            <div key={course.id} className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-brand-500/10">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-black text-[var(--text-primary)]">{course.title}</h4>
                                                        <p className="text-xs text-slate-400">نسبة الإنجاز: {course.progress}% • مكتمل: {course.completedLessons}/{course.lessons}</p>
                                                    </div>
                                                    {course.thumbnail && (
                                                        <img src={course.thumbnail} className="w-16 h-16 rounded-xl object-cover border border-brand-500/10" />
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {course.lessonDetails?.map((l: any) => (
                                                        <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-brand-500/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500 text-xs font-black">
                                                                    {l.type === 'video' ? 'فيديو' : l.type === 'exam' ? 'امتحان' : 'ملف'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-black text-[var(--text-primary)]">{l.title}</p>
                                                                    <p className="text-[10px] text-slate-400">{l.duration}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={clsx('text-xs font-black', l.isCompleted ? 'text-emerald-500' : 'text-slate-400')}>{l.isCompleted ? 'مكتمل' : 'غير مكتمل'}</p>
                                                                <p className="text-[10px] text-slate-400">زمن المشاهدة: {Math.floor((l.watched_seconds || 0) / 60)} دقيقة</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Branding */}
                        <div className="p-4 bg-brand-500/5 border-t border-brand-500/10 flex justify-center opacity-30 shrink-0">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500">Bacaloria Elite Student Profile</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
    const colors: Record<string, string> = {
        brand: "text-brand-500 bg-brand-500/10 border-brand-500/5",
        indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
        emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    };

    return (
        <div className="bg-[var(--bg-card)] p-5 rounded-[2rem] border border-brand-500/5 flex flex-col items-center text-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm", colors[color])}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
                <span className="text-xs font-black text-[var(--text-primary)] truncate max-w-full">{value}</span>
            </div>
        </div>
    );
}
