// ============================================================
// HLS Custom Player - with Bunny.net Support
// ============================================================

import { useRef, useState } from 'react';
import { useVideoPlayer } from '../hooks/useVideoPlayer';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    CheckCircle
} from 'lucide-react';

interface HLSPlayerProps {
    src: string;
    onComplete?: () => void;
    onTimeUpdate?: (seconds: number, duration?: number) => void;
    initialTime?: number;
}

export function HLSPlayer({ src, onComplete, onTimeUpdate, initialTime = 0 }: HLSPlayerProps) {
    const { videoRef, state, controls, formattedTime, formattedDuration, progressPercent } = useVideoPlayer({
        src,
        onComplete,
        initialTime,
        onProgress: (seconds, duration) => onTimeUpdate?.(seconds, duration),
        config: { autoPlay: true }
    });

    const [showSettings, setShowSettings] = useState(false);
    const [hovering, setHovering] = useState(false);

    const progressRef = useRef<HTMLDivElement>(null);

    // Seek Handler
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !state.duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        controls.seek(percentage * state.duration);
    };

    return (
        <div
            className="relative w-full h-full bg-black group overflow-hidden"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {/* HLS Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onContextMenu={(e) => e.preventDefault()}
                playsInline
                onClick={controls.togglePlay}
            />

            {/* Buffering Indicator */}
            {state.isLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </div>
            )}

            {/* Error Message */}
            {state.error && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
                    <div className="text-center p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">
                        <p className="text-red-500 font-bold mb-2">عذراً، حدث خطأ في التشغيل</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm text-white underline hover:text-red-400"
                        >
                            تحديث الصفحة
                        </button>
                    </div>
                </div>
            )}

            {/* Center Play Button (Overlay) */}
            <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${!state.isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                <div
                    onClick={controls.togglePlay}
                    className="w-20 h-20 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm cursor-pointer pointer-events-auto transform transition-transform hover:scale-110"
                >
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
            </div>

            {/* Controls Bar */}
            <div className={clsx(
                "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-4 px-6 z-20 transition-opacity duration-300",
                state.isPlaying && !hovering ? "opacity-0" : "opacity-100"
            )}>

                {/* Progress Bar */}
                <div
                    ref={progressRef}
                    className="w-full h-1.5 bg-white/20 rounded-full mb-4 cursor-pointer relative group/progress"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 bottom-0 bg-cyan-500 rounded-full transition-all duration-100"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 scale-0 group-hover/progress:scale-100 transition-all" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {/* Right Hand Controls (RTL layout) */}
                    <div className="flex items-center gap-4">
                        <button onClick={controls.togglePlay} className="text-white hover:text-cyan-400 transition-colors">
                            {state.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>

                        <div className="flex items-center gap-2 text-white/90 text-sm font-bold font-mono">
                            <span>{formattedTime}</span>
                            <span className="opacity-50">/</span>
                            <span>{formattedDuration}</span>
                        </div>

                        {/* Volume */}
                        <div className="flex items-center gap-2 group/volume">
                            <button onClick={controls.toggleMute} className="text-white hover:text-cyan-400">
                                {state.isMuted || state.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={state.isMuted ? 0 : state.volume}
                                onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                                className="w-0 group-hover/volume:w-20 transition-all overflow-hidden h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Left Hand Controls */}
                    <div className="flex items-center gap-4">
                        {/* Speed & Quality Settings */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className={clsx("text-white hover:text-cyan-400 transition-colors", showSettings && "text-cyan-500 rotate-45")}
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                                {showSettings && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-4 bg-black/90 border border-white/10 rounded-xl p-3 w-48 shadow-xl backdrop-blur-md"
                                    >
                                        <div className="space-y-4">
                                            {/* Speed */}
                                            <div>
                                                <div className="text-xs font-bold text-white/50 mb-2 px-1">السرعة</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {[0.5, 1, 1.5, 2].map(rate => (
                                                        <button
                                                            key={rate}
                                                            onClick={() => controls.setPlaybackRate(rate)}
                                                            className={clsx(
                                                                "px-2 py-1 rounded text-xs font-bold transition-colors",
                                                                state.playbackRate === rate ? "bg-cyan-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                                                            )}
                                                        >
                                                            {rate}x
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Quality (HLS Levels) */}
                                            {/* Note: In a real implementation with hls.js levels exposed, we would map them here. 
                                                For now we show static "Auto" as placeholder unless levels are passed from hook. */}
                                            <div>
                                                <div className="text-xs font-bold text-white/50 mb-2 px-1">الجودة</div>
                                                <button className="w-full text-right px-2 py-1.5 rounded text-sm font-bold bg-cyan-500/20 text-cyan-500 flex items-center justify-between">
                                                    <span>تلقائي (Auto)</span>
                                                    <CheckCircle className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button onClick={controls.toggleFullscreen} className="text-white hover:text-cyan-400">
                            {state.isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
