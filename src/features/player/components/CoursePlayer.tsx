// ============================================================
// CoursePlayer - Premium Video Player Component
// ============================================================

import { useState, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Settings,
    SkipForward,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import type { Lesson, PlayerConfig } from '../types';

// ============================================================
// Context for Compound Component Pattern
// ============================================================
interface PlayerContextValue {
    lesson: Lesson;
    videoRef: React.RefObject<HTMLVideoElement>;
    state: ReturnType<typeof useVideoPlayer>['state'];
    controls: ReturnType<typeof useVideoPlayer>['controls'];
    progressPercent: number;
    formattedTime: string;
    formattedDuration: string;
    showControls: boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function usePlayerContext() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('Player components must be used within CoursePlayer');
    }
    return context;
}

// ============================================================
// Main CoursePlayer Component (Container)
// ============================================================
interface CoursePlayerProps {
    lesson: Lesson;
    config?: Partial<PlayerConfig>;
    onProgress?: (currentTime: number, duration: number) => void;
    onComplete?: () => void;
    onNextLesson?: () => void;
    children?: ReactNode;
}

export function CoursePlayer({
    lesson,
    config,
    onProgress,
    onComplete,
    onNextLesson,
    children,
}: CoursePlayerProps) {
    const [showControls, setShowControls] = useState(true);
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

    const player = useVideoPlayer({
        src: lesson.videoUrl,
        config,
        onProgress,
        onComplete,
    });

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeout) clearTimeout(controlsTimeout);

        const timeout = setTimeout(() => {
            if (player.state.isPlaying) {
                setShowControls(false);
            }
        }, 3000);

        setControlsTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (player.state.isPlaying) {
            setShowControls(false);
        }
    };

    const contextValue: PlayerContextValue = {
        lesson,
        ...player,
        showControls,
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            <div
                className={clsx(
                    'relative w-full aspect-video rounded-2xl overflow-hidden',
                    'bg-slate-900',
                    'group'
                )}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Video Element */}
                <video
                    ref={player.videoRef}
                    className="w-full h-full object-contain"
                    playsInline
                    onClick={player.controls.togglePlay}
                />

                {/* Loading Overlay */}
                <AnimatePresence>
                    {player.state.isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                        >
                            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Play Button Overlay (when paused) */}
                <AnimatePresence>
                    {!player.state.isPlaying && !player.state.isLoading && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={player.controls.togglePlay}
                            className={clsx(
                                'absolute inset-0 flex items-center justify-center',
                                'bg-black/30'
                            )}
                        >
                            <div className={clsx(
                                'w-20 h-20 rounded-full',
                                'bg-white/10 backdrop-blur-xl',
                                'flex items-center justify-center',
                                'border border-white/20',
                                'transition-transform duration-300',
                                'hover:scale-110'
                            )}>
                                <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Controls */}
                {children || <CoursePlayer.Controls onNextLesson={onNextLesson} />}
            </div>
        </PlayerContext.Provider>
    );
}

// ============================================================
// Controls Sub-Component
// ============================================================
interface ControlsProps {
    onNextLesson?: () => void;
}

function Controls({ onNextLesson }: ControlsProps) {
    const { state, controls, formattedTime, formattedDuration, showControls } = usePlayerContext();

    return (
        <AnimatePresence>
            {showControls && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16"
                >
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <ProgressBar />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <button
                                onClick={controls.togglePlay}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                {state.isPlaying ? (
                                    <Pause className="w-6 h-6 text-white" />
                                ) : (
                                    <Play className="w-6 h-6 text-white ml-0.5" />
                                )}
                            </button>

                            {/* Next Lesson */}
                            {onNextLesson && (
                                <button
                                    onClick={onNextLesson}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <SkipForward className="w-5 h-5 text-white" />
                                </button>
                            )}

                            {/* Volume */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={controls.toggleMute}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    {state.isMuted || state.volume === 0 ? (
                                        <VolumeX className="w-5 h-5 text-white" />
                                    ) : (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={state.isMuted ? 0 : state.volume}
                                    onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                                    className="w-20 h-1 accent-indigo-500"
                                />
                            </div>

                            {/* Time Display */}
                            <span className="text-sm text-white/80 ml-2">
                                {formattedTime} / {formattedDuration}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Settings */}
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                <Settings className="w-5 h-5 text-white" />
                            </button>

                            {/* Fullscreen */}
                            <button
                                onClick={controls.toggleFullscreen}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <Maximize className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================
// Progress Bar Sub-Component
// ============================================================
function ProgressBar() {
    const { state, controls, progressPercent } = usePlayerContext();

    const [hoverPercent, setHoverPercent] = useState<number | null>(null);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * state.duration;
        controls.seek(time);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        setHoverPercent(percent);
    };

    return (
        <div
            className="group/progress relative h-1.5 bg-white/20 rounded-full cursor-pointer"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverPercent(null)}
        >
            {/* Progress Fill */}
            <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
            />

            {/* Hover Preview */}
            {hoverPercent !== null && (
                <div
                    className="absolute top-0 h-full bg-white/30 rounded-full pointer-events-none"
                    style={{ width: `${hoverPercent}%` }}
                />
            )}

            {/* Scrubber Handle */}
            <motion.div
                className={clsx(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full',
                    'bg-white shadow-lg',
                    'opacity-0 group-hover/progress:opacity-100',
                    'transition-opacity duration-200'
                )}
                style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
        </div>
    );
}

// ============================================================
// Attach Sub-Components
// ============================================================
CoursePlayer.Controls = Controls;
CoursePlayer.ProgressBar = ProgressBar;

export default CoursePlayer;
