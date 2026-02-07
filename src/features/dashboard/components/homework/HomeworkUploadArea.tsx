import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function HomeworkUploadArea() {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (file.type !== 'application/pdf') {
            alert('عذراً، يجب اختيار ملف PDF فقط!');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('حجم الملف كبير جداً (الأقصى 20 ميجا)');
            return;
        }
        setSelectedFile(file);
        setUploadStatus('idle');
    };

    const startUpload = () => {
        if (!selectedFile) return;
        setUploadStatus('uploading');
        let p = 0;
        const interval = setInterval(() => {
            p += 5;
            setProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                setUploadStatus('success');
            }
        }, 100);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div
                className={clsx(
                    "relative border-2 border-dashed rounded-[3rem] p-12 flex flex-col items-center justify-center text-center transition-all duration-500",
                    isDragging ? "border-[var(--color-brand)] bg-brand-500/5 scale-[1.02]" : "border-brand-500/10 bg-white/5 backdrop-blur-md",
                    selectedFile ? "border-emerald-500/30 bg-emerald-500/5" : "hover:border-brand-500/40"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="w-24 h-24 rounded-[2rem] bg-brand-500/10 flex items-center justify-center mx-auto border border-brand-500/20 shadow-xl">
                                <Upload className="w-10 h-10 text-[var(--color-brand)]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">ارفع واجبك الآن</h3>
                                <p className="text-sm font-bold text-[var(--text-secondary)] opacity-60 max-w-xs mx-auto">
                                    اسحب ملف الـ <span className="text-rose-500 font-black">PDF</span> هنا أو اضغط للاختيار
                                </p>
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-10 py-4 rounded-2xl bg-[var(--color-brand)] text-white font-black hover:scale-105 transition-all shadow-xl shadow-brand-500/30"
                            >
                                اختيار ملف PDF
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full space-y-8"
                        >
                            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/10 border border-emerald-500/20 shadow-lg">
                                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                                    <FileText className="w-8 h-8 text-rose-500" />
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="font-black text-[var(--text-primary)] truncate text-lg line-clamp-1">{selectedFile.name}</p>
                                    <p className="text-xs font-bold text-[var(--text-secondary)] opacity-60">
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-3 rounded-full hover:bg-rose-500/20 text-rose-500 transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {uploadStatus === 'uploading' && (
                                <div className="space-y-3 px-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-[var(--color-brand)] uppercase tracking-widest text-right">جاري التحميل الفائق...</span>
                                        <span className="text-sm font-black text-[var(--text-primary)]">{progress}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-brand-600 to-brand-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {uploadStatus === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 text-emerald-500"
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <p className="text-xl font-black">تم التسليم بنجاح!</p>
                                </motion.div>
                            ) : (
                                <button
                                    onClick={startUpload}
                                    disabled={uploadStatus === 'uploading'}
                                    className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/40 disabled:opacity-50"
                                >
                                    {uploadStatus === 'uploading' ? 'جاري المعالجة...' : 'تأكيد التسليم النهائي'}
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Instructions Luxe Card */}
            <div className="space-y-6">
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-brand-600/10 to-transparent border border-brand-500/20 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full" />
                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3 relative z-10">
                        <AlertCircle className="w-6 h-6 text-[var(--color-brand)]" />
                        تعليمات هامة جداً
                    </h3>
                    <ul className="space-y-4 relative z-10">
                        {[
                            'يجب أن يكون الملف بصيغة PDF فقط.',
                            'تأكد من أن اسمك ورقم الواجب واضحان في الصفحة الأولى.',
                            'حاول أن يكون حجم الملف أقل من 20 ميجا لسرعة الرفع.',
                            'يتم مراجعة الواجبات خلال 24-48 ساعة عمل.',
                            'في حال ظهرت لك علامة X، يرجى إعادة الرفع بصيغة صحيحة.'
                        ].map((text, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold text-[var(--text-secondary)] leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] mt-2 shrink-0" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
