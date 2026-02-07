import { useState } from 'react';
import { X, User, Mail, Phone, Lock, BookOpen, GraduationCap, FileText, Loader2, Plus } from 'lucide-react';
import { apiClient } from '@/core/api/client';

interface TeacherFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TeacherFormModal({ isOpen, onClose, onSuccess }: TeacherFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        subject: '',
        gradeLevels: [] as string[],
        bio: '',
        avatar: null as File | null,
        banner: null as File | null
    });

    if (!isOpen) return null;

    const availableGradeLevels = [
        'الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي',
        'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            data.append('password', formData.password);
            data.append('subject', formData.subject);
            data.append('bio', formData.bio);

            // Append array data correctly
            formData.gradeLevels.forEach((level, index) => {
                data.append(`gradeLevels[${index}]`, level);
            });

            if (formData.avatar) {
                data.append('avatar', formData.avatar);
            }
            if (formData.banner) {
                data.append('banner', formData.banner);
            }

            await apiClient.post('/admin/teachers', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'حدث خطأ أثناء إضافة المعلم');
        } finally {
            setLoading(false);
        }
    };

    const toggleGradeLevel = (level: string) => {
        setFormData(prev => ({
            ...prev,
            gradeLevels: prev.gradeLevels.includes(level)
                ? prev.gradeLevels.filter(l => l !== level)
                : [...prev.gradeLevels, level]
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'banner') => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-blue-400" />
                        إضافة معلم جديد
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">اسم المعلم</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="الاسم الكامل"
                                />
                            </div>
                        </div>

                        {/* Subject Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">المادة الدراسية</label>
                            <div className="relative">
                                <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full h-[46px] bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors appearance-none"
                                >
                                    <option value="" disabled>اختر المادة</option>
                                    <option value="الرياضيات">الرياضيات</option>
                                    <option value="الغة الإنجليزية">اللغة الإنجليزية</option>
                                    <option value="الرياضيات">الرياضيات</option>
                                    <option value="الفيزياء">الفيزياء</option>
                                    <option value="الكيمياء">الكيمياء</option>
                                    <option value="الأحياء">الأحياء</option>
                                    <option value="التاريخ">التاريخ</option>
                                    <option value="الجغرافيا">الجغرافيا</option>
                                    <option value="الفلسفة والمنطق">الفلسفة والمنطق</option>
                                    <option value="علم النفس والاجتماع">علم النفس والاجتماع</option>
                                    <option value="الغة الفرنسية">اللغة الفرنسية</option>
                                    <option value="الغة الألمانية">اللغة الألمانية</option>
                                    <option value="الغة الإيطالية">اللغة الإيطالية</option>
                                    <option value="الغة الإسبانية">اللغة الإسبانية</option>
                                    <option value="الجيولوجيا">الجيولوجيا</option>
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="teacher@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">رقم الهاتف</label>
                            <div className="relative">
                                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="012345678912"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Avatar & Banner Upload */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Avatar */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">الصورة الشخصية (Avatar)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'avatar')}
                                        className="block w-full text-sm text-slate-400
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-xl file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-slate-700 file:text-blue-400
                                          hover:file:bg-slate-600
                                          cursor-pointer border border-slate-700 rounded-xl bg-slate-900"
                                    />
                                    {formData.avatar && (
                                        <p className="mt-1 text-xs text-green-400">تم اختيار: {formData.avatar.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Banner */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">صورة الغلاف (Banner)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                        className="block w-full text-sm text-slate-400
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-xl file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-slate-700 file:text-blue-400
                                          hover:file:bg-slate-600
                                          cursor-pointer border border-slate-700 rounded-xl bg-slate-900"
                                    />
                                    {formData.banner && (
                                        <p className="mt-1 text-xs text-green-400">تم اختيار: {formData.banner.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Grade Levels */}
                        <div className="col-span-1 md:col-span-2 space-y-3">
                            <label className="text-sm font-medium text-slate-400">الصفوف الدراسية</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableGradeLevels.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => toggleGradeLevel(level)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${formData.gradeLevels.includes(level)
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-800'
                                            : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-slate-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            {formData.gradeLevels.length === 0 && (
                                <p className="text-xs text-amber-500 font-medium">* يجب اختيار صف دراسي واحد على الأقل</p>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-400">نبذة تعريفية (اختياري)</label>
                            <div className="relative">
                                <FileText className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white focus:border-blue-500 focus:outline-none transition-colors min-h-[100px] resize-none"
                                    placeholder="اكتب نبذة مختصرة عن المعلم..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-slate-300 font-medium hover:text-white transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.gradeLevels.length === 0}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    جاري الإضافة...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    إضافة المعلم
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
