import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/core/api/client';
import { useAuthStore } from '@/store/authStore';

interface VdoCipherPlayerProps {
    videoId: string;
    onVideoEnd?: () => void;
    onTimeUpdate?: (seconds: number, duration?: number) => void;
    initialTime?: number;
}

export function VdoCipherPlayer({ videoId, onVideoEnd, onTimeUpdate, initialTime = 0 }: VdoCipherPlayerProps) {
    const { user } = useAuthStore();
    const [playbackInfo, setPlaybackInfo] = useState<{ otp: string; playbackInfo: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Watermark State
    const [watermarkPosition, setWatermarkPosition] = useState('top-4 right-4');

    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const playerRef = useRef<any>(null);

    // Watermark Animation
    useEffect(() => {
        const positions = [
            'top-8 right-8',
            'top-8 left-8',
            'bottom-20 right-8', // Higher to avoid controls
            'bottom-20 left-8',
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'top-1/3 left-1/3',
            'bottom-1/3 right-1/3'
        ];

        const interval = setInterval(() => {
            const randomPos = positions[Math.floor(Math.random() * positions.length)];
            setWatermarkPosition(randomPos);
        }, 5000); // Move every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Ensure VdoCipher API script is loaded
    useEffect(() => {
        const ensureApiScript = () => {
            if ((window as any).VdoPlayer) return; // already loaded
            const existing = document.querySelector<HTMLScriptElement>('script[src="https://player.vdocipher.com/v2/api.js"]');
            if (existing) return; // loading elsewhere
            const script = document.createElement('script');
            script.src = 'https://player.vdocipher.com/v2/api.js';
            script.async = true;
            document.head.appendChild(script);
        };
        ensureApiScript();
    }, []);

    useEffect(() => {
        const fetchOTP = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch OTP and PlaybackInfo from our backend proxy
                const response = await apiClient.post(`/videos/${videoId}/otp`, {});
                setPlaybackInfo(response.data);
            } catch (err: any) {
                console.error('VdoCipher OTP Fetch Error:', err);
                setError(err.response?.data?.error || 'فشل تحميل بيانات الفيديو');
            } finally {
                setLoading(false);
            }
        };

        if (videoId) {
            fetchOTP();
        }
    }, [videoId]);

    // Initialize VdoPlayer instance and wire events once iframe + API are ready
    useEffect(() => {
        if (!playbackInfo) return;

        let cancelled = false;
        let attempts = 0;
        const maxAttempts = 50; // ~5s

        const tryInit = () => {
            if (cancelled) return;
            attempts++;
            const VdoPlayer = (window as any).VdoPlayer;
            const iframe = iframeRef.current;
            if (VdoPlayer && iframe) {
                try {
                    const player = VdoPlayer.getInstance(iframe);
                    playerRef.current = player;

                    // Seek to initialTime after metadata is loaded
                    const seekToInitial = () => {
                        try {
                            if (initialTime && initialTime > 0) {
                                // set current time and optionally play (autoplay handled via player config)
                                player.video.currentTime = initialTime;
                            }
                        } catch (e) {
                            // ignore
                        }
                    };

                    player.video.addEventListener('loadedmetadata', seekToInitial);

                    // Forward timeupdate events
                    player.video.addEventListener('timeupdate', () => {
                        try {
                            const current = player.video.currentTime;
                            const duration = player.video.duration || 0;
                            if (typeof current === 'number' && onTimeUpdate) {
                                onTimeUpdate(current, duration);
                            }
                        } catch (e) {
                            // ignore
                        }
                    });

                    // Forward ended event
                    player.video.addEventListener('ended', async () => {
                        try {
                            const duration = player.video.duration || 0;
                            const current = player.video.currentTime;
                            if (onTimeUpdate) {
                                await Promise.resolve(onTimeUpdate(duration || current, duration));
                            }
                        } catch (e) { }
                        await Promise.resolve(onVideoEnd?.());
                    });

                    return; // initialized
                } catch (e) {
                    // try again
                }
            }
            if (attempts < maxAttempts) {
                setTimeout(tryInit, 100);
            }
        };

        tryInit();

        return () => {
            cancelled = true;
            try {
                const player = playerRef.current;
                if (player) {
                    // Remove listeners by cloning the node (simple cleanup without tracking handlers)
                    // Note: VdoCipher API doesn't expose removeEventListener on wrapper reliably
                    // so we rely on unmounting of iframe below
                }
            } catch (e) { }
        };
    }, [playbackInfo, initialTime, onTimeUpdate, onVideoEnd]);

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm gap-4">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-cyan-500 font-black text-sm animate-pulse">جاري تأمين الحماية وتجهيز المشغل...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-xl font-black text-red-500">{error}</h3>
                <p className="text-gray-400 font-bold max-w-sm">
                    حدث خطأ أثناء محاولة الحصول على تصريح تشغيل الفيديو. يرجى التأكد من اتصالك بالإنترنت أو مراجعة إدارة المنصة.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-black hover:bg-red-600 transition-all mt-4"
                >
                    إعادة المحاولة
                </button>
            </div>
        );
    }

    if (!playbackInfo) return null;

    const playerId = (import.meta as any).env.VITE_VDOCIPHER_PLAYER_ID;
    let iframeSrc = `https://player.vdocipher.com/v2/?otp=${playbackInfo.otp}&playbackInfo=${playbackInfo.playbackInfo}${playerId ? `&player=${playerId}` : ''}`;

    return (
        <div
            className="relative w-full h-full bg-black overflow-hidden group"
            onContextMenu={(e) => e.preventDefault()}
        >
            <iframe
                ref={iframeRef}
                src={iframeSrc}
                className="absolute inset-0 w-full h-full border-0 select-none"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
            />

            {/* Dynamic Watermark - Moves around */}
            {user && (
                <div
                    className={`absolute pointer-events-none opacity-40 bg-black/60 px-4 py-2 rounded-xl border border-white/10 z-50 backdrop-blur-sm transition-all duration-1000 ease-in-out ${watermarkPosition}`}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[12px] md:text-sm text-white font-black whitespace-nowrap drop-shadow-md">
                            {user.name}
                        </span>
                        <span className="text-[10px] md:text-xs text-red-400 font-mono font-bold tracking-widest drop-shadow-md">
                            {user.phone || user.email}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
