// ============================================================
// FileCard - Individual File Display Component
// ============================================================

import { clsx } from 'clsx';
import {
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    File,
    Download,
    Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/core/utils/url';

export interface FileItem {
    id: number;
    name: string;
    type: 'pdf' | 'doc' | 'image' | 'video' | 'audio' | 'other';
    size: string;
    url: string;
    previewable?: boolean;
}

interface FileCardProps {
    file: FileItem;
    onPreview?: (file: FileItem) => void;
    index?: number;
}

const fileIcons: Record<string, React.ElementType> = {
    pdf: FileText,
    doc: FileText,
    image: FileImage,
    video: FileVideo,
    audio: FileAudio,
    other: File
};

const fileColors: Record<string, string> = {
    pdf: 'bg-red-500/10 text-red-500 border-red-500/20',
    doc: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    image: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    video: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    audio: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    other: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
};

export function FileCard({ file, onPreview, index = 0 }: FileCardProps) {
    const Icon = fileIcons[file.type] || File;
    const colorClass = fileColors[file.type] || fileColors.other;

    const downloadHref = getImageUrl(file.url);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-cyan-500/30 hover:shadow-lg transition-all group"
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border shrink-0",
                    colorClass
                )}>
                    <Icon className="w-7 h-7" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-[var(--text-primary)] truncate mb-1 group-hover:text-cyan-500 transition-colors">
                        {file.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
                        <span className="uppercase">{file.type}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]" />
                        <span>{file.size}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {file.previewable && onPreview && (
                        <button
                            onClick={() => onPreview(file)}
                            className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-cyan-500 hover:border-cyan-500/50 transition-all"
                            title="معاينة"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    <a
                        href={downloadHref}
                        download
                        target="_blank"
                        rel="noopener"
                        className="p-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-500/20"
                        title="تحميل"
                    >
                        <Download className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
