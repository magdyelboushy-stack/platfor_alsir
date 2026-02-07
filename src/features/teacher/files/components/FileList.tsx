import { FileRow } from './FileRow';
import { motion } from 'framer-motion';

interface FileListProps {
    files: any[];
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
}

export function FileList({ files, onDownload, onDelete }: FileListProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5"
        >
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full">
                    <thead className="bg-[var(--bg-main)]/50 border-b border-[var(--border-color)]">
                        <tr>
                            <th className="text-right py-6 px-8 text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">اسم الملف</th>
                            <th className="text-right py-6 px-8 text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">الحجم</th>
                            <th className="text-right py-6 px-8 text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">تاريخ الرفع</th>
                            <th className="text-right py-6 px-8 text-xs font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">التنزيلات</th>
                            <th className="py-6 px-8"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {files.length > 0 ? (
                            files.map((file) => (
                                <FileRow
                                    key={file.id}
                                    file={file}
                                    onDownload={onDownload}
                                    onDelete={onDelete}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                                        <div className="w-20 h-20 rounded-full bg-[var(--bg-main)] border border-[var(--border-color)] flex items-center justify-center mb-6">
                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <p className="font-black text-xl">لا توجد ملفات حالياً</p>
                                        <p className="font-bold text-sm mt-2">ابدأ برفع أول مذكرة أو كتاب دراسي لمكتبتك</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
