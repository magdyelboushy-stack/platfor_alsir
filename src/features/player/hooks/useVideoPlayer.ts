// ============================================================
// useVideoPlayer - Custom Hook for HLS Video Player Logic
// ============================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import Hls from 'hls.js';
import type { PlayerState, PlayerConfig, VideoQuality } from '../types';

interface UseVideoPlayerOptions {
    src: string;
    initialTime?: number;
    config?: Partial<PlayerConfig>;
    onProgress?: (currentTime: number, duration: number) => void;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

const defaultConfig: PlayerConfig = {
    allowSkipping: false,
    autoPlay: false,
    autoAdvance: true,
    saveProgress: true,
    progressInterval: 10,
};

export function useVideoPlayer({
    src,
    initialTime = 0,
    config: userConfig,
    onProgress,
    onComplete,
    onError,
}: UseVideoPlayerOptions) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const progressTimerRef = useRef<any>(null); // Use any to avoid NodeJS namespace issues in browser
    const lastSavedTimeRef = useRef<number>(initialTime);

    const config = { ...defaultConfig, ...userConfig };

    const [state, setState] = useState<PlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        isFullscreen: false,
        playbackRate: 1,
        quality: 'auto',
        isLoading: true,
        error: null,
    });

    // --------------------------------------------------------
    // Initialize HLS Player
    // --------------------------------------------------------
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        const initPlayer = () => {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                });

                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setState((prev) => ({ ...prev, isLoading: false }));
                    if (config.autoPlay) {
                        video.play().catch(() => {
                            // Autoplay blocked - user interaction required
                        });
                    }
                });

                hls.on(Hls.Events.ERROR, (_, data) => {
                    if (data.fatal) {
                        const errorMsg = 'Video playback error. Please try again.';
                        setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }));
                        onError?.(errorMsg);
                    }
                });

                hlsRef.current = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = src;
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        initPlayer();

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [src, config.autoPlay, onError]);

    // --------------------------------------------------------
    // Video Event Handlers
    // --------------------------------------------------------
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            if (initialTime > 0 && video.currentTime === 0) {
                video.currentTime = initialTime;
            }
        };

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;
            const duration = video.duration || 0;

            setState((prev) => ({
                ...prev,
                currentTime,
                duration,
            }));

            // Progress callback at intervals
            if (config.saveProgress && onProgress) {
                if (Math.abs(currentTime - lastSavedTimeRef.current) >= config.progressInterval) {
                    onProgress(currentTime, duration);
                    lastSavedTimeRef.current = currentTime;
                }
            }
        };

        const handlePlay = () => setState((prev) => ({ ...prev, isPlaying: true }));
        const handlePause = () => setState((prev) => ({ ...prev, isPlaying: false }));
        const handleEnded = async () => {
            setState((prev) => ({ ...prev, isPlaying: false }));
            // Ensure final progress is saved at end of playback
            try {
                const duration = video.duration || 0;
                const current = video.currentTime;
                if (onProgress) {
                    await Promise.resolve(onProgress(duration || current, duration));
                    lastSavedTimeRef.current = duration || current;
                }
            } catch (e) {
                // ignore
            }
            await Promise.resolve(onComplete?.());
        };
        const handleLoadStart = () => setState((prev) => ({ ...prev, isLoading: true }));
        const handleCanPlay = () => setState((prev) => ({ ...prev, isLoading: false }));
        const handleVolumeChange = () => {
            setState((prev) => ({
                ...prev,
                volume: video.volume,
                isMuted: video.muted,
            }));
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('volumechange', handleVolumeChange);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('volumechange', handleVolumeChange);
        };
    }, [config.saveProgress, config.progressInterval, onProgress, onComplete, initialTime]);

    // --------------------------------------------------------
    // Player Controls
    // --------------------------------------------------------
    const play = useCallback(() => {
        videoRef.current?.play();
    }, []);

    const pause = useCallback(() => {
        videoRef.current?.pause();
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }, []);

    const seek = useCallback((time: number) => {
        const video = videoRef.current;
        if (!video) return;

        // Prevent seeking if not allowed
        if (!config.allowSkipping && time > video.currentTime) {
            return;
        }

        video.currentTime = Math.max(0, Math.min(time, video.duration));
    }, [config.allowSkipping]);

    const setVolume = useCallback((volume: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = Math.max(0, Math.min(1, volume));
    }, []);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = rate;
        setState((prev) => ({ ...prev, playbackRate: rate }));
    }, []);

    const toggleFullscreen = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (!document.fullscreenElement) {
                await video.requestFullscreen();
                setState((prev) => ({ ...prev, isFullscreen: true }));
            } else {
                await document.exitFullscreen();
                setState((prev) => ({ ...prev, isFullscreen: false }));
            }
        } catch (err) {
            // Silently handle fullscreen errors
        }
    }, []);

    const setQuality = useCallback((quality: VideoQuality) => {
        const hls = hlsRef.current;
        if (!hls) return;

        if (quality === 'auto') {
            hls.currentLevel = -1; // Auto
        } else {
            const levels = hls.levels;
            const qualityHeight = parseInt(quality.replace('p', ''));
            const levelIndex = levels.findIndex((l) => l.height === qualityHeight);
            if (levelIndex !== -1) {
                hls.currentLevel = levelIndex;
            }
        }
        setState((prev) => ({ ...prev, quality }));
    }, []);

    // --------------------------------------------------------
    // Cleanup Progress Timer
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, []);

    return {
        videoRef,
        state,
        controls: {
            play,
            pause,
            togglePlay,
            seek,
            setVolume,
            toggleMute,
            setPlaybackRate,
            toggleFullscreen,
            setQuality,
        },
        // Computed values
        progressPercent: state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0,
        formattedTime: formatTime(state.currentTime),
        formattedDuration: formatTime(state.duration),
    };
}

// --------------------------------------------------------
// Utility: Format seconds to MM:SS or HH:MM:SS
// --------------------------------------------------------
function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
