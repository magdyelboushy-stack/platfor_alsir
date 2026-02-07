import { FileText, Download, Trash2, Clock, MoreVertical, FileCode, FileVideo, FileImage } from 'lucide-react';

interface FileRowProps {
    file: any;
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
}

export function FileRow({ file, onDownload, onDelete }: FileRowProps) {
    const getFileIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('pdf')) return { icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' };
        if (t.includes('video') || t.includes('mp4')) return { icon: FileVideo, color: 'text-amber-500', bg: 'bg-amber-500/10' };
        if (t.includes('image') || t.includes('jpg')) return { icon: FileImage, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
        return { icon: FileCode, color: 'text-cyan-500', bg: 'bg-cyan-500/10' };
    };

    const fileStyle = getFileIcon(file.type);

    return (
        <tr className="group hover:bg-[var(--bg-main)]/50 transition-all">
            <td className="py-6 px-8">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${fileStyle.bg} ${fileStyle.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <fileStyle.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="font-black text-[var(--text-primary)] text-lg group-hover:text-brand-500 transition-colors leading-tight truncate">
                            {file.display_name || file.original_name || file.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1 opacity-60">
                            {file.type}
                        </p>
                    </div>
                </div>
            </td>

            <td className="py-6 px-8">
                <span className="px-3 py-1.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-black dir-ltr">
                    {file.size}
                </span>
            </td>

            <td className="py-6 px-8 whitespace-nowrap">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] font-bold">
                    <Clock className="w-4 h-4 opacity-40" />
                    <span className="text-sm">{file.date}</span>
                </div>
            </td>

            <td className="py-6 px-8">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Download className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-black text-[var(--text-primary)]">{file.downloads}</span>
                </div>
            </td>

            <td className="py-6 px-8 text-left">
                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <button
                        onClick={() => onDownload(file.id)}
                        className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center border border-cyan-500/20"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(file.id)}
                        className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-500/20"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="w-12 h-12 rounded-xl bg-[var(--bg-main)] text-[var(--text-secondary)] hover:text-brand-500 transition-colors flex items-center justify-center border border-[var(--border-color)]">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
