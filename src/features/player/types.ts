// ============================================================
// Course Player Types
// ============================================================

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    instructorId: string;
    instructorName: string;
    price: number;
    discount?: number;
    duration: number; // Total duration in minutes
    lessonsCount: number;
    enrolledStudents: number;
    rating: number;
    status: 'draft' | 'published' | 'archived';
    createdAt: string;
    updatedAt: string;
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description: string;
    order: number;
    duration: number; // in seconds
    videoUrl: string; // HLS stream URL from Bunny.net
    thumbnailUrl?: string;
    isPreview: boolean;
    isLocked: boolean;
    resources: LessonResource[];
}

export interface LessonResource {
    id: string;
    title: string;
    type: 'pdf' | 'document' | 'link';
    url: string;
}

export interface WatchProgress {
    lessonId: string;
    currentTime: number; // in seconds
    duration: number;
    percentage: number;
    isCompleted: boolean;
    lastWatchedAt: string;
}

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    playbackRate: number;
    quality: VideoQuality;
    isLoading: boolean;
    error: string | null;
}

export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';

export interface PlayerConfig {
    allowSkipping: boolean; // Disable for mandatory watching
    autoPlay: boolean;
    autoAdvance: boolean; // Auto-play next lesson
    saveProgress: boolean;
    progressInterval: number; // Seconds between progress saves
}
