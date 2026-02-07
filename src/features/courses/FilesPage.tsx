// ============================================================
// FilesPage - Course Files & Downloads Page
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    FileText,
    FolderOpen,
    Download,
    Eye,
    X,
    Search,
    Grid,
    List as ListIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { Navbar } from '@/core/components/Navbar';
import { FileCard, FileItem } from '@/core/components/FileCard';
import { getImageUrl } from '@/core/utils/url';
import { apiClient } from '@/core/api/client';
import { ENDPOINTS } from '@/core/api/endpoints';
import { Helmet } from 'react-helmet-async';

type ViewMode = 'grid' | 'list';
type FileType = 'all' | 'pdf' | 'doc' | 'image' | 'video' | 'audio';

export function FilesPage() {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [filterType, setFilterType] = useState<FileType>('all');
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            try {
                setLoading(true);
                // Fetch Course Details
                const res = await apiClient.get(ENDPOINTS.COURSES.DETAIL(courseId));
                const courseData = res.data;
                setCourse(courseData);

                // Consolidate files from all lessons
                const extractedFiles: FileItem[] = [];

                courseData.sections?.forEach((section: any) => {
                    section.lessons?.forEach((lesson: any) => {
                        lesson.attachments?.forEach((att: any) => {
                            extractedFiles.push({
                                id: att.id,
                                name: att.name || lesson.title,
                                type: att.type,
                                size: att.size || 'Unknown',
                                url: att.url,
                                previewable: ['pdf', 'image', 'video'].includes(att.type)
                            });
                        });
                    });
                });

                setFiles(extractedFiles);

            } catch (error) {
                console.error("Failed to fetch course files:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId]);

    // Filter & Search
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || file.type === filterType;
        return matchesSearch && matchesType;
    });

    const fileTypeCounts = {
        all: files.length,
        pdf: files.filter(f => f.type === 'pdf').length,
        doc: files.filter(f => f.type === 'doc').length,
        image: files.filter(f => f.type === 'image').length,
        video: files.filter(f => f.type === 'video').length,
        audio: files.filter(f => f.type === 'audio').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <div className="text-xl font-bold text-brand-500">جاري تحميل الملفات...</div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center">
                <div className="text-xl font-bold text-red-500">الكورس غير موجود</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] transition-colors" dir="rtl">
            <Helmet>
                <title>{`ملفات ومرفقات - ${course.title}`}</title>
                <meta
                    name="description"
                    content={`تحميل ملفات ${course.title}${course.teacher?.name ? ` مع ${course.teacher.name}` : ''}: PDF، صور، فيديو، مستندات.`}
                />
                <meta
                    name="keywords"
                    content={[
                        'ملفات', 'PDF', 'مرفقات', 'تحميل',
                        course.title,
                        course.teacher?.name || ''
                    ].filter(Boolean).join(', ')}
                />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
            </Helmet>
            <Navbar />

            {/* Header */}
            <header className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                        <Link to="/courses" className="hover:text-cyan-500 transition-colors font-bold">الكورسات</Link>
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <Link to={`/course/${courseId}`} className="hover:text-cyan-500 transition-colors font-bold">{course.title}</Link>
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        <span className="text-cyan-500 font-black">الملفات والمرفقات</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <FolderOpen className="w-8 h-8 text-cyan-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-1">الملفات والمرفقات</h1>
                            <p className="text-[var(--text-secondary)] font-bold">
                                {course.title}
                                {course.teacher?.name ? <span className="opacity-70 mx-2">• {course.teacher.name}</span> : ''}
                                • {files.length} ملف
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في الملفات..."
                            className="w-full pl-4 pr-12 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-3 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-cyan-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            )}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-3 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-cyan-500 text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            )}
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {(['all', 'pdf', 'doc', 'image', 'video', 'audio'] as FileType[]).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={clsx(
                                "px-5 py-2.5 rounded-xl font-bold text-sm transition-all border",
                                filterType === type
                                    ? "bg-cyan-500 text-white border-cyan-500"
                                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-cyan-500/50"
                            )}
                        >
                            {type === 'all' && 'الكل'}
                            {type === 'pdf' && 'PDF'}
                            {type === 'doc' && 'مستندات'}
                            {type === 'image' && 'صور'}
                            {type === 'video' && 'فيديو'}
                            {type === 'audio' && 'صوت'}
                            <span className="mr-2 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-xs">
                                {fileTypeCounts[type]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Files List/Grid */}
                {filteredFiles.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">لا توجد ملفات</h3>
                        <p className="text-[var(--text-secondary)] font-bold">جرب تغيير كلمات البحث أو الفلتر</p>
                    </div>
                ) : (
                    <div className={clsx(
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "space-y-4"
                    )}>
                        {filteredFiles.map((file, index) => (
                            <FileCard
                                key={file.id}
                                file={file}
                                index={index}
                                onPreview={file.previewable ? setPreviewFile : undefined}
                            />
                        ))}
                    </div>
                )}

                {/* Download All Button */}
                {filteredFiles.length > 0 && (
                    <div className="mt-12 text-center">
                        <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:scale-105 transition-all">
                            <Download className="w-6 h-6" />
                            تحميل جميع الملفات ({filteredFiles.length})
                        </button>
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            <AnimatePresence>
                {previewFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setPreviewFile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--bg-card)] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-[var(--border-color)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-[var(--text-primary)]">{previewFile.name}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] font-bold">{previewFile.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={getImageUrl(previewFile.url)}
                                        download
                                        target="_blank"
                                        rel="noopener"
                                        className="p-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 transition-all"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                    <button
                                        onClick={() => setPreviewFile(null)}
                                        className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/50 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="h-[60vh] bg-[var(--bg-main)] flex items-center justify-center">
                                {previewFile.type === 'pdf' ? (
                                    <div className="text-center">
                                        <FileText className="w-24 h-24 text-red-500/50 mx-auto mb-4" />
                                        <p className="text-[var(--text-secondary)] font-bold mb-4">معاينة PDF</p>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            (في الواقع سيتم عرض الـ PDF هنا باستخدام embed أو react-pdf)
                                        </p>
                                    </div>
                                ) : previewFile.type === 'image' ? (
                                    <div className="text-center">
                                        <Eye className="w-24 h-24 text-emerald-500/50 mx-auto mb-4" />
                                        <p className="text-[var(--text-secondary)] font-bold mb-4">معاينة صورة</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Eye className="w-24 h-24 text-cyan-500/50 mx-auto mb-4" />
                                        <p className="text-[var(--text-secondary)] font-bold mb-4">معاينة ملف</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
