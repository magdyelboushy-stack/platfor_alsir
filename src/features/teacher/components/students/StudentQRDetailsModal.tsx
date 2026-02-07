import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ShieldCheck, Phone, Mail } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

interface StudentQRDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}

export function StudentQRDetailsModal({ isOpen, onClose, student }: StudentQRDetailsModalProps) {
    const qrRef = useRef<HTMLCanvasElement>(null);

    const downloadQR = () => {
        if (!qrRef.current) return;
        const canvas = qrRef.current;
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `QR_${student.name}_${student.id}.png`;
        link.click();
    };

    const qrData = `
بطاقة هوية طالب - السير الشامي
الاسم: ${student.name}
الـ ID: ${student.id}
الموبايل: ${student.phone}
البريد: ${student.email || 'غير مسجل'}
الحالة: نشط
`.trim();

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
                        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-brand-500/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        dir="rtl"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-brand-600/20 to-transparent pointer-events-none" />

                        {/* Scrollable Content Container */}
                        <div className="overflow-y-auto custom-scrollbar flex-1 relative z-10 p-8">
                            {/* Top Bar */}
                            <div className="flex justify-between items-center mb-8 sticky top-0 bg-[var(--bg-card)]/80 backdrop-blur-md pb-4 pt-0 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/10">
                                        <ShieldCheck className="w-6 h-6 text-brand-500" />
                                    </div>
                                    <h3 className="text-xl font-black text-[var(--text-primary)]">هوية الطالب الرقمية</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors border border-transparent hover:border-rose-500/20"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex flex-col items-center gap-8">
                                {/* QR Code Container */}
                                <div className="relative group/qr">
                                    <div className="p-6 bg-white rounded-[2.5rem] shadow-2xl border-4 border-brand-500/10 group-hover:border-brand-500/30 transition-all duration-500">
                                        <QRCodeCanvas
                                            ref={qrRef}
                                            value={qrData}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            fgColor="#342718"
                                        />
                                    </div>
                                    <div className="absolute -inset-4 bg-brand-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                </div>

                                {/* Student Info Card */}
                                <div className="w-full space-y-4 bg-white/5 p-6 rounded-[2rem] border border-brand-500/5">
                                    <div className="text-center mb-4">
                                        <h4 className="text-2xl font-black text-[var(--text-primary)]">{student.name}</h4>
                                        <p className="text-brand-500 font-bold text-[10px] uppercase tracking-wider mt-1 opacity-80 break-all select-all hover:bg-brand-500/10 transition-colors p-1 rounded-lg">ID: {student.id}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        <InfoRow icon={Phone} label="رقم الهاتف" value={student.phone} />
                                        <InfoRow icon={Mail} label="البريد الإلكتروني" value={student.email || 'غير مسجل'} />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-4 w-full pt-2">
                                    <button
                                        onClick={downloadQR}
                                        className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-brand-500 text-white font-black hover:bg-brand-600 shadow-xl shadow-brand-500/20 transition-all active:scale-95 border border-brand-400/20"
                                    >
                                        <Download className="w-5 h-5" />
                                        تحميل بطاقة الهوية
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Logo/Brand Overlay */}
                        <div className="p-4 bg-brand-500/5 border-t border-brand-500/10 flex justify-center opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500">Bacaloria Elite System</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 bg-[var(--bg-card)] p-3 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center border border-brand-500/10">
                <Icon className="w-4 h-4 text-brand-500" />
            </div>
            <div className="flex flex-col text-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-bold text-[var(--text-primary)]">{value}</span>
            </div>
        </div>
    );
}
