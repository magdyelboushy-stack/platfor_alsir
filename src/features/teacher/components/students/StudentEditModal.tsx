import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCog, Phone, GraduationCap, MapPin, Save, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { EDUCATION_SYSTEM } from '@/core/utils/educationMapping';
import { EGYPT_LOCATIONS } from '@/core/data/egypt-locations';
import { clsx } from 'clsx';

interface StudentEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData: any;
    isUpdating: boolean;
}

export function StudentEditModal({ isOpen, onClose, onSubmit, initialData, isUpdating }: StudentEditModalProps) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [parentPhone, setParentPhone] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [educationStage, setEducationStage] = useState('');
    const [governorate, setGovernorate] = useState('');
    const [city, setCity] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setPhone(initialData.phone || '');
            setParentPhone(initialData.parentPhone || '');
            setGuardianName(initialData.guardianName || '');
            setGradeLevel(String(initialData.gradeLevel || ''));
            setEducationStage(initialData.educationStage || '');
            setGovernorate(initialData.governorate || '');
            setCity(initialData.city || '');
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            phone,
            parent_phone: parentPhone,
            guardian_name: guardianName,
            grade_level: gradeLevel,
            education_stage: educationStage,
            governorate,
            city
        });
    };

    const inputClassName = "w-full h-14 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all";
    const labelClassName = "text-xs font-black text-[var(--text-secondary)] px-2 mb-1 block";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-l from-brand-500/5 to-transparent shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                    <UserCog className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-black text-[var(--text-primary)]">
                                    تعديل بيانات الطالب
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {/* Section: Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-brand-500 flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4" />
                                    البيانات الشخصية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClassName}>الاسم بالكامل</label>
                                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClassName} placeholder="الاسم ثلاثي" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClassName}>رقم الهاتف</label>
                                        <div className="relative">
                                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-40" />
                                            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={clsx(inputClassName, "pr-12 text-left")} dir="ltr" placeholder="012345678912" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Guardian Info */}
                            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                <h3 className="text-sm font-black text-brand-500 flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4" />
                                    بيانات ولي الأمر
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClassName}>اسم ولي الأمر</label>
                                        <input required type="text" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className={inputClassName} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClassName}>رقم هاتف ولي الأمر</label>
                                        <div className="relative">
                                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] opacity-40" />
                                            <input required type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className={clsx(inputClassName, "pr-12 text-left")} dir="ltr" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Educational Info */}
                            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                <h3 className="text-sm font-black text-brand-500 flex items-center gap-2 mb-4">
                                    <GraduationCap className="w-4 h-4" />
                                    البيانات الدراسية
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClassName}>المرحلة الدراسية</label>
                                        <select
                                            required
                                            value={educationStage}
                                            onChange={(e) => {
                                                setEducationStage(e.target.value);
                                                setGradeLevel('');
                                            }}
                                            className={inputClassName}
                                        >
                                            <option value="">اختر المرحلة</option>
                                            {EDUCATION_SYSTEM.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClassName}>الصف الدراسي</label>
                                        <select
                                            required
                                            value={gradeLevel}
                                            onChange={(e) => setGradeLevel(e.target.value)}
                                            className={inputClassName}
                                            disabled={!educationStage}
                                        >
                                            <option value="">اختر الصف</option>
                                            {EDUCATION_SYSTEM.find(s => s.id === educationStage)?.grades.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Location Info */}
                            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                <h3 className="text-sm font-black text-brand-500 flex items-center gap-2 mb-4">
                                    <MapPin className="w-4 h-4" />
                                    الموقع الجغرافي
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClassName}>المحافظة</label>
                                        <select
                                            required
                                            value={governorate}
                                            onChange={(e) => {
                                                setGovernorate(e.target.value);
                                                setCity('');
                                            }}
                                            className={inputClassName}
                                        >
                                            <option value="">اختر المحافظة</option>
                                            {Object.keys(EGYPT_LOCATIONS).map(gov => <option key={gov} value={gov}>{gov}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClassName}>المدينة / المنطقة</label>
                                        <select
                                            required
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className={inputClassName}
                                            disabled={!governorate}
                                        >
                                            <option value="">اختر المدينة</option>
                                            {governorate && EGYPT_LOCATIONS[governorate as keyof typeof EGYPT_LOCATIONS].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-main)]/50 shrink-0">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 h-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-black hover:bg-[var(--bg-card)] transition-all"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isUpdating}
                                    className="flex-[2] h-14 rounded-2xl bg-brand-500 text-white font-black shadow-xl shadow-brand-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            حفظ التعديلات
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
