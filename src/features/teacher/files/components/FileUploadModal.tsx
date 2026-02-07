import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Link, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export function FileUploadModal({ isOpen, onClose, onSubmit }: FileUploadModalProps) {
    const [fileName, setFileName] = useState('');
    const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
    const [fileUrl, setFileUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: fileName,
            type: uploadType,
            data: uploadType === 'file' ? selectedFile : fileUrl
        });
        onClose();
        // Reset form
        setFileName('');
        setUploadType('file');
        setFileUrl('');
        setSelectedFile(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-l from-brand-500/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">إضافة ملف جديد</h2>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-xl hover:bg-[var(--bg-main)] text-[var(--text-secondary)] transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* File Name */}
                            <div className="space-y-3">
                                <label className="text-sm font-black text-[var(--text-secondary)] px-2">اسم الملف للمكتبة</label>
                                <input
                                    required
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    placeholder="مثال: مذكرة الكيمياء - الفصل الأول"
                                    className="w-full h-16 px-6 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all"
                                />
                            </div>

                            {/* Type Toggle */}
                            <div className="grid grid-cols-2 gap-4 p-1.5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)]">
                                <button
                                    type="button"
                                    onClick={() => setUploadType('file')}
                                    className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black transition-all ${uploadType === 'file' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>رفع من الجهاز</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadType('link')}
                                    className={`h-12 rounded-xl flex items-center justify-center gap-2 font-black transition-all ${uploadType === 'link' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <Link className="w-4 h-4" />
                                    <span>رابط خارجي</span>
                                </button>
                            </div>

                            {/* Upload Area */}
                            {uploadType === 'file' ? (
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-4 border-dashed border-[var(--border-color)] rounded-[2rem] p-12 flex flex-col items-center justify-center gap-4 group-hover:border-brand-500/50 group-hover:bg-brand-500/5 transition-all">
                                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)] group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                            {selectedFile ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />}
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-[var(--text-primary)] text-lg">
                                                {selectedFile ? selectedFile.name : 'اسحب الملف هنا أو اضغط للاختيار'}
                                            </p>
                                            <p className="text-xs font-bold text-[var(--text-secondary)] mt-2 opacity-60">
                                                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'يدعم PDF, MP4, PNG, JPG (الحد الأقصى 50MB)'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-[var(--text-secondary)] px-2">رابط الملف المباشر</label>
                                    <div className="relative">
                                        <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)] opacity-40" />
                                        <input
                                            required
                                            type="url"
                                            value={fileUrl}
                                            onChange={(e) => setFileUrl(e.target.value)}
                                            placeholder="https://drive.google.com/..."
                                            className="w-full h-16 px-6 pl-14 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-brand-500 transition-all dir-ltr"
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-amber-500/80 px-2 italic">تأكد من أن الرابط مباشر ومتاح للتحميل</p>
                                </div>
                            )}

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
                                    className="flex-[2] h-16 rounded-2xl bg-brand-500 text-white font-black shadow-xl shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-105 transition-all active:scale-95"
                                >
                                    إضافة للمكتبة
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
